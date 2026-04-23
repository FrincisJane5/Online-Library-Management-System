import { useState, useEffect } from 'react';
import Layout from './Layout';
import { User } from '../App';
import { Search, Plus, Edit, Trash2, X } from 'lucide-react';
import axios from 'axios';
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

  const [formData, setFormData] = useState({
    callNumber: '', 
    title: '',
    author: '',
    category: 'Computer Science', 
    totalCopies: 0
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
   
      const res = await axios.get('http://127.0.0.1:8000/api/books');
      
      const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
      setBooks(data);
      console.log("Books loaded successfully:", data);
    } catch (err) {
      console.error("Fetch error details:", err);
  
    }
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        // Use the full URL to be safe, or ensure 'api' instance has the correct baseURL
        const response = await axios.post('http://127.0.0.1:8000/api/books', { 
            call_number: formData.callNumber,
            title: formData.title,
            author: formData.author,
            category: formData.category,
            total: Number(formData.totalCopies),
            available: Number(formData.totalCopies),
            status: 'Available'
        });

        if (response.status === 201 || response.status === 200) {
            alert("Book Saved Successfully!");
            setShowAddModal(false); 
            fetchBooks(); // Refresh the list
            setFormData({ callNumber: '', title: '', author: '', category: 'Computer Science', totalCopies: 0 }); // Reset form
        }
    } catch (err: any) {
        // Log the specific error from Laravel (Validation errors, etc.)
        console.error("Backend Error:", err.response?.data);
        alert(err.response?.data?.message || "Check your XAMPP/MySQL connection.");
    }
};
  const handleDelete = async (id: number) => {
    if(!confirm("Delete this book?")) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/books/${id}`);
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
 const handleSaveBook = async (bookData: any) => {// Accept bookData as an argument
  try {
    const response = await fetch('http://127.0.0.1:8000/api/books', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json', // Highly recommended for Laravel APIs
      },
      body: JSON.stringify(bookData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Server Error:', errorData);
      return;
    }

    const result = await response.json();
    console.log('Book saved successfully:', result);
  } catch (error) {
    console.error('Network error:', error);
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
            onClick={() => setShowAddModal(true)} 
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
                placeholder="Search by title or call number..." 
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
                <th className="px-6 py-3">Call Number</th>
                <th className="px-6 py-3">Title</th>
                <th className="px-6 py-3">Author</th>
                <th className="px-6 py-3 text-center">Total</th>
                <th className="px-6 py-3 text-center">Available</th>
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
                    <td className="px-6 py-4 text-center">{book.totalCopies}</td>
                    <td className="px-6 py-4 text-center">{book.available}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(book.status || 'Available')}`}>
                        {book.status || 'Available'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button title="Edit" className="text-blue-600 hover:text-blue-800"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(book.id)} title="Delete" className="text-red-600 hover:text-red-800">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-[#9DA4A6]">No books found. Ensure backend is running.</td>
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
                <h3 className="font-bold text-xl text-[#4B4C58]">Add New Book</h3>
                <X className="cursor-pointer text-gray-500 hover:text-black" onClick={() => setShowAddModal(false)} />
              </div>
              <form onSubmit={handleAddBook} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Call Number</label>
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
                <div className="flex gap-3 pt-4 border-t">
                  <button 
                    type="button" 
                    onClick={() => setShowAddModal(false)} 
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-[#1B764C] text-white py-2 rounded-lg hover:bg-[#145a3a] transition-colors"
                  >
                    Save Book
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