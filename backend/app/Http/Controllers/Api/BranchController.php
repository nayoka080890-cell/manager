<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BranchController extends Controller
{
    public function index(): JsonResponse
    {
        $branches = Branch::query()->latest()->get()->map(function (Branch $branch) {
            return [
                'id' => $branch->id,
                'code' => $branch->code,
                'name' => $branch->name,
                'phone' => $branch->phone,
                'email' => $branch->email,
                'address' => $branch->address,
                'city' => $branch->city,
                'status' => $branch->status,
                'createdAt' => $branch->created_at?->toDateString(),
            ];
        });

        return response()->json($branches);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:50', 'unique:branches,code'],
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:255'],
        ]);

        $branch = Branch::create([
            'code' => $data['code'],
            'name' => $data['name'],
            'phone' => $data['phone'] ?? null,
            'email' => $data['email'] ?? null,
            'address' => $data['address'] ?? null,
            'city' => $data['city'] ?? null,
            'status' => 'Active',
        ]);

        return response()->json([
            'id' => $branch->id,
            'code' => $branch->code,
            'name' => $branch->name,
            'phone' => $branch->phone,
            'email' => $branch->email,
            'address' => $branch->address,
            'city' => $branch->city,
            'status' => $branch->status,
            'createdAt' => $branch->created_at?->toDateString(),
        ], 201);
    }

    public function update(Request $request, Branch $branch): JsonResponse
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:50', 'unique:branches,code,'.$branch->id],
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'in:Active,Inactive'],
        ]);

        $branch->update([
            'code' => $data['code'],
            'name' => $data['name'],
            'phone' => $data['phone'] ?? null,
            'email' => $data['email'] ?? null,
            'address' => $data['address'] ?? null,
            'city' => $data['city'] ?? null,
            'status' => $data['status'] ?? $branch->status,
        ]);

        return response()->json([
            'id' => $branch->id,
            'code' => $branch->code,
            'name' => $branch->name,
            'phone' => $branch->phone,
            'email' => $branch->email,
            'address' => $branch->address,
            'city' => $branch->city,
            'status' => $branch->status,
            'createdAt' => $branch->created_at?->toDateString(),
        ]);
    }

    public function destroy(Branch $branch): JsonResponse
    {
        $branch->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
