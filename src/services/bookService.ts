import api from '../api/axios';
import type { Book } from '../types';

export const bookService = {
  getAll: () => api.get<Book[]>('/books').then(r => r.data),

  lookup: (q: string) => api.get<Book[]>('/books/lookup', { params: { q } }).then(r => r.data),

  create: (data: Omit<Book, 'id'>) => api.post<Book>('/books', data).then(r => r.data),

  update: (id: number, data: Omit<Book, 'id'>) =>
    api.put<Book>(`/books/${id}`, data).then(r => r.data),

  remove: (id: number) => api.delete(`/books/${id}`),
};
