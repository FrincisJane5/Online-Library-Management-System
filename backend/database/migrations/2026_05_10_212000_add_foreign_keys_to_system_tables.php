<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. attendances.student_id → students.id
        Schema::table('attendances', function (Blueprint $table) {
            if (!Schema::hasColumn('attendances', 'student_id')) {
                $table->foreignId('student_id')->nullable()->after('id')
                      ->constrained('students')->nullOnDelete();
            }
        });

        // Backfill: match attendance to student by id_number
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("
                UPDATE attendances a
                JOIN students s ON s.student_id_number = a.id_number
                SET a.student_id = s.id
                WHERE a.student_id IS NULL
            ");
        } else {
            DB::statement("
                UPDATE attendances SET student_id = (
                    SELECT id FROM students WHERE students.student_id_number = attendances.id_number LIMIT 1
                ) WHERE student_id IS NULL
            ");
        }

        // 2. borrowing_records.student_id → students.id
        Schema::table('borrowing_records', function (Blueprint $table) {
            if (!Schema::hasColumn('borrowing_records', 'student_id')) {
                $table->foreignId('student_id')->nullable()->after('book_id')
                      ->constrained('students')->nullOnDelete();
            }
        });

        // Backfill: match borrow to student by id_number
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("
                UPDATE borrowing_records br
                JOIN students s ON s.student_id_number = br.id_number
                SET br.student_id = s.id
                WHERE br.student_id IS NULL
            ");
        } else {
            DB::statement("
                UPDATE borrowing_records SET student_id = (
                    SELECT id FROM students WHERE students.student_id_number = borrowing_records.id_number LIMIT 1
                ) WHERE student_id IS NULL
            ");
        }

        // 3. activity_logs.user_id → users.id
        Schema::table('activity_logs', function (Blueprint $table) {
            if (!Schema::hasColumn('activity_logs', 'user_id')) {
                $table->foreignId('user_id')->nullable()->after('id')
                      ->constrained('users')->nullOnDelete();
            }
        });

        // Backfill: match log to user by user_name (username or full_name)
        if (DB::getDriverName() !== 'sqlite') {
            DB::statement("
                UPDATE activity_logs al
                JOIN users u ON u.full_name = al.user_name OR u.username = al.user_name
                SET al.user_id = u.id
                WHERE al.user_id IS NULL
            ");
        } else {
            DB::statement("
                UPDATE activity_logs SET user_id = (
                    SELECT id FROM users
                    WHERE users.full_name = activity_logs.user_name OR users.username = activity_logs.user_name
                    LIMIT 1
                ) WHERE user_id IS NULL
            ");
        }
    }

    public function down(): void
    {
        Schema::table('activity_logs', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');
        });
        Schema::table('borrowing_records', function (Blueprint $table) {
            $table->dropForeign(['student_id']);
            $table->dropColumn('student_id');
        });
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropForeign(['student_id']);
            $table->dropColumn('student_id');
        });
    }
};
