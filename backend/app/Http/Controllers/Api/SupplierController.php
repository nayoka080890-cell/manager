<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    public function index(): JsonResponse
    {
        $suppliers = Supplier::query()->latest()->get()->map(function (Supplier $supplier) {
            return [
                'id' => $supplier->id,
                'name' => $supplier->name,
                'contactPerson' => $supplier->contact_person,
                'email' => $supplier->email,
                'phone' => $supplier->phone,
                'address' => $supplier->address,
                'city' => $supplier->city,
                'createdAt' => $supplier->created_at?->toDateString(),
            ];
        });

        return response()->json($suppliers);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'contactPerson' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:255'],
        ]);

        $supplier = Supplier::create([
            'name' => $data['name'],
            'contact_person' => $data['contactPerson'] ?? null,
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'] ?? null,
            'address' => $data['address'] ?? null,
            'city' => $data['city'] ?? null,
            'status' => 'Active',
        ]);

        return response()->json([
            'id' => $supplier->id,
            'name' => $supplier->name,
            'contactPerson' => $supplier->contact_person,
            'email' => $supplier->email,
            'phone' => $supplier->phone,
            'address' => $supplier->address,
            'city' => $supplier->city,
            'createdAt' => $supplier->created_at?->toDateString(),
        ], 201);
    }

    public function update(Request $request, Supplier $supplier): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'contactPerson' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:255'],
        ]);

        $supplier->update([
            'name' => $data['name'],
            'contact_person' => $data['contactPerson'] ?? null,
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'] ?? null,
            'address' => $data['address'] ?? null,
            'city' => $data['city'] ?? null,
        ]);

        return response()->json([
            'id' => $supplier->id,
            'name' => $supplier->name,
            'contactPerson' => $supplier->contact_person,
            'email' => $supplier->email,
            'phone' => $supplier->phone,
            'address' => $supplier->address,
            'city' => $supplier->city,
            'createdAt' => $supplier->created_at?->toDateString(),
        ]);
    }

    public function destroy(Supplier $supplier): JsonResponse
    {
        $supplier->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
