<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('borrowing_records', function (Blueprint $table) {
            if (!Schema::hasColumn('borrowing_records', 'course')) {
                $table->string('course')->nullable()->after('contact_number');
            }
            if (!Schema::hasColumn('borrowing_records', 'year')) {
                $table->string('year')->nullable()->after('course');
            }
        });
    }

    public function down(): void
    {
        Schema::table('borrowing_records', function (Blueprint $table) {
            $table->dropColumn(['course', 'year']);
        });
    }
};
