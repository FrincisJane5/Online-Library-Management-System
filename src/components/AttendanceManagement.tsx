import { useEffect, useMemo, useState, useRef } from 'react';
import Layout from './Layout';
import { User } from '../types';
import { Search, Download, Printer, Users, Calendar, Filter } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../api/axios';
import { exportCSV } from '../utils';
import { usePagination } from '../hooks/usePagination';
import Pagination from './Pagination';

interface AttendanceManagementProps {
  user: User;
  onLogout: () => void;
}

interface AttendanceRecord {
  id: number;
  id_number?: string;
  name: string;
  email?: string;
  phone?: string;
  course: string;
  year: string;
  purpose: string;
  created_at: string;
}

const PURPOSES = [
  'Research', 'Borrowing / Returning Books', 'Reading / Studying',
  'Internet / Computer Use', 'Group Study', 'Thesis / Capstone Work',
  'Others',
];

export default function AttendanceManagement({ user, onLogout }: AttendanceManagementProps) {
  const [data, setData]           = useState<AttendanceRecord[]>([]);
  const [loading, setLoading]     = useState(true);
  const [programs, setPrograms]   = useState<{ code: string; year_levels: string[] }[]>([]);
  const [search, setSearch]       = useState('');
  const [course, setCourse]       = useState('');
  const [year, setYear]           = useState('');
  const [purpose, setPurpose]     = useState('');
  const [lanUrl, setLanUrl]       = useState('');
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get('/network-url').then(r => setLanUrl(r.data.url + '/LccLibraryAttendance')).catch(() => {});
  }, []);

  useEffect(() => {
    Promise.all([
      api.get('/attendance').then(r => setData(r.data)),
      api.get('/programs').then(r => setPrograms(r.data)),
    ]).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => data.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) &&
    (!course  || item.course  === course) &&
    (!year    || item.year    === year) &&
    (!purpose || item.purpose === purpose)
  ), [data, search, course, year, purpose]);

  const { paged, page, totalPages, setPage, reset, total } = usePagination(filtered);
  useEffect(() => { reset(); }, [filtered]); // eslint-disable-line react-hooks/exhaustive-deps

  const printQR = (url: string) => {
    const svgEl = qrRef.current?.querySelector('svg');
    if (!svgEl) return;
    const win = window.open('', '_blank')!;
    win.document.write(`<!DOCTYPE html><html><head><title>Library Attendance QR</title>
      <style>
        @page { size: A4; margin: 0; }
        body { display:flex; flex-direction:column; align-items:center; justify-content:center;
               min-height:100vh; font-family:Arial,sans-serif; gap:24px; padding:40px; box-sizing:border-box; }
        h1 { color:#1B764C; font-size:28px; text-align:center; margin:0; }
        p  { color:#555; font-size:14px; text-align:center; margin:0; }
        svg { width:320px; height:320px; }
      </style></head>
      <body>
        <h1>Scan to fill out the<br/>Library Attendance Form</h1>
        ${svgEl.outerHTML}
        <p>${url}</p>
        <p style="font-size:12px;color:#999">Legacy College of Compostela — Library Management System</p>
      </body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
  };

  const handleExport = () => exportCSV(
    filtered.map(r => ({
      Date: r.created_at, ID: r.id_number ?? '', Name: r.name,
      Email: r.email ?? '', Phone: r.phone ?? '',
      Course: r.course, Year: r.year, Purpose: r.purpose,
    })),
    'attendance.csv'
  );

  const handlePrint = () => {
    const win = window.open('', '', 'width=1000,height=650');
    win?.document.write(`
      <html><head><title>Attendance Report</title></head><body>
      <h2>Library Attendance Report</h2>
      <table border="1" cellpadding="8" cellspacing="0">
        <tr><th>Date</th><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Course</th><th>Year</th><th>Purpose</th></tr>
        ${filtered.map(r => `<tr>
          <td>${r.created_at}</td><td>${r.id_number ?? ''}</td><td>${r.name}</td>
          <td>${r.email ?? ''}</td><td>${r.phone ?? ''}</td>
          <td>${r.course}</td><td>${r.year}</td><td>${r.purpose}</td>
        </tr>`).join('')}
      </table></body></html>
    `);
    win?.document.close();
    win?.print();
  };

  const hasActiveFilters = course || year || purpose || search;

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-[#4B4C58] font-bold text-2xl mb-1">Attendance Records</h2>
            <p className="text-[#9DA4A6] text-sm">View and manage library attendance logs.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 border border-[#9DA4A6] text-[#4B4C58] rounded-lg text-sm hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <button onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 border border-[#9DA4A6] text-[#4B4C58] rounded-lg text-sm hover:bg-gray-50 transition-colors">
              <Printer className="w-4 h-4" /> Print
            </button>
          </div>
        </div>

        {/* Stats + QR Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Total count card */}
          <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-[#1B764C]/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-[#1B764C]" />
            </div>
            <div>
              <p className="text-[#9DA4A6] text-sm">Total Records</p>
              <p className="text-[#4B4C58] text-2xl font-bold">{data.length}</p>
            </div>
          </div>

          {/* Today's count */}
          <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-[#EF8B2D]/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Calendar className="w-6 h-6 text-[#EF8B2D]" />
            </div>
            <div>
              <p className="text-[#9DA4A6] text-sm">Today's Visits</p>
              <p className="text-[#4B4C58] text-2xl font-bold">
                {data.filter(r => r.created_at.startsWith(new Date().toISOString().slice(0, 10))).length}
              </p>
            </div>
          </div>

          {/* QR Card */}
          <div className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-sm flex items-center gap-4">
            <div ref={qrRef} className="flex-shrink-0">
              {lanUrl && <QRCodeSVG value={lanUrl} size={80} level="H" includeMargin />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#4B4C58] font-semibold text-sm mb-1">Attendance QR Code</p>
              {lanUrl && (
                <>
                  <a href={lanUrl} target="_blank" rel="noreferrer"
                    className="text-[#1B764C] underline text-xs block truncate mb-2">{lanUrl}</a>
                  <button onClick={() => printQR(lanUrl)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1B764C] hover:bg-[#016937] text-white rounded-lg text-xs transition-colors">
                    <Printer className="w-3.5 h-3.5" /> Print QR
                  </button>
                </>
              )}
            </div>
          </div>

        </div>

        {/* Filters */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-[#E5E7EB]">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-[#9DA4A6]" />
            <span className="text-sm font-medium text-[#4B4C58]">Filter Records</span>
            {hasActiveFilters && (
              <button onClick={() => { setSearch(''); setCourse(''); setYear(''); setPurpose(''); }}
                className="ml-auto text-xs text-[#D72A24] hover:underline">
                Clear all
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="sm:col-span-2 lg:col-span-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B764C] focus:border-transparent"
              />
            </div>
            <select value={course} onChange={e => setCourse(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B764C] focus:border-transparent text-[#4B4C58]">
              <option value="">All Courses</option>
              {programs.map(p => <option key={p.code} value={p.code}>{p.code}</option>)}
            </select>
            <select value={year} onChange={e => setYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B764C] focus:border-transparent text-[#4B4C58]">
              <option value="">All Year Levels</option>
              {Array.from(new Set(programs.flatMap(p => p.year_levels))).map(y => <option key={y}>{y}</option>)}
            </select>
            <select value={purpose} onChange={e => setPurpose(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1B764C] focus:border-transparent text-[#4B4C58]">
              <option value="">All Purposes</option>
              {PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          {filtered.length !== data.length && (
            <p className="text-xs text-[#9DA4A6] mt-3">
              Showing {filtered.length} of {data.length} records
            </p>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Date & Time', 'ID Number', 'Student Name', 'Email', 'Phone', 'Course', 'Year', 'Purpose'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#9DA4A6] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={8} className="text-center py-12 text-[#9DA4A6]">Loading records...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12 text-[#9DA4A6]">No records found</td></tr>
                ) : paged.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-[#4B4C58] whitespace-nowrap">{item.created_at}</td>
                    <td className="px-4 py-3 text-sm text-[#4B4C58]">{item.id_number ?? '—'}</td>
                    <td className="px-4 py-3 text-sm font-medium text-[#4B4C58]">{item.name}</td>
                    <td className="px-4 py-3 text-sm text-[#9DA4A6]">{item.email ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-[#9DA4A6]">{item.phone ?? '—'}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#1B764C]/10 text-[#1B764C]">
                        {item.course}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#4B4C58]">{item.year}</td>
                    <td className="px-4 py-3 text-sm text-[#9DA4A6]">{item.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length > 0 && (
            <Pagination page={page} totalPages={totalPages} total={total} onPage={setPage} />
          )}
        </div>

      </div>
    </Layout>
  );
}
