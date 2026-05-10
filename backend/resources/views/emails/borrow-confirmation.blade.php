<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Borrowing Confirmation</title></head>
<body style="font-family:Arial,sans-serif;background:#f5f5f5;padding:20px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e0e0e0;">
    <div style="background:#1B764C;padding:24px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:20px;">Library Borrowing Confirmation</h1>
      <p style="color:#a8e6c3;margin:4px 0 0;">Legacy College of Compostela</p>
    </div>
    <div style="padding:24px;">
      <p style="color:#333;">Dear <strong>{{ $record->student_name }}</strong>,</p>
      <p style="color:#555;">Your book borrowing has been recorded. Please keep this for reference.</p>

      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr style="background:#f9f9f9;">
          <td style="padding:10px 12px;color:#666;font-size:13px;border-bottom:1px solid #eee;width:40%;">Call Number</td>
          <td style="padding:10px 12px;color:#333;font-size:13px;border-bottom:1px solid #eee;font-family:monospace;">{{ $record->call_number ?? '—' }}</td>
        </tr>
        <tr>
          <td style="padding:10px 12px;color:#666;font-size:13px;border-bottom:1px solid #eee;">Book Title</td>
          <td style="padding:10px 12px;color:#333;font-size:13px;border-bottom:1px solid #eee;font-weight:bold;">{{ $record->book_title }}</td>
        </tr>
        <tr style="background:#f9f9f9;">
          <td style="padding:10px 12px;color:#666;font-size:13px;border-bottom:1px solid #eee;">Date Borrowed</td>
          <td style="padding:10px 12px;color:#333;font-size:13px;border-bottom:1px solid #eee;">{{ $record->borrow_date }}</td>
        </tr>
        <tr>
          <td style="padding:10px 12px;color:#666;font-size:13px;border-bottom:1px solid #eee;">Due Date</td>
          <td style="padding:10px 12px;color:#D72A24;font-size:13px;border-bottom:1px solid #eee;font-weight:bold;">{{ $record->due_date }}</td>
        </tr>
        @if($record->course)
        <tr style="background:#f9f9f9;">
          <td style="padding:10px 12px;color:#666;font-size:13px;border-bottom:1px solid #eee;">Course / Year</td>
          <td style="padding:10px 12px;color:#333;font-size:13px;border-bottom:1px solid #eee;">{{ $record->course }} {{ $record->year }}</td>
        </tr>
        @endif
      </table>

      <div style="background:#fff8e1;border:1px solid #ffe082;border-radius:6px;padding:12px 16px;margin-top:16px;">
        <p style="margin:0;color:#795548;font-size:13px;">⚠ Please return the book on or before the due date to avoid fines. Late returns are charged per day.</p>
      </div>

      <p style="color:#888;font-size:12px;margin-top:24px;">This is an automated message from the Library Management System. Do not reply to this email.</p>
    </div>
  </div>
</body>
</html>
