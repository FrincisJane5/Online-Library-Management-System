<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\Request;

/**
 * ActivityLogController — read-only access to the system audit trail.
 * Every significant action (borrow, return, book added, etc.) is logged here.
 */
class ActivityLogController extends Controller
{
    /**
     * GET /api/activity-logs
     * Returns all log entries newest first, with optional filters.
     * Query params: search (description/user), action (type), user (name).
     */
    public function index(Request $request)
    {
        $query = ActivityLog::query()->latest();

        // Filter by keyword — matches description or user_name
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('user_name', 'like', "%{$search}%");
            });
        }

        // Filter by action type (e.g. "Borrow", "Return", "Book Added")
        if ($action = $request->query('action')) {
            $query->where('action', $action);
        }

        // Filter by the name of the user who performed the action
        if ($user = $request->query('user')) {
            $query->where('user_name', $user);
        }

        // Map to the shape expected by the frontend ActivityLogsPage
        $logs = $query->get()->map(fn($log) => [
            'id'       => $log->id,
            'dateTime' => $log->created_at?->format('Y-m-d H:i'),
            'user'     => $log->user_name ?: 'Unknown',
            'role'     => ucfirst($log->user_role ?: 'staff'),
            'action'   => $log->action,
            'details'  => $log->description,
        ]);

        return response()->json($logs);
    }
}
