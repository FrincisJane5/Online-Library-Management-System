<?php

namespace App\Http\Controllers;

use App\Models\Book;
use Illuminate\Http\Request;

class BookController extends Controller
{
   public function index() {
    // This returns the collection of books as JSON
    return response()->json(\App\Models\Book::all());
} 
public function store(Request $request)
{
    try {
        // 1. Validate - check if names match your React frontend
        $validated = $request->validate([
            'call_number' => 'required|string',
            'title'       => 'required|string',
            'author'      => 'required|string',
            'category'    => 'required|string',
            'total'       => 'required|integer',
            'available'   => 'required|integer',
            'status'      => 'required|string',
        ]);

        // 2. Create
        $book = \App\Models\Book::create($validated);

        // 3. Return JSON (Important for React)
        return response()->json($book, 201);

    } catch (\Exception $e) {
        // This will send the actual error message to your React console
        return response()->json(['error' => $e->getMessage()], 500);
    }
}   public function destroy(Book $book)
    {
        $book->delete();
        return response()->json(null, 204);
    }
}