import api from '../api/axios';
import type { BorrowingRecord } from '../types';

export interface BorrowPayload {
  student_name: string;
  id_number: string;
  email?: string;
  contact_number?: string;
  book_title: string;
  call_number?: string;
  borrow_date: string;
  due_date: string;
}

export interface ReturnPayload {
  action?: 'damaged' | 'lost';
}

export const borrowingService = {
  getAll: () => api.get<BorrowingRecord[]>('/borrowings').then(r => r.data),

  borrow: (data: BorrowPayload) =>
    api.post<BorrowingRecord>('/borrowings', data).then(r => r.data),

  return: (id: number, data: ReturnPayload = {}) =>
    api.post<BorrowingRecord>(`/borrowings/${id}/return`, data).then(r => r.data),

  getFines: () => api.get('/fines').then(r => r.data),

  markPaid: (id: number) => api.patch(`/fines/${id}/pay`).then(r => r.data),

  sendReminder: (id: number) => api.post(`/fines/${id}/remind`).then(r => r.data),

  sendReminders: () => api.post('/fines/reminders').then(r => r.data),
};
