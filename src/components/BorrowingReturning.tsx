import { useState } from 'react';
import Layout from './Layout';
import { User } from '../App';
import { Search, Check } from 'lucide-react';

interface BorrowingReturningProps {
  user: User;
  onLogout: () => void;
}

export default function BorrowingReturning({ user, onLogout }: BorrowingReturningProps) {
  const [activeTab, setActiveTab] = useState<'borrow' | 'return'>('borrow');
  const [borrowSuccess, setBorrowSuccess] = useState(false);
  const [returnSuccess, setReturnSuccess] = useState(false);
  const [fineAmount, setFineAmount] = useState<number | null>(null);

  // Borrow form
  const [borrowForm, setBorrowForm] = useState({
    studentName: '',
    bookTitle: '',
    dateBorrowed: new Date().toISOString().split('T')[0],
    dueDate: ''
  });

  // Return form
  const [returnForm, setReturnForm] = useState({
    transactionId: ''
  });

  const handleBorrow = (e: React.FormEvent) => {
    e.preventDefault();
    setBorrowSuccess(true);
    setTimeout(() => {
      setBorrowSuccess(false);
      setBorrowForm({ studentName: '', bookTitle: '', dateBorrowed: new Date().toISOString().split('T')[0], dueDate: '' });
    }, 3000);
  };

  const handleReturn = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate overdue check
    const isOverdue = Math.random() > 0.5;
    if (isOverdue) {
      setFineAmount(50);
    } else {
      setFineAmount(0);
    }
    setReturnSuccess(true);
    setTimeout(() => {
      setReturnSuccess(false);
      setFineAmount(null);
      setReturnForm({ transactionId: '' });
    }, 5000);
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h2 className="text-slate-900 mb-2">Borrowing & Returning</h2>
          <p className="text-slate-600">Manage book borrowing and return transactions.</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="border-b border-slate-200 flex">
            <button
              onClick={() => setActiveTab('borrow')}
              className={`px-6 py-4 transition-colors ${
                activeTab === 'borrow'
                  ? 'border-b-2 border-teal-600 text-teal-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Borrow Book
            </button>
            <button
              onClick={() => setActiveTab('return')}
              className={`px-6 py-4 transition-colors ${
                activeTab === 'return'
                  ? 'border-b-2 border-teal-600 text-teal-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Return Book
            </button>
          </div>

          <div className="p-6">
            {/* Borrow Tab */}
            {activeTab === 'borrow' && (
              <form onSubmit={handleBorrow} className="space-y-6">
                {/* Borrower Information */}
                <div>
                  <h3 className="text-slate-900 mb-4">Borrower Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-slate-700 mb-2">
                        Search Student (name or ID)
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          value={borrowForm.studentName}
                          onChange={(e) => setBorrowForm({ ...borrowForm, studentName: e.target.value })}
                          placeholder="Search for student..."
                          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Book Information */}
                <div>
                  <h3 className="text-slate-900 mb-4">Book Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-slate-700 mb-2">
                        Search Book (title or call number)
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          type="text"
                          value={borrowForm.bookTitle}
                          onChange={(e) => setBorrowForm({ ...borrowForm, bookTitle: e.target.value })}
                          placeholder="Search for book..."
                          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-slate-600">Status</p>
                          <p className="text-slate-900">Available</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Available Copies</p>
                          <p className="text-slate-900">7</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Date Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 mb-2">
                      Date Borrowed
                    </label>
                    <input
                      type="date"
                      value={borrowForm.dateBorrowed}
                      onChange={(e) => setBorrowForm({ ...borrowForm, dateBorrowed: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-2">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={borrowForm.dueDate}
                      onChange={(e) => setBorrowForm({ ...borrowForm, dueDate: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>
                </div>

                {borrowSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <p className="text-green-900">Book successfully borrowed! Available copies updated.</p>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full md:w-auto px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
                >
                  Confirm Borrowing
                </button>
              </form>
            )}

            {/* Return Tab */}
            {activeTab === 'return' && (
              <form onSubmit={handleReturn} className="space-y-6">
                <div>
                  <label className="block text-slate-700 mb-2">
                    Search Active Transaction
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={returnForm.transactionId}
                      onChange={(e) => setReturnForm({ transactionId: e.target.value })}
                      placeholder="Search by student name, ID, or book title..."
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    />
                  </div>
                </div>

                {returnForm.transactionId && (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 space-y-4">
                    <h3 className="text-slate-900">Transaction Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-slate-600">Student Name</p>
                        <p className="text-slate-900">Maria Santos</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Book Title</p>
                        <p className="text-slate-900">Introduction to Algorithms</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Date Borrowed</p>
                        <p className="text-slate-900">2025-01-28</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Due Date</p>
                        <p className="text-slate-900">2025-02-04</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Today's Date</p>
                        <p className="text-slate-900">{new Date().toISOString().split('T')[0]}</p>
                      </div>
                    </div>
                  </div>
                )}

                {returnSuccess && fineAmount !== null && (
                  <div className={`border rounded-lg p-4 ${
                    fineAmount > 0 
                      ? 'bg-orange-50 border-orange-200' 
                      : 'bg-green-50 border-green-200'
                  }`}>
                    {fineAmount > 0 ? (
                      <div>
                        <p className="text-orange-900 mb-2">Book returned - Overdue</p>
                        <p className="text-orange-700">Fine amount: ₱{fineAmount}</p>
                        <p className="text-orange-600">A fine record has been created in the Overdue & Fines module.</p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-600" />
                        <p className="text-green-900">Returned on time – no fine.</p>
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full md:w-auto px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
                >
                  Return Book
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
