import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { activityLogService } from '../../services/activityLogService';
import type { ActivityLog } from '../../types';
import { usePagination } from '../../hooks/usePagination';
import Pagination from '../../components/Pagination';

const ACTION_COLOR: Record<string, string> = {
  Login:          'bg-slate-100 text-slate-700 border-slate-200',
  Borrow:         'bg-orange-100 text-orange-700 border-orange-200',
  Return:         'bg-green-100 text-green-700 border-green-200',
  'Book Added':   'bg-blue-100 text-blue-700 border-blue-200',
  'Book Updated': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Book Deleted': 'bg-red-100 text-red-700 border-red-200',
  Fine:           'bg-red-100 text-red-700 border-red-200',
  Attendance:     'bg-teal-100 text-teal-700 border-teal-200',
  Notification:   'bg-purple-100 text-purple-700 border-purple-200',
};

const ROLE_COLOR: Record<string, string> = {
  Admin: 'bg-purple-100 text-purple-700 border-purple-200',
  Staff: 'bg-blue-100 text-blue-700 border-blue-200',
};

function Badge({ value, colorMap }: { value: string; colorMap: Record<string, string> }) {
  return (
    <span className={`inline-flex px-2 py-1 rounded border text-sm ${colorMap[value] ?? 'bg-slate-100 text-slate-700 border-slate-200'}`}>
      {value}
    </span>
  );
}

export default function ActivityLogsPage() {
  const [search, setSearch]     = useState('');
  const [action, setAction]     = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo]     = useState('');
  const [logs, setLogs]         = useState<ActivityLog[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const { paged, page, totalPages, setPage, total } = usePagination(logs);

  const fetchLogs = async (s = search, a = action, df = dateFrom, dt = dateTo) => {
    setLoading(true);
    setError(null);
    try {
      const data = await activityLogService.getAll({
        search: s, action: a,
        date_from: df || undefined,
        date_to: dt || undefined,
      });
      setLogs(data);
    } catch (err: any) {
      console.error(err);
      const msg = err.code === 'ERR_NETWORK'
        ? 'Cannot reach the backend. Make sure the Laravel server is running on http://127.0.0.1:8000.'
        : (err.response?.data?.message ?? 'Failed to load activity logs.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => { fetchLogs('', ''); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs(search, action, dateFrom, dateTo);
  };

  const uniqueActions = [...new Set(logs.map(l => l.action))];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-slate-900 mb-2">Activity Logs</h2>
        <p className="text-slate-600">Full audit trail of all system actions.</p>
      </div>

      {/* Filters */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-48">
            <label className="block text-slate-700 mb-2 text-sm">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="User or details..."
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
          </div>
          <div>
            <label className="block text-slate-700 mb-2 text-sm">Action</label>
            <select value={action} onChange={e => setAction(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="">All Actions</option>
              {uniqueActions.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-slate-700 mb-2 text-sm">From</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label className="block text-slate-700 mb-2 text-sm">To</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <button type="submit"
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors">
            Filter
          </button>
        </div>
      </form>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 text-red-700">
          <span className="font-medium">Error:</span>
          <span>{error}</span>
          <button onClick={() => fetchLogs(search, action)} className="ml-auto underline text-sm">Retry</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Date & Time', 'User', 'Role', 'Action', 'Details'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-slate-700 text-sm font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">Loading...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">No logs found.</td></tr>
              ) : paged.map(log => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-slate-900 whitespace-nowrap">{log.dateTime}</td>
                  <td className="px-6 py-4 text-slate-900">{log.user}</td>
                  <td className="px-6 py-4"><Badge value={log.role} colorMap={ROLE_COLOR} /></td>
                  <td className="px-6 py-4"><Badge value={log.action} colorMap={ACTION_COLOR} /></td>
                  <td className="px-6 py-4 text-slate-600 max-w-md">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && logs.length > 0 && (
          <Pagination page={page} totalPages={totalPages} total={total} onPage={setPage} />
        )}
      </div>
    </div>
  );
}
