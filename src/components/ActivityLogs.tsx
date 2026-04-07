import { useState } from 'react';
import Layout from './Layout';
import { User } from '../App';
import { Search, Filter } from 'lucide-react';

interface ActivityLogsProps {
  user: User;
  onLogout: () => void;
}

interface ActivityLog {
  id: number;
  dateTime: string;
  user: string;
  role: 'Admin' | 'Staff';
  action: string;
  details: string;
}

const mockLogs: ActivityLog[] = [
  { id: 1, dateTime: '2026-02-10 14:32', user: 'Juan Dela Cruz', role: 'Staff', action: 'Book Borrowed', details: 'Processed borrowing of "Introduction to Physics" for student Maria Santos' },
  { id: 2, dateTime: '2026-02-10 14:15', user: 'Maria Santos', role: 'Admin', action: 'Book Returned', details: 'Processed return of "Data Structures" by Pedro Reyes - on time, no fine' },
  { id: 3, dateTime: '2026-02-10 13:45', user: 'Juan Dela Cruz', role: 'Staff', action: 'Fine Created', details: 'Created fine record for overdue book - ₱50 for student Pedro Reyes' },
  { id: 4, dateTime: '2026-02-10 13:30', user: 'Maria Santos', role: 'Admin', action: 'Staff Account Created', details: 'Created new staff account for "Rosa Garcia" (username: rosa.garcia)' },
  { id: 5, dateTime: '2026-02-10 12:30', user: 'Maria Santos', role: 'Admin', action: 'Book Added', details: 'Added new book "Machine Learning Basics" to inventory - 5 copies' },
  { id: 6, dateTime: '2026-02-10 11:20', user: 'Juan Dela Cruz', role: 'Staff', action: 'Book Status Updated', details: 'Updated book status to DAMAGED for "Psychology: Themes and Variations"' },
  { id: 7, dateTime: '2026-02-10 10:15', user: 'Maria Santos', role: 'Admin', action: 'System Settings Changed', details: 'Updated fine rate from ₱3 to ₱5 per day' },
  { id: 8, dateTime: '2026-02-10 09:30', user: 'Juan Dela Cruz', role: 'Staff', action: 'Login', details: 'User logged into the system' },
  { id: 9, dateTime: '2026-02-10 08:30', user: 'Maria Santos', role: 'Admin', action: 'Login', details: 'User logged into the system' },
  { id: 10, dateTime: '2026-02-09 16:45', user: 'Maria Santos', role: 'Admin', action: 'Notification Sent', details: 'Sent overdue reminder notifications to 15 students' }
];

const actionTypes = [
  'Login',
  'Book Borrowed',
  'Book Returned',
  'Book Added',
  'Book Status Updated',
  'Fine Created',
  'Staff Account Created',
  'System Settings Changed',
  'Notification Sent'
];

export default function ActivityLogs({ user, onLogout }: ActivityLogsProps) {
  const [logs] = useState<ActivityLog[]>(mockLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = 
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUser = !userFilter || log.user === userFilter;
    const matchesAction = !actionFilter || log.action === actionFilter;
    return matchesSearch && matchesUser && matchesAction;
  });

  const uniqueUsers = Array.from(new Set(logs.map(log => log.user)));

  const getRoleColor = (role: string) => {
    return role === 'Admin' 
      ? 'bg-purple-100 text-purple-700 border-purple-200' 
      : 'bg-blue-100 text-blue-700 border-blue-200';
  };

  const getActionColor = (action: string) => {
    if (action.includes('Login')) return 'bg-slate-100 text-slate-700 border-slate-200';
    if (action.includes('Borrowed')) return 'bg-orange-100 text-orange-700 border-orange-200';
    if (action.includes('Returned')) return 'bg-green-100 text-green-700 border-green-200';
    if (action.includes('Created') || action.includes('Added')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (action.includes('Updated') || action.includes('Changed')) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if (action.includes('Fine')) return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h2 className="text-slate-900 mb-2">Activity Logs – Security & Traceability</h2>
          <p className="text-slate-600">Monitor all system activities and user actions for security and accountability.</p>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
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
                  placeholder="Search by user or details..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* User Filter */}
            <div>
              <label htmlFor="user" className="block text-slate-700 mb-2">
                User
              </label>
              <select
                id="user"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">All Users</option>
                {uniqueUsers.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            {/* Action Type Filter */}
            <div>
              <label htmlFor="action" className="block text-slate-700 mb-2">
                Action Type
              </label>
              <select
                id="action"
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">All Actions</option>
                {actionTypes.map((action) => (
                  <option key={action} value={action}>{action}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Activity Logs Table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-slate-700">Date & Time</th>
                  <th className="px-6 py-3 text-left text-slate-700">User</th>
                  <th className="px-6 py-3 text-left text-slate-700">Role</th>
                  <th className="px-6 py-3 text-left text-slate-700">Action</th>
                  <th className="px-6 py-3 text-left text-slate-700">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-slate-900">{log.dateTime}</td>
                    <td className="px-6 py-4 text-slate-900">{log.user}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded border ${getRoleColor(log.role)}`}>
                        {log.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded border ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-lg">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500">No activity logs found.</p>
            </div>
          )}

          {filteredLogs.length > 0 && (
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
              <p className="text-slate-600">
                Showing {filteredLogs.length} of {logs.length} activity logs
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
