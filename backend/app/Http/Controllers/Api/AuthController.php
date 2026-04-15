<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'email' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $identifier = trim($payload['email']);
        $password = $payload['password'];

        $user = User::query()->where('email', $identifier)->first();

        // Keep compatibility with existing frontend demo credentials.
        if (!$user && $identifier === 'nayoka' && $password === '1234576@') {
            $demoUser = [
                'id' => 1,
                'name' => 'Nayoka Admin',
                'email' => 'nayoka@qhmanage.com',
                'role' => 'Admin',
                'status' => 'Active',
                'branch_id' => null,
            ];

            $token = bin2hex(random_bytes(32));
            Cache::put("auth_token:{$token}", $demoUser, now()->addDays(7));

            return response()->json([
                'token' => $token,
                'user' => $demoUser,
            ]);
        }

        if (!$user || !Hash::check($password, $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials.',
            ], 401);
        }

        $token = bin2hex(random_bytes(32));
        Cache::put("auth_token:{$token}", [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role ?? 'User',
            'status' => $user->status ?? 'Active',
            'branch_id' => $user->branch_id,
        ], now()->addDays(7));

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role ?? 'User',
                'status' => $user->status ?? 'Active',
                'branch_id' => $user->branch_id,
            ],
        ]);
    }

    public function user(Request $request): JsonResponse
    {
        $token = $this->extractBearerToken($request);

        if (!$token) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $user = Cache::get("auth_token:{$token}");

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        return response()->json($user);
    }

    public function logout(Request $request): JsonResponse
    {
        $token = $this->extractBearerToken($request);

        if ($token) {
            Cache::forget("auth_token:{$token}");
        }

        return response()->json([
            'message' => 'Logged out.',
        ]);
    }

    private function extractBearerToken(Request $request): ?string
    {
        $auth = $request->header('Authorization');

        if (!$auth || !str_starts_with($auth, 'Bearer ')) {
            return null;
        }

        return trim(substr($auth, 7));
    }
}
