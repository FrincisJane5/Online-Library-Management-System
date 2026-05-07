<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('borrowing_records', function (Blueprint $table) {
            if (!Schema::hasColumn('borrowing_records', 'call_number')) {
                $table->string('call_number')->nullable()->after('book_title');
            }
            if (!Schema::hasColumn('borrowing_records', 'action')) {
                $table->string('action')->nullable()->after('status');
            }
            if (!Schema::hasColumn('borrowing_records', 'last_notification_at')) {
                $table->timestamp('last_notification_at')->nullable()->after('fine_status');
            }
        });
    }

    public function down(): void
    {
        Schema::table('borrowing_records', function (Blueprint $table) {
            $table->dropColumn(array_filter([
                Schema::hasColumn('borrowing_records', 'call_number') ? 'call_number' : null,
                Schema::hasColumn('borrowing_records', 'action') ? 'action' : null,
                Schema::hasColumn('borrowing_records', 'last_notification_at') ? 'last_notification_at' : null,
            ]));
        });
    }
};
