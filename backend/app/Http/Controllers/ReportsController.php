<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Book;
use App\Models\BorrowingRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ReportsController extends Controller
{
    public function attendance(Request $request)
    {
        $query = Attendance::query()->latest();

        if ($start = $request->query('start')) {
            $query->whereDate('created_at', '>=', $start);
        }
        if ($end = $request->query('end')) {
            $query->whereDate('created_at', '<=', $end);
        }

        return response()->json($query->get()->map(fn($a) => [
            'date'    => Carbon::parse($a->created_at)->format('Y-m-d'),
            'time'    => Carbon::parse($a->created_at)->format('H:i'),
            'name'    => $a->name,
            'course'  => $a->course,
            'year'    => $a->year,
            'purpose' => $a->purpose,
        ]));
    }

    public function borrowing(Request $request)
    {
        $query = BorrowingRecord::query()->latest();

        if ($start = $request->query('start')) {
            $query->whereDate('borrow_date', '>=', $start);
        }
        if ($end = $request->query('end')) {
            $query->whereDate('borrow_date', '<=', $end);
        }

        return response()->json($query->get()->map(fn($r) => [
            'date'        => $r->borrow_date,
            'student'     => $r->student_name,
            'idNumber'    => $r->id_number,
            'book'        => $r->book_title,
            'callNumber'  => $r->call_number,
            'action'      => $r->action,
            'status'      => $r->status,
            'borrowDate'  => $r->borrow_date,
            'dueDate'     => $r->due_date,
            'returnDate'  => $r->return_date,
        ]));
    }

    public function inventory()
    {
        $books = Book::selectRaw('
            category,
            SUM(total) as total,
            SUM(available) as available,
            SUM(borrowed) as borrowed,
            SUM(damaged) as damaged,
            SUM(lost) as lost
        ')->groupBy('category')->get();

        return response()->json($books);
    }

    public function overdue(Request $request)
    {
        $query = BorrowingRecord::query()
            ->where('status', 'borrowed')
            ->where('due_date', '<', Carbon::today()->toDateString());

        if ($start = $request->query('start')) {
            $query->whereDate('due_date', '>=', $start);
        }
        if ($end = $request->query('end')) {
            $query->whereDate('due_date', '<=', $end);
        }

        return response()->json($query->get()->map(fn($r) => [
            'student'     => $r->student_name,
            'book'        => $r->book_title,
            'daysOverdue' => max(0, Carbon::parse($r->due_date)->diffInDays(Carbon::today(), false)),
            'fineAmount'  => (float) $r->fine_amount,
            'fineStatus'  => $r->fine_status,
            'action'      => $r->action,
        ]));
    }
}
