// Import the shared axios instance
import api from '../api/axios';
// Import the BorrowingRecord type for response typing
import type { BorrowingRecord } from '../types';

// Shape of the data sent when creating a new borrow record
export interface BorrowPayload {
  student_name: string;    // Full name of the borrower
  id_number?: string;      // Student/patron ID
  email?: string;          // Optional contact email
  contact_number?: string; // Optional phone number
  course?: string;         // Optional course/program
  year?: string;           // Optional year level
  book_title: string;      // Title of the book being borrowed
  call_number?: string;    // Optional call number
  borrow_date: string;     // Date borrowed (YYYY-MM-DD)
  due_date: string;        // Due date (YYYY-MM-DD)
  academic_year?: string;  // e.g. "2024-2025"
  semester?: string;       // e.g. "1st Semester"
}

// Shape of the data sent when returning a book
export interface ReturnPayload {
  action?: 'damaged' | 'lost'; // Optional flag if the book was returned damaged or lost
  description?: string;        // Optional description for damaged/lost condition
}

// borrowingService — all borrowing and fine-related API calls
export const borrowingService = {
  // GET /api/borrowings — fetch all borrow records
  getAll: () => api.get<BorrowingRecord[]>('/borrowings').then(r => r.data),

  // POST /api/borrowings — create a new borrow record
  borrow: (data: BorrowPayload) =>
    api.post<BorrowingRecord>('/borrowings', data).then(r => r.data),

  // POST /api/borrowings/:id/return — mark a book as returned, optionally flagging damage/loss
  return: (id: number, data: ReturnPayload = {}) =>
    api.post<BorrowingRecord>(`/borrowings/${id}/return`, data).then(r => r.data),

  // GET /api/fines — fetch all overdue fine records
  getFines: () => api.get('/fines').then(r => r.data),

  // PATCH /api/fines/:id/pay — mark a specific fine as paid
  markPaid: (id: number) => api.patch(`/fines/${id}/pay`).then(r => r.data),

  // POST /api/fines/:id/remind — send an email reminder for a specific fine
  sendReminder: (id: number) => api.post(`/fines/${id}/remind`).then(r => r.data),

  // POST /api/fines/reminders — send email reminders to all borrowers with unpaid fines
  sendReminders: () => api.post('/fines/reminders').then(r => r.data),
};
