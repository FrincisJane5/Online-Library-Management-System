@component('mail::message')
# Hello World

This is a test email from the **Library Management System**.

@component('mail::button', ['url' => config('app.url')])
Visit App
@endcomponent

Thanks,
{{ config('app.name') }}
@endcomponent
