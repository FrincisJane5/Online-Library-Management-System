<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\LibrarySetting;
use Illuminate\Http\Request;

class LibrarySettingController extends Controller
{
    public function show()
    {
        $settings = LibrarySetting::query()->firstOrCreate([], [
            'loan_duration' => 7,
            'fine_rate' => 5,
            'open_time' => '08:00',
            'close_time' => '17:00',
            'email_notifications' => true,
            'sms_notifications' => false,
            'library_policies' => '',
        ]);

        return response()->json($settings);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'loan_duration' => 'required|integer|min:1',
            'fine_rate' => 'required|numeric|min:0',
            'open_time' => 'required|string',
            'close_time' => 'required|string',
            'email_notifications' => 'required|boolean',
            'sms_notifications' => 'required|boolean',
            'library_policies' => 'nullable|string',
        ]);

        $settings = LibrarySetting::query()->firstOrCreate([]);
        $settings->update($validated);

        ActivityLog::create([
            'action' => 'Settings',
            'description' => 'Library settings were updated',
        ]);

        return response()->json($settings->fresh());
    }
}
