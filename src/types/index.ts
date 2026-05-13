// ─── User ────────────────────────────────────────────────────────────────────
// Represents a logged-in library staff member or admin
export interface User {
  id: string;           // Unique identifier from the database
  username: string;     // Login username
  fullName: string;     // Display name shown in the header
  role: 'admin' | 'staff'; // Determines which routes and features are accessible
  status?: 'Active' | 'Inactive'; // Optional — used in User Management to enable/disable accounts
}

// ─── Book ─────────────────────────────────────────────────────────────────────
// Represents a single book record in the library inventory
export interface Book {
  id: number;           // Auto-incremented database ID
  call_number: string;  // Library call number (e.g. "REF 001.5")
  title: string;        // Book title
  author: string;       // Author name
  category: string;     // Genre or subject category
  total: number;        // Total copies owned by the library
  available: number;    // Copies currently on the shelf
  borrowed: number;     // Copies currently checked out
  damaged: number;      // Copies marked as damaged
  lost: number;         // Copies marked as lost
  status: 'available' | 'borrowed' | 'returned'; // Current overall status
}

// ─── BorrowingRecord ──────────────────────────────────────────────────────────
// Represents one borrow/return transaction
export interface BorrowingRecord {
  id: number;                   // Database ID of the transaction
  student_name: string;         // Name of the borrower
  id_number: string;            // Student/patron ID number
  email?: string;               // Optional contact email
  contact_number?: string;      // Optional phone number
  book_title: string;           // Title of the borrowed book
  call_number?: string;         // Optional call number of the book
  borrow_date: string;          // Date the book was borrowed (YYYY-MM-DD)
  due_date: string;             // Date the book must be returned (YYYY-MM-DD)
  return_date?: string;         // Actual return date, null if still borrowed
  status: 'borrowed' | 'returned'; // Whether the book has been returned
  action?: 'damaged' | 'lost'; // Optional flag set when returning a damaged or lost book
  fine_amount: number;          // Calculated fine in pesos
  fine_status: 'paid' | 'unpaid'; // Whether the fine has been settled
}

// ─── Attendance ───────────────────────────────────────────────────────────────
// Represents one library visit log entry
export interface Attendance {
  id: number;           // Database ID
  id_number: string;    // Student/patron ID number
  name: string;         // Full name of the visitor
  email?: string;       // Optional email
  phone?: string;       // Optional phone number
  course?: string;      // Optional course/program
  year?: string;        // Optional year level
  purpose?: string;     // Optional reason for the visit
  created_at: string;   // Timestamp when the attendance was recorded
}

// ─── ActivityLog ──────────────────────────────────────────────────────────────
// Represents one entry in the admin activity log
export interface ActivityLog {
  id: number;       // Database ID
  dateTime: string; // When the action occurred
  user: string;     // Who performed the action (from X-User-Name header)
  role: string;     // Their role at the time (from X-User-Role header)
  action: string;   // Short action label (e.g. "Book Added")
  details: string;  // Full description of what was done
}
