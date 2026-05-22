<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class BackupDatabase extends Command
{
    protected $signature   = 'db:backup';
    protected $description = 'Dump the MySQL database to storage/backups/';

    public function handle(): int
    {
        $host     = config('database.connections.mysql.host');
        $port     = config('database.connections.mysql.port');
        $db       = config('database.connections.mysql.database');
        $user     = config('database.connections.mysql.username');
        $pass     = config('database.connections.mysql.password');

        $dir  = storage_path('backups');
        if (!is_dir($dir)) mkdir($dir, 0755, true);

        $file = $dir . DIRECTORY_SEPARATOR . $db . '_' . date('Y-m-d_H-i-s') . '.sql';

        // Keep only the last 7 backups
        $existing = glob($dir . DIRECTORY_SEPARATOR . '*.sql');
        if (count($existing) >= 7) {
            usort($existing, fn($a, $b) => filemtime($a) - filemtime($b));
            foreach (array_slice($existing, 0, count($existing) - 6) as $old) {
                unlink($old);
            }
        }

        $mysqldump = 'C:\\xampp\\mysql\\bin\\mysqldump.exe';
        $passArg   = $pass ? "-p{$pass}" : '';
        $cmd       = "\"{$mysqldump}\" -h{$host} -P{$port} -u{$user} {$passArg} {$db} > \"{$file}\" 2>&1";

        exec($cmd, $output, $code);

        if ($code !== 0 || !file_exists($file) || filesize($file) < 100) {
            $this->error('Backup failed: ' . implode("\n", $output));
            return 1;
        }

        $this->info('Backup saved: ' . $file . ' (' . round(filesize($file) / 1024, 1) . ' KB)');
        return 0;
    }
}
