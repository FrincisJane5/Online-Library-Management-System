<?php

namespace App\Http\Controllers;

use App\Models\NotificationLog;
use Illuminate\Http\Request;

/**
 * NotificationController — read-only access to the notification history.
 * Shows every overdue reminder that was sent (or failed) for admin review.
 */
class NotificationController extends Controller
{
    /**
     * GET /api/notifications
     * Returns all notification logs newest first.
     * Supports filters: search (student name), status (Sent/Failed), type.
     */
    public function index(Request $request)
    {
        $query = NotificationLog::query()->latest();

        // Filter by student name
        if ($search = $request->query('search')) {
            $query->where('student_name', 'like', "%{$search}%");
        }
        // Filter by delivery status: "Sent" or "Failed"
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }
        // Filter by notification type: "Overdue" or "Fine Reminder"
        if ($type = $request->query('type')) {
            $query->where('type', $type);
        }

        return response()->json(
            $query->get()->map(fn($n) => [
                'id'          => $n->id,
                'dateTime'    => $n->sent_at?->format('Y-m-d H:i') ?? $n->created_at?->format('Y-m-d H:i'),
                'studentName' => $n->student_name,
                'email'       => $n->student_email,
                'callNumber'  => $n->call_number,
                'bookTitle'   => $n->book_title,
                'type'        => $n->type,
                'message'     => $n->message,
                'preview'     => mb_strimwidth($n->message, 0, 100, '...'), // Truncated preview for the table
                'status'      => $n->status,
            ])
        );
    }
}
