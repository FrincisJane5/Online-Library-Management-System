<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

/**
 * AuthController — handles staff and admin login.
 * Uses username + password authentication.
 * The frontend stores the returned user in localStorage and attaches
 * X-User-Name / X-User-Role headers to every subsequent request.
 */
class AuthController extends Controller
{
    /**
     * POST /api/auth/login
     * Validates credentials and returns the user profile if successful.
     */
    public function login(Request $request)
    {
        // Validate that both fields are present
        $credentials = $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        // Look up the user by username
        $user = User::where('username', $credentials['username'])->first();

        // Reject if user not found or password doesn't match the stored hash
        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            return response()->json(['message' => 'Invalid username or password'], 422);
        }

        // Reject inactive accounts with a role-appropriate message
        if (strtolower($user->status) !== 'active') {
            $message = $user->role === 'admin'
                ? 'Your account has been deactivated. Please contact the system administrator.'
                : 'Your account has been set to Inactive. Please contact the Librarian (Admin) to restore access.';
            return response()->json(['message' => $message], 403);
        }

        // Record the login timestamp for the "Last Login" column in User Management
        $user->update(['last_login' => now()]);

        // Build full URL for profile picture (stored as relative path in DB)
        $profilePicture = null;
        if ($user->profile_picture) {
            $pic = $user->profile_picture;
            // Already a full URL (http/https) — use as-is
            if (str_starts_with($pic, 'http')) {
                $profilePicture = $pic;
            } else {
                // Strip leading slash/storage prefix if present, then build full URL
                $pic = ltrim($pic, '/');
                $pic = preg_replace('#^storage/#', '', $pic);
                $profilePicture = url('storage/' . $pic);
            }
        }

        // Return only the fields the frontend needs — never expose the password
        return response()->json([
            'id'             => (string) $user->id,
            'username'       => $user->username,
            'fullName'       => $user->full_name,
            'firstName'      => $user->first_name,
            'lastName'       => $user->last_name,
            'role'           => $user->role,
            'status'         => $user->status,
            'email'          => $user->email,
            'contactNumber'  => $user->contact_number,
            'profilePicture' => $profilePicture,
        ]);
    }
}
