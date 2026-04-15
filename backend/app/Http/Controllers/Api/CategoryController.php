<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = Category::query()->latest()->get()->map(function (Category $category) {
            return [
                'id' => $category->id,
                'name' => $category->name,
                'description' => $category->description,
                'createdAt' => $category->created_at?->toDateString(),
            ];
        });

        return response()->json($categories);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:categories,name'],
            'description' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'in:Active,Inactive'],
        ]);

        $category = Category::create([
            ...$data,
            'status' => $data['status'] ?? 'Active',
        ]);

        return response()->json([
            'id' => $category->id,
            'name' => $category->name,
            'description' => $category->description,
            'createdAt' => $category->created_at?->toDateString(),
        ], 201);
    }

    public function update(Request $request, Category $category): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:categories,name,'.$category->id],
            'description' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'in:Active,Inactive'],
        ]);

        $category->update($data);

        return response()->json([
            'id' => $category->id,
            'name' => $category->name,
            'description' => $category->description,
            'createdAt' => $category->created_at?->toDateString(),
        ]);
    }

    public function destroy(Category $category): JsonResponse
    {
        $category->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
