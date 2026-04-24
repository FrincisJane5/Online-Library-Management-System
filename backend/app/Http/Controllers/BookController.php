<?php

namespace App\Http\Controllers;

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
        try {
            $validated = $request->validate([
                'call_number' => 'required|string|unique:books,call_number',
                'title' => 'required|string',
                'author' => 'required|string',
                'category' => 'required|string',
                'total' => 'required|integer|min:1',
                'available' => 'required|integer|min:0',
                'borrowed' => 'nullable|integer|min:0',
                'damaged' => 'nullable|integer|min:0',
                'lost' => 'nullable|integer|min:0',
                'status' => 'required|string',
            ]);

            $book = Book::create([
                ...$validated,
                'borrowed' => $validated['borrowed'] ?? 0,
                'damaged' => $validated['damaged'] ?? 0,
                'lost' => $validated['lost'] ?? 0,
            ]);

            return response()->json($book, 201);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, Book $book)
    {
        $validated = $request->validate([
            'call_number' => 'required|string|unique:books,call_number,' . $book->id,
            'title' => 'required|string',
            'author' => 'required|string',
            'category' => 'required|string',
            'total' => 'required|integer|min:1',
            'available' => 'required|integer|min:0',
            'borrowed' => 'nullable|integer|min:0',
            'damaged' => 'nullable|integer|min:0',
            'lost' => 'nullable|integer|min:0',
            'status' => 'required|string',
        ]);

        $book->update([
            ...$validated,
            'borrowed' => $validated['borrowed'] ?? 0,
            'damaged' => $validated['damaged'] ?? 0,
            'lost' => $validated['lost'] ?? 0,
        ]);

        return response()->json($book->fresh());
    }

    public function destroy(Book $book)
    {
        $book->delete();
        return response()->json(null, 204);
    }
}