<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('borrowing_records', function (Blueprint $table) {
            $table->id();
            $table->string('student_name');
            $table->string('id_number');
            $table->string('email')->nullable();
            $table->string('contact_number')->nullable();
            $table->string('book_title');
            $table->date('borrow_date');
            $table->date('due_date');
            $table->date('return_date')->nullable();
            $table->string('status')->default('Borrowed');
            $table->decimal('fine_amount', 10, 2)->default(0);
            $table->string('fine_status')->default('Unpaid');
            $table->timestamp('last_notification_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('borrowing_records');
    }
};
