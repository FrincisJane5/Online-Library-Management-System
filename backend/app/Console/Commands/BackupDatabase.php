<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

/**
 * BackupDatabase — Artisan command that dumps the MySQL database to a .sql file.
 * Run manually with: php artisan db:backup
 * Keeps only the 7 most recent backups to avoid filling up disk space.
 * Backup files are stored in storage/backups/ with a timestamp in the filename.
 */
class BackupDatabase extends Command
{
    protected $signature   = 'db:backup';
    protected $description = 'Dump the MySQL database to storage/backups/';

    public function handle(): int
    {
        // Read database connection settings from config/database.php (sourced from .env)
        $host     = config('database.connections.mysql.host');
        $port     = config('database.connections.mysql.port');
        $db       = config('database.connections.mysql.database');
        $user     = config('database.connections.mysql.username');
        $pass     = config('database.connections.mysql.password');

        // Ensure the backups directory exists
        $dir  = storage_path('backups');
        if (!is_dir($dir)) mkdir($dir, 0755, true);

        // Build the output filename with a timestamp (e.g. library_2026-05-23_08-00-00.sql)
        $file = $dir . DIRECTORY_SEPARATOR . $db . '_' . date('Y-m-d_H-i-s') . '.sql';

        // Keep only the last 7 backups — delete the oldest ones if we already have 7+
        $existing = glob($dir . DIRECTORY_SEPARATOR . '*.sql');
        if (count($existing) >= 7) {
            // Sort by modification time (oldest first)
            usort($existing, fn($a, $b) => filemtime($a) - filemtime($b));
            // Delete all but the 6 most recent (the new one will become the 7th)
            foreach (array_slice($existing, 0, count($existing) - 6) as $old) {
                unlink($old);
            }
        }

        // Build the mysqldump shell command
        $mysqldump = 'C:\\xampp\\mysql\\bin\\mysqldump.exe';
        $passArg   = $pass ? "-p{$pass}" : ''; // Omit -p flag if no password is set
        $cmd       = "\"{$mysqldump}\" -h{$host} -P{$port} -u{$user} {$passArg} {$db} > \"{$file}\" 2>&1";

        // Execute the dump — $code is 0 on success, non-zero on failure
        exec($cmd, $output, $code);

        // Validate the result: non-zero exit code or suspiciously small file means failure
        if ($code !== 0 || !file_exists($file) || filesize($file) < 100) {
            $this->error('Backup failed: ' . implode("\n", $output));
            return 1;
        }

        $this->info('Backup saved: ' . $file . ' (' . round(filesize($file) / 1024, 1) . ' KB)');
        return 0;
    }
}
