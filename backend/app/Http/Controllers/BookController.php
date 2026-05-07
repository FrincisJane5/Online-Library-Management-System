<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Book;
use Illuminate\Http\Request;

class BookController extends Controller
{
    public function index()
    {
        return response()->json(Book::query()->latest()->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'     => 'required|string',
            'author'    => 'required|string',
            'total'     => 'required|integer|min:1',
            'available' => 'required|integer|min:0',
            'borrowed'  => 'nullable|integer|min:0',
            'damaged'   => 'nullable|integer|min:0',
            'lost'      => 'nullable|integer|min:0',
            'status'    => 'required|in:Available,Borrowed,Damaged,Lost',
        ]);

        $book = Book::create([
            ...$validated,
            'borrowed' => $validated['borrowed'] ?? 0,
            'damaged'  => $validated['damaged']  ?? 0,
            'lost'     => $validated['lost']     ?? 0,
        ]);

        ActivityLog::create([
            'action'      => 'Book Added',
            'description' => 'Added book "' . $book->title . '" by ' . $book->author . ' - ' . $book->total . ' copies',
            'user_name'   => $request->header('X-User-Name', 'Staff'),
            'user_role'   => $request->header('X-User-Role', 'staff'),
        ]);

        return response()->json($book, 201);
    }

    public function update(Request $request, Book $book)
    {
        $validated = $request->validate([
            'title'     => 'required|string',
            'author'    => 'required|string',
            'total'     => 'required|integer|min:1',
            'available' => 'required|integer|min:0',
            'borrowed'  => 'nullable|integer|min:0',
            'damaged'   => 'nullable|integer|min:0',
            'lost'      => 'nullable|integer|min:0',
            'status'    => 'required|in:Available,Borrowed,Damaged,Lost',
        ]);

        $previousStatus = $book->status;
        $newStatus      = $validated['status'];

        if ($previousStatus !== $newStatus) {
            if ($newStatus === 'Damaged' && $book->available > 0) {
                $validated['available'] = max(0, $book->available - 1);
                $validated['damaged']   = ($validated['damaged'] ?? $book->damaged) + 1;
            } elseif ($newStatus === 'Lost' && $book->available > 0) {
                $validated['available'] = max(0, $book->available - 1);
                $validated['lost']      = ($validated['lost'] ?? $book->lost) + 1;
            }
        }

        $book->update([
            ...$validated,
            'borrowed' => $validated['borrowed'] ?? $book->borrowed,
            'damaged'  => $validated['damaged']  ?? $book->damaged,
            'lost'     => $validated['lost']     ?? $book->lost,
        ]);

        $userName = $request->header('X-User-Name', 'Staff');
        $userRole = $request->header('X-User-Role', 'staff');

        if ($previousStatus !== $newStatus && in_array($newStatus, ['Damaged', 'Lost'])) {
            ActivityLog::create([
                'action'      => 'Book ' . $newStatus,
                'description' => "Marked \"{$book->title}\" as {$newStatus} — available copies adjusted",
                'user_name'   => $userName,
                'user_role'   => $userRole,
            ]);
        } else {
            ActivityLog::create([
                'action'      => 'Book Updated',
                'description' => 'Updated book "' . $book->title . '"',
                'user_name'   => $userName,
                'user_role'   => $userRole,
            ]);
        }

        return response()->json($book->fresh());
    }

    public function destroy(Request $request, Book $book)
    {
        $title = $book->title;
        $book->delete();

        ActivityLog::create([
            'action'      => 'Book Deleted',
            'description' => 'Deleted book "' . $title . '"',
            'user_name'   => $request->header('X-User-Name', 'Staff'),
            'user_role'   => $request->header('X-User-Role', 'staff'),
        ]);

        return response()->json(null, 204);
    }

    public function lookup(Request $request)
    {
        $q = $request->query('q', '');
        return response()->json(
            Book::where('available', '>', 0)
                ->where(function ($query) use ($q) {
                    $query->where('title', 'like', "%{$q}%")
                          ->orWhere('author', 'like', "%{$q}%");
                })
                ->limit(10)
                ->get()
        );
    }
}
