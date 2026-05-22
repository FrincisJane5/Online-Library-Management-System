<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

/**
 * UserManagementController — admin-only CRUD for library staff accounts.
 * All routes in this controller are protected by the 'admin' middleware.
 */
class UserManagementController extends Controller
{
    /**
     * GET /api/users
     * Returns all user accounts, newest first.
     */
    public function index()
    {
        return response()->json(
            User::query()
                ->select(['id', 'full_name', 'username', 'email', 'role', 'status', 'created_at', 'last_login'])
                ->orderByDesc('created_at')
                ->get()
                ->map(fn(User $u) => [
                    'id'          => $u->id,
                    'fullName'    => $u->full_name,
                    'username'    => $u->username,
                    'email'       => $u->email,
                    'role'        => ucfirst($u->role),
                    'status'      => $u->status,
                    'dateCreated' => optional($u->created_at)->format('Y-m-d'),
                    'lastLogin'   => optional($u->last_login)->format('Y-m-d H:i') ?? 'Never',
                ])
        );
    }

    /**
     * POST /api/users
     * Creates a new staff or admin account.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'email'     => 'required|email|unique:users,email',
            'username'  => 'required|string|max:100|unique:users,username',
            'password'  => 'required|string|min:6',
            'role'      => 'required|in:staff,admin',
        ]);

        // New accounts are Active by default
        $user = User::create([
            'name'      => $validated['full_name'],
            'full_name' => $validated['full_name'],
            'email'     => $validated['email'],
            'username'  => $validated['username'],
            'password'  => $validated['password'], // Auto-hashed via the 'hashed' cast on the model
            'role'      => $validated['role'],
            'status'    => 'Active',
        ]);

        return response()->json([
            'id'          => $user->id,
            'fullName'    => $user->full_name,
            'username'    => $user->username,
            'email'       => $user->email,
            'role'        => ucfirst($user->role),
            'status'      => $user->status,
            'dateCreated' => optional($user->created_at)->format('Y-m-d'),
            'lastLogin'   => 'Never',
        ], 201);
    }

    /**
     * PUT /api/users/{user}
     * Updates a user's profile. Password is only updated if provided.
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'email'     => 'required|email|unique:users,email,' . $user->id,
            'username'  => 'required|string|max:100|unique:users,username,' . $user->id,
            'password'  => 'nullable|string|min:6',
        ]);

        $updateData = [
            'full_name' => $validated['full_name'],
            'email'     => $validated['email'],
            'username'  => $validated['username'],
        ];

        // Only update password if a new one was provided
        if (!empty($validated['password'])) {
            $updateData['password'] = $validated['password'];
        }

        $user->update($updateData);

        return response()->json([
            'message'  => 'Account updated',
            'fullName' => $user->full_name,
            'username' => $user->username,
            'email'    => $user->email,
            'role'     => ucfirst($user->role),
        ]);
    }

    /**
     * PATCH /api/users/{user}/reset-password
     * Resets a user's password to a new value provided by the admin.
     */
    public function resetPassword(Request $request, User $user)
    {
        $validated = $request->validate(['password' => 'required|string|min:6']);
        $user->update(['password' => $validated['password']]);
        return response()->json(['message' => 'Password reset successfully']);
    }

    /**
     * PATCH /api/users/{user}/status
     * Activates or deactivates a staff account.
     * Admin accounts cannot be deactivated through this endpoint.
     */
    public function setStatus(Request $request, User $user)
    {
        $validated = $request->validate(['status' => 'required|in:Active,Inactive']);

        // Prevent admins from being locked out via this endpoint
        if ($user->role === 'admin') {
            return response()->json(['message' => 'Admin account status cannot be changed'], 422);
        }

        $user->update(['status' => $validated['status']]);
        return response()->json(['message' => 'Status updated']);
    }
}
