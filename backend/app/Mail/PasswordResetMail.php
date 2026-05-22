<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * PasswordResetMail — sent to a user when they request a password reset.
 * Contains a 6-digit OTP that expires in 15 minutes.
 * Uses the emails/password-reset Blade view for the email body.
 */
class PasswordResetMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * @param string $fullName  The recipient's full name (used in the email greeting)
     * @param string $otp       The 6-digit one-time password to include in the email
     */
    public function __construct(
        public string $fullName,
        public string $otp        // 6-digit code
    ) {}

    /** Sets the email subject line */
    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Your Password Reset Code');
    }

    /** Points to the Blade view used to render the email body */
    public function content(): Content
    {
        return new Content(view: 'emails.password-reset');
    }
}
