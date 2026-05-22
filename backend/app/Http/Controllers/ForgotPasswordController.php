<?php

namespace App\Http\Controllers;

use App\Mail\PasswordResetMail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

/**
 * ForgotPasswordController — OTP-based password reset for admin and staff.
 * Step 1: POST /api/auth/forgot-password  — look up user by email, send 6-digit OTP
 * Step 2: POST /api/auth/verify-otp       — verify OTP, return a short-lived token
 * Step 3: POST /api/auth/reset-password   — verify token, set new password
 */
class ForgotPasswordController extends Controller
{
    /** POST /api/auth/forgot-password */
    public function send(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'No account found with that email address.'], 422);
        }

        // Generate a 6-digit OTP with 15-minute expiry
        $otp     = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $expires = now()->addMinutes(15)->toDateTimeString();

        $user->update(['remember_token' => 'otp:' . $otp . '|' . $expires]);

        Mail::to($user->email)->send(new PasswordResetMail($user->full_name, $otp));

        return response()->json(['message' => 'If that email is registered, a code has been sent.']);
    }

    /** POST /api/auth/verify-otp */
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp'   => 'required|string|size:6',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !str_starts_with($user->remember_token ?? '', 'otp:')) {
            return response()->json(['message' => 'Invalid or expired code.'], 422);
        }

        // Parse stored OTP and expiry
        $stored  = substr($user->remember_token, 4); // strip "otp:"
        [$storedOtp, $expires] = explode('|', $stored);

        if ($request->otp !== $storedOtp || now()->isAfter($expires)) {
            return response()->json(['message' => 'Invalid or expired code.'], 422);
        }

        // OTP verified — swap for a short-lived reset token (5 min)
        $token   = bin2hex(random_bytes(32));
        $expires = now()->addMinutes(5)->toDateTimeString();
        $user->update(['remember_token' => 'reset:' . $token . '|' . $expires]);

        return response()->json(['token' => $token]);
    }

    /** POST /api/auth/reset-password */
    public function reset(Request $request)
    {
        $request->validate([
            'token'    => 'required|string',
            'password' => 'required|string|min:6',
        ]);

        $user = User::where('remember_token', 'like', 'reset:' . $request->token . '|%')->first();

        if (!$user) {
            return response()->json(['message' => 'Invalid or expired session. Please start over.'], 422);
        }

        [, $expires] = explode('|', substr($user->remember_token, 6)); // strip "reset:"
        if (now()->isAfter($expires)) {
            $user->update(['remember_token' => null]);
            return response()->json(['message' => 'Session expired. Please start over.'], 422);
        }

        $user->update([
            'password'       => Hash::make($request->password),
            'remember_token' => null,
        ]);

        return response()->json(['message' => 'Password updated successfully. You can now log in.']);
    }
}
