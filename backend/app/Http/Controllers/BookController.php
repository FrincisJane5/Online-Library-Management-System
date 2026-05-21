<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\Book;
use Illuminate\Http\Request;

/**
 * BookController — full CRUD for the library book inventory.
 * Also provides a lookup endpoint for the BorrowForm autocomplete.
 */
class BookController extends Controller
{
    /** GET /api/books — returns all books, newest first */
    public function index()
    {
        return response()->json(Book::query()->latest()->get());
    }

    /** POST /api/books — creates a new book record */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'call_number' => 'nullable|string|unique:books,call_number',
            'title'       => 'nullable|string',
            'author'      => 'nullable|string',
            'pages'       => 'nullable|integer|min:1',
            'cost_price'  => 'nullable|numeric|min:0',
            'publisher'   => 'nullable|string',
            'year'        => 'nullable|integer|min:1000|max:9999',
            'remarks'     => 'nullable|date',
            'total'       => 'required|integer|min:1',
            'available'   => 'required|integer|min:0',
            'borrowed'    => 'nullable|integer|min:0',
            'damaged'     => 'nullable|integer|min:0',
            'lost'        => 'nullable|integer|min:0',
            'status'      => 'required|in:Available,Borrowed,Damaged,Lost',
        ]);

        // Default counter fields to 0 if not provided
        $book = Book::create([
            ...$validated,
            'borrowed' => $validated['borrowed'] ?? 0,
            'damaged'  => $validated['damaged']  ?? 0,
            'lost'     => $validated['lost']     ?? 0,
        ]);

        ActivityLog::create([
            'action'      => 'Book Added',
            'description' => 'Added book "' . ($book->title ?? $book->call_number) . '"'
                           . ($book->author ? ' by ' . $book->author : '')
                           . ' - ' . $book->total . ' copies',
            'user_name'   => $request->header('X-User-Name', 'Staff'),
            'user_role'   => $request->header('X-User-Role', 'staff'),
        ]);

        return response()->json($book, 201);
    }

    /**
     * PUT /api/books/{book} — updates a book record.
     * Automatically adjusts copy counts when status changes to Damaged, Lost, or Available.
     */
    public function update(Request $request, Book $book)
    {
        $validated = $request->validate([
            'call_number' => 'nullable|string|unique:books,call_number,' . $book->id,
            'title'       => 'nullable|string',
            'author'      => 'nullable|string',
            'pages'       => 'nullable|integer|min:1',
            'cost_price'  => 'nullable|numeric|min:0',
            'publisher'   => 'nullable|string',
            'year'        => 'nullable|integer|min:1000|max:9999',
            'remarks'     => 'nullable|date',
            'total'       => 'required|integer|min:1',
            'available'   => 'required|integer|min:0',
            'borrowed'    => 'nullable|integer|min:0',
            'damaged'     => 'nullable|integer|min:0',
            'lost'        => 'nullable|integer|min:0',
            'status'      => 'required|in:Available,Borrowed,Damaged,Lost',
        ]);

        $previousStatus = $book->status;
        $newStatus      = $validated['status'];

        // Manually setting to Available — reset all counters
        if ($newStatus === 'Available' && $previousStatus !== 'Available') {
            $validated['available'] = $validated['total'] ?? $book->total;
            $validated['borrowed']  = 0;
            $validated['damaged']   = 0;
            $validated['lost']      = 0;
        } elseif ($previousStatus !== $newStatus) {
            // Move one copy from available to damaged
            if ($newStatus === 'Damaged' && $book->available > 0) {
                $validated['available'] = max(0, $book->available - 1);
                $validated['damaged']   = ($validated['damaged'] ?? $book->damaged) + 1;
            // Move one copy from available to lost
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

        // Log a specific action if status changed to Damaged or Lost
        if ($previousStatus !== $newStatus && in_array($newStatus, ['Damaged', 'Lost'])) {
            ActivityLog::create([
                'action'      => 'Book ' . $newStatus,
                'description' => "Marked \"" . ($book->title ?? $book->call_number) . "\" as {$newStatus}",
                'user_name'   => $userName,
                'user_role'   => $userRole,
            ]);
        } else {
            ActivityLog::create([
                'action'      => 'Book Updated',
                'description' => 'Updated book "' . ($book->title ?? $book->call_number) . '"',
                'user_name'   => $userName,
                'user_role'   => $userRole,
            ]);
        }

        return response()->json($book->fresh());
    }

    /** DELETE /api/books/{book} — permanently deletes a book record */
    public function destroy(Request $request, Book $book)
    {
        $label = $book->title ?? $book->call_number ?? 'Unknown';
        $book->delete();

        ActivityLog::create([
            'action'      => 'Book Deleted',
            'description' => 'Deleted book "' . $label . '"',
            'user_name'   => $request->header('X-User-Name', 'Staff'),
            'user_role'   => $request->header('X-User-Role', 'staff'),
        ]);

        return response()->json(null, 204); // 204 No Content
    }

    /**
     * GET /api/books/lookup?q=...
     * Returns up to 10 available books matching the query.
     * Used by BorrowForm autocomplete (title, author, or call number).
     */
    public function lookup(Request $request)
    {
        $q = $request->query('q', '');

        return response()->json(
            Book::where('available', '>', 0) // Only books that can be borrowed
                ->where(function ($query) use ($q) {
                    $query->where('title', 'like', "%{$q}%")
                          ->orWhere('author', 'like', "%{$q}%")
                          ->orWhere('call_number', 'like', "%{$q}%");
                })
                ->limit(10)
                ->get()
        );
    }
}
