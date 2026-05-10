<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('borrowing_record_id')->nullable()->constrained('borrowing_records')->nullOnDelete();
            $table->string('student_name');
            $table->string('student_email')->nullable();
            $table->string('call_number')->nullable();
            $table->string('book_title');
            $table->enum('type', ['Overdue', 'Fine Reminder', 'Damaged', 'Lost']);
            $table->text('message');
            $table->enum('status', ['Sent', 'Pending', 'Failed'])->default('Pending');
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_logs');
    }
};
