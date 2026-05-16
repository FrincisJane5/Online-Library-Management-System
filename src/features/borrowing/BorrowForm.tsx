import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { borrowingService } from '../../services/borrowingService';
import { bookService } from '../../services/bookService';
import { useDebounce } from '../../hooks/useDebounce';
import { today } from '../../utils';
import type { Book } from '../../types';
import api from '../../api/axios';

interface Program { id: number; code: string; name: string; total_years: number; }

interface Props {
  onSuccess: (msg: string) => void;
  onError: (err: any) => void;
}

const EMPTY_FORM = {
  studentName: '', email: '', contactNumber: '',
  course: '', year: '',
  dateBorrowed: today(), dueDate: '',
  academicYear: '', semester: '',
};

export default function BorrowForm({ onSuccess, onError }: Props) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [bookQuery, setBookQuery] = useState('');
  const [bookResults, setBookResults] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const debouncedQuery = useDebounce(bookQuery);

  useEffect(() => {
    api.get('/programs').then(r => setPrograms(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!debouncedQuery.trim() || selectedBook) { setBookResults([]); return; }
    bookService.lookup(debouncedQuery).then(setBookResults).catch(() => setBookResults([]));
  }, [debouncedQuery, selectedBook]);

  const selectBook = (book: Book) => {
    setSelectedBook(book);
    setBookQuery(book.title ?? book.call_number ?? '');
    setBookResults([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook) { onError({ response: { data: { message: 'Please select a book from the search results.' } } }); return; }
    try {
      await borrowingService.borrow({
        student_name:   form.studentName,
        email:          form.email || undefined,
        contact_number: form.contactNumber || undefined,
        course:         form.course || undefined,
        year:           form.year || undefined,
        book_title:     selectedBook.title ?? '',
        call_number:    selectedBook.call_number ?? undefined,
        borrow_date:    form.dateBorrowed,
        due_date:       form.dueDate,
        academic_year:  form.academicYear || undefined,
        semester:       form.semester || undefined,
      });
      setForm(EMPTY_FORM);
      setSelectedBook(null);
      setBookQuery('');
      onSuccess('Book successfully borrowed! A confirmation email has been sent to the student.');
    } catch (err: any) {
      onError(err);
    }
  };

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [key]: e.target.value })),
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Student info */}
      <div>
        <h3 className="text-slate-900 mb-4">Borrower Information</h3>
        <div className="space-y-3">
          <input {...field('studentName')} placeholder="Student Full Name" required
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input {...field('email')} type="email" placeholder="Email Address" required
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
            <input {...field('contactNumber')} placeholder="Contact Number" required
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select value={form.course}
              onChange={e => setForm(f => ({ ...f, course: e.target.value, year: '' }))} required
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="">Select Course</option>
              {programs.map(p => (
                <option key={p.id} value={p.code}>{p.code} – {p.name}</option>
              ))}
            </select>
            <select {...field('year')} required
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="">Select Year</option>
              {(() => {
                const prog = programs.find(p => p.code === form.course);
                const years = prog ? prog.total_years : 4;
                return Array.from({ length: years }, (_, i) => {
                  const label = ['1st', '2nd', '3rd', '4th', '5th'][i] ?? `${i + 1}th`;
                  return <option key={i} value={`${label} Year`}>{label} Year</option>;
                });
              })()}
            </select>
          </div>
        </div>
      </div>

      {/* Book search */}
      <div>
        <h3 className="text-slate-900 mb-4">Book Information</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input value={bookQuery}
            onChange={e => { setBookQuery(e.target.value); setSelectedBook(null); }}
            placeholder="Search by title, call number, or author..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>

        {bookResults.length > 0 && (
          <div className="mt-1 border border-slate-200 rounded-lg shadow-sm bg-white divide-y divide-slate-100 max-h-48 overflow-y-auto">
            {bookResults.map(book => (
              <button key={book.id} type="button" onClick={() => selectBook(book)}
                className="w-full text-left px-4 py-3 hover:bg-slate-50">
                <p className="text-slate-900 font-medium">{book.title ?? '—'}</p>
                <p className="text-slate-500 text-sm">
                  {book.call_number && <span className="font-mono font-semibold text-teal-700 mr-2">[{book.call_number}]</span>}
                  {book.author} · <span className="text-green-700">{book.available} available</span>
                </p>
              </button>
            ))}
          </div>
        )}

        {selectedBook && (
          <div className="mt-3 bg-teal-50 border border-teal-200 rounded-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div><p className="text-slate-500">Call No.</p><p className="font-mono font-bold text-teal-700">{selectedBook.call_number ?? '—'}</p></div>
            <div><p className="text-slate-500">Title</p><p className="text-slate-900">{selectedBook.title ?? '—'}</p></div>
            <div><p className="text-slate-500">Author</p><p className="text-slate-900">{selectedBook.author ?? '—'}</p></div>
            <div><p className="text-slate-500">Available</p><p className="text-green-700 font-medium">{selectedBook.available}</p></div>
          </div>
        )}
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-700 mb-2">Date Borrowed</label>
          <input type="date" {...field('dateBorrowed')} required
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <div>
          <label className="block text-slate-700 mb-2">Due Date</label>
          <input type="date" {...field('dueDate')} required
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
      </div>

      {/* Academic Year & Semester */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-700 mb-2">Academic Year</label>
          <input {...field('academicYear')} placeholder="e.g. 2024-2025"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <div>
          <label className="block text-slate-700 mb-2">Semester</label>
          <select value={form.semester}
            onChange={e => setForm(f => ({ ...f, semester: e.target.value }))}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="">Select Semester</option>
            <option value="1st Semester">1st Semester</option>
            <option value="2nd Semester">2nd Semester</option>
            <option value="Summer">Summer</option>
          </select>
        </div>
      </div>

      <button type="submit"
        className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors">
        Confirm Borrowing
      </button>
    </form>
  );
}
