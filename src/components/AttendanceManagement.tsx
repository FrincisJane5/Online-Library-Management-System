import { useEffect, useMemo, useState, useRef } from 'react';
import Layout from './Layout';
import { User } from '../types';
import { Search, Download, Printer } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import api from '../api/axios';
import { exportCSV } from '../utils';

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

const COURSES     = ['BSIT', 'BSBA', 'BSED', 'BSCRIM'];
const YEAR_LEVELS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

export default function AttendanceManagement({ user, onLogout }: AttendanceManagementProps) {
  const [data, setData]           = useState<AttendanceRecord[]>([]);
  const [search, setSearch]       = useState('');
  const [course, setCourse]       = useState('');
  const [year, setYear]           = useState('');
  const [qrUrl, setQrUrl]         = useState(window.location.origin + '/LccLibraryAttendance');
  const qrRef                     = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get('/attendance').then(r => setData(r.data)).catch(console.error);
    api.get('/network-url').then(r => setQrUrl(r.data.url + '/LccLibraryAttendance')).catch(() => {});
  }, []);

  const filtered = useMemo(() => data.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) &&
    (!course || item.course === course) &&
    (!year   || item.year   === year)
  ), [data, search, course, year]);

  const onlineUrl = qrUrl;

  const printQR = () => {
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
        <p>${qrUrl}</p>
        <p style="font-size:12px;color:#999">Legacy College of Compostela — Library Management System</p>
      </body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
  };

  const handleExport = () => exportCSV(
    filtered.map(r => ({
      Date: r.created_at, ID: r.id_number ?? '', Name: r.name,
      Course: r.course, Year: r.year, Purpose: r.purpose,
    })),
    'attendance.csv'
  );

  const handlePrint = () => {
    const win = window.open('', '', 'width=900,height=650');
    win?.document.write(`
      <html><head><title>Attendance Report</title></head><body>
      <h2>Library Attendance Report</h2>
      <table border="1" cellpadding="8" cellspacing="0">
        <tr><th>Date</th><th>ID</th><th>Name</th><th>Course</th><th>Year</th><th>Purpose</th></tr>
        ${filtered.map(r => `<tr>
          <td>${r.created_at}</td><td>${r.id_number ?? ''}</td><td>${r.name}</td>
          <td>${r.course}</td><td>${r.year}</td><td>${r.purpose}</td>
        </tr>`).join('')}
      </table></body></html>
    `);
    win?.document.close();
    win?.print();
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6">
        <div>
          <h2 className="text-[#4B4C58] mb-2">Attendance Records</h2>
          <p className="text-[#9DA4A6]">View and manage library attendance logs.</p>
        </div>

        {/* QR Card */}
        <div className="bg-white p-5 rounded-lg border border-[#9DA4A6] flex items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-[#4B4C58] font-semibold mb-1">Online Attendance via QR</h3>
            <p className="text-sm text-[#9DA4A6] mb-3">Students scan this QR code to fill out the attendance form on their phone.</p>
            <a href={onlineUrl} target="_blank" rel="noreferrer" className="text-[#1B764C] underline text-sm block mb-3">
              {onlineUrl}
            </a>
            <button onClick={printQR}
              className="flex items-center gap-2 px-4 py-2 bg-[#1B764C] hover:bg-[#016937] text-white rounded-lg text-sm transition-colors">
              <Printer className="w-4 h-4" /> Print QR Code
            </button>
          </div>
          <div ref={qrRef} className="flex-shrink-0">
            <QRCodeSVG value={qrUrl} size={120} level="H" includeMargin />
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#9DA4A6]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="lg:col-span-2">
              <label className="block mb-2 text-sm">Search by Name</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search student name..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B764C]"
                />
              </div>
            </div>
            <div>
              <label className="block mb-2 text-sm">Course</label>
              <select value={course} onChange={e => setCourse(e.target.value)} className="w-full p-2 border rounded-lg">
                <option value="">All</option>
                {COURSES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block mb-2 text-sm">Year Level</label>
              <select value={year} onChange={e => setYear(e.target.value)} className="w-full p-2 border rounded-lg">
                <option value="">All</option>
                {YEAR_LEVELS.map(y => <option key={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleExport} className="bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
              <Download size={16} /> Export CSV
            </button>
            <button onClick={handlePrint} className="border px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
              <Printer size={16} /> Print Report
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg border border-[#9DA4A6] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  {['Date & Time', 'ID Number', 'Student Name', 'Course', 'Year', 'Purpose'].map(h => (
                    <th key={h} className="p-3 text-left text-sm font-medium text-gray-700">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="text-center p-6 text-gray-500">No records found</td></tr>
                ) : filtered.map(item => (
                  <tr key={item.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 text-sm">{item.created_at}</td>
                    <td className="p-3 text-sm">{item.id_number ?? '-'}</td>
                    <td className="p-3 text-sm">{item.name}</td>
                    <td className="p-3 text-sm">{item.course}</td>
                    <td className="p-3 text-sm">{item.year}</td>
                    <td className="p-3 text-sm">{item.purpose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length > 0 && (
            <div className="px-4 py-3 bg-gray-50 border-t text-sm text-gray-500">
              {filtered.length} of {data.length} records
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
