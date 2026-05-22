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
            if (!Schema::hasColumn('users', 'full_name'))  $table->string('full_name')->nullable()->after('name');
            if (!Schema::hasColumn('users', 'username'))   $table->string('username')->nullable()->unique()->after('full_name');
            if (!Schema::hasColumn('users', 'role'))       $table->enum('role', ['admin', 'staff'])->default('staff')->after('password');
            if (!Schema::hasColumn('users', 'status'))     $table->enum('status', ['Active', 'Deactivated'])->default('Active')->after('role');
            if (!Schema::hasColumn('users', 'last_login')) $table->timestamp('last_login')->nullable()->after('status');
        });

        DB::table('users')
            ->whereNull('full_name')
            ->update(['full_name' => DB::raw('name')]);

        DB::table('users')
            ->whereNull('username')
            ->update(['username' => DB::raw("SUBSTR(email, 1, INSTR(email, '@') - 1)")]);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['full_name', 'username', 'role', 'status', 'last_login']);
        });
    }
};
