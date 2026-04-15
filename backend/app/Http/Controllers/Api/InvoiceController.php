<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Invoice;
use App\Models\InvoiceItem;
use App\Models\InvoicePayment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class InvoiceController extends Controller
{
    private function extractBearerToken(Request $request): ?string
    {
        $auth = $request->header('Authorization');

        if (!$auth || !str_starts_with($auth, 'Bearer ')) {
            return null;
        }

        return trim(substr($auth, 7));
    }

    private function resolveAuthenticatedUserId(Request $request): ?int
    {
        $token = $this->extractBearerToken($request);
        if (!$token) {
            return null;
        }

        $user = Cache::get("auth_token:{$token}");
        $userId = (int) ($user['id'] ?? 0);

        return $userId > 0 ? $userId : null;
    }

    private function buildInvoiceNumberFromId(int $id): string
    {
        $group = intdiv(max($id - 1, 0), 1000000);
        $sequence = (($id - 1) % 1000000) + 1;

        return sprintf('INV%d-%06d', $group, $sequence);
    }

    private function mapInvoicePayment(InvoicePayment $payment): array
    {
        return [
            'id' => $payment->id,
            'date' => $payment->payment_date,
            'amount' => (float) $payment->amount,
            'method' => $payment->method,
            'reference' => $payment->reference,
            'notes' => $payment->notes,
            'isInitial' => (bool) $payment->is_initial,
        ];
    }

    private function syncInitialPayment(Invoice $invoice, float $paymentAmount, string $paymentDate, ?int $userId): void
    {
        $initialPayment = $invoice->payments()->where('is_initial', true)->first();

        if ($paymentAmount <= 0) {
            if ($initialPayment) {
                $initialPayment->delete();
            }

            return;
        }

        $payload = [
            'user_id' => $userId,
            'payment_date' => $paymentDate,
            'amount' => $paymentAmount,
            'method' => 'Cash',
            'reference' => null,
            'notes' => 'Initial payment from invoice form',
        ];

        if ($initialPayment) {
            $initialPayment->update($payload);

            return;
        }

        $invoice->payments()->create(array_merge($payload, [
            'is_initial' => true,
        ]));
    }

    private function recalculateInvoicePaymentTotals(Invoice $invoice, ?string $forcedStatus = null): void
    {
        $totalPaid = (float) $invoice->payments()->sum('amount');
        $balanceDue = max(0, round(((float) $invoice->total) - $totalPaid, 2));

        $nextStatus = $forcedStatus ?? (string) $invoice->status;
        if ($balanceDue <= 0) {
            $nextStatus = 'Paid';
        } elseif ($forcedStatus === null && $nextStatus === 'Paid') {
            $nextStatus = 'Sent';
        }

        $invoice->update([
            'payment_received' => $totalPaid,
            'balance_due' => $balanceDue,
            'status' => $nextStatus,
        ]);
    }

    private function mapInvoiceSummary(Invoice $invoice): array
    {
        return [
            'id' => $invoice->id,
            'invoiceNumber' => $invoice->invoice_number,
            'customerId' => $invoice->customer_id,
            'customerName' => $invoice->customer_name,
            'date' => $invoice->invoice_date,
            'createdAt' => $invoice->created_at?->toDateString(),
            'subtotal' => (float) $invoice->subtotal,
            'discount' => (float) $invoice->discount,
            'paymentReceived' => (float) $invoice->payment_received,
            'balanceDue' => (float) $invoice->balance_due,
            'total' => (float) $invoice->total,
            'amount' => (float) $invoice->total,
            'status' => $invoice->status,
            'payments' => $invoice->relationLoaded('payments')
                ? $invoice->payments->sortBy('payment_date')->values()->map(fn (InvoicePayment $payment) => $this->mapInvoicePayment($payment))->all()
                : [],
        ];
    }

    private function mapInvoiceDetail(Invoice $invoice): array
    {
        $invoice->loadMissing(['customer', 'items', 'payments']);

        return array_merge($this->mapInvoiceSummary($invoice), [
            'customerPhone' => $invoice->customer?->phone,
            'customerAddress' => $invoice->customer?->address,
            'items' => $invoice->items->map(function (InvoiceItem $item) {
                return [
                    'id' => $item->id,
                    'productId' => $item->product_id,
                    'productName' => $item->product_name,
                    'unit' => $item->unit ?? '',
                    'qty' => (float) $item->qty,
                    'unitPrice' => (float) $item->unit_price,
                    'lineTotal' => (float) $item->line_total,
                ];
            })->values()->all(),
            'payments' => $invoice->payments->sortBy('payment_date')->values()->map(fn (InvoicePayment $payment) => $this->mapInvoicePayment($payment))->all(),
        ]);
    }

    private function validateInvoicePayload(Request $request, Invoice $invoice = null): array
    {
        $invoiceId = $invoice?->id;

        return $request->validate([
            'invoiceNumber' => ['required', 'string', 'max:255', 'unique:invoices,invoice_number,'.($invoiceId ?? 'NULL').',id'],
            'customerId' => ['nullable', 'integer', 'exists:customers,id'],
            'customerName' => ['required', 'string', 'max:255'],
            'date' => ['required', 'date'],
            'discount' => ['nullable', 'numeric', 'min:0'],
            'paymentReceived' => ['nullable', 'numeric', 'min:0'],
            'status' => ['required', 'in:Draft,Sent,Paid,Overdue'],
            'items' => ['nullable', 'array'],
            'items.*.productId' => ['nullable', 'integer', 'exists:products,id'],
            'items.*.productName' => ['required_with:items', 'string', 'max:255'],
            'items.*.unit' => ['nullable', 'string', 'max:50'],
            'items.*.qty' => ['required_with:items', 'numeric', 'gt:0'],
            'items.*.unitPrice' => ['required_with:items', 'numeric', 'min:0'],
        ]);
    }

    private function calculateInvoiceTotals(array $itemsData, float $discount, float $paymentReceived): array
    {
        $subtotal = round((float) collect($itemsData)->sum(function (array $item) {
            return ((float) ($item['qty'] ?? 0)) * ((float) ($item['unitPrice'] ?? 0));
        }), 2);
        $total = max(0, round($subtotal - $discount, 2));
        $balanceDue = max(0, round($total - $paymentReceived, 2));

        return [
            'subtotal' => $subtotal,
            'total' => $total,
            'balanceDue' => $balanceDue,
        ];
    }

    public function nextNumber(): JsonResponse
    {
        $nextId = ((int) Invoice::query()->max('id')) + 1;

        return response()->json([
            'nextId' => $nextId,
            'invoiceNumber' => $this->buildInvoiceNumberFromId($nextId),
        ]);
    }

    public function index(): JsonResponse
    {
        $invoices = Invoice::query()->with('payments')->latest()->get()->map(fn (Invoice $invoice) => $this->mapInvoiceSummary($invoice));

        return response()->json($invoices);
    }

    public function show(Invoice $invoice): JsonResponse
    {
        return response()->json($this->mapInvoiceDetail($invoice));
    }

    public function store(Request $request): JsonResponse
    {
        $currentUserId = $this->resolveAuthenticatedUserId($request);
        $data = $this->validateInvoicePayload($request);
        $itemsData = $data['items'] ?? [];
        $discount = round((float) ($data['discount'] ?? 0), 2);
        $paymentReceived = round((float) ($data['paymentReceived'] ?? 0), 2);
        $totals = $this->calculateInvoiceTotals($itemsData, $discount, $paymentReceived);

        $customer = null;
        if (!empty($data['customerId'])) {
            $customer = Customer::query()->findOrFail((int) $data['customerId']);
        }

        $invoice = DB::transaction(function () use ($data, $itemsData, $discount, $paymentReceived, $totals, $customer, $currentUserId) {
            $invoice = Invoice::create([
                'invoice_number' => $data['invoiceNumber'],
                'customer_id' => $customer?->id,
                'customer_name' => $customer?->name ?? $data['customerName'],
                'invoice_date' => $data['date'],
                'subtotal' => $totals['subtotal'],
                'discount' => $discount,
                'total' => $totals['total'],
                'payment_received' => 0,
                'balance_due' => $totals['total'],
                'status' => $data['status'],
            ]);

            if (!empty($itemsData)) {
                $invoice->items()->createMany(collect($itemsData)->map(function (array $item) {
                    $qty = round((float) $item['qty'], 2);
                    $unitPrice = round((float) $item['unitPrice'], 2);

                    return [
                        'product_id' => $item['productId'] ?? null,
                        'product_name' => $item['productName'],
                        'unit' => $item['unit'] ?? null,
                        'qty' => $qty,
                        'unit_price' => $unitPrice,
                        'line_total' => round($qty * $unitPrice, 2),
                    ];
                })->all());
            }

            $this->syncInitialPayment($invoice, $paymentReceived, $data['date'], $currentUserId);
            $this->recalculateInvoicePaymentTotals($invoice, $data['status']);

            return $invoice;
        });

        return response()->json($this->mapInvoiceDetail($invoice), 201);
    }

    public function update(Request $request, Invoice $invoice): JsonResponse
    {
        $currentUserId = $this->resolveAuthenticatedUserId($request);
        $data = $this->validateInvoicePayload($request, $invoice);
        $itemsData = $data['items'] ?? [];
        $discount = round((float) ($data['discount'] ?? 0), 2);
        $paymentReceived = round((float) ($data['paymentReceived'] ?? 0), 2);
        $totals = $this->calculateInvoiceTotals($itemsData, $discount, $paymentReceived);

        $customer = null;
        if (!empty($data['customerId'])) {
            $customer = Customer::query()->findOrFail((int) $data['customerId']);
        }

        DB::transaction(function () use ($invoice, $data, $itemsData, $discount, $paymentReceived, $totals, $customer, $currentUserId) {
            $invoice->update([
                'invoice_number' => $data['invoiceNumber'],
                'customer_id' => $customer?->id,
                'customer_name' => $customer?->name ?? $data['customerName'],
                'invoice_date' => $data['date'],
                'subtotal' => $totals['subtotal'],
                'discount' => $discount,
                'total' => $totals['total'],
                'payment_received' => 0,
                'balance_due' => $totals['total'],
                'status' => $data['status'],
            ]);

            $invoice->items()->delete();

            if (!empty($itemsData)) {
                $invoice->items()->createMany(collect($itemsData)->map(function (array $item) {
                    $qty = round((float) $item['qty'], 2);
                    $unitPrice = round((float) $item['unitPrice'], 2);

                    return [
                        'product_id' => $item['productId'] ?? null,
                        'product_name' => $item['productName'],
                        'unit' => $item['unit'] ?? null,
                        'qty' => $qty,
                        'unit_price' => $unitPrice,
                        'line_total' => round($qty * $unitPrice, 2),
                    ];
                })->all());
            }

            $this->syncInitialPayment($invoice, $paymentReceived, $data['date'], $currentUserId);
            $this->recalculateInvoicePaymentTotals($invoice, $data['status']);
        });

        $invoice->refresh();

        return response()->json($this->mapInvoiceDetail($invoice));
    }

    public function destroy(Invoice $invoice): JsonResponse
    {
        $invoice->delete();

        return response()->json(['message' => 'Deleted']);
    }

    public function addPayment(Request $request, Invoice $invoice): JsonResponse
    {
        $currentUserId = $this->resolveAuthenticatedUserId($request);

        $data = $request->validate([
            'date' => ['required', 'date'],
            'amount' => ['required', 'numeric', 'gt:0'],
            'method' => ['nullable', 'string', 'max:50'],
            'reference' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string'],
        ]);

        $currentPaid = (float) $invoice->payments()->sum('amount');
        $nextPaid = $currentPaid + (float) $data['amount'];
        if ($nextPaid > ((float) $invoice->total) + 0.00001) {
            return response()->json([
                'message' => 'Payment exceeds remaining balance.',
                'remainingBalance' => max(0, round(((float) $invoice->total) - $currentPaid, 2)),
            ], 422);
        }

        $payment = DB::transaction(function () use ($invoice, $data, $currentUserId) {
            $payment = $invoice->payments()->create([
                'user_id' => $currentUserId,
                'payment_date' => $data['date'],
                'amount' => (float) $data['amount'],
                'method' => trim((string) ($data['method'] ?? 'Cash')) ?: 'Cash',
                'reference' => $data['reference'] ?? null,
                'notes' => $data['notes'] ?? null,
                'is_initial' => false,
            ]);

            $this->recalculateInvoicePaymentTotals($invoice);

            return $payment;
        });

        $invoice->refresh();

        return response()->json([
            'message' => 'Payment added.',
            'payment' => $this->mapInvoicePayment($payment),
            'invoice' => [
                'id' => $invoice->id,
                'total' => (float) $invoice->total,
                'paymentReceived' => (float) $invoice->payment_received,
                'balanceDue' => (float) $invoice->balance_due,
                'status' => $invoice->status,
            ],
        ], 201);
    }

    public function destroyPayment(Request $request, Invoice $invoice, InvoicePayment $payment): JsonResponse
    {
        $currentUserId = $this->resolveAuthenticatedUserId($request);
        if (!$currentUserId) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if ((int) $payment->invoice_id !== (int) $invoice->id) {
            return response()->json(['message' => 'Payment does not belong to this invoice.'], 422);
        }

        if ($payment->is_initial) {
            return response()->json(['message' => 'Initial payment can be edited from invoice form only.'], 422);
        }

        DB::transaction(function () use ($invoice, $payment) {
            $payment->delete();
            $this->recalculateInvoicePaymentTotals($invoice);
        });

        $invoice->refresh();

        return response()->json([
            'message' => 'Payment deleted.',
            'invoice' => [
                'id' => $invoice->id,
                'total' => (float) $invoice->total,
                'paymentReceived' => (float) $invoice->payment_received,
                'balanceDue' => (float) $invoice->balance_due,
                'status' => $invoice->status,
            ],
        ]);
    }
}
