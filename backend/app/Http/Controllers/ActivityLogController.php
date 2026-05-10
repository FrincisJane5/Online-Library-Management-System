<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function notifications()
    {
        $logs = \App\Models\ActivityLog::where('action', 'Notification')
            ->latest()
            ->get()
            ->map(fn($log) => [
                'id'          => $log->id,
                'dateTime'    => $log->created_at?->format('Y-m-d H:i'),
                'description' => $log->description,
                'sentBy'      => $log->user_name ?: 'System',
            ]);

        return response()->json($logs);
    }

    public function index(Request $request)
    {
        $query = ActivityLog::query()->latest();

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('user_name', 'like', "%{$search}%");
            });
        }

        if ($action = $request->query('action')) {
            $query->where('action', $action);
        }

        if ($user = $request->query('user')) {
            $query->where('user_name', $user);
        }

        $logs = $query->get()->map(fn($log) => [
            'id'          => $log->id,
            'dateTime'    => $log->created_at?->format('Y-m-d H:i'),
            'user'        => $log->user_name ?: 'Unknown',
            'role'        => ucfirst($log->user_role ?: 'staff'),
            'action'      => $log->action,
            'details'     => $log->description,
        ]);

        return response()->json($logs);
    }
}
