<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

/**
 * User — represents a library staff member or administrator who can log in to the system.
 * Roles: "admin" (full access) | "staff" (limited access, no user management or settings).
 * Authentication is session-based via Sanctum; identity is passed via X-User-Name / X-User-Role headers.
 */
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> — enables User::factory() in seeders and tests */
    use HasFactory, Notifiable;

    /** Columns that can be mass-assigned via create() or fill() */
    protected $fillable = [
        'name',       // Internal name field (mirrors full_name)
        'full_name',  // Display name shown in the UI header
        'username',   // Login username (must be unique)
        'role',       // "admin" | "staff"
        'status',     // "Active" | "Inactive" — inactive users cannot log in
        'email',      // Email address (used for password reset)
        'password',   // Hashed password (auto-hashed via the 'hashed' cast below)
        'last_login', // Timestamp of the most recent successful login
    ];

    /** Columns excluded from JSON serialization (never sent to the frontend) */
    protected $hidden = [
        'password',       // Never expose the hashed password in API responses
        'remember_token', // Laravel session token — internal use only
    ];

    /**
     * Column type casts — Laravel automatically converts these when reading from the DB.
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime', // Cast to Carbon instance
            'password'          => 'hashed',   // Auto-hash on assignment (no need for Hash::make)
            'last_login'        => 'datetime', // Cast to Carbon instance for easy formatting
        ];
    }

    /**
     * One user → many activity log entries.
     * Lets admins see all actions performed by a specific user.
     */
    public function activityLogs()
    {
        return $this->hasMany(ActivityLog::class, 'user_id');
    }
}
