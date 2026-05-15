import { useEffect, useMemo, useState } from 'react';
import Layout from './Layout';
import { User } from '../types';
import { Search, Send, Check, RotateCcw } from 'lucide-react';
import api from '../api/axios';
import { usePagination } from '../hooks/usePagination';
import Pagination from './Pagination';

interface OverdueFinesProps {
  user: User;
  onLogout: () => void;
}

interface FineRecord {
  id: number;
  studentName: string;
  studentEmail: string;
  studentPhone: string | null;
  callNumber: string | null;
  bookTitle: string;
  dateBorrowed: string;
  dueDate: string;
  daysOverdue: number;
  fineAmount: number;
  status: string;
  action: string | null;
  lastNotification: string;
}

const PENALTY_LABEL: Record<string, { label: string; color: string; desc: string }> = {
  damaged: { label: 'Damaged', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', desc: 'Book returned with damage' },
  lost:    { label: 'Lost',    color: 'bg-red-100 text-red-800 border-red-300',          desc: 'Book not returned / lost' },
};

export default function OverdueFines({ user, onLogout }: OverdueFinesProps) {
  const [fines, setFines] = useState<FineRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [penaltyFilter, setPenaltyFilter] = useState('');
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
    const matchesStatus  = !statusFilter  || fine.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesPenalty = !penaltyFilter || (penaltyFilter === 'overdue' ? !fine.action : fine.action === penaltyFilter);
    return matchesSearch && matchesStatus && matchesPenalty;
  }), [fines, searchTerm, statusFilter, penaltyFilter]);

  const { paged, page, totalPages, setPage, reset, total } = usePagination(filteredFines);
  useEffect(() => { reset(); }, [filteredFines]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const markUnpaid = async (id: number) => {
    try {
      await api.patch(`/fines/${id}/unpay`);
      await fetchFines();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to mark fine as unpaid.');
    }
  };

  const getPenaltyInfo = (fine: FineRecord) => {
    if (fine.action && PENALTY_LABEL[fine.action]) return PENALTY_LABEL[fine.action];
    return { label: 'Overdue', color: 'bg-orange-100 text-orange-800 border-orange-300', desc: `${fine.daysOverdue} day(s) overdue` };
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
          <button onClick={sendAllReminders}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors text-sm">
            {bulkSent ? <><Check className="w-4 h-4" /> Reminders Sent!</> : <><Send className="w-4 h-4" /> Send Overdue Reminders</>}
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-wrap gap-4">
          <div className="flex-1 min-w-48 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by student or book..."
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm">
            <option value="">All Status</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Paid">Paid</option>
          </select>
          <select value={penaltyFilter} onChange={e => setPenaltyFilter(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm">
            <option value="">All Penalty Types</option>
            <option value="overdue">Overdue</option>
            <option value="damaged">Damaged</option>
            <option value="lost">Lost</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3 text-left text-slate-700">Student</th>
                  <th className="px-5 py-3 text-left text-slate-700">Email</th>
                  <th className="px-5 py-3 text-left text-slate-700">Phone</th>
                  <th className="px-5 py-3 text-left text-slate-700">Call No.</th>
                  <th className="px-5 py-3 text-left text-slate-700">Book Title</th>
                  <th className="px-5 py-3 text-left text-slate-700">Penalty Type</th>
                  <th className="px-5 py-3 text-left text-slate-700">Description</th>
                  <th className="px-5 py-3 text-left text-slate-700">Due Date</th>
                  <th className="px-5 py-3 text-center text-slate-700">Days Overdue</th>
                  <th className="px-5 py-3 text-left text-slate-700">Fee</th>
                  <th className="px-5 py-3 text-left text-slate-700">Status</th>
                  <th className="px-5 py-3 text-left text-slate-700">Last Notified</th>
                  <th className="px-5 py-3 text-center text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {paged.map((fine) => {
                  const penalty = getPenaltyInfo(fine);
                  return (
                    <tr key={fine.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-medium text-slate-900">{fine.studentName}</td>
                      <td className="px-5 py-4 text-slate-600 text-xs">{fine.studentEmail || '—'}</td>
                      <td className="px-5 py-4 text-slate-600 text-xs">{fine.studentPhone || '—'}</td>
                      <td className="px-5 py-4 font-mono text-xs text-slate-600">{fine.callNumber ?? '—'}</td>
                      <td className="px-5 py-4 text-slate-700">{fine.bookTitle}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex px-2 py-1 rounded border text-xs font-medium ${penalty.color}`}>
                          {penalty.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-500 text-xs">{penalty.desc}</td>
                      <td className="px-5 py-4 text-slate-600">{fine.dueDate}</td>
                      <td className="px-5 py-4 text-center text-red-700 font-medium">{fine.daysOverdue > 0 ? fine.daysOverdue : '—'}</td>
                      <td className="px-5 py-4 font-medium text-slate-900">₱{Number(fine.fineAmount).toFixed(2)}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex px-2 py-1 rounded border text-xs ${getStatusColor(fine.status)}`}>
                          {fine.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-500 text-xs">{fine.lastNotification}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {isUnpaid(fine.status) && (
                            <>
                              <button onClick={() => sendReminder(fine.id)}
                                className="flex items-center gap-1 px-2 py-1 text-teal-600 border border-teal-600 hover:bg-teal-50 rounded transition-colors text-xs">
                                {sentId === fine.id ? <><Check className="w-3 h-3" /> Sent</> : <><Send className="w-3 h-3" /> Remind</>}
                              </button>
                              <button onClick={() => markPaid(fine.id)}
                                className="px-2 py-1 text-green-600 border border-green-600 hover:bg-green-50 rounded transition-colors text-xs">
                                Mark Paid
                              </button>
                            </>
                          )}
                          {!isUnpaid(fine.status) && (
                            <button onClick={() => markUnpaid(fine.id)}
                              className="flex items-center gap-1 px-2 py-1 text-orange-600 border border-orange-600 hover:bg-orange-50 rounded transition-colors text-xs">
                              <RotateCcw className="w-3 h-3" /> Mark Unpaid
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredFines.length === 0 && (
            <p className="text-center py-12 text-slate-500">No overdue records found.</p>
          )}

          {filteredFines.length > 0 && (
            <Pagination page={page} totalPages={totalPages} total={total} onPage={setPage} />
          )}
        </div>
      </div>
    </Layout>
  );
}
