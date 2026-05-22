<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StudentSeeder extends Seeder
{
    public function run(): void
    {
        $students = [
            ['student_id_number' => '2024-0001', 'name' => 'Juan dela Cruz',      'email' => 'juan.delacruz@lcc.edu.ph',    'course' => 'BSIT',   'year_level' => '1st Year', 'contact_number' => '09171234567'],
            ['student_id_number' => '2024-0002', 'name' => 'Maria Santos',        'email' => 'maria.santos@lcc.edu.ph',      'course' => 'BSED',   'year_level' => '2nd Year', 'contact_number' => '09182345678'],
            ['student_id_number' => '2024-0003', 'name' => 'Jose Reyes',          'email' => 'jose.reyes@lcc.edu.ph',        'course' => 'BSN',    'year_level' => '3rd Year', 'contact_number' => '09193456789'],
            ['student_id_number' => '2024-0004', 'name' => 'Ana Garcia',          'email' => 'ana.garcia@lcc.edu.ph',        'course' => 'BSBA',   'year_level' => '1st Year', 'contact_number' => '09204567890'],
            ['student_id_number' => '2024-0005', 'name' => 'Pedro Mendoza',       'email' => 'pedro.mendoza@lcc.edu.ph',     'course' => 'BSCRIM', 'year_level' => '2nd Year', 'contact_number' => '09215678901'],
            ['student_id_number' => '2024-0006', 'name' => 'Rosa Villanueva',     'email' => 'rosa.villanueva@lcc.edu.ph',   'course' => 'BSIT',   'year_level' => '3rd Year', 'contact_number' => '09226789012'],
            ['student_id_number' => '2024-0007', 'name' => 'Carlos Fernandez',   'email' => 'carlos.fernandez@lcc.edu.ph',  'course' => 'BSCS',   'year_level' => '4th Year', 'contact_number' => '09237890123'],
            ['student_id_number' => '2024-0008', 'name' => 'Liza Ramos',         'email' => 'liza.ramos@lcc.edu.ph',        'course' => 'BEED',   'year_level' => '1st Year', 'contact_number' => '09248901234'],
            ['student_id_number' => '2024-0009', 'name' => 'Marco Torres',       'email' => 'marco.torres@lcc.edu.ph',      'course' => 'BSHM',   'year_level' => '2nd Year', 'contact_number' => '09259012345'],
            ['student_id_number' => '2024-0010', 'name' => 'Elena Cruz',         'email' => 'elena.cruz@lcc.edu.ph',        'course' => 'BSN',    'year_level' => '4th Year', 'contact_number' => '09260123456'],
        ];

        foreach ($students as $student) {
            DB::table('students')->updateOrInsert(
                ['student_id_number' => $student['student_id_number']],
                array_merge($student, ['created_at' => now(), 'updated_at' => now()])
            );
        }
    }
}
