<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('borrowing_records', function (Blueprint $table) {
            $table->string('id_number')->nullable()->default(null)->change();
        });
    }

    public function down(): void {}
};
