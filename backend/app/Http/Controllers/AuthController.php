<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('username', $credentials['username'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            return response()->json(['message' => 'Invalid username or password'], 422);
        }

        if ($user->status !== 'Active') {
            return response()->json(['message' => 'This account is deactivated'], 403);
        }

        $user->update(['last_login' => now()]);

        return response()->json([
            'id' => (string) $user->id,
            'username' => $user->username,
            'fullName' => $user->full_name,
            'role' => $user->role,
            'status' => $user->status,
        ]);
    }
}
