<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Attendance;
use App\Models\ActivityLog;

class AttendanceController extends Controller
{
    // Show form (QR page)
    public function scanForm()
    {
        return view('attendance'); // blade file
    }

    // Save attendance
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'email' => 'nullable|email',
            'phone' => 'nullable',
            'course' => 'required',
            'year' => 'required',
            'purpose' => 'required'
        ]);

        $attendance = Attendance::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'course' => $request->course,
            'year' => $request->year,
            'purpose' => $request->purpose,
        ]);

        // 🔥 LOG ACTIVITY
        ActivityLog::create([
            'action' => 'Attendance',
            'description' => $request->name . ' logged attendance'
        ]);

        return redirect()->back()->with('success', 'Attendance recorded!');
    }

public function index()
{
    return \App\Models\Attendance::latest()->get();
}
}