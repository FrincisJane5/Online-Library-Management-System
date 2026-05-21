<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Attendance;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * AttendanceController — manages library visit records.
 * Public routes: store, checkId, lookup.
 * Staff/admin route: index.
 */
class AttendanceController extends Controller
{
    /**
     * GET /api/attendance
     * Returns all attendance records newest first (Attendance Management page).
     */
    public function index()
    {
        return response()->json(
            Attendance::latest()->get()->map(fn($a) => [
                'id'         => $a->id,
                'id_number'  => $a->id_number,
                'name'       => $a->name,
                'email'      => $a->email,
                'phone'      => $a->phone,
                'course'     => $a->course,
                'year'       => $a->year,
                'purpose'    => $a->purpose,
                // Convert to Manila timezone for display
                'created_at' => $a->created_at?->setTimezone('Asia/Manila')->format('Y-m-d H:i'),
            ])
        );
    }

    /**
     * GET /api/attendance/check-id?id_number=xxx
     * Returns whether this ID has already been logged today.
     * Used by the public form to warn about duplicate entries.
     */
    public function checkId(Request $request)
    {
        $idNumber = $request->query('id_number', '');

        $exists = Attendance::where('id_number', $idNumber)
            ->whereDate('created_at', now('Asia/Manila')->toDateString())
            ->exists();

        return response()->json(['exists' => $exists]);
    }

    /**
     * GET /api/attendance/lookup?id_number=xxx
     * Returns the most recent record for this ID to auto-fill the form.
     */
    public function lookup(Request $request)
    {
        $record = Attendance::where('id_number', $request->query('id_number', ''))
            ->latest()->first();

        if (!$record) {
            return response()->json(['found' => false]);
        }

        return response()->json([
            'found'  => true,
            'name'   => $record->name,
            'email'  => $record->email,
            'phone'  => $record->phone,
            'course' => $record->course,
            'year'   => $record->year,
        ]);
    }

    /**
     * POST /api/attendance
     * Validates and saves a new attendance record from the public form.
     * Also upserts a student profile and writes an activity log entry.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'id_number'   => 'required|string|max:10',
            'first_name'  => 'required|string|max:50',
            'middle_name' => 'nullable|string|max:50',
            'last_name'   => 'required|string|max:50',
            'suffix'      => 'nullable|string|max:10',
            'name'        => 'required|string|max:255',
            'email'       => 'required|email|max:100',
            'phone'       => ['required', 'string', 'regex:/^\d{11}$/'], // Must be exactly 11 digits
            'course'      => 'required|string|exists:programs,code',     // Must be a valid program code
            'year'        => 'required|string|max:20',
            'purpose'     => 'required|string|max:255',
        ]);

        // Reject duplicate ID for today
        $alreadyLogged = Attendance::where('id_number', $data['id_number'])
            ->whereDate('created_at', now('Asia/Manila')->toDateString())
            ->exists();

        if ($alreadyLogged) {
            return response()->json(['message' => 'This ID number has already been recorded today.'], 422);
        }

        return DB::transaction(function () use ($data) {
            // Upsert student profile — non-fatal if students table isn't migrated yet
            try {
                Student::firstOrCreate(
                    ['contact_number' => $data['phone']],
                    [
                        'student_id_number' => $data['id_number'],
                        'name'              => $data['name'],
                        'email'             => $data['email'],
                        'course'            => $data['course'],
                        'year_level'        => $data['year'],
                    ]
                );
            } catch (\Throwable $e) {
                // Students table not yet migrated — skip silently
            }

            // Save the attendance record
            $attendance = Attendance::create([
                'id_number' => $data['id_number'],
                'name'      => $data['name'],
                'email'     => $data['email'],
                'phone'     => $data['phone'],
                'course'    => $data['course'],
                'year'      => $data['year'],
                'purpose'   => $data['purpose'],
            ]);

            // Log the visit for the activity log page
            ActivityLog::create([
                'action'      => 'Attendance',
                'description' => "{$data['name']} logged attendance",
                'user_name'   => $data['name'],
                'user_role'   => 'Student',
            ]);

            return response()->json(['message' => 'Attendance recorded', 'attendance' => $attendance], 201);
        });
    }
}
