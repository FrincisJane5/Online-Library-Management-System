import { useEffect, useMemo, useState } from 'react';
import Layout from './Layout';
import { User } from '../types';
import { Search, Send, Check } from 'lucide-react';
import api from '../api/axios';

interface OverdueFinesProps {
  user: User;
  onLogout: () => void;
}

interface FineRecord {
  id: number;
  studentName: string;
  studentEmail: string;
  bookTitle: string;
  dateBorrowed: string;
  dueDate: string;
  daysOverdue: number;
  fineAmount: number;
  status: string;
  lastNotification: string;
}

export default function OverdueFines({ user, onLogout }: OverdueFinesProps) {
  const [fines, setFines] = useState<FineRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sentId, setSentId] = useState<number | null>(null);
  const [bulkSent, setBulkSent] = useState(false);

  const fetchFines = async () => {
    const res = await api.get('/fines');
    setFines(res.data);
  };

  useEffect(() => { fetchFines().catch(console.error); }, []);

  const filteredFines = useMemo(() => fines.filter((fine) => {
    const matchesSearch =
      fine.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fine.bookTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || fine.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  }), [fines, searchTerm, statusFilter]);

  const sendAllReminders = async () => {
    try {
      await api.post('/fines/reminders');
      await fetchFines();
      setBulkSent(true);
      setTimeout(() => setBulkSent(false), 3000);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to send reminders.');
    }
  };

  const sendReminder = async (id: number) => {
    try {
      await api.post(`/fines/${id}/remind`);
      await fetchFines();
      setSentId(id);
      setTimeout(() => setSentId(null), 3000);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to send reminder.');
    }
  };

  const markPaid = async (id: number) => {
    try {
      await api.patch(`/fines/${id}/pay`);
      await fetchFines();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to mark fine as paid.');
    }
  };

  const getStatusColor = (status: string) =>
    status.toLowerCase() === 'paid'
      ? 'bg-green-100 text-green-700 border-green-200'
      : 'bg-red-100 text-red-700 border-red-200';

  const isUnpaid = (status: string) => status.toLowerCase() === 'unpaid';

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-slate-900 mb-2">Overdue Books & Fines</h2>
            <p className="text-slate-600">Track overdue books and manage fine payments.</p>
          </div>
          <button
            onClick={sendAllReminders}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors text-sm"
          >
            {bulkSent ? <><Check className="w-4 h-4" /> Reminders Sent!</> : <><Send className="w-4 h-4" /> Send Overdue Reminders</>}
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-slate-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by student name or book title..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-slate-700 mb-2">Fine Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
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
                  <th className="px-6 py-3 text-left text-slate-700">Last Notified</th>
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
                      <span className={`inline-flex px-2 py-1 rounded border text-sm ${getStatusColor(fine.status)}`}>
                        {fine.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">{fine.lastNotification}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        {isUnpaid(fine.status) && (
                          <>
                            <button
                              onClick={() => sendReminder(fine.id)}
                              title={fine.studentEmail ? `Send to ${fine.studentEmail}` : 'No email on record'}
                              className="flex items-center gap-1 px-3 py-1 text-teal-600 border border-teal-600 hover:bg-teal-50 rounded transition-colors text-sm"
                            >
                              {sentId === fine.id
                                ? <><Check className="w-3 h-3" /> Sent</>
                                : <><Send className="w-3 h-3" /> Remind</>
                              }
                            </button>
                            <button
                              onClick={() => markPaid(fine.id)}
                              className="px-3 py-1 text-green-600 border border-green-600 hover:bg-green-50 rounded transition-colors text-sm"
                            >
                              Mark Paid
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredFines.length === 0 && (
            <p className="text-center py-12 text-slate-500">No overdue records found.</p>
          )}

          {filteredFines.length > 0 && (
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <p className="text-slate-600 text-sm">
                Showing {filteredFines.length} of {fines.length} records
              </p>
              <p className="text-slate-900 text-sm font-medium">
                Total Unpaid: ₱{fines.filter(f => isUnpaid(f.status)).reduce((sum, f) => sum + f.fineAmount, 0)}
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
