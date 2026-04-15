<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Warehouse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WarehouseController extends Controller
{
    public function index(): JsonResponse
    {
        $warehouses = Warehouse::query()->with('branch')->latest()->get()->map(function (Warehouse $warehouse) {
            return [
                'id' => $warehouse->id,
                'branchId' => $warehouse->branch_id,
                'branchName' => $warehouse->branch?->name,
                'code' => $warehouse->code,
                'name' => $warehouse->name,
                'phone' => $warehouse->phone,
                'address' => $warehouse->address,
                'city' => $warehouse->city,
                'status' => $warehouse->status,
                'createdAt' => $warehouse->created_at?->toDateString(),
            ];
        });

        return response()->json($warehouses);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'branchId' => ['nullable', 'integer', 'exists:branches,id'],
            'code' => ['required', 'string', 'max:50', 'unique:warehouses,code'],
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:255'],
        ]);

        $warehouse = Warehouse::create([
            'branch_id' => $data['branchId'] ?? null,
            'code' => $data['code'],
            'name' => $data['name'],
            'phone' => $data['phone'] ?? null,
            'address' => $data['address'] ?? null,
            'city' => $data['city'] ?? null,
            'status' => 'Active',
        ]);

        $warehouse->load('branch');

        return response()->json([
            'id' => $warehouse->id,
            'branchId' => $warehouse->branch_id,
            'branchName' => $warehouse->branch?->name,
            'code' => $warehouse->code,
            'name' => $warehouse->name,
            'phone' => $warehouse->phone,
            'address' => $warehouse->address,
            'city' => $warehouse->city,
            'status' => $warehouse->status,
            'createdAt' => $warehouse->created_at?->toDateString(),
        ], 201);
    }

    public function update(Request $request, Warehouse $warehouse): JsonResponse
    {
        $data = $request->validate([
            'branchId' => ['nullable', 'integer', 'exists:branches,id'],
            'code' => ['required', 'string', 'max:50', 'unique:warehouses,code,'.$warehouse->id],
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'in:Active,Inactive'],
        ]);

        $warehouse->update([
            'branch_id' => $data['branchId'] ?? null,
            'code' => $data['code'],
            'name' => $data['name'],
            'phone' => $data['phone'] ?? null,
            'address' => $data['address'] ?? null,
            'city' => $data['city'] ?? null,
            'status' => $data['status'] ?? $warehouse->status,
        ]);

        $warehouse->load('branch');

        return response()->json([
            'id' => $warehouse->id,
            'branchId' => $warehouse->branch_id,
            'branchName' => $warehouse->branch?->name,
            'code' => $warehouse->code,
            'name' => $warehouse->name,
            'phone' => $warehouse->phone,
            'address' => $warehouse->address,
            'city' => $warehouse->city,
            'status' => $warehouse->status,
            'createdAt' => $warehouse->created_at?->toDateString(),
        ]);
    }

    public function destroy(Warehouse $warehouse): JsonResponse
    {
        $warehouse->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
