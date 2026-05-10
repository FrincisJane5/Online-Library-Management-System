<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('borrowing_records', function (Blueprint $table) {
            $table->unsignedBigInteger('book_id')->nullable()->after('id');
            $table->foreign('book_id')->references('id')->on('books')->nullOnDelete();
        });

        // Backfill existing records: match by call_number first, then title
        DB::statement("
            UPDATE borrowing_records br
            JOIN books b ON (
                (br.call_number != '' AND br.call_number IS NOT NULL AND b.call_number = br.call_number)
                OR
                (br.book_title IS NOT NULL AND b.title = br.book_title)
            )
            SET br.book_id = b.id
            WHERE br.book_id IS NULL
        ");
    }

    public function down(): void
    {
        Schema::table('borrowing_records', function (Blueprint $table) {
            $table->dropForeign(['book_id']);
            $table->dropColumn('book_id');
        });
    }
};
