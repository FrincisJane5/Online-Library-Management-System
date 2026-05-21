<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\LibrarySetting;
use Illuminate\Http\Request;

/**
 * LibrarySettingController — manages the single row of global library configuration.
 * GET is open to all staff; PUT is admin-only (enforced by the 'admin' middleware on the route).
 */
class LibrarySettingController extends Controller
{
    /**
     * GET /api/settings
     * Returns current settings, creating defaults on first run.
     */
    public function show()
    {
        // firstOrCreate with empty conditions ensures exactly one row always exists
        $settings = LibrarySetting::query()->firstOrCreate([], [
            'loan_duration'       => 7,
            'fine_rate'           => 5,
            'damaged_fine'        => 100,
            'lost_fine'           => 500,
            'open_time'           => '08:00',
            'close_time'          => '17:00',
            'email_notifications' => true,
            'sms_notifications'   => false,
            'library_policies'    => '',
        ]);

        return response()->json($settings);
    }

    /**
     * PUT /api/settings
     * Validates and saves updated settings, then logs the change.
     */
    public function update(Request $request)
    {
        $validated = $request->validate([
            'loan_duration'       => 'required|integer|min:1',
            'fine_rate'           => 'required|numeric|min:0',
            'damaged_fine'        => 'required|numeric|min:0',
            'lost_fine'           => 'required|numeric|min:0',
            'open_time'           => 'required|string',
            'close_time'          => 'required|string',
            'email_notifications' => 'required|boolean',
            'sms_notifications'   => 'required|boolean',
            'library_policies'    => 'nullable|string',
        ]);

        $settings = LibrarySetting::query()->firstOrCreate([]);
        $settings->update($validated);

        ActivityLog::create([
            'action'      => 'Settings',
            'description' => 'Library settings were updated',
            'user_name'   => $request->header('X-User-Name', ''),
            'user_role'   => $request->header('X-User-Role', 'admin'),
        ]);

        return response()->json($settings->fresh());
    }
}
