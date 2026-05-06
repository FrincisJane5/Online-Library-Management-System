<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1B764C; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
    .body { background: #f9f9f9; padding: 24px; border: 1px solid #ddd; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .label { color: #666; }
    .value { font-weight: bold; }
    .fine { color: #D72A24; font-size: 1.2em; }
    .footer { background: #eee; padding: 12px; text-align: center; font-size: 12px; color: #888; border-radius: 0 0 8px 8px; }
  </style>
</head>
<body>
  <div class="header">
    <h2 style="margin:0">📚 Library Overdue Notice</h2>
    <p style="margin:4px 0 0">Legacy College of Compostela</p>
  </div>

  <div class="body">
    <p>Dear <strong>{{ $record->student_name }}</strong>,</p>
    <p>This is a reminder that you have an overdue library book. Please return it as soon as possible to avoid additional fines.</p>

    <table style="width:100%; border-collapse:collapse; margin: 16px 0;">
      <tr><td class="label" style="padding:8px; border-bottom:1px solid #eee; color:#666;">Book Title</td>
          <td class="value" style="padding:8px; border-bottom:1px solid #eee; font-weight:bold;">{{ $record->book_title }}</td></tr>
      <tr><td class="label" style="padding:8px; border-bottom:1px solid #eee; color:#666;">Date Borrowed</td>
          <td style="padding:8px; border-bottom:1px solid #eee;">{{ $record->borrow_date }}</td></tr>
      <tr><td class="label" style="padding:8px; border-bottom:1px solid #eee; color:#666;">Due Date</td>
          <td style="padding:8px; border-bottom:1px solid #eee;">{{ $record->due_date }}</td></tr>
      <tr><td class="label" style="padding:8px; border-bottom:1px solid #eee; color:#666;">Days Overdue</td>
          <td style="padding:8px; border-bottom:1px solid #eee; color:#D72A24; font-weight:bold;">
            {{ max(0, \Carbon\Carbon::parse($record->due_date)->diffInDays(\Carbon\Carbon::today(), false)) }} days
          </td></tr>
      <tr><td class="label" style="padding:8px; color:#666;">Fine Amount</td>
          <td style="padding:8px; color:#D72A24; font-weight:bold;">₱{{ number_format($record->fine_amount, 2) }}</td></tr>
    </table>

    <p>Please visit the library immediately to return the book and settle your fine.</p>
    <p>Thank you for your cooperation.</p>
  </div>

  <div class="footer">
    Legacy College of Compostela Library &mdash; This is an automated notification.
  </div>
</body>
</html>
