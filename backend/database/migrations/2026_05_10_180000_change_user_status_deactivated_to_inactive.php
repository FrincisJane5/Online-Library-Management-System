<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Update existing Deactivated values first
        DB::table('users')->where('status', 'Deactivated')->update(['status' => 'Inactive']);

        // Change the ENUM to replace Deactivated with Inactive
        DB::statement("ALTER TABLE users MODIFY COLUMN status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active'");
    }

    public function down(): void
    {
        DB::table('users')->where('status', 'Inactive')->update(['status' => 'Deactivated']);
        DB::statement("ALTER TABLE users MODIFY COLUMN status ENUM('Active', 'Deactivated') NOT NULL DEFAULT 'Active'");
    }
};
