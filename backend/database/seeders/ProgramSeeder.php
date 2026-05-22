<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProgramSeeder extends Seeder
{
    public function run(): void
    {
        $programs = [
            ['code' => 'BSIT',   'name' => 'Bachelor of Science in Information Technology'],
            ['code' => 'BSCS',   'name' => 'Bachelor of Science in Computer Science'],
            ['code' => 'BSED',   'name' => 'Bachelor of Secondary Education'],
            ['code' => 'BEED',   'name' => 'Bachelor of Elementary Education'],
            ['code' => 'BSN',    'name' => 'Bachelor of Science in Nursing'],
            ['code' => 'BSBA',   'name' => 'Bachelor of Science in Business Administration'],
            ['code' => 'BSCRIM', 'name' => 'Bachelor of Science in Criminology'],
            ['code' => 'BSHM',   'name' => 'Bachelor of Science in Hospitality Management'],
        ];

        foreach ($programs as $program) {
            DB::table('programs')->updateOrInsert(['code' => $program['code']], $program);
        }
    }
}
