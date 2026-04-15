<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(User::query()->latest()->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'role' => ['required', 'in:Admin,Moderator,User'],
            'status' => ['required', 'in:Active,Inactive'],
        ]);

        $user = User::create([
            ...$data,
            'password' => 'password123',
        ]);

        return response()->json($user, 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,'.$user->id],
            'role' => ['required', 'in:Admin,Moderator,User'],
            'status' => ['required', 'in:Active,Inactive'],
        ]);

        $user->update($data);

        return response()->json($user->fresh());
    }

    public function destroy(User $user): JsonResponse
    {
        $user->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
