import { useState, useEffect } from 'react';
import Layout from './Layout';
import { User } from '../App';
import { Search, Plus, Edit, Trash2, X } from 'lucide-react';
import api from '../api/axios';

interface BooksInventoryProps {
  user: User;
  onLogout: () => void;
}

interface Book {
  id: number;
  callNumber: string; 
  title: string;
  author: string;
  category: string;
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
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  const [formData, setFormData] = useState({
    callNumber: '', 
    title: '',
    author: '',
    category: 'Computer Science', 
    totalCopies: 0,
    status: 'Available' as Book['status'],
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await api.get('/books');
      const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
      const normalizedBooks = data.map((book: any) => ({
        ...book,
        callNumber: book.callNumber ?? book.call_number ?? '',
        totalCopies: book.totalCopies ?? book.total ?? 0,
        available: book.available ?? 0,
        borrowed: book.borrowed ?? 0,
        damaged: book.damaged ?? 0,
        lost: book.lost ?? 0,
        status: book.status ?? 'Available',
      }));
      setBooks(normalizedBooks);
      console.log("Books loaded successfully:", data);
    } catch (err) {
      console.error("Fetch error details:", err);
  
    }
  };

  const resetForm = () => {
    setFormData({
      callNumber: '',
      title: '',
      author: '',
      category: 'Computer Science',
      totalCopies: 0,
      status: 'Available',
    });
    setEditingBook(null);
  };

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const payload = {
          call_number: formData.callNumber,
          title: formData.title,
          author: formData.author,
          category: formData.category,
          total: Number(formData.totalCopies),
          available: editingBook ? editingBook.available : Number(formData.totalCopies),
          status: formData.status,
        };

        const response = editingBook
          ? await api.put(`/books/${editingBook.id}`, payload)
          : await api.post('/books', payload);

        if (response.status === 201 || response.status === 200) {
            alert(editingBook ? "Book Updated Successfully!" : "Book Saved Successfully!");
            setShowAddModal(false);
            resetForm();
            fetchBooks();
        }
    } catch (err: any) {
        console.error("Backend Error:", err.response?.data);
        alert(err.response?.data?.message || "Check your XAMPP/MySQL connection.");
    }
  };

  const openEditModal = (book: Book) => {
    setEditingBook(book);
    setFormData({
      callNumber: book.callNumber,
      title: book.title,
      author: book.author,
      category: book.category,
      totalCopies: book.totalCopies,
      status: book.status || 'Available',
    });
    setShowAddModal(true);
  };
  const handleDelete = async (id: number) => {
    if(!confirm("Delete this book?")) return;
    try {
      await api.delete(`/books/${id}`);
      setBooks(books.filter(b => b.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const filteredBooks = books.filter((book) => {
    const titleMatch = (book.title || "").toLowerCase().includes(searchTerm.toLowerCase());
    const callNumberMatch = (book.callNumber || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = titleMatch || callNumberMatch;
    
    return (
      matchesSearch && 
      (!categoryFilter || book.category === categoryFilter) && 
      (!statusFilter || (book.status || 'Available') === statusFilter)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-[#79C39F] text-white';
      case 'Borrowed': return 'bg-[#EF8B2D] text-white';
      case 'Damaged': return 'bg-[#D72A24] text-white';
      default: return 'bg-[#9DA4A6] text-white';
    }
  };
  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[#4B4C58] text-2xl font-bold mb-2">Books & Inventory</h2>
            <p className="text-[#9DA4A6]">School Library Management System</p>
          </div>
          <button 
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#EF8B2D] text-white rounded-lg hover:bg-[#d67a1f] transition-colors"
          >
            <Plus className="w-4 h-4" /> Add New Book
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#9DA4A6] grid grid-cols-4 gap-4">
          <div className="col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9DA4A6]" />
            <input 
                type="text" 
                placeholder="Search by title or license number..." 
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#EF8B2D] outline-none" 
                onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>
          <select className="border p-2 rounded-lg outline-none" onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="">All Categories</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Physics">Physics</option>
            <option value="Business">Business</option>
          </select>
          <select className="border p-2 rounded-lg outline-none" onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="Available">Available</option>
            <option value="Borrowed">Borrowed</option>
            <option value="Damaged">Damaged</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-[#9DA4A6] overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-[#F5F6F5] border-b">
              <tr>
                <th className="px-6 py-3">License Number</th>
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Author</th>
                <th className="px-6 py-3">Category</th>
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
              {filteredBooks.length > 0 ? (
                filteredBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-[#F5F6F5] transition-colors">
                    <td className="px-6 py-4 font-mono text-sm">{book.callNumber}</td>
                    <td className="px-6 py-4 font-semibold">{book.title}</td>
                    <td className="px-6 py-4 text-[#9DA4A6]">{book.author}</td>
                    <td className="px-6 py-4">{book.category}</td>
                    <td className="px-6 py-4 text-center">{book.totalCopies}</td>
                    <td className="px-6 py-4 text-center">{book.available}</td>
                    <td className="px-6 py-4 text-center">{book.borrowed}</td>
                    <td className="px-6 py-4 text-center">{book.damaged}</td>
                    <td className="px-6 py-4 text-center">{book.lost}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(book.status || 'Available')}`}>
                        {book.status || 'Available'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => openEditModal(book)} title="Edit" className="text-blue-600 hover:text-blue-800"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(book.id)} title="Delete" className="text-red-600 hover:text-red-800">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} className="px-6 py-10 text-center text-[#9DA4A6]">No books found. Ensure backend is running.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-xl">
              <div className="flex justify-between mb-4 border-b pb-2">
                <h3 className="font-bold text-xl text-[#4B4C58]">{editingBook ? 'Edit Book' : 'Add New Book'}</h3>
                <X
                  className="cursor-pointer text-gray-500 hover:text-black"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                />
              </div>
              <form onSubmit={handleSaveBook} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">License Number</label>
                    <input 
                        required 
                        value={formData.callNumber} 
                        className="w-full border p-2 rounded focus:ring-2 focus:ring-[#EF8B2D] outline-none" 
                        placeholder="e.g. CS-101" 
                        onChange={e => setFormData({...formData, callNumber: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Total Copies</label>
                    <input 
                        type="number" 
                        min="1" 
                        required 
                        value={formData.totalCopies} 
                        className="w-full border p-2 rounded focus:ring-2 focus:ring-[#EF8B2D] outline-none" 
                        onChange={e => setFormData({...formData, totalCopies: parseInt(e.target.value) || 0})} 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input 
                    required 
                    value={formData.title} 
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-[#EF8B2D] outline-none" 
                    placeholder="Book Title" 
                    onChange={e => setFormData({...formData, title: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Author</label>
                  <input 
                    required 
                    value={formData.author} 
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-[#EF8B2D] outline-none" 
                    placeholder="Author Name" 
                    onChange={e => setFormData({...formData, author: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select 
                    value={formData.category} 
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-[#EF8B2D] outline-none" 
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                      <option value="Computer Science">Computer Science</option>
                      <option value="Physics">Physics</option>
                      <option value="Business">Business</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={formData.status}
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-[#EF8B2D] outline-none"
                    onChange={e => setFormData({ ...formData, status: e.target.value as Book['status'] })}
                  >
                    <option value="Available">Available</option>
                    <option value="Borrowed">Borrowed</option>
                    <option value="Damaged">Damaged</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4 border-t">
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-[#1B764C] text-white py-2 rounded-lg hover:bg-[#145a3a] transition-colors"
                  >
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