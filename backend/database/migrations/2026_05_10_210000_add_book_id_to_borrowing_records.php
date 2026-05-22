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
            if (!Schema::hasColumn('borrowing_records', 'book_id')) {
                $table->unsignedBigInteger('book_id')->nullable()->after('id');
                $table->foreign('book_id')->references('id')->on('books')->nullOnDelete();
            }
        });

        // Backfill existing records: match by title (SQLite-compatible)
        if (DB::getDriverName() !== 'sqlite') {
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
        } else {
            DB::statement("
                UPDATE borrowing_records
                SET book_id = (
                    SELECT id FROM books
                    WHERE books.title = borrowing_records.book_title
                    LIMIT 1
                )
                WHERE book_id IS NULL AND book_title IS NOT NULL
            ");
        }
    }

    public function down(): void
    {
        Schema::table('borrowing_records', function (Blueprint $table) {
            $table->dropForeign(['book_id']);
            $table->dropColumn('book_id');
        });
    }
};
