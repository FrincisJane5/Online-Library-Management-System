<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Add total_years to programs
        Schema::table('programs', function (Blueprint $table) {
            $table->unsignedTinyInteger('total_years')->default(4)->after('name');
        });

        // Seed default programs
        DB::table('programs')->insertOrIgnore([
            ['code' => 'BSIT',   'name' => 'Bachelor of Science in Information Technology', 'total_years' => 4, 'created_at' => now(), 'updated_at' => now()],
            ['code' => 'BSBA',   'name' => 'Bachelor of Science in Business Administration', 'total_years' => 4, 'created_at' => now(), 'updated_at' => now()],
            ['code' => 'BSED',   'name' => 'Bachelor of Secondary Education', 'total_years' => 4, 'created_at' => now(), 'updated_at' => now()],
            ['code' => 'BSCRIM', 'name' => 'Bachelor of Science in Criminology', 'total_years' => 4, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Add program_id FK to students
        Schema::table('students', function (Blueprint $table) {
            $table->foreignId('program_id')->nullable()->after('id')
                  ->constrained('programs')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropForeign(['program_id']);
            $table->dropColumn('program_id');
        });
        Schema::table('programs', function (Blueprint $table) {
            $table->dropColumn('total_years');
        });
    }
};
