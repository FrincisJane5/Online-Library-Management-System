<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'username'  => 'admin',
                'full_name' => 'Library Admin',
                'email'     => 'admin@lcc.library',
                'password'  => 'admin123',
                'role'      => 'admin',
                'status'    => 'Active',
            ],
            [
                'username'  => 'staff01',
                'full_name' => 'Library Staff',
                'email'     => 'staff01@lcc.library',
                'password'  => 'staff123',
                'role'      => 'staff',
                'status'    => 'Active',
            ],
        ];

        foreach ($users as $user) {
            User::updateOrCreate(['username' => $user['username']], $user);
        }
    }
}
