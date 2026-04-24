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
            'id_number' => 'required|string|max:50',
            'email' => 'nullable|email',
            'phone' => 'nullable',
            'course' => 'required|in:BSIT,BSBA,BSED,BSCRIM',
            'year' => 'required|in:1st Year,2nd Year,3rd Year,4th Year',
            'purpose' => 'required'
        ]);

        $attendance = Attendance::create([
            'id_number' => $request->id_number,
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

        return response()->json([
            'message' => 'Attendance recorded',
            'attendance' => $attendance,
        ], 201);
    }

public function index()
{
    return \App\Models\Attendance::latest()->get();
}
}