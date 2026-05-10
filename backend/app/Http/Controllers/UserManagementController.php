<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserManagementController extends Controller
{
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

    public function store(Request $request)
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'email'     => 'required|email|unique:users,email',
            'username'  => 'required|string|max:100|unique:users,username',
            'password'  => 'required|string|min:6',
            'role'      => 'required|in:staff,admin',
        ]);

        $user = User::create([
            'name'      => $validated['full_name'],
            'full_name' => $validated['full_name'],
            'email'     => $validated['email'],
            'username'  => $validated['username'],
            'password'  => $validated['password'],
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

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'email'     => 'required|email|unique:users,email,' . $user->id,
            'username'  => 'required|string|max:100|unique:users,username,' . $user->id,
            'password'  => 'nullable|string|min:6',
        ]);

        $updateData = [
            'name'      => $validated['full_name'],
            'full_name' => $validated['full_name'],
            'email'     => $validated['email'],
            'username'  => $validated['username'],
        ];

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

    public function resetPassword(Request $request, User $user)
    {
        $validated = $request->validate(['password' => 'required|string|min:6']);
        $user->update(['password' => $validated['password']]);
        return response()->json(['message' => 'Password reset successfully']);
    }

    public function setStatus(Request $request, User $user)
    {
        $validated = $request->validate(['status' => 'required|in:Active,Inactive']);

        if ($user->role === 'admin') {
            return response()->json(['message' => 'Admin account status cannot be changed'], 422);
        }

        $user->update(['status' => $validated['status']]);
        return response()->json(['message' => 'Status updated']);
    }
}
