<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Book;
use App\Models\BorrowingRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

/**
 * ReportsController — generates data for all report tabs.
 * All endpoints accept optional start/end date query params for filtering.
 */
class ReportsController extends Controller
{
    /** GET /api/reports/attendance — attendance log report */
    public function attendance(Request $request)
    {
        $query = Attendance::query()->latest();
        if ($start = $request->query('start')) $query->whereDate('created_at', '>=', $start);
        if ($end   = $request->query('end'))   $query->whereDate('created_at', '<=', $end);

        return response()->json($query->get()->map(fn($a) => [
            'date'      => Carbon::parse($a->created_at)->setTimezone('Asia/Manila')->format('Y-m-d'),
            'time'      => Carbon::parse($a->created_at)->setTimezone('Asia/Manila')->format('H:i'),
            'id_number' => $a->id_number,
            'name'      => $a->name,
            'email'     => $a->email,
            'phone'     => $a->phone,
            'course'    => $a->course,
            'year'      => $a->year,
            'purpose'   => $a->purpose,
        ]));
    }

    /** GET /api/reports/borrowing — borrowing & returning report */
    public function borrowing(Request $request)
    {
        $query = BorrowingRecord::query()->latest();
        if ($start = $request->query('start')) $query->whereDate('borrow_date', '>=', $start);
        if ($end   = $request->query('end'))   $query->whereDate('borrow_date', '<=', $end);

        return response()->json($query->get()->map(fn($r) => [
            'date'       => $r->borrow_date,
            'student'    => $r->student_name,
            'idNumber'   => $r->id_number,
            'book'       => $r->book_title,
            'callNumber' => $r->call_number,
            'action'     => $r->action,
            'status'     => $r->status,
            'borrowDate' => $r->borrow_date,
            'dueDate'    => $r->due_date,
            'returnDate' => $r->return_date,
        ]));
    }

    /**
     * GET /api/reports/inventory — book inventory summary.
     * Groups by title+author+year and sums copy counts across all copies.
     */
    public function inventory()
    {
        return response()->json(
            Book::select(['title', 'author', 'year',
                \DB::raw('SUM(total) as total'),
                \DB::raw('SUM(available) as available'),
                \DB::raw('SUM(borrowed) as borrowed'),
                \DB::raw('SUM(damaged) as damaged'),
                \DB::raw('SUM(lost) as lost'),
            ])
            ->groupBy('title', 'author', 'year')
            ->orderBy('title')
            ->get()->values()
            ->map(fn($b, $i) => [
                'no'        => $i + 1,
                'title'     => $b->title ?? '—',
                'author'    => $b->author ?? '—',
                'copyright' => $b->year ?? '—',
                'copyCount' => (int) $b->total,
                'available' => (int) $b->available,
                'borrowed'  => (int) $b->borrowed,
                'damaged'   => (int) $b->damaged,
                'lost'      => (int) $b->lost,
            ])
        );
    }

    /** GET /api/reports/department-attendance — attendance grouped by course */
    public function departmentAttendance(Request $request)
    {
        $query = Attendance::query()->orderBy('course')->orderBy('name');
        if ($start = $request->query('start')) $query->whereDate('created_at', '>=', $start);
        if ($end   = $request->query('end'))   $query->whereDate('created_at', '<=', $end);

        return response()->json(
            $query->get()->values()->map(fn($a, $i) => [
                'no'     => $i + 1,
                'course' => $a->course,
                'name'   => $a->name,
                'year'   => $a->year,
                'date'   => Carbon::parse($a->created_at)->setTimezone('Asia/Manila')->format('Y-m-d H:i'),
            ])
        );
    }

    /** GET /api/reports/overdue — currently overdue books with fine info */
    public function overdue(Request $request)
    {
        $query = BorrowingRecord::query()
            ->where('status', 'borrowed')
            ->where('due_date', '<', Carbon::today()->toDateString());
        if ($start = $request->query('start')) $query->whereDate('due_date', '>=', $start);
        if ($end   = $request->query('end'))   $query->whereDate('due_date', '<=', $end);

        return response()->json($query->get()->map(fn($r) => [
            'student'     => $r->student_name,
            'book'        => $r->book_title,
            'daysOverdue' => max(0, Carbon::parse($r->due_date)->diffInDays(Carbon::today(), false)),
            'fineAmount'  => (float) $r->fine_amount,
            'fineStatus'  => $r->fine_status,
            'action'      => $r->action,
        ]));
    }

    /** GET /api/reports/payment-collection — paid fines accountability report */
    public function paymentCollection(Request $request)
    {
        $query = BorrowingRecord::query()
            ->where('fine_status', 'paid')
            ->whereNotNull('fine_amount')
            ->where('fine_amount', '>', 0)
            ->latest('updated_at');
        if ($start = $request->query('start')) $query->whereDate('updated_at', '>=', $start);
        if ($end   = $request->query('end'))   $query->whereDate('updated_at', '<=', $end);

        return response()->json($query->get()->map(fn($r) => [
            'datePaid'    => $r->updated_at ? Carbon::parse($r->updated_at)->setTimezone('Asia/Manila')->format('Y-m-d') : null,
            'student'     => $r->student_name,
            'idNumber'    => $r->id_number,
            'book'        => $r->book_title,
            // Days between due date and return date (0 if missing)
            'daysOverdue' => $r->return_date && $r->due_date
                ? max(0, Carbon::parse($r->due_date)->diffInDays(Carbon::parse($r->return_date), false))
                : 0,
            'fineAmount'  => (float) $r->fine_amount,
            'fineStatus'  => $r->fine_status,
        ]));
    }
}
