<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1B764C; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
    .body { background: #f9f9f9; padding: 24px; border: 1px solid #ddd; }
    .footer { background: #eee; padding: 12px; text-align: center; font-size: 12px; color: #888; border-radius: 0 0 8px 8px; }
    .otp { font-size: 40px; font-weight: bold; letter-spacing: 12px; color: #1B764C; text-align: center; padding: 20px; background: #fff; border: 2px dashed #1B764C; border-radius: 8px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h2 style="margin:0">🔒 Password Reset Code</h2>
    <p style="margin:4px 0 0">Legacy College of Compostela Library</p>
  </div>

  <div class="body">
    <p>Hello <strong>{{ $fullName }}</strong>,</p>
    <p>Use the code below to reset your password. Enter it in the app within <strong>15 minutes</strong>.</p>

    <div class="otp">{{ $otp }}</div>

    <p style="font-size:13px; color:#888;">If you did not request a password reset, you can safely ignore this email.</p>
  </div>

  <div class="footer">
    Legacy College of Compostela Library &mdash; This is an automated notification.
  </div>
</body>
</html>
