<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;    
use App\Models\Attendance;
use App\Models\Student;
use App\Models\Book;
use App\Models\Borrow;
use App\Models\ActivityLog;
use App\Models\BorrowingRecord;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $monday = Carbon::now()->startOfWeek(Carbon::MONDAY);
        $saturday = (clone $monday)->addDays(5);
        $attendanceRaw = Attendance::selectRaw('DATE(created_at) as date, COUNT(*) as total')
            ->whereBetween('created_at', [$monday->copy()->startOfDay(), $saturday->copy()->endOfDay()])
            ->groupBy('date')
            ->orderBy('date', 'ASC')
            ->get()
            ->keyBy('date');
        $attendance = collect(range(0, 5))->map(function ($offset) use ($monday, $attendanceRaw) {
            $date = $monday->copy()->addDays($offset);
            return [
                'date' => $date->format('D'),
                'total' => (int) ($attendanceRaw[$date->toDateString()]->total ?? 0),
            ];
        });

        // 📦 Stats
        $totalStudents = Student::count();
        $totalBooks = Book::count();
        $totalBorrowed = Borrow::where('status', 'borrowed')->count();
        $totalFines = BorrowingRecord::where('fine_status', 'Unpaid')->sum('fine_amount');

        // 🕒 Recent Activity (latest 5)
        $activities = ActivityLog::latest()->take(5)->get();

        return response()->json([
            'attendance_chart' => $attendance,
            'stats' => [
                'students' => $totalStudents,
                'books' => $totalBooks,
                'borrowed' => $totalBorrowed,
                'fines' => $totalFines,
            ],
            'recent_activity' => $activities
        ]);
    }
}