<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('full_name')->nullable()->after('name');
            $table->string('username')->nullable()->unique()->after('full_name');
            $table->enum('role', ['admin', 'staff'])->default('staff')->after('password');
            $table->enum('status', ['Active', 'Deactivated'])->default('Active')->after('role');
            $table->timestamp('last_login')->nullable()->after('status');
        });

        DB::table('users')
            ->whereNull('full_name')
            ->update(['full_name' => DB::raw('name')]);

        DB::table('users')
            ->whereNull('username')
            ->update(['username' => DB::raw("SUBSTRING_INDEX(email, '@', 1)")]);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['full_name', 'username', 'role', 'status', 'last_login']);
        });
    }
};
