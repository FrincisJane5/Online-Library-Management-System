<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;    
use App\Models\Attendance;
use App\Models\Student;
use App\Models\Book;
use App\Models\Borrow;
use App\Models\ActivityLog;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        // 📊 Daily Attendance (last 7 days)
        $attendance = Attendance::selectRaw('DATE(created_at) as date, COUNT(*) as total')
            ->where('created_at', '>=', Carbon::now()->subDays(7))
            ->groupBy('date')
            ->orderBy('date', 'ASC')
            ->get();

        // 📦 Stats
        $totalStudents = Student::count();
        $totalBooks = Book::count();
        $totalBorrowed = Borrow::where('status', 'borrowed')->count();

        // 🕒 Recent Activity (latest 5)
        $activities = ActivityLog::latest()->take(5)->get();

        return response()->json([
            'attendance_chart' => $attendance,
            'stats' => [
                'students' => $totalStudents,
                'books' => $totalBooks,
                'borrowed' => $totalBorrowed,
            ],
            'recent_activity' => $activities
        ]);
    }
}