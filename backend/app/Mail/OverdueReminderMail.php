<?php

namespace App\Mail;

use App\Models\BorrowingRecord;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * OverdueReminderMail — sent to a student when their borrowed book is overdue.
 * Triggered manually (per-record or bulk) from BorrowingController,
 * and automatically by the SendOverdueReminders scheduled command.
 * Uses the emails/overdue-reminder Blade view for the email body.
 */
class OverdueReminderMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * @param BorrowingRecord $record  The overdue borrow record to remind about
     */
    public function __construct(public BorrowingRecord $record) {}

    /** Sets the email subject line */
    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Library Overdue Book Reminder');
    }

    /** Points to the Blade view used to render the email body */
    public function content(): Content
    {
        return new Content(view: 'emails.overdue-reminder');
    }
}
