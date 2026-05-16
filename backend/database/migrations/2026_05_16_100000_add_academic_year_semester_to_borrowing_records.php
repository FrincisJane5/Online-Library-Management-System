<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('borrowing_records', function (Blueprint $table) {
            if (!Schema::hasColumn('borrowing_records', 'academic_year')) {
                $table->string('academic_year')->nullable()->after('year');
            }
            if (!Schema::hasColumn('borrowing_records', 'semester')) {
                $table->string('semester')->nullable()->after('academic_year');
            }
        });
    }

    public function down(): void
    {
        Schema::table('borrowing_records', function (Blueprint $table) {
            $table->dropColumn(['academic_year', 'semester']);
        });
    }
};
