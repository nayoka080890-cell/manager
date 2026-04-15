<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CustomerController extends Controller
{
    private function normalizePhoneInput(array $data): array
    {
        if (!array_key_exists('phone', $data)) {
            return $data;
        }

        $phone = trim((string) ($data['phone'] ?? ''));
        $data['phone'] = $phone === '' ? null : $phone;

        return $data;
    }

    public function index(): JsonResponse
    {
        $customers = Customer::query()->latest()->get()->map(function (Customer $customer) {
            return [
                'id' => $customer->id,
                'name' => $customer->name,
                'email' => $customer->email,
                'phone' => $customer->phone,
                'address' => $customer->address,
                'city' => $customer->city,
                'status' => $customer->status,
                'createdAt' => $customer->created_at?->toDateString(),
            ];
        });

        return response()->json($customers);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50', Rule::unique('customers', 'phone')],
            'address' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:255'],
            'status' => ['required', 'in:Active,Inactive'],
        ]);

        $data = $this->normalizePhoneInput($data);

        $customer = Customer::create($data);

        return response()->json([
            'id' => $customer->id,
            'name' => $customer->name,
            'email' => $customer->email,
            'phone' => $customer->phone,
            'address' => $customer->address,
            'city' => $customer->city,
            'status' => $customer->status,
            'createdAt' => $customer->created_at?->toDateString(),
        ], 201);
    }

    public function update(Request $request, Customer $customer): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50', Rule::unique('customers', 'phone')->ignore($customer->id)],
            'address' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:255'],
            'status' => ['required', 'in:Active,Inactive'],
        ]);

        $data = $this->normalizePhoneInput($data);

        $customer->update($data);

        return response()->json([
            'id' => $customer->id,
            'name' => $customer->name,
            'email' => $customer->email,
            'phone' => $customer->phone,
            'address' => $customer->address,
            'city' => $customer->city,
            'status' => $customer->status,
            'createdAt' => $customer->created_at?->toDateString(),
        ]);
    }

    public function destroy(Customer $customer): JsonResponse
    {
        $customer->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
