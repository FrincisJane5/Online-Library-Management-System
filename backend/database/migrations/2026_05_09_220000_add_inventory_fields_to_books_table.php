<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('books', function (Blueprint $table) {
            if (!Schema::hasColumn('books', 'call_number')) {
                $table->string('call_number')->nullable()->after('id');
            }
            if (!Schema::hasColumn('books', 'pages')) {
                $table->integer('pages')->nullable()->after('author');
            }
            if (!Schema::hasColumn('books', 'cost_price')) {
                $table->decimal('cost_price', 10, 2)->nullable()->after('pages');
            }
            if (!Schema::hasColumn('books', 'publisher')) {
                $table->string('publisher')->nullable()->after('cost_price');
            }
            if (!Schema::hasColumn('books', 'year')) {
                $table->year('year')->nullable()->after('publisher');
            }
            if (!Schema::hasColumn('books', 'remarks')) {
                $table->date('remarks')->nullable()->after('year');
            }
        });
    }

    public function down(): void
    {
        Schema::table('books', function (Blueprint $table) {
            $table->dropColumn(['call_number', 'pages', 'cost_price', 'publisher', 'year', 'remarks']);
        });
    }
};
