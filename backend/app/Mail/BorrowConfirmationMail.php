<?php

namespace App\Mail;

use App\Models\BorrowingRecord;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BorrowConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public BorrowingRecord $record) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Library – Book Borrowing Confirmation');
    }

    public function content(): Content
    {
        return new Content(view: 'emails.borrow-confirmation');
    }
}
