<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StudentSeeder extends Seeder
{
    public function run(): void
    {
        $students = [
            [
    ['student_id_number' => '2024005431', 'name' => 'Joshane Asuela Marabe', 'email' => 'joshanemarabe@gmail.com', 'year_level' => '2nd Year', 'contact_number' => '09564837822'],
    ['student_id_number' => '2023001491', 'name' => 'Frenchenette Tapar Judilla', 'email' => 'frenchenettej@gmail.com', 'year_level' => '3rd Year', 'contact_number' => '09911380063'],
    ['student_id_number' => '2024004109', 'name' => 'Rodz Patrick Robenn Ancog Masudiot', 'email' => 'rmasudiot@gmail.com', 'year_level' => '2nd Year', 'contact_number' => '09169966740'],
    ['student_id_number' => '2025006852', 'name' => 'Ejjy Abuyen', 'email' => 'abuyenejjy@gmail.com', 'year_level' => '1st Year', 'contact_number' => '09852336875'],
    ['student_id_number' => '2023002739', 'name' => 'Reshil Napaliacan Sedorifa', 'email' => 'rachelsedorifa36@gmail.com', 'year_level' => '3rd Year', 'contact_number' => '09359221035'],
    ['student_id_number' => '2023001481', 'name' => 'April Mae Vismanos', 'email' => 'aprilmaevismanos504@gmail.com', 'year_level' => '3rd Year', 'contact_number' => '09096889746'],
    ['student_id_number' => '2024004889', 'name' => 'Roy Fel Lipar Villanueva', 'email' => 'rhoylipar@gmail.com', 'year_level' => '2nd Year', 'contact_number' => '09276452289'],
    ['student_id_number' => '2023003433', 'name' => 'Gilmark Laude Cruz', 'email' => 'gilmarklcruz81@gmajlil.com', 'year_level' => '4th Year', 'contact_number' => '09635524913'],
    ['student_id_number' => '2024004709', 'name' => 'Crystelle Micah Curay Moleta', 'email' => 'crystellemicahmoleta@gmail.com', 'year_level' => '2nd Year', 'contact_number' => '09092739761'],
    ['student_id_number' => '2025006756', 'name' => 'Kathyrine Bandolon Dela Cruz', 'email' => 'kathyrinedelacruz00@gmail.com', 'year_level' => '1st Year', 'contact_number' => '09777046497'],
    ['student_id_number' => '2024004215', 'name' => 'REAH JANE GUMAHIN CRESINO', 'email' => 'cresinoreahjane@gmail.com', 'year_level' => '2nd Year', 'contact_number' => '09388877303'],
    ['student_id_number' => '2023002889', 'name' => 'Frincis Jane Panimdim Omadley', 'email' => 'janeomadley@gmail.com', 'year_level' => '3rd Year', 'contact_number' => '09971978830'],
    ['student_id_number' => '2023004071', 'name' => 'Idyll Claire Curay Moleta', 'email' => 'moletaidyllclaire@gmail.com', 'year_level' => '3rd Year', 'contact_number' => '09486955714'],
    ['student_id_number' => '2023001619', 'name' => 'Jenny Rose Relabo Zabala', 'email' => 'jennyrosezabala1@gmail.com', 'year_level' => '3rd Year', 'contact_number' => '09944059669'],
    ['student_id_number' => '2025007852', 'name' => 'CHARIZ SIMPLE PILONGO', 'email' => 'charizpilongo56@gmail.com', 'year_level' => '1st Year', 'contact_number' => '09369482023'],
    ['student_id_number' => '2024005625', 'name' => 'elmer etang tolomia Jr.', 'email' => 'tolomia098@gmail.com', 'year_level' => '4th Year', 'contact_number' => '09700404410'],
    ['student_id_number' => '2024005857', 'name' => 'Gideon Mesias Cabinbin Jr.', 'email' => 'cabinbinjrgideon@gmail.com', 'year_level' => '4th Year', 'contact_number' => '09918570030'],
]
        ];

        foreach ($students as $student) {
            DB::table('students')->updateOrInsert(
                ['student_id_number' => $student['student_id_number']],
                array_merge($student, ['created_at' => now(), 'updated_at' => now()])
            );
        }
    }
}
