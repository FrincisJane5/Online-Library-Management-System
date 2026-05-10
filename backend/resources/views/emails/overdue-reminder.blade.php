<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1B764C; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
    .body { background: #f9f9f9; padding: 24px; border: 1px solid #ddd; }
    .footer { background: #eee; padding: 12px; text-align: center; font-size: 12px; color: #888; border-radius: 0 0 8px 8px; }
    td { padding: 8px 10px; border-bottom: 1px solid #eee; font-size: 14px; }
    .label { color: #666; width: 40%; }
    .value { font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <h2 style="margin:0">📚 Library Notice</h2>
    <p style="margin:4px 0 0">Legacy College of Compostela</p>
  </div>

  <div class="body">
    <p>Dear <strong>{{ $record->student_name }}</strong>,</p>

    @php
      $daysOverdue = max(0, \Carbon\Carbon::parse($record->due_date)->diffInDays(\Carbon\Carbon::today(), false));
      $penaltyType = match($record->action) {
        'damaged' => 'Damaged Book',
        'lost'    => 'Lost Book',
        default   => 'Overdue Return',
      };
      $penaltyDesc = match($record->action) {
        'damaged' => 'The book was returned with damage. A damage fee has been applied.',
        'lost'    => 'The book was reported lost. A replacement fee has been applied.',
        default   => "The book is {$daysOverdue} day(s) overdue. A daily fine is accumulating.",
      };
    @endphp

    <p>{{ $penaltyDesc }} Please visit the library to settle this matter.</p>

    <table style="width:100%; border-collapse:collapse; margin: 16px 0;">
      <tr><td class="label">Penalty Type</td>
          <td class="value" style="color:#D72A24;">{{ $penaltyType }}</td></tr>
      <tr><td class="label">Description</td>
          <td>{{ $penaltyDesc }}</td></tr>
      @if($record->call_number)
      <tr><td class="label">Call Number</td>
          <td style="font-family:monospace;">{{ $record->call_number }}</td></tr>
      @endif
      <tr><td class="label">Book Title</td>
          <td class="value">{{ $record->book_title }}</td></tr>
      <tr><td class="label">Date Borrowed</td>
          <td>{{ $record->borrow_date }}</td></tr>
      <tr><td class="label">Due Date</td>
          <td>{{ $record->due_date }}</td></tr>
      @if($daysOverdue > 0)
      <tr><td class="label">Days Overdue</td>
          <td style="color:#D72A24; font-weight:bold;">{{ $daysOverdue }} days</td></tr>
      @endif
      <tr><td class="label">Fine Amount</td>
          <td style="color:#D72A24; font-weight:bold;">₱{{ number_format($record->fine_amount, 2) }}</td></tr>
    </table>

    <p>Please visit the library immediately to return the book and settle your fine.</p>
    <p>Thank you for your cooperation.</p>
  </div>

  <div class="footer">
    Legacy College of Compostela Library &mdash; This is an automated notification.
  </div>
</body>
</html>
