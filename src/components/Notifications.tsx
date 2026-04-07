import { useState } from 'react';
import Layout from './Layout';
import { User } from '../App';
import { Search, Eye, X } from 'lucide-react';

interface NotificationsProps {
  user: User;
  onLogout: () => void;
}

interface Notification {
  id: number;
  dateTime: string;
  studentName: string;
  type: 'Overdue Book' | 'Fine Reminder' | 'Other';
  message: string;
  status: 'Sent' | 'Pending' | 'Failed';
}

const mockNotifications: Notification[] = [
  { id: 1, dateTime: '2026-02-10 14:30', studentName: 'Pedro Reyes', type: 'Fine Reminder', message: 'Your book "Database System Concepts" is 19 days overdue. Fine: ₱95. Please return the book and settle the fine.', status: 'Sent' },
  { id: 2, dateTime: '2026-02-10 14:30', studentName: 'Anna Cruz', type: 'Overdue Book', message: 'Your book "Physics for Scientists" is overdue. Please return it to avoid additional fines.', status: 'Sent' },
  { id: 3, dateTime: '2026-02-10 14:31', studentName: 'Lisa Tan', type: 'Fine Reminder', message: 'You have an unpaid fine of ₱45. Please settle at the library counter.', status: 'Sent' },
  { id: 4, dateTime: '2026-02-10 10:00', studentName: 'Miguel Torres', type: 'Other', message: 'Your reserved book is now available for pickup.', status: 'Pending' },
  { id: 5, dateTime: '2026-02-09 16:45', studentName: 'Sofia Ramirez', type: 'Overdue Book', message: 'Reminder: Your book is due tomorrow. Please return or renew.', status: 'Failed' }
];

export default function Notifications({ user, onLogout }: NotificationsProps) {
  const [notifications] = useState<Notification[]>(mockNotifications);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const filteredNotifications = notifications.filter((notif) => {
    const matchesSearch = notif.studentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || notif.status === statusFilter;
    const matchesType = !typeFilter || notif.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Sent': return 'bg-green-100 text-green-700 border-green-200';
      case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Failed': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Overdue Book': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Fine Reminder': return 'bg-red-100 text-red-700 border-red-200';
      case 'Other': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h2 className="text-slate-900 mb-2">Notifications</h2>
          <p className="text-slate-600">View and manage system notifications sent to students.</p>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label htmlFor="search" className="block text-slate-700 mb-2">
                Search by Student Name
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  id="search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search student..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="status" className="block text-slate-700 mb-2">
                Status
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="Sent">Sent</option>
                <option value="Pending">Pending</option>
                <option value="Failed">Failed</option>
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label htmlFor="type" className="block text-slate-700 mb-2">
                Type
              </label>
              <select
                id="type"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="Overdue Book">Overdue Book</option>
                <option value="Fine Reminder">Fine Reminder</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications Table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-slate-700">Date & Time</th>
                  <th className="px-6 py-3 text-left text-slate-700">Student Name</th>
                  <th className="px-6 py-3 text-left text-slate-700">Type</th>
                  <th className="px-6 py-3 text-left text-slate-700">Message Preview</th>
                  <th className="px-6 py-3 text-left text-slate-700">Status</th>
                  <th className="px-6 py-3 text-center text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredNotifications.map((notif) => (
                  <tr key={notif.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-slate-900">{notif.dateTime}</td>
                    <td className="px-6 py-4 text-slate-900">{notif.studentName}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded border ${getTypeColor(notif.type)}`}>
                        {notif.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-md truncate">
                      {notif.message}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded border ${getStatusColor(notif.status)}`}>
                        {notif.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => setSelectedNotification(notif)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredNotifications.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500">No notifications found.</p>
            </div>
          )}
        </div>

        {/* Notification Detail Modal */}
        {selectedNotification && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full">
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-slate-900">Notification Details</h3>
                <button onClick={() => setSelectedNotification(null)} className="p-1 hover:bg-slate-100 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-600 mb-1">Date & Time</p>
                    <p className="text-slate-900">{selectedNotification.dateTime}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 mb-1">Student Name</p>
                    <p className="text-slate-900">{selectedNotification.studentName}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 mb-1">Type</p>
                    <span className={`inline-flex px-2 py-1 rounded border ${getTypeColor(selectedNotification.type)}`}>
                      {selectedNotification.type}
                    </span>
                  </div>
                  <div>
                    <p className="text-slate-600 mb-1">Status</p>
                    <span className={`inline-flex px-2 py-1 rounded border ${getStatusColor(selectedNotification.status)}`}>
                      {selectedNotification.status}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-slate-600 mb-2">Full Message</p>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                    <p className="text-slate-900">{selectedNotification.message}</p>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg transition-colors"
                >
                  Close
                </button>
                {selectedNotification.status === 'Failed' && (
                  <button className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors">
                    Resend
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
