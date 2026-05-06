<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up(): void
{
    Schema::create('books', function (Blueprint $table) {
        $table->id();
        $table->string('call_number')->unique();
        $table->string('title');
        $table->string('author');
        $table->string('category');
        $table->integer('total')->default(1);
        $table->integer('available')->default(1);
        $table->integer('borrowed')->default(0);
        $table->integer('damaged')->default(0);
        $table->integer('lost')->default(0);
        $table->string('status')->default('available'); // available | borrowed | returned
        $table->timestamps();
    });
}
    

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('books');
    }
};
