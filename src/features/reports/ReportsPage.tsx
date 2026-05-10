import { useState } from 'react';
import { Download, Printer } from 'lucide-react';
import { reportService } from '../../services/reportService';
import { exportCSV } from '../../utils';

type ReportType = 'attendance' | 'borrowing' | 'inventory' | 'overdue';

const TABS: { key: ReportType; label: string }[] = [
  { key: 'attendance', label: 'Attendance' },
  { key: 'borrowing',  label: 'Borrowing & Returning' },
  { key: 'inventory',  label: 'Inventory Status' },
  { key: 'overdue',    label: 'Overdue & Fines' },
];

const STATUS_BADGE: Record<string, string> = {
  borrowed: 'bg-orange-100 text-orange-700 border-orange-200',
  returned: 'bg-green-100 text-green-700 border-green-200',
  paid:     'bg-green-100 text-green-700 border-green-200',
  unpaid:   'bg-red-100 text-red-700 border-red-200',
  damaged:  'bg-yellow-100 text-yellow-700 border-yellow-200',
  lost:     'bg-red-100 text-red-700 border-red-200',
};

function Badge({ value }: { value: string }) {
  return (
    <span className={`inline-flex px-2 py-1 rounded border text-sm ${STATUS_BADGE[value] ?? 'bg-slate-100 text-slate-700 border-slate-200'}`}>
      {value}
    </span>
  );
}

export default function ReportsPage() {
  const [active, setActive] = useState<ReportType>('attendance');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const range = { start: start || undefined, end: end || undefined };
      const fetchers: Record<ReportType, () => Promise<any>> = {
        attendance: () => reportService.attendance(range),
        borrowing:  () => reportService.borrowing(range),
        inventory:  () => reportService.inventory(),
        overdue:    () => reportService.overdue(range),
      };
      setData(await fetchers[active]());
    } catch { setData([]); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-slate-900 mb-2">Reports</h2>
        <p className="text-slate-600">Generate and export library reports.</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        {/* Tabs */}
        <div className="border-b border-slate-200 flex flex-wrap">
          {TABS.map(({ key, label }) => (
            <button key={key} onClick={() => { setActive(key); setData([]); }}
              className={`px-6 py-4 transition-colors ${active === key ? 'border-b-2 border-teal-600 text-teal-600' : 'text-slate-600 hover:text-slate-900'}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Controls */}
          <div className="mb-6 flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-slate-700 mb-1 text-sm">Start Date</label>
              <input type="date" value={start} onChange={e => setStart(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="block text-slate-700 mb-1 text-sm">End Date</label>
              <input type="date" value={end} onChange={e => setEnd(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <button onClick={fetch}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors">
              Generate
            </button>
            <button onClick={() => exportCSV(data, `${active}-report.csv`)}
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg transition-colors">
              <Download className="w-4 h-4" /> CSV
            </button>
            <button onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg transition-colors">
              <Printer className="w-4 h-4" /> Print
            </button>
          </div>

          {loading && <p className="text-center py-12 text-slate-500">Loading...</p>}
          {!loading && data.length === 0 && (
            <p className="text-center py-12 text-slate-500">No data. Click Generate to load report.</p>
          )}

          {/* Attendance */}
          {!loading && active === 'attendance' && data.length > 0 && (
            <Table headers={['Date', 'Time', 'Name', 'Course', 'Year', 'Purpose']}>
              {data.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-6 py-4">{r.date}</td>
                  <td className="px-6 py-4 text-slate-600">{r.time}</td>
                  <td className="px-6 py-4">{r.name}</td>
                  <td className="px-6 py-4 text-slate-600">{r.course}</td>
                  <td className="px-6 py-4 text-slate-600">{r.year}</td>
                  <td className="px-6 py-4 text-slate-600">{r.purpose}</td>
                </tr>
              ))}
            </Table>
          )}

          {/* Borrowing */}
          {!loading && active === 'borrowing' && data.length > 0 && (
            <Table headers={['Date', 'Student', 'ID', 'Book', 'Call No.', 'Status', 'Action', 'Due Date', 'Returned']}>
              {data.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-6 py-4">{r.date}</td>
                  <td className="px-6 py-4">{r.student}</td>
                  <td className="px-6 py-4 text-slate-600">{r.idNumber}</td>
                  <td className="px-6 py-4 text-slate-600">{r.book}</td>
                  <td className="px-6 py-4 text-slate-600">{r.callNumber ?? '-'}</td>
                  <td className="px-6 py-4"><Badge value={r.status} /></td>
                  <td className="px-6 py-4">{r.action ? <Badge value={r.action} /> : '-'}</td>
                  <td className="px-6 py-4 text-slate-600">{r.dueDate}</td>
                  <td className="px-6 py-4 text-slate-600">{r.returnDate ?? '-'}</td>
                </tr>
              ))}
            </Table>
          )}

          {/* Inventory */}
          {!loading && active === 'inventory' && data.length > 0 && (
            <Table headers={['No.', 'Title', 'Author', 'Copyright', 'Copy Count', 'Available', 'Borrowed', 'Damaged', 'Lost']}>
              {data.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-slate-500 text-center">{r.no}</td>
                  <td className="px-6 py-4 font-medium">{r.title}</td>
                  <td className="px-6 py-4 text-slate-600">{r.author}</td>
                  <td className="px-6 py-4 text-center text-slate-600">{r.copyright}</td>
                  <td className="px-6 py-4 text-center font-medium">{r.copyCount}</td>
                  <td className="px-6 py-4 text-center text-green-700 font-medium">{r.available}</td>
                  <td className="px-6 py-4 text-center text-orange-700">{r.borrowed}</td>
                  <td className="px-6 py-4 text-center text-yellow-700">{r.damaged}</td>
                  <td className="px-6 py-4 text-center text-red-700">{r.lost}</td>
                </tr>
              ))}
            </Table>
          )}

          {/* Overdue */}
          {!loading && active === 'overdue' && data.length > 0 && (
            <Table headers={['Student', 'Book', 'Days Overdue', 'Fine', 'Fine Status', 'Action']}>
              {data.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-6 py-4">{r.student}</td>
                  <td className="px-6 py-4">{r.book}</td>
                  <td className="px-6 py-4 text-center text-red-700 font-medium">{r.daysOverdue}</td>
                  <td className="px-6 py-4">₱{Number(r.fineAmount).toFixed(2)}</td>
                  <td className="px-6 py-4"><Badge value={r.fineStatus} /></td>
                  <td className="px-6 py-4">{r.action ? <Badge value={r.action} /> : '-'}</td>
                </tr>
              ))}
            </Table>
          )}

          {!loading && data.length > 0 && (
            <p className="mt-4 text-slate-500 text-sm">{data.length} record{data.length !== 1 ? 's' : ''}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            {headers.map(h => (
              <th key={h} className="px-6 py-3 text-left text-slate-700 text-sm font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 text-slate-900">{children}</tbody>
      </table>
    </div>
  );
}
