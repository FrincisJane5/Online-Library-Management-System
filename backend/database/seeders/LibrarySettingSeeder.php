<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LibrarySettingSeeder extends Seeder
{
    public function run(): void
    {
        // Only insert if no settings row exists yet
        if (DB::table('library_settings')->count() === 0) {
            DB::table('library_settings')->insert([
                'loan_duration'       => 7,
                'fine_rate'           => 5.00,
                'open_time'           => '08:00',
                'close_time'          => '17:00',
                'email_notifications' => true,
                'sms_notifications'   => false,
                'library_policies'    => "1. Books must be returned within the loan period.\n2. A fine of ₱5.00 per day is charged for overdue books.\n3. Lost or damaged books must be replaced or paid for.\n4. Library cards are non-transferable.",
                'created_at'          => now(),
                'updated_at'          => now(),
            ]);
        }
    }
}
