// React hooks for state, side effects, and memoized values
import { useEffect, useState, useMemo } from 'react';
// Shared sidebar + header layout wrapper
import Layout from './Layout';
import { User } from '../types';
// Lucide icons: search input icon, view detail icon, close modal icon
import { Search, Eye, X } from 'lucide-react';
// Shared axios instance with base URL and auth headers
import api from '../api/axios';
// Pagination hook and component
import { usePagination } from '../hooks/usePagination';
import Pagination from './Pagination';

// Props for the Notifications page
interface NotificationsProps { user: User; onLogout: () => void; }

// Shape of a single notification record returned by the API
interface NotifRecord {
  id: number;
  dateTime: string;           // When the notification was sent
  studentName: string;        // Recipient's name
  email: string | null;       // Recipient's email address
  callNumber: string | null;  // Call number of the related book
  bookTitle: string;          // Title of the related book
  type: 'Overdue' | 'Fine Reminder' | 'Damaged' | 'Lost'; // Notification category
  message: string;            // Full email body
  preview: string;            // Short preview shown in the table
  status: 'Sent' | 'Pending' | 'Failed'; // Delivery status
}

// Tailwind color classes for each delivery status badge
const STATUS_COLOR: Record<string, string> = {
  Sent:    'bg-green-100 text-green-700 border-green-200',
  Pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  Failed:  'bg-red-100 text-red-700 border-red-200',
};
// Tailwind color classes for each notification type badge
const TYPE_COLOR: Record<string, string> = {
  'Overdue':      'bg-orange-100 text-orange-700 border-orange-200',
  'Fine Reminder':'bg-red-100 text-red-700 border-red-200',
  'Damaged':      'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Lost':         'bg-slate-100 text-slate-700 border-slate-200',
};

/**
 * Notifications — displays all email notifications sent to students.
 * Supports filtering by keyword, status, and type.
 * Clicking the eye icon opens a detail modal with the full email content.
 */
export default function Notifications({ user, onLogout }: NotificationsProps) {
  const [notifications, setNotifications] = useState<NotifRecord[]>([]); // All loaded notifications
  const [search, setSearch]               = useState('');                 // Keyword filter
  const [statusFilter, setStatusFilter]   = useState('');                 // Status filter (Sent/Pending/Failed)
  const [typeFilter, setTypeFilter]       = useState('');                 // Type filter (Overdue/etc.)
  const [loading, setLoading]             = useState(true);               // Loading state
  const [selected, setSelected]           = useState<NotifRecord | null>(null); // Currently viewed notification

  // Fetch notifications from the API with optional filters as query params
  const fetchNotifications = (s = search, st = statusFilter, t = typeFilter) => {
    setLoading(true);
    api.get('/notifications', { params: { search: s || undefined, status: st || undefined, type: t || undefined } })
      .then(res => setNotifications(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const { paged, page, totalPages, setPage, reset, total } = usePagination(notifications);
  // Reset to page 1 whenever the notifications list changes
  useEffect(() => { reset(); }, [notifications]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load all notifications on first render
  useEffect(() => { fetchNotifications('', '', ''); }, []);

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6">
        <div>
          <h2 className="text-slate-900 mb-2">Notifications</h2>
          <p className="text-slate-600">Email notifications sent to students for overdue, fines, damaged, and lost books.</p>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-48 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchNotifications(search, statusFilter, typeFilter)}
              placeholder="Search by student name..."
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm" />
          </div>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); fetchNotifications(search, e.target.value, typeFilter); }}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm">
            <option value="">All Status</option>
            <option value="Sent">Sent</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>
          <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); fetchNotifications(search, statusFilter, e.target.value); }}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm">
            <option value="">All Types</option>
            <option value="Overdue">Overdue</option>
            <option value="Fine Reminder">Fine Reminder</option>
            <option value="Damaged">Damaged</option>
            <option value="Lost">Lost</option>
          </select>
          <button onClick={() => fetchNotifications(search, statusFilter, typeFilter)}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm transition-colors">
            Search
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3 text-left text-slate-700">Date & Time</th>
                  <th className="px-5 py-3 text-left text-slate-700">Student Name</th>
                  <th className="px-5 py-3 text-left text-slate-700">Type</th>
                  <th className="px-5 py-3 text-left text-slate-700">Message Preview</th>
                  <th className="px-5 py-3 text-left text-slate-700">Status</th>
                  <th className="px-5 py-3 text-center text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">Loading...</td></tr>
                ) : notifications.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">No notifications found.</td></tr>
                ) : paged.map(n => (
                  <tr key={n.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 text-slate-500 whitespace-nowrap">{n.dateTime}</td>
                    <td className="px-5 py-4 font-medium text-slate-900">{n.studentName}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 rounded border text-xs ${TYPE_COLOR[n.type] ?? 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                        {n.type}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600 max-w-xs truncate">{n.preview}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 rounded border text-xs ${STATUS_COLOR[n.status]}`}>
                        {n.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button onClick={() => setSelected(n)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && notifications.length > 0 && (
            <Pagination page={page} totalPages={totalPages} total={total} onPage={setPage} />
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl">
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="font-bold text-lg text-slate-900">Notification Details</h3>
              <button onClick={() => setSelected(null)}><X className="w-5 h-5 text-slate-400 hover:text-slate-700" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-slate-500">Date Sent</p><p className="font-medium">{selected.dateTime}</p></div>
                <div><p className="text-slate-500">Student</p><p className="font-medium">{selected.studentName}</p></div>
                <div><p className="text-slate-500">Email</p><p className="text-slate-700">{selected.email ?? '—'}</p></div>
                <div><p className="text-slate-500">Type</p>
                  <span className={`px-2 py-1 rounded border text-xs ${TYPE_COLOR[selected.type]}`}>{selected.type}</span>
                </div>
                <div><p className="text-slate-500">Call No.</p><p className="font-mono">{selected.callNumber ?? '—'}</p></div>
                <div><p className="text-slate-500">Book Title</p><p className="font-medium">{selected.bookTitle}</p></div>
                <div><p className="text-slate-500">Status</p>
                  <span className={`px-2 py-1 rounded border text-xs ${STATUS_COLOR[selected.status]}`}>{selected.status}</span>
                </div>
              </div>
              <div>
                <p className="text-slate-500 text-sm mb-2">Full Email Content</p>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-sm text-slate-800 whitespace-pre-wrap font-mono">
                  {selected.message}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end">
              <button onClick={() => setSelected(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-sm transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
