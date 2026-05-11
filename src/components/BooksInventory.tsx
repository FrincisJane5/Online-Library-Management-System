import { useState, useEffect, useMemo } from 'react';
import Layout from './Layout';
import { User } from '../types';
import { Search, Plus, Edit, Trash2, X } from 'lucide-react';
import api from '../api/axios';
import { usePagination } from '../hooks/usePagination';
import Pagination from './Pagination';

interface BooksInventoryProps {
  user: User;
  onLogout: () => void;
}

interface Book {
  id: number;
  call_number: string | null;
  title: string | null;
  author: string | null;
  pages: number | null;
  cost_price: number | null;
  publisher: string | null;
  year: number | null;
  remarks: string | null;
  total: number;
  available: number;
  borrowed: number;
  damaged: number;
  lost: number;
  status: 'Available' | 'Borrowed' | 'Damaged' | 'Lost';
}

const emptyForm = {
  call_number: '',
  title: '',
  author: '',
  pages: '',
  cost_price: '',
  publisher: '',
  year: '',
  remarks: '',
  total: 1,
  status: 'Available' as Book['status'],
};

export default function BooksInventory({ user, onLogout }: BooksInventoryProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => { fetchBooks(); }, []);

  const fetchBooks = async () => {
    try {
      const res = await api.get('/books');
      const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setBooks(data.map((b: any) => ({
        id: b.id,
        call_number: b.call_number ?? null,
        title: b.title ?? null,
        author: b.author ?? null,
        pages: b.pages ?? null,
        cost_price: b.cost_price ?? null,
        publisher: b.publisher ?? null,
        year: b.year ?? null,
        remarks: b.remarks ?? null,
        total: b.total ?? 0,
        available: b.available ?? 0,
        borrowed: b.borrowed ?? 0,
        damaged: b.damaged ?? 0,
        lost: b.lost ?? 0,
        status: b.status ?? 'Available',
      })));
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const resetForm = () => { setFormData(emptyForm); setEditingBook(null); };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      const payload = {
        call_number: formData.call_number || null,
        title:       formData.title || null,
        author:      formData.author || null,
        pages:       formData.pages ? Number(formData.pages) : null,
        cost_price:  formData.cost_price ? Number(formData.cost_price) : null,
        publisher:   formData.publisher || null,
        year:        formData.year ? Number(formData.year) : null,
        remarks:     formData.remarks || null,
        total:       Number(formData.total),
        available:   editingBook ? editingBook.available : Number(formData.total),
        status:      formData.status,
      };
      const res = editingBook
        ? await api.put(`/books/${editingBook.id}`, payload)
        : await api.post('/books', payload);
      if (res.status === 200 || res.status === 201) {
        setShowModal(false);
        resetForm();
        fetchBooks();
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Could not save book.');
    }
  };

  const openEdit = (book: Book) => {
    setEditingBook(book);
    setFormData({
      call_number: book.call_number ?? '',
      title:       book.title ?? '',
      author:      book.author ?? '',
      pages:       book.pages != null ? String(book.pages) : '',
      cost_price:  book.cost_price != null ? String(book.cost_price) : '',
      publisher:   book.publisher ?? '',
      year:        book.year != null ? String(book.year) : '',
      remarks:     book.remarks ?? '',
      total:       book.total,
      status:      book.status,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this book?')) return;
    try {
      await api.delete(`/books/${id}`);
      setBooks(books.filter(b => b.id !== id));
    } catch (err) { console.error(err); }
  };

  const filtered = useMemo(() => books.filter(b =>
    (!searchTerm || [b.title, b.author, b.call_number].some(v => v?.toLowerCase().includes(searchTerm.toLowerCase()))) &&
    (!statusFilter || b.status === statusFilter)
  ), [books, searchTerm, statusFilter]);

  const { paged, page, totalPages, setPage, reset, total } = usePagination(filtered);
  useEffect(() => { reset(); }, [filtered]); // eslint-disable-line react-hooks/exhaustive-deps

  const statusColor = (s: string) => ({
    Available: 'bg-[#79C39F] text-white',
    Borrowed:  'bg-[#EF8B2D] text-white',
    Damaged:   'bg-[#D72A24] text-white',
    Lost:      'bg-[#9DA4A6] text-white',
  }[s] ?? 'bg-[#9DA4A6] text-white');

  const field = (label: string, key: keyof typeof emptyForm, type = 'text', required = false) => (
    <div>
      <label className="block text-sm font-medium mb-1">{label}{required && <span className="text-red-500"> *</span>}</label>
      <input
        type={type}
        required={required}
        value={formData[key] as string}
        placeholder={label}
        className="w-full border p-2 rounded focus:ring-2 focus:ring-[#EF8B2D] outline-none"
        onChange={e => setFormData({ ...formData, [key]: e.target.value })}
      />
    </div>
  );

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[#4B4C58] text-2xl font-bold mb-2">Books & Inventory</h2>
            <p className="text-[#9DA4A6]">School Library Management System</p>
          </div>
          <button onClick={() => { resetForm(); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#EF8B2D] text-white rounded-lg hover:bg-[#d67a1f] transition-colors">
            <Plus className="w-4 h-4" /> Add New Book
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-[#9DA4A6] flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9DA4A6]" />
            <input type="text" placeholder="Search by title, author, or call number..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#EF8B2D] outline-none"
              onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <select className="border p-2 rounded-lg outline-none" onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="Available">Available</option>
            <option value="Borrowed">Borrowed</option>
            <option value="Damaged">Damaged</option>
            <option value="Lost">Lost</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-[#9DA4A6] overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F5F6F5] border-b">
              <tr>
                <th className="px-4 py-3">Call No.</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Author</th>
                <th className="px-4 py-3">Publisher</th>
                <th className="px-4 py-3 text-center">Year</th>
                <th className="px-4 py-3 text-center">Pages</th>
                <th className="px-4 py-3 text-center">Cost</th>
                <th className="px-4 py-3 text-center">Avail.</th>
                <th className="px-4 py-3 text-center">Borrowed</th>
                <th className="px-4 py-3 text-center">Damaged</th>
                <th className="px-4 py-3 text-center">Lost</th>
                <th className="px-4 py-3">Remarks</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length > 0 ? paged.map(book => (
                <tr key={book.id} className="hover:bg-[#F5F6F5] transition-colors">
                  <td className="px-4 py-3 font-mono text-xs">{book.call_number ?? '—'}</td>
                  <td className="px-4 py-3 font-semibold">{book.title ?? '—'}</td>
                  <td className="px-4 py-3 text-[#9DA4A6]">{book.author ?? '—'}</td>
                  <td className="px-4 py-3 text-[#9DA4A6]">{book.publisher ?? '—'}</td>
                  <td className="px-4 py-3 text-center">{book.year ?? '—'}</td>
                  <td className="px-4 py-3 text-center">{book.pages ?? '—'}</td>
                  <td className="px-4 py-3 text-center">{book.cost_price != null ? `₱${Number(book.cost_price).toFixed(2)}` : '—'}</td>
                  <td className="px-4 py-3 text-center">{book.available}</td>
                  <td className="px-4 py-3 text-center">{book.borrowed}</td>
                  <td className="px-4 py-3 text-center">{book.damaged}</td>
                  <td className="px-4 py-3 text-center">{book.lost}</td>
                  <td className="px-4 py-3 text-xs text-[#9DA4A6]">{book.remarks ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusColor(book.status)}`}>{book.status}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => openEdit(book)} className="text-blue-600 hover:text-blue-800"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(book.id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={15} className="px-6 py-10 text-center text-[#9DA4A6]">No books found.</td></tr>
              )}
            </tbody>
          </table>
          <Pagination page={page} totalPages={totalPages} total={total} onPage={setPage} />
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between mb-4 border-b pb-2">
                <h3 className="font-bold text-xl text-[#4B4C58]">{editingBook ? 'Edit Book' : 'Add New Book'}</h3>
                <X className="cursor-pointer text-gray-500 hover:text-black"
                  onClick={() => { setShowModal(false); resetForm(); setFormError(null); }} />
              </div>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {field('Call Number', 'call_number')}
                  {field('Title', 'title')}
                  {field('Author', 'author')}
                  {field('Publisher', 'publisher')}
                  {field('Year', 'year', 'number')}
                  {field('Pages', 'pages', 'number')}
                  {field('Cost Price (₱)', 'cost_price', 'number')}
                  <div>
                    <label className="block text-sm font-medium mb-1">Remarks (Inventory Date)</label>
                    <input
                      type="date"
                      value={formData.remarks}
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-[#EF8B2D] outline-none"
                      onChange={e => setFormData({ ...formData, remarks: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Status <span className="text-red-500">*</span></label>
                    <select value={formData.status}
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-[#EF8B2D] outline-none"
                      onChange={e => setFormData({ ...formData, status: e.target.value as Book['status'] })}>
                      <option value="Available">Available</option>
                      <option value="Borrowed">Borrowed</option>
                      <option value="Damaged">Damaged</option>
                      <option value="Lost">Lost</option>
                    </select>
                    {formData.status === 'Available' && editingBook && editingBook.status !== 'Available' && (
                      <p className="text-xs text-green-700 mt-1">⚠ Setting to Available will reset Borrowed, Damaged, and Lost counters to 0 and restore all copies.</p>
                    )}
                  </div>
                </div>
                {formError && <p className="text-red-600 text-sm">{formError}</p>}
                <div className="flex gap-3 pt-4 border-t">
                  <button type="button" onClick={() => { setShowModal(false); resetForm(); setFormError(null); }}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                  <button type="submit"
                    className="flex-1 bg-[#1B764C] text-white py-2 rounded-lg hover:bg-[#145a3a] transition-colors">
                    {editingBook ? 'Save Changes' : 'Save Book'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
