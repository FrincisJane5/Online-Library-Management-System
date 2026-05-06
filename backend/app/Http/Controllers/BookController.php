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
            'call_number' => 'required|string|unique:books,call_number',
            'title'       => 'required|string',
            'author'      => 'required|string',
            'category'    => 'required|string',
            'total'       => 'required|integer|min:1',
            'available'   => 'required|integer|min:0',
            'borrowed'    => 'nullable|integer|min:0',
            'damaged'     => 'nullable|integer|min:0',
            'lost'        => 'nullable|integer|min:0',
            'status'      => 'required|in:Available,Borrowed,Damaged,Lost',
        ]);

        $book = Book::create([
            ...$validated,
            'borrowed' => $validated['borrowed'] ?? 0,
            'damaged'  => $validated['damaged'] ?? 0,
            'lost'     => $validated['lost'] ?? 0,
        ]);

        ActivityLog::create([
            'action'      => 'Book Added',
            'description' => 'Added book "' . $book->title . '" (' . $book->call_number . ') - ' . $book->total . ' copies',
            'user_name'   => $request->header('X-User-Name', 'Staff'),
            'user_role'   => $request->header('X-User-Role', 'staff'),
        ]);

        return response()->json($book, 201);
    }

    public function update(Request $request, Book $book)
    {
        $validated = $request->validate([
            'call_number' => 'required|string|unique:books,call_number,' . $book->id,
            'title'       => 'required|string',
            'author'      => 'required|string',
            'category'    => 'required|string',
            'total'       => 'required|integer|min:1',
            'available'   => 'required|integer|min:0',
            'borrowed'    => 'nullable|integer|min:0',
            'damaged'     => 'nullable|integer|min:0',
            'lost'        => 'nullable|integer|min:0',
            'status'      => 'required|in:Available,Borrowed,Damaged,Lost',
        ]);

        $book->update([
            ...$validated,
            'borrowed' => $validated['borrowed'] ?? 0,
            'damaged'  => $validated['damaged'] ?? 0,
            'lost'     => $validated['lost'] ?? 0,
        ]);

        ActivityLog::create([
            'action'      => 'Book Updated',
            'description' => 'Updated book "' . $book->title . '" (' . $book->call_number . ')',
            'user_name'   => $request->header('X-User-Name', 'Staff'),
            'user_role'   => $request->header('X-User-Role', 'staff'),
        ]);

        return response()->json($book->fresh());
    }

    public function destroy(Request $request, Book $book)
    {
        $title = $book->title;
        $callNumber = $book->call_number;
        $book->delete();

        ActivityLog::create([
            'action'      => 'Book Deleted',
            'description' => 'Deleted book "' . $title . '" (' . $callNumber . ')',
            'user_name'   => $request->header('X-User-Name', 'Staff'),
            'user_role'   => $request->header('X-User-Role', 'staff'),
        ]);

        return response()->json(null, 204);
    }

    public function lookup(Request $request)
    {
        $q = $request->query('q', '');
        $books = Book::where('available', '>', 0)
            ->where(function ($query) use ($q) {
                $query->where('title', 'like', "%{$q}%")
                      ->orWhere('call_number', 'like', "%{$q}%")
                      ->orWhere('author', 'like', "%{$q}%");
            })
            ->limit(10)
            ->get();
        return response()->json($books);
    }
}
