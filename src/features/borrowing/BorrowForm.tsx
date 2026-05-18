import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { borrowingService } from '../../services/borrowingService';
import { bookService } from '../../services/bookService';
import { useDebounce } from '../../hooks/useDebounce';
import { today } from '../../utils';
import api from '../../api/axios';
import type { Book } from '../../types';

interface Program { id: number; code: string; name: string; total_years: number; year_levels: string[]; }

interface Props {
  onSuccess: (msg: string) => void;
  onError: (err: any) => void;
}

const EMPTY_FORM = {
  idNumber: '',
  studentName: '', email: '', contactNumber: '',
  course: '', year: '',
  academicYear: '', semester: '',
  dateBorrowed: today(), dueDate: '',
};

export default function BorrowForm({ onSuccess, onError }: Props) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [lookupStatus, setLookupStatus] = useState<'idle' | 'found' | 'not_found'>('idle');
  const [attendedToday, setAttendedToday] = useState<boolean | null>(null);
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

  const handleIdLookup = async () => {
    const id = form.idNumber.trim();
    if (!id) return;
    try {
      const [lookupRes, checkRes] = await Promise.all([
        api.get(`/attendance/lookup?id_number=${encodeURIComponent(id)}`),
        api.get(`/attendance/check-id?id_number=${encodeURIComponent(id)}`),
      ]);
      setAttendedToday(checkRes.data.exists === true);
      if (lookupRes.data.found) {
        setForm(f => ({
          ...f,
          studentName:   lookupRes.data.name   ?? f.studentName,
          email:         lookupRes.data.email  ?? f.email,
          contactNumber: lookupRes.data.phone  ?? f.contactNumber,
          course:        lookupRes.data.course ?? f.course,
          year:          lookupRes.data.year   ?? f.year,
        }));
        setLookupStatus('found');
      } else {
        setLookupStatus('not_found');
      }
    } catch {
      setLookupStatus('idle');
      setAttendedToday(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBook) { onError({ response: { data: { message: 'Please select a book from the search results.' } } }); return; }
    if (attendedToday === false) { onError({ response: { data: { message: 'Student has not attended the library today. Attendance is required before borrowing.' } } }); return; }
    try {
      await borrowingService.borrow({
        student_name:   form.studentName,
        id_number:      form.idNumber || undefined,
        email:          form.email || undefined,
        contact_number: form.contactNumber || undefined,
        course:         form.course || undefined,
        year:           form.year || undefined,
        academic_year:  form.academicYear || undefined,
        semester:       form.semester || undefined,
        book_title:     selectedBook.title ?? '',
        call_number:    selectedBook.call_number ?? undefined,
        borrow_date:    form.dateBorrowed,
        due_date:       form.dueDate,
      });
      setForm(EMPTY_FORM);
      setSelectedBook(null);
      setBookQuery('');
      setLookupStatus('idle');
      setAttendedToday(null);
      onSuccess('Book successfully borrowed! A confirmation email has been sent to the student.');
    } catch (err: any) {
      onError(err);
    }
  };

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value })),
  });

  const inputCls = "px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500";
  const selectedProgram = programs.find(p => p.code === form.course);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Student info */}
      <div>
        <h3 className="text-slate-900 mb-4">Borrower Information</h3>
        <div className="space-y-3">

          {/* ID Number lookup */}
          <div>
            <div className="flex gap-2">
              <input
                {...field('idNumber')}
                placeholder="ID Number (auto-fill from attendance)"
                onBlur={handleIdLookup}
                className={`flex-1 ${inputCls}`}
              />
              <button type="button" onClick={handleIdLookup}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm transition-colors whitespace-nowrap">
                Look Up
              </button>
            </div>
            {lookupStatus === 'found' && (
              <p className="text-green-600 text-xs mt-1">✅ Student info auto-filled from attendance record.</p>
            )}
            {lookupStatus === 'not_found' && (
              <p className="text-amber-500 text-xs mt-1">⚠️ No attendance record found. Please fill in manually.</p>
            )}
            {attendedToday === true && (
              <p className="text-green-600 text-xs mt-1">✅ Student has attended the library today.</p>
            )}
            {attendedToday === false && (
              <p className="text-red-600 text-xs mt-1">🚫 Student has NOT attended the library today. Borrowing is not allowed.</p>
            )}
          </div>

          <input {...field('studentName')} placeholder="Student Full Name" required
            className={`w-full ${inputCls}`} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input {...field('email')} type="email" placeholder="Email Address" required
              className={inputCls} />
            <input {...field('contactNumber')} placeholder="Contact Number" required
              className={inputCls} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select value={form.course}
              onChange={e => setForm(f => ({ ...f, course: e.target.value, year: '' }))}
              required
              className={inputCls}>
              <option value="">Select Course</option>
              {programs.map(p => <option key={p.id} value={p.code}>{p.code} — {p.name}</option>)}
            </select>
            <select value={form.year}
              onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
              required
              disabled={!selectedProgram}
              className={`${inputCls} disabled:opacity-50`}>
              <option value="">Select Year Level</option>
              {(selectedProgram?.year_levels ?? []).map(y => <option key={y} value={y}>{y}</option>)}
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
          <input type="date" {...field('dateBorrowed')} required className={`w-full ${inputCls}`} />
        </div>
        <div>
          <label className="block text-slate-700 mb-2">Due Date</label>
          <input type="date" {...field('dueDate')} required className={`w-full ${inputCls}`} />
        </div>
      </div>

      {/* Academic Year & Semester */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-slate-700 mb-2">Academic Year</label>
          <input {...field('academicYear')} placeholder="e.g. 2024-2025" className={`w-full ${inputCls}`} />
        </div>
        <div>
          <label className="block text-slate-700 mb-2">Semester</label>
          <select value={form.semester}
            onChange={e => setForm(f => ({ ...f, semester: e.target.value }))}
            className={`w-full ${inputCls}`}>
            <option value="">Select Semester</option>
            <option value="1st Semester">1st Semester</option>
            <option value="2nd Semester">2nd Semester</option>
            <option value="Summer">Summer</option>
          </select>
        </div>
      </div>

      <button type="submit"
        disabled={attendedToday === false}
        className="px-6 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors">
        Confirm Borrowing
      </button>
    </form>
  );
}
