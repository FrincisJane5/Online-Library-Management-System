import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { BorrowingRecord } from '../../types';
import { usePagination } from '../../hooks/usePagination';
import Pagination from '../../components/Pagination';

interface Props {
  records: BorrowingRecord[];
}

export default function BorrowingDetails({ records }: Props) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'borrowed' | 'returned'>('all');

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return records.filter(r => {
      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchQuery = !term ||
        r.student_name.toLowerCase().includes(term) ||
        r.book_title.toLowerCase().includes(term) ||
        (r.call_number ?? '').toLowerCase().includes(term) ||
        (r.academic_year ?? '').toLowerCase().includes(term) ||
        (r.semester ?? '').toLowerCase().includes(term);
      return matchStatus && matchQuery;
    });
  }, [records, query, statusFilter]);

  const { paged, page, totalPages, setPage, reset, total } = usePagination(filtered);
  // Reset to page 1 on filter change
  useMemo(() => reset(), [filtered]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={query}
            onChange={e => { setQuery(e.target.value); reset(); }}
            placeholder="Search by student, book, academic year..."
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value as typeof statusFilter); reset(); }}
          className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="all">All Status</option>
          <option value="borrowed">Borrowed</option>
          <option value="returned">Returned</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Student</th>
              <th className="px-4 py-3 font-medium">Book</th>
              <th className="px-4 py-3 font-medium">Academic Year</th>
              <th className="px-4 py-3 font-medium">Semester</th>
              <th className="px-4 py-3 font-medium">Borrow Date</th>
              <th className="px-4 py-3 font-medium">Due Date</th>
              <th className="px-4 py-3 font-medium">Return Date</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paged.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-400">No records found.</td>
              </tr>
            ) : paged.map(r => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{r.student_name}</p>
                  {r.id_number && <p className="text-slate-400 text-xs">{r.id_number}</p>}
                </td>
                <td className="px-4 py-3">
                  <p className="text-slate-900">{r.book_title}</p>
                  {r.call_number && <p className="text-teal-700 font-mono text-xs">{r.call_number}</p>}
                </td>
                <td className="px-4 py-3 text-slate-700">{r.academic_year ?? '—'}</td>
                <td className="px-4 py-3 text-slate-700">{r.semester ?? '—'}</td>
                <td className="px-4 py-3 text-slate-600">{r.borrow_date}</td>
                <td className="px-4 py-3 text-slate-600">{r.due_date}</td>
                <td className="px-4 py-3 text-slate-600">{r.return_date ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    r.status === 'borrowed' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {r.status === 'borrowed' ? 'Borrowed' : 'Returned'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <Pagination page={page} totalPages={totalPages} total={total} onPage={setPage} />
      )}
    </div>
  );
}
