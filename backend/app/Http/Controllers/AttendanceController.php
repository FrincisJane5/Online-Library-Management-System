<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Attendance;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AttendanceController extends Controller
{
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
                'created_at' => $a->created_at?->format('Y-m-d H:i'),
            ])
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'id_number' => 'required|string|max:50',
            'name'      => 'required|string|max:255',
            'course'    => 'required|string|exists:programs,code',
            'year'      => 'required|string|max:20',
            'purpose'   => 'required|string|max:255',
        ]);

        return DB::transaction(function () use ($data) {
            // Attempt to upsert student record — non-fatal if students table isn't migrated yet
            try {
                Student::firstOrCreate(
                    ['contact_number' => $data['phone']],
                    [
                        'student_id_number' => $data['id_number'],
                        'name'              => $data['name'],
                        'email'             => $data['email'] ?? null,
                        'course'            => $data['course'],
                        'year_level'        => $data['year'],
                    ]
                );
            } catch (\Throwable $e) {
                // Students table not yet migrated — skip silently
            }

            $attendance = Attendance::create([
                'id_number' => $data['id_number'],
                'name'      => $data['name'],
                'course'    => $data['course'],
                'year'      => $data['year'],
                'purpose'   => $data['purpose'],
            ]);

            ActivityLog::create([
                'action'      => 'Attendance',
                'description' => "{$data['name']} logged attendance",
                'user_name'   => $data['name'],
                'user_role'   => 'Student',
            ]);

            return response()->json([
                'message'    => 'Attendance recorded',
                'attendance' => $attendance,
            ], 201);
        });
    }
}
