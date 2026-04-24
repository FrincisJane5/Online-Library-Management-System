<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::updateOrCreate([
            'username' => 'admin',
        ], [
            'name' => 'Library Admin',
            'full_name' => 'Library Admin',
            'email' => 'admin@local.library',
            'password' => 'admin123',
            'role' => 'admin',
            'status' => 'Active',
        ]);

        User::updateOrCreate([
            'username' => 'staff',
        ], [
            'name' => 'Library Staff',
            'full_name' => 'Library Staff',
            'email' => 'staff@local.library',
            'password' => 'staff123',
            'role' => 'staff',
            'status' => 'Active',
        ]);
    }
}
