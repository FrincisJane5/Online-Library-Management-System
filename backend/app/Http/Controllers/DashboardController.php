<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Attendance;
use App\Models\Book;
use App\Models\ActivityLog;
use App\Models\BorrowingRecord;
use Carbon\Carbon;

/**
 * DashboardController — aggregates all data shown on the dashboard in one request.
 * Returns stats, weekly attendance chart, department visit breakdown, and recent activity.
 */
class DashboardController extends Controller
{
    /**
     * GET /api/dashboard
     */
    public function index()
    {
        // Build Mon–Sat range for the current week in Manila time
        $monday   = Carbon::now('Asia/Manila')->startOfWeek(Carbon::MONDAY);
        $saturday = (clone $monday)->addDays(5);

        // Fetch daily attendance totals for Mon–Sat, keyed by Manila date string
        // Convert created_at to Manila time before grouping by date to avoid UTC mismatch
        $attendanceRaw = Attendance::selectRaw("DATE(CONVERT_TZ(created_at, '+00:00', '+08:00')) as date, COUNT(*) as total")
            ->whereBetween('created_at', [$monday->copy()->startOfDay()->utc(), $saturday->copy()->endOfDay()->utc()])
            ->groupBy('date')
            ->orderBy('date', 'ASC')
            ->get()
            ->keyBy('date');

        // Build a 6-element array (Mon–Sat), filling 0 for days with no visits
        $attendance = collect(range(0, 5))->map(function ($offset) use ($monday, $attendanceRaw) {
            $date = $monday->copy()->addDays($offset);
            return [
                'date'  => $date->format('D'), // Short day name: "Mon", "Tue", etc.
                'total' => (int) ($attendanceRaw[$date->toDateString()]->total ?? 0),
            ];
        });

        // Unique students who visited this week (by distinct ID number)
        $totalStudents = Attendance::whereBetween('created_at', [$monday->copy()->startOfDay(), $saturday->copy()->endOfDay()])
            ->distinct('id_number')->count('id_number');

        $totalBooks    = Book::count();
        $totalBorrowed = BorrowingRecord::where('status', 'borrowed')->count();
        $totalFines    = (float) BorrowingRecord::where('fine_status', 'Unpaid')->sum('fine_amount');

        // Latest 5 activity log entries for the dashboard feed
        $activities = ActivityLog::latest()->take(5)->get()->map(fn($log) => [
            'id'          => $log->id,
            'action'      => $log->action,
            'description' => $log->description,
            'user_name'   => $log->user_name,
            'created_at'  => $log->created_at?->setTimezone('Asia/Manila')->format('Y-m-d H:i'),
        ]);

        // Today's attendance grouped by course for the department bar chart
        // Use UTC range covering the full Manila day to avoid timezone mismatch on the server
        $todayManila = Carbon::now('Asia/Manila');
        $startUtc    = $todayManila->copy()->startOfDay()->utc();
        $endUtc      = $todayManila->copy()->endOfDay()->utc();

        $byDept = Attendance::selectRaw('course, COUNT(*) as total')
            ->whereBetween('created_at', [$startUtc, $endUtc])
            ->whereNotNull('course')
            ->groupBy('course')
            ->orderByDesc('total')
            ->get()
            ->map(fn($r) => ['course' => $r->course, 'visits' => (int) $r->total]);

        return response()->json([
            'attendance_chart'     => $attendance,
            'visits_by_department' => $byDept,
            'stats' => [
                'students' => $totalStudents,
                'books'    => $totalBooks,
                'borrowed' => $totalBorrowed,
                'fines'    => $totalFines,
            ],
            'recent_activity' => $activities,
        ]);
    }
}
