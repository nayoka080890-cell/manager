<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Purchase;
use App\Models\PurchasePayment;
use App\Models\Supplier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PurchaseController extends Controller
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

    private function normalizeInventoryQty(float|int|string $qty): float
    {
        return max(0, round((float) $qty, 2));
    }

    private function resolveWarehouseId(): int
    {
        $warehouse = DB::table('warehouses')->orderBy('id')->first();
        if ($warehouse) {
            return (int) $warehouse->id;
        }

        $code = 'MAIN';
        $exists = DB::table('warehouses')->where('code', $code)->exists();
        if ($exists) {
            $code = 'MAIN-'.time();
        }

        return (int) DB::table('warehouses')->insertGetId([
            'branch_id' => null,
            'code' => $code,
            'name' => 'Main Warehouse',
            'phone' => null,
            'address' => null,
            'city' => null,
            'status' => 'Active',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private function adjustInventoryQuantity(int $productId, float $qtyDelta, ?int $warehouseId = null): void
    {
        if ($productId <= 0 || $qtyDelta == 0.0) {
            return;
        }

        $warehouseId = $warehouseId ?: $this->resolveWarehouseId();

        $row = DB::table('inventory')
            ->where('product_id', $productId)
            ->where('warehouse_id', $warehouseId)
            ->lockForUpdate()
            ->first();

        if ($row) {
            $nextQty = max(0, ((float) $row->quantity) + $qtyDelta);

            DB::table('inventory')
                ->where('id', $row->id)
                ->update([
                    'quantity' => $nextQty,
                    'updated_at' => now(),
                ]);

            return;
        }

        DB::table('inventory')->insert([
            'product_id' => $productId,
            'warehouse_id' => $warehouseId,
            'quantity' => max(0, $qtyDelta),
            'reserved_quantity' => 0,
            'minimum_quantity' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private function increaseInventoryFromItems(array $itemsData, ?int $warehouseId = null): void
    {
        foreach ($itemsData as $item) {
            $productId = (int) ($item['productId'] ?? 0);
            if ($productId <= 0) {
                continue;
            }

            $qty = $this->normalizeInventoryQty($item['qty'] ?? 0);
            if ($qty <= 0) {
                continue;
            }

            $this->adjustInventoryQuantity($productId, $qty, $warehouseId);
        }
    }

    private function decreaseInventoryFromPurchase(Purchase $purchase): void
    {
        $purchase->loadMissing('items');

        foreach ($purchase->items as $item) {
            if (!$item->product_id) {
                continue;
            }

            $qty = $this->normalizeInventoryQty($item->qty);
            if ($qty <= 0) {
                continue;
            }

            $this->adjustInventoryQuantity((int) $item->product_id, -$qty, $purchase->warehouse_id);
        }
    }

    private function buildPurchaseNumberFromId(int $id): string
    {
        $group = intdiv(max($id - 1, 0), 1000000);
        $sequence = (($id - 1) % 1000000) + 1;

        return sprintf('HDQH%d-%06d', $group, $sequence);
    }

    private function syncInitialPayment(Purchase $purchase, float $paymentAmount, string $paymentDate, ?int $userId): void
    {
        $initialPayment = $purchase->payments()->where('is_initial', true)->first();

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
            'notes' => 'Initial payment from purchase form',
        ];

        if ($initialPayment) {
            $initialPayment->update($payload);

            return;
        }

        $purchase->payments()->create(array_merge($payload, [
            'is_initial' => true,
        ]));
    }

    private function recalculatePurchasePaymentTotals(Purchase $purchase): void
    {
        $totalPaid = (float) $purchase->payments()->sum('amount');
        $balanceDue = max(0, round(((float) $purchase->total) - $totalPaid, 2));

        $purchase->update([
            'payment_made' => $totalPaid,
            'balance_due' => $balanceDue,
        ]);
    }

    public function nextNumber(): JsonResponse
    {
        $nextId = ((int) Purchase::query()->max('id')) + 1;

        return response()->json([
            'nextId' => $nextId,
            'purchaseNumber' => $this->buildPurchaseNumberFromId($nextId),
        ]);
    }

    public function index(): JsonResponse
    {
        $purchases = Purchase::query()->with(['warehouse', 'payments'])->latest()->get()->map(function (Purchase $purchase) {
            return [
                'id' => $purchase->id,
                'purchaseNumber' => $purchase->purchase_number,
                'supplierId' => $purchase->supplier_id,
                'supplierName' => $purchase->supplier_name,
                'warehouseId' => $purchase->warehouse_id,
                'warehouseName' => $purchase->warehouse?->name,
                'date' => $purchase->purchase_date,
                'amount' => (float) $purchase->total,
                'paymentMade' => (float) $purchase->payment_made,
                'balanceDue' => (float) $purchase->balance_due,
                'status' => $purchase->status,
                'createdAt' => $purchase->created_at?->toDateString(),
                'payments' => $purchase->payments->sortBy('payment_date')->values()->map(function (PurchasePayment $payment) {
                    return [
                        'id' => $payment->id,
                        'date' => $payment->payment_date,
                        'amount' => (float) $payment->amount,
                        'method' => $payment->method,
                        'isInitial' => (bool) $payment->is_initial,
                    ];
                }),
            ];
        });

        return response()->json($purchases);
    }

    public function show(Purchase $purchase): JsonResponse
    {
        $purchase->loadMissing(['items', 'warehouse', 'payments']);

        return response()->json([
            'id' => $purchase->id,
            'purchaseNumber' => $purchase->purchase_number,
            'supplierId' => $purchase->supplier_id,
            'supplierName' => $purchase->supplier_name,
            'warehouseId' => $purchase->warehouse_id,
            'warehouseName' => $purchase->warehouse?->name,
            'date' => $purchase->purchase_date,
            'subtotal' => (float) $purchase->subtotal,
            'discount' => (float) $purchase->discount,
            'total' => (float) $purchase->total,
            'paymentMade' => (float) $purchase->payment_made,
            'balanceDue' => (float) $purchase->balance_due,
            'amount' => (float) $purchase->total,
            'status' => $purchase->status,
            'createdAt' => $purchase->created_at?->toDateString(),
            'items' => $purchase->items->map(function ($item) {
                return [
                    'id' => $item->id,
                    'productId' => $item->product_id,
                    'productName' => $item->product_name,
                    'unit' => $item->unit ?? '',
                    'qty' => (float) $item->qty,
                    'packagingUnitsQty' => $item->packaging_units_qty !== null ? (float) $item->packaging_units_qty : null,
                    'unitsPerPack' => $item->units_per_pack !== null ? (float) $item->units_per_pack : null,
                    'totalUnits' => $item->total_units !== null ? (float) $item->total_units : null,
                    'billableQty' => $item->billable_qty !== null ? (float) $item->billable_qty : null,
                    'unitPrice' => $item->unit_price !== null ? (float) $item->unit_price : null,
                    'unitCost' => (float) $item->unit_cost,
                    'lineTotal' => (float) $item->line_total,
                ];
            }),
            'payments' => $purchase->payments->sortBy('payment_date')->values()->map(function (PurchasePayment $payment) {
                return [
                    'id' => $payment->id,
                    'date' => $payment->payment_date,
                    'amount' => (float) $payment->amount,
                    'method' => $payment->method,
                    'reference' => $payment->reference,
                    'notes' => $payment->notes,
                    'isInitial' => (bool) $payment->is_initial,
                ];
            }),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $currentUserId = $this->resolveAuthenticatedUserId($request);

        $data = $request->validate([
            'supplierId' => ['required', 'integer', 'exists:suppliers,id'],
            'warehouseId' => ['required', 'integer', 'exists:warehouses,id'],
            'date' => ['required', 'date'],
            'status' => ['required', 'in:Draft,Ordered,Received,Cancelled'],
            'items' => ['nullable', 'array'],
            'items.*.productId' => ['nullable', 'integer'],
            'items.*.productName' => ['required_with:items', 'string', 'max:255'],
            'items.*.unit' => ['nullable', 'string', 'max:50'],
            'items.*.qty' => ['required_with:items', 'numeric', 'min:0'],
            'items.*.packagingUnitsQty' => ['nullable', 'numeric', 'min:0'],
            'items.*.unitsPerPack' => ['nullable', 'numeric', 'min:0'],
            'items.*.totalUnits' => ['nullable', 'numeric', 'min:0'],
            'items.*.billableQty' => ['nullable', 'numeric', 'min:0'],
            'items.*.unitPrice' => ['nullable', 'numeric', 'min:0'],
            'items.*.unitCost' => ['required_with:items', 'numeric', 'min:0'],
            'discount' => ['nullable', 'numeric', 'min:0'],
            'paymentMade' => ['nullable', 'numeric', 'min:0'],
        ]);

        $supplier = Supplier::query()->findOrFail($data['supplierId']);

        $itemsData = $data['items'] ?? [];
        $subtotal = collect($itemsData)->sum(fn($item) => $item['qty'] * $item['unitCost']);
        $discount = (float) ($data['discount'] ?? 0);
        $total = $subtotal - $discount;
        $paymentMade = (float) ($data['paymentMade'] ?? 0);

        $purchase = DB::transaction(function () use ($data, $supplier, $subtotal, $discount, $total, $paymentMade, $itemsData, $currentUserId) {
            $purchase = Purchase::create([
                'purchase_number' => Str::uuid()->toString(),
                'supplier_id' => (int) $data['supplierId'],
                'warehouse_id' => (int) $data['warehouseId'],
                'user_id' => $currentUserId,
                'supplier_name' => $supplier->name,
                'purchase_date' => $data['date'],
                'subtotal' => $subtotal,
                'discount' => $discount,
                'total' => $total,
                'payment_made' => 0,
                'balance_due' => $total,
                'status' => $data['status'],
            ]);

            $purchase->purchase_number = $this->buildPurchaseNumberFromId((int) $purchase->id);
            $purchase->save();

            foreach ($itemsData as $item) {
                $purchase->items()->create([
                    'product_id' => $item['productId'] ?? null,
                    'product_name' => $item['productName'],
                    'unit' => $item['unit'] ?? null,
                    'qty' => $item['qty'],
                    'packaging_units_qty' => $item['packagingUnitsQty'] ?? null,
                    'units_per_pack' => $item['unitsPerPack'] ?? null,
                    'total_units' => $item['totalUnits'] ?? null,
                    'billable_qty' => $item['billableQty'] ?? null,
                    'unit_price' => $item['unitPrice'] ?? null,
                    'unit_cost' => $item['unitCost'],
                    'line_total' => $item['qty'] * $item['unitCost'],
                ]);
            }

            $this->increaseInventoryFromItems($itemsData, (int) $data['warehouseId']);
            $this->syncInitialPayment($purchase, $paymentMade, $data['date'], $currentUserId);
            $this->recalculatePurchasePaymentTotals($purchase);

            return $purchase;
        });

        return response()->json([
            'id' => $purchase->id,
            'purchaseNumber' => $purchase->purchase_number,
            'supplierId' => $purchase->supplier_id,
            'supplierName' => $purchase->supplier_name,
            'warehouseId' => $purchase->warehouse_id,
            'warehouseName' => $purchase->warehouse?->name,
            'date' => $purchase->purchase_date,
            'amount' => (float) $purchase->total,
            'status' => $purchase->status,
            'createdAt' => $purchase->created_at?->toDateString(),
        ], 201);
    }

    public function update(Request $request, Purchase $purchase): JsonResponse
    {
        $currentUserId = $this->resolveAuthenticatedUserId($request);

        $data = $request->validate([
            'supplierId' => ['required', 'integer', 'exists:suppliers,id'],
            'warehouseId' => ['required', 'integer', 'exists:warehouses,id'],
            'date' => ['required', 'date'],
            'status' => ['required', 'in:Draft,Ordered,Received,Cancelled'],
            'items' => ['nullable', 'array'],
            'items.*.productId' => ['nullable', 'integer'],
            'items.*.productName' => ['required_with:items', 'string', 'max:255'],
            'items.*.unit' => ['nullable', 'string', 'max:50'],
            'items.*.qty' => ['required_with:items', 'numeric', 'min:0'],
            'items.*.packagingUnitsQty' => ['nullable', 'numeric', 'min:0'],
            'items.*.unitsPerPack' => ['nullable', 'numeric', 'min:0'],
            'items.*.totalUnits' => ['nullable', 'numeric', 'min:0'],
            'items.*.billableQty' => ['nullable', 'numeric', 'min:0'],
            'items.*.unitPrice' => ['nullable', 'numeric', 'min:0'],
            'items.*.unitCost' => ['required_with:items', 'numeric', 'min:0'],
            'discount' => ['nullable', 'numeric', 'min:0'],
            'paymentMade' => ['nullable', 'numeric', 'min:0'],
        ]);

        $supplier = Supplier::query()->findOrFail($data['supplierId']);

        $itemsData = $data['items'] ?? [];
        $subtotal = collect($itemsData)->sum(fn($item) => $item['qty'] * $item['unitCost']);
        $discount = (float) ($data['discount'] ?? 0);
        $total = $subtotal - $discount;
        $paymentMade = (float) ($data['paymentMade'] ?? 0);

        DB::transaction(function () use ($purchase, $data, $supplier, $subtotal, $discount, $total, $paymentMade, $itemsData, $currentUserId) {
            $this->decreaseInventoryFromPurchase($purchase);

            $purchase->update([
                'supplier_id' => (int) $data['supplierId'],
                'warehouse_id' => (int) $data['warehouseId'],
                'supplier_name' => $supplier->name,
                'purchase_date' => $data['date'],
                'subtotal' => $subtotal,
                'discount' => $discount,
                'total' => $total,
                'status' => $data['status'],
            ]);

            $purchase->items()->delete();
            foreach ($itemsData as $item) {
                $purchase->items()->create([
                    'product_id' => $item['productId'] ?? null,
                    'product_name' => $item['productName'],
                    'unit' => $item['unit'] ?? null,
                    'qty' => $item['qty'],
                    'packaging_units_qty' => $item['packagingUnitsQty'] ?? null,
                    'units_per_pack' => $item['unitsPerPack'] ?? null,
                    'total_units' => $item['totalUnits'] ?? null,
                    'billable_qty' => $item['billableQty'] ?? null,
                    'unit_price' => $item['unitPrice'] ?? null,
                    'unit_cost' => $item['unitCost'],
                    'line_total' => $item['qty'] * $item['unitCost'],
                ]);
            }

            $this->increaseInventoryFromItems($itemsData, (int) $data['warehouseId']);
            $this->syncInitialPayment($purchase, $paymentMade, $data['date'], $currentUserId);
            $this->recalculatePurchasePaymentTotals($purchase);
        });

        $purchase->loadMissing(['warehouse']);

        return response()->json([
            'id' => $purchase->id,
            'purchaseNumber' => $purchase->purchase_number,
            'supplierId' => $purchase->supplier_id,
            'supplierName' => $purchase->supplier_name,
            'warehouseId' => $purchase->warehouse_id,
            'warehouseName' => $purchase->warehouse?->name,
            'date' => $purchase->purchase_date,
            'amount' => (float) $purchase->total,
            'status' => $purchase->status,
            'createdAt' => $purchase->created_at?->toDateString(),
        ]);
    }

    public function destroy(Purchase $purchase): JsonResponse
    {
        DB::transaction(function () use ($purchase) {
            $this->decreaseInventoryFromPurchase($purchase);
            $purchase->delete();
        });

        return response()->json(['message' => 'Deleted']);
    }

    public function addPayment(Request $request, Purchase $purchase): JsonResponse
    {
        $currentUserId = $this->resolveAuthenticatedUserId($request);

        $data = $request->validate([
            'date' => ['required', 'date'],
            'amount' => ['required', 'numeric', 'gt:0'],
            'method' => ['nullable', 'string', 'max:50'],
            'reference' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string'],
        ]);

        $currentPaid = (float) $purchase->payments()->sum('amount');
        $nextPaid = $currentPaid + (float) $data['amount'];
        if ($nextPaid > ((float) $purchase->total) + 0.00001) {
            return response()->json([
                'message' => 'Payment exceeds remaining balance.',
                'remainingBalance' => max(0, round(((float) $purchase->total) - $currentPaid, 2)),
            ], 422);
        }

        $payment = DB::transaction(function () use ($purchase, $data, $currentUserId) {
            $payment = $purchase->payments()->create([
                'user_id' => $currentUserId,
                'payment_date' => $data['date'],
                'amount' => (float) $data['amount'],
                'method' => trim((string) ($data['method'] ?? 'Cash')) ?: 'Cash',
                'reference' => $data['reference'] ?? null,
                'notes' => $data['notes'] ?? null,
                'is_initial' => false,
            ]);

            $this->recalculatePurchasePaymentTotals($purchase);

            return $payment;
        });

        $purchase->refresh();

        return response()->json([
            'message' => 'Payment added.',
            'payment' => [
                'id' => $payment->id,
                'date' => $payment->payment_date,
                'amount' => (float) $payment->amount,
                'method' => $payment->method,
                'reference' => $payment->reference,
                'notes' => $payment->notes,
                'isInitial' => (bool) $payment->is_initial,
            ],
            'purchase' => [
                'id' => $purchase->id,
                'total' => (float) $purchase->total,
                'paymentMade' => (float) $purchase->payment_made,
                'balanceDue' => (float) $purchase->balance_due,
            ],
        ], 201);
    }

    public function destroyPayment(Request $request, Purchase $purchase, PurchasePayment $payment): JsonResponse
    {
        $currentUserId = $this->resolveAuthenticatedUserId($request);
        if (!$currentUserId) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if ((int) $payment->purchase_id !== (int) $purchase->id) {
            return response()->json(['message' => 'Payment does not belong to this purchase.'], 422);
        }

        if ($payment->is_initial) {
            return response()->json(['message' => 'Initial payment can be edited from purchase form only.'], 422);
        }

        DB::transaction(function () use ($purchase, $payment) {
            $payment->delete();
            $this->recalculatePurchasePaymentTotals($purchase);
        });

        $purchase->refresh();

        return response()->json([
            'message' => 'Payment deleted.',
            'purchase' => [
                'id' => $purchase->id,
                'total' => (float) $purchase->total,
                'paymentMade' => (float) $purchase->payment_made,
                'balanceDue' => (float) $purchase->balance_due,
            ],
        ]);
    }
}
