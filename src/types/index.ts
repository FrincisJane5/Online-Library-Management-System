export interface User {
  id: string;
  username: string;
  fullName: string;
  role: 'admin' | 'staff';
  status?: 'Active' | 'Inactive';
}

export interface Book {
  id: number;
  call_number: string;
  title: string;
  author: string;
  category: string;
  total: number;
  available: number;
  borrowed: number;
  damaged: number;
  lost: number;
  status: 'available' | 'borrowed' | 'returned';
}

export interface BorrowingRecord {
  id: number;
  student_name: string;
  id_number: string;
  email?: string;
  contact_number?: string;
  book_title: string;
  call_number?: string;
  borrow_date: string;
  due_date: string;
  return_date?: string;
  status: 'borrowed' | 'returned';
  action?: 'damaged' | 'lost';
  fine_amount: number;
  fine_status: 'paid' | 'unpaid';
}

export interface Attendance {
  id: number;
  id_number: string;
  name: string;
  email?: string;
  phone?: string;
  course?: string;
  year?: string;
  purpose?: string;
  created_at: string;
}

export interface ActivityLog {
  id: number;
  dateTime: string;
  user: string;
  role: string;
  action: string;
  details: string;
}
