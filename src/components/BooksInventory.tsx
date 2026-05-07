import { useState, useEffect } from 'react';
import Layout from './Layout';
import { User } from '../types';
import { Search, Plus, Edit, Trash2, X } from 'lucide-react';
import api from '../api/axios';

interface BooksInventoryProps {
  user: User;
  onLogout: () => void;
}

interface Book {
  id: number;
  title: string;
  author: string;
  totalCopies: number;
  available: number;
  borrowed: number;
  damaged: number;
  lost: number;
  status: 'Available' | 'Borrowed' | 'Damaged' | 'Lost';
}

export default function BooksInventory({ user, onLogout }: BooksInventoryProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    totalCopies: 1,
    status: 'Available' as Book['status'],
  });

  useEffect(() => { fetchBooks(); }, []);

  const fetchBooks = async () => {
    try {
      const res = await api.get('/books');
      const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setBooks(data.map((b: any) => ({
        id: b.id,
        title: b.title,
        author: b.author,
        totalCopies: b.total ?? b.totalCopies ?? 0,
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

  const resetForm = () => {
    setFormData({ title: '', author: '', totalCopies: 1, status: 'Available' });
    setEditingBook(null);
  };

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      const payload = {
        title:     formData.title,
        author:    formData.author,
        total:     Number(formData.totalCopies),
        available: editingBook ? editingBook.available : Number(formData.totalCopies),
        status:    formData.status,
      };
      const res = editingBook
        ? await api.put(`/books/${editingBook.id}`, payload)
        : await api.post('/books', payload);
      if (res.status === 200 || res.status === 201) {
        setShowAddModal(false);
        resetForm();
        fetchBooks();
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Could not save book. Check your backend connection.');
    }
  };

  const openEditModal = (book: Book) => {
    setEditingBook(book);
    setFormData({ title: book.title, author: book.author, totalCopies: book.totalCopies, status: book.status });
    setShowAddModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this book?')) return;
    try {
      await api.delete(`/books/${id}`);
      setBooks(books.filter(b => b.id !== id));
    } catch (err) { console.error(err); }
  };

  const filtered = books.filter(b =>
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (!statusFilter || b.status === statusFilter)
  );

  const statusColor = (s: string) => ({
    Available: 'bg-[#79C39F] text-white',
    Borrowed:  'bg-[#EF8B2D] text-white',
    Damaged:   'bg-[#D72A24] text-white',
    Lost:      'bg-[#9DA4A6] text-white',
  }[s] ?? 'bg-[#9DA4A6] text-white');

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[#4B4C58] text-2xl font-bold mb-2">Books & Inventory</h2>
            <p className="text-[#9DA4A6]">School Library Management System</p>
          </div>
          <button onClick={() => { resetForm(); setShowAddModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#EF8B2D] text-white rounded-lg hover:bg-[#d67a1f] transition-colors">
            <Plus className="w-4 h-4" /> Add New Book
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-[#9DA4A6] flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9DA4A6]" />
            <input type="text" placeholder="Search by title..."
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
        <div className="bg-white rounded-lg border border-[#9DA4A6] overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#F5F6F5] border-b">
              <tr>
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Author</th>
                <th className="px-6 py-3 text-center">Total</th>
                <th className="px-6 py-3 text-center">Available</th>
                <th className="px-6 py-3 text-center">Borrowed</th>
                <th className="px-6 py-3 text-center">Damaged</th>
                <th className="px-6 py-3 text-center">Lost</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length > 0 ? filtered.map(book => (
                <tr key={book.id} className="hover:bg-[#F5F6F5] transition-colors">
                  <td className="px-6 py-4 font-semibold">{book.title}</td>
                  <td className="px-6 py-4 text-[#9DA4A6]">{book.author}</td>
                  <td className="px-6 py-4 text-center">{book.totalCopies}</td>
                  <td className="px-6 py-4 text-center">{book.available}</td>
                  <td className="px-6 py-4 text-center">{book.borrowed}</td>
                  <td className="px-6 py-4 text-center">{book.damaged}</td>
                  <td className="px-6 py-4 text-center">{book.lost}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusColor(book.status)}`}>
                      {book.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => openEditModal(book)} className="text-blue-600 hover:text-blue-800"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(book.id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={9} className="px-6 py-10 text-center text-[#9DA4A6]">No books found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
              <div className="flex justify-between mb-4 border-b pb-2">
                <h3 className="font-bold text-xl text-[#4B4C58]">{editingBook ? 'Edit Book' : 'Add New Book'}</h3>
                <X className="cursor-pointer text-gray-500 hover:text-black"
                  onClick={() => { setShowAddModal(false); resetForm(); setFormError(null); }} />
              </div>
              <form onSubmit={handleSaveBook} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input required value={formData.title}
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-[#EF8B2D] outline-none"
                    placeholder="Book Title"
                    onChange={e => setFormData({ ...formData, title: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Author</label>
                  <input required value={formData.author}
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-[#EF8B2D] outline-none"
                    placeholder="Author Name"
                    onChange={e => setFormData({ ...formData, author: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Total Copies</label>
                  <input type="number" min="1" required value={formData.totalCopies}
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-[#EF8B2D] outline-none"
                    onChange={e => setFormData({ ...formData, totalCopies: parseInt(e.target.value) || 1 })} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select value={formData.status}
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-[#EF8B2D] outline-none"
                    onChange={e => setFormData({ ...formData, status: e.target.value as Book['status'] })}>
                    <option value="Available">Available</option>
                    <option value="Borrowed">Borrowed</option>
                    <option value="Damaged">Damaged</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>
                {formError && <p className="text-red-600 text-sm">{formError}</p>}
                <div className="flex gap-3 pt-4 border-t">
                  <button type="button" onClick={() => { setShowAddModal(false); resetForm(); setFormError(null); }}
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
