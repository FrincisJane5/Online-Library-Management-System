import { useEffect, useMemo, useState } from 'react';
import Layout from './Layout';
import { User } from '../App';
import { Search, Send, Check } from 'lucide-react';
import api from '../api/axios';

interface OverdueFinesProps {
  user: User;
  onLogout: () => void;
}

interface FineRecord {
  id: number;
  studentName: string;
  bookTitle: string;
  dateBorrowed: string;
  dueDate: string;
  daysOverdue: number;
  fineAmount: number;
  status: 'Unpaid' | 'Paid';
  lastNotification: string;
}

export default function OverdueFines({ user, onLogout }: OverdueFinesProps) {
  const [fines, setFines] = useState<FineRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [reminderSent, setReminderSent] = useState(false);

  const fetchFines = async () => {
    const response = await api.get('/fines');
    setFines(response.data);
  };

  useEffect(() => {
    fetchFines().catch(console.error);
  }, []);

  const filteredFines = useMemo(() => fines.filter((fine) => {
    const matchesSearch = 
      fine.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fine.bookTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || fine.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [fines, searchTerm, statusFilter]);

  const handleSendReminders = async () => {
    try {
      await api.post('/fines/reminders');
      await fetchFines();
      setReminderSent(true);
      setTimeout(() => setReminderSent(false), 3000);
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.message || 'Failed to send reminders.');
    }
  };

  const markPaid = async (id: number) => {
    try {
      await api.patch(`/fines/${id}/pay`);
      await fetchFines();
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.message || 'Failed to mark fine as paid.');
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'Paid' 
      ? 'bg-green-100 text-green-700 border-green-200' 
      : 'bg-red-100 text-red-700 border-red-200';
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-slate-900 mb-2">Overdue Books & Fines</h2>
            <p className="text-slate-600">Track overdue books and manage fine payments.</p>
          </div>
          <button
            onClick={handleSendReminders}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
            Send Overdue Reminders
          </button>
        </div>

        {reminderSent && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <Check className="w-5 h-5 text-green-600" />
            <p className="text-green-900">Reminders sent to all students with unpaid fines!</p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label htmlFor="search" className="block text-slate-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by student name or book title..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="status" className="block text-slate-700 mb-2">
                Fine Status
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">All</option>
                <option value="Unpaid">Unpaid Fines</option>
                <option value="Paid">Paid Fines</option>
              </select>
            </div>
          </div>
        </div>

        {/* Fines Table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-slate-700">Student Name</th>
                  <th className="px-6 py-3 text-left text-slate-700">Book Title</th>
                  <th className="px-6 py-3 text-left text-slate-700">Date Borrowed</th>
                  <th className="px-6 py-3 text-left text-slate-700">Due Date</th>
                  <th className="px-6 py-3 text-center text-slate-700">Days Overdue</th>
                  <th className="px-6 py-3 text-left text-slate-700">Fine Amount</th>
                  <th className="px-6 py-3 text-left text-slate-700">Status</th>
                  <th className="px-6 py-3 text-left text-slate-700">Last Notification</th>
                  <th className="px-6 py-3 text-center text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredFines.map((fine) => (
                  <tr key={fine.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-slate-900">{fine.studentName}</td>
                    <td className="px-6 py-4 text-slate-900">{fine.bookTitle}</td>
                    <td className="px-6 py-4 text-slate-600">{fine.dateBorrowed}</td>
                    <td className="px-6 py-4 text-slate-600">{fine.dueDate}</td>
                    <td className="px-6 py-4 text-center text-slate-900">{fine.daysOverdue}</td>
                    <td className="px-6 py-4 text-slate-900">₱{fine.fineAmount}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded border ${getStatusColor(fine.status)}`}>
                        {fine.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{fine.lastNotification}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {fine.status === 'Unpaid' && (
                          <button onClick={() => markPaid(fine.id)} className="px-3 py-1 text-green-600 border border-green-600 hover:bg-green-50 rounded transition-colors">
                            Mark Paid
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredFines.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500">No overdue records found.</p>
            </div>
          )}

          {filteredFines.length > 0 && (
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <p className="text-slate-600">
                  Showing {filteredFines.length} of {fines.length} records
                </p>
                <p className="text-slate-900">
                  Total Unpaid: ₱{fines.filter(f => f.status === 'Unpaid').reduce((sum, f) => sum + f.fineAmount, 0)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
