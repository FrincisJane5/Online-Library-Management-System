import { useState } from 'react';
import Layout from './Layout';
import { User } from '../App';
import { Search, Plus, Edit, Trash2, X } from 'lucide-react';

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

const mockBooks: Book[] = [
  { id: 1, callNumber: 'QA76.76', title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', category: 'Computer Science', totalCopies: 10, available: 7, borrowed: 2, damaged: 1, lost: 0, status: 'Available' },
  { id: 2, callNumber: 'QC21.3', title: 'Physics for Scientists', author: 'Raymond A. Serway', category: 'Physics', totalCopies: 8, available: 5, borrowed: 3, damaged: 0, lost: 0, status: 'Available' },
  { id: 3, callNumber: 'HF5549', title: 'Human Resource Management', author: 'Gary Dessler', category: 'Business', totalCopies: 6, available: 0, borrowed: 5, damaged: 0, lost: 1, status: 'Borrowed' },
  { id: 4, callNumber: 'QA76.9', title: 'Database System Concepts', author: 'Abraham Silberschatz', category: 'Computer Science', totalCopies: 12, available: 9, borrowed: 3, damaged: 0, lost: 0, status: 'Available' },
  { id: 5, callNumber: 'RT41', title: 'Fundamentals of Nursing', author: 'Patricia A. Potter', category: 'Nursing', totalCopies: 15, available: 12, borrowed: 2, damaged: 1, lost: 0, status: 'Available' },
  { id: 6, callNumber: 'BF121', title: 'Psychology: Themes and Variations', author: 'Wayne Weiten', category: 'Psychology', totalCopies: 7, available: 4, borrowed: 2, damaged: 1, lost: 0, status: 'Damaged' }
];

export default function BooksInventory({ user, onLogout }: BooksInventoryProps) {
  const [books] = useState<Book[]>(mockBooks);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredBooks = books.filter((book) => {
    const matchesSearch = 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.callNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || book.category === categoryFilter;
    const matchesStatus = !statusFilter || book.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = ['Computer Science', 'Physics', 'Business', 'Nursing', 'Psychology', 'Education', 'Engineering'];
  const statuses = ['Available', 'Borrowed', 'Damaged', 'Lost'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-[#79C39F] text-white border-[#79C39F]';
      case 'Borrowed': return 'bg-[#EF8B2D] text-white border-[#EF8B2D]';
      case 'Damaged': return 'bg-[#D72A24] text-white border-[#D72A24]';
      case 'Lost': return 'bg-[#9DA4A6] text-white border-[#9DA4A6]';
      default: return 'bg-[#9DA4A6] text-white border-[#9DA4A6]';
    }
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[#4B4C58] mb-2">Books & Inventory</h2>
            <p className="text-[#9DA4A6]">Manage book collection and track inventory status.</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#EF8B2D] hover:bg-[#EF8B2D]/90 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New Book
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#9DA4A6]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label htmlFor="search" className="block text-[#4B4C58] mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9DA4A6]" />
                <input
                  id="search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by title, author, or call number..."
                  className="w-full pl-10 pr-4 py-2 border border-[#9DA4A6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B764C] focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label htmlFor="category" className="block text-[#4B4C58] mb-2">
                Category
              </label>
              <select
                id="category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-[#9DA4A6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B764C] focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="status" className="block text-[#4B4C58] mb-2">
                Status
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-[#9DA4A6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B764C] focus:border-transparent"
              >
                <option value="">All Status</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Books Table */}
        <div className="bg-white rounded-lg shadow-sm border border-[#9DA4A6] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F5F6F5] border-b border-[#9DA4A6]">
                <tr>
                  <th className="px-6 py-3 text-left text-[#4B4C58]">Call Number</th>
                  <th className="px-6 py-3 text-left text-[#4B4C58]">Title</th>
                  <th className="px-6 py-3 text-left text-[#4B4C58]">Author</th>
                  <th className="px-6 py-3 text-left text-[#4B4C58]">Category</th>
                  <th className="px-6 py-3 text-center text-[#4B4C58]">Total</th>
                  <th className="px-6 py-3 text-center text-[#4B4C58]">Available</th>
                  <th className="px-6 py-3 text-center text-[#4B4C58]">Borrowed</th>
                  <th className="px-6 py-3 text-center text-[#4B4C58]">Damaged</th>
                  <th className="px-6 py-3 text-center text-[#4B4C58]">Lost</th>
                  <th className="px-6 py-3 text-left text-[#4B4C58]">Status</th>
                  <th className="px-6 py-3 text-center text-[#4B4C58]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#9DA4A6]/30">
                {filteredBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-[#F5F6F5]">
                    <td className="px-6 py-4 text-[#4B4C58]">{book.callNumber}</td>
                    <td className="px-6 py-4 text-[#4B4C58]">{book.title}</td>
                    <td className="px-6 py-4 text-[#9DA4A6]">{book.author}</td>
                    <td className="px-6 py-4 text-[#9DA4A6]">{book.category}</td>
                    <td className="px-6 py-4 text-center text-[#4B4C58]">{book.totalCopies}</td>
                    <td className="px-6 py-4 text-center text-[#4B4C58]">{book.available}</td>
                    <td className="px-6 py-4 text-center text-[#4B4C58]">{book.borrowed}</td>
                    <td className="px-6 py-4 text-center text-[#4B4C58]">{book.damaged}</td>
                    <td className="px-6 py-4 text-center text-[#4B4C58]">{book.lost}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded border ${getStatusColor(book.status)}`}>
                        {book.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-1 text-[#1B764C] hover:bg-[#79C39F]/20 rounded">
                          <Edit className="w-4 h-4" />
                        </button>
                        {user.role === 'admin' && (
                          <button className="p-1 text-[#D72A24] hover:bg-[#D72A24]/10 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredBooks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[#9DA4A6]">No books found.</p>
            </div>
          )}
        </div>

        {/* Add Book Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-[#9DA4A6] flex items-center justify-between">
                <h3 className="text-[#4B4C58]">Add New Book</h3>
                <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-[#F5F6F5] rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#4B4C58] mb-2">Call Number</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-[#9DA4A6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B764C]"
                      placeholder="e.g., QA76.76"
                    />
                  </div>
                  <div>
                    <label className="block text-[#4B4C58] mb-2">Category</label>
                    <select className="w-full px-4 py-2 border border-[#9DA4A6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B764C]">
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[#4B4C58] mb-2">Title</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-[#9DA4A6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B764C]"
                    placeholder="Book title"
                  />
                </div>
                <div>
                  <label className="block text-[#4B4C58] mb-2">Author</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-[#9DA4A6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B764C]"
                    placeholder="Author name"
                  />
                </div>
                <div>
                  <label className="block text-[#4B4C58] mb-2">Number of Copies</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-4 py-2 border border-[#9DA4A6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B764C]"
                    placeholder="0"
                  />
                </div>
                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-[#9DA4A6] hover:bg-[#F5F6F5] text-[#4B4C58] rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowAddModal(false);
                    }}
                    className="px-4 py-2 bg-[#1B764C] hover:bg-[#016937] text-white rounded-lg transition-colors"
                  >
                    Add Book
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