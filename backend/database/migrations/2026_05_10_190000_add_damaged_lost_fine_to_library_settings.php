<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('library_settings', function (Blueprint $table) {
            $table->decimal('damaged_fine', 10, 2)->default(100)->after('fine_rate');
            $table->decimal('lost_fine', 10, 2)->default(500)->after('damaged_fine');
        });
    }

    public function down(): void
    {
        Schema::table('library_settings', function (Blueprint $table) {
            $table->dropColumn(['damaged_fine', 'lost_fine']);
        });
    }
};
