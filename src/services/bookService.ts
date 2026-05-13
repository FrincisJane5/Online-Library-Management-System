// Import the shared axios instance
import api from '../api/axios';
// Import the Book type for request/response typing
import type { Book } from '../types';

// bookService — all book inventory CRUD API calls
export const bookService = {
  // GET /api/books — fetch all books in the inventory
  getAll: () => api.get<Book[]>('/books').then(r => r.data),

  // GET /api/books/lookup?q=... — search books by title or call number (used in BorrowForm autocomplete)
  lookup: (q: string) => api.get<Book[]>('/books/lookup', { params: { q } }).then(r => r.data),

  // POST /api/books — create a new book record
  // Omit<Book, 'id'> means we send all Book fields except id (the DB assigns the id)
  create: (data: Omit<Book, 'id'>) => api.post<Book>('/books', data).then(r => r.data),

  // PUT /api/books/:id — update an existing book record by its ID
  update: (id: number, data: Omit<Book, 'id'>) =>
    api.put<Book>(`/books/${id}`, data).then(r => r.data),

  // DELETE /api/books/:id — delete a book record by its ID
  remove: (id: number) => api.delete(`/books/${id}`),
};
