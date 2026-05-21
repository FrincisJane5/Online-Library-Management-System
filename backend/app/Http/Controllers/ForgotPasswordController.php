<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;

/**
 * ForgotPasswordController — password reset for both admin and staff.
 * Step 1: POST /api/auth/forgot-password  — verify username, return a short-lived token
 * Step 2: POST /api/auth/reset-password   — verify token, set new password
 */
class ForgotPasswordController extends Controller
{
    /** POST /api/auth/forgot-password */
    public function send(Request $request)
    {
        $request->validate(['username' => 'required|string']);

        $user = User::where('username', $request->username)->first();

        if (!$user) {
            return response()->json(['message' => 'No account found with that username.'], 404);
        }

        // Generate a random token and store it in remember_token
        $token = Str::random(32);
        $user->update(['remember_token' => $token]);

        return response()->json([
            'message' => 'Username verified. You may now set a new password.',
            'token'   => $token,
            'name'    => $user->full_name,
        ]);
    }

    /** POST /api/auth/reset-password */
    public function reset(Request $request)
    {
        $request->validate([
            'token'    => 'required|string',
            'password' => 'required|string|min:6',
        ]);

        $user = User::where('remember_token', $request->token)->first();

        if (!$user) {
            return response()->json(['message' => 'Invalid or expired reset token.'], 422);
        }

        $user->update([
            'password'       => Hash::make($request->password),
            'remember_token' => null,
        ]);

        return response()->json(['message' => 'Password updated successfully. You can now log in.']);
    }
}
