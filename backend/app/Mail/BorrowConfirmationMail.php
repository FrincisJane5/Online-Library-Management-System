<?php

namespace App\Mail;

use App\Models\BorrowingRecord;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * BorrowConfirmationMail — sent to the student when they successfully borrow a book.
 * Uses the emails/borrow-confirmation Blade view for the email body.
 * The $record is passed as a public property so the Blade view can access it directly.
 */
class BorrowConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * @param BorrowingRecord $record  The borrow transaction to confirm
     */
    public function __construct(public BorrowingRecord $record) {}

    /** Sets the email subject line */
    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Library – Book Borrowing Confirmation');
    }

    /** Points to the Blade view used to render the email body */
    public function content(): Content
    {
        return new Content(view: 'emails.borrow-confirmation');
    }
}
