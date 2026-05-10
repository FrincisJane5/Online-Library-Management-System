<?php

namespace App\Http\Controllers;

use App\Models\NotificationLog;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $query = NotificationLog::query()->latest();

        if ($search = $request->query('search')) {
            $query->where('student_name', 'like', "%{$search}%");
        }
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }
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
                'preview'     => mb_strimwidth($n->message, 0, 100, '...'),
                'status'      => $n->status,
            ])
        );
    }
}
