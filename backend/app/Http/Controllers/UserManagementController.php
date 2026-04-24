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
                ->select(['id', 'full_name', 'username', 'role', 'status', 'created_at', 'last_login'])
                ->orderByDesc('created_at')
                ->get()
                ->map(function (User $user) {
                    return [
                        'id' => $user->id,
                        'fullName' => $user->full_name,
                        'username' => $user->username,
                        'role' => ucfirst($user->role),
                        'status' => $user->status,
                        'dateCreated' => optional($user->created_at)->format('Y-m-d'),
                        'lastLogin' => optional($user->last_login)->format('Y-m-d H:i') ?? 'Never',
                    ];
                })
        );
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'username' => 'required|string|max:100|unique:users,username',
            'password' => 'required|string|min:6',
            'role' => 'required|in:staff',
        ]);

        $user = User::create([
            'full_name' => $validated['full_name'],
            'name' => $validated['full_name'],
            'username' => $validated['username'],
            'email' => $validated['username'] . '@local.library',
            'password' => $validated['password'],
            'role' => $validated['role'],
            'status' => 'Active',
        ]);

        return response()->json([
            'id' => $user->id,
            'fullName' => $user->full_name,
            'username' => $user->username,
            'role' => ucfirst($user->role),
            'status' => $user->status,
            'dateCreated' => optional($user->created_at)->format('Y-m-d'),
            'lastLogin' => 'Never',
        ], 201);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'username' => 'required|string|max:100|unique:users,username,' . $user->id,
        ]);

        $user->update([
            'full_name' => $validated['full_name'],
            'name' => $validated['full_name'],
            'username' => $validated['username'],
        ]);

        return response()->json([
            'message' => 'Staff account updated',
            'fullName' => $user->full_name,
            'username' => $user->username,
        ]);
    }

    public function setStatus(Request $request, User $user)
    {
        $validated = $request->validate([
            'status' => 'required|in:Active,Deactivated',
        ]);

        if ($user->role === 'admin') {
            return response()->json(['message' => 'Admin account status cannot be changed'], 422);
        }

        $user->update(['status' => $validated['status']]);

        return response()->json(['message' => 'Status updated']);
    }
}
