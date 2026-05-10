<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;

class ForgotPasswordController extends Controller
{
    public function send(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        // Always return success to avoid email enumeration
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'If that email belongs to an admin account, a reset link has been sent.']);
        }

        $tempPassword = Str::random(10);
        $user->update(['password' => \Illuminate\Support\Facades\Hash::make($tempPassword)]);

        Mail::raw(
            "Hello {$user->full_name},\n\nYour temporary password is: {$tempPassword}\n\nPlease log in and change it immediately.\n\n— Library System",
            function ($message) use ($user) {
                $message->to($user->email)->subject('Library System – Password Reset');
            }
        );

        return response()->json(['message' => 'If that email belongs to an admin account, a reset link has been sent.']);
    }
}
