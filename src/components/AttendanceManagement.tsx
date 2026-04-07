import { useEffect, useState } from 'react';
import Layout from './Layout';
import { User } from '../App';
import { Search, Download, Printer, Calendar } from 'lucide-react';
import axios from 'axios';

interface AttendanceManagementProps {
  user: User;
  onLogout: () => void;
}

interface Attendance {
  id: number;
  created_at: string;
  name: string;
  course: string;
  year: string;
  purpose: string;
}

export default function AttendanceManagement({ user, onLogout }: AttendanceManagementProps) {
  const [data, setData] = useState<Attendance[]>([]);
  const [filteredData, setFilteredData] = useState<Attendance[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');

  // ✅ FETCH FROM BACKEND
  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const res = await axios.get("http://localhost:8000/api/attendance");
      setData(res.data);
      setFilteredData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ FILTER LOGIC
  useEffect(() => {
    let filtered = data.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (courseFilter) {
      filtered = filtered.filter(item => item.course === courseFilter);
    }

    if (yearFilter) {
      filtered = filtered.filter(item => item.year === yearFilter);
    }

    setFilteredData(filtered);
  }, [searchTerm, courseFilter, yearFilter, data]);

  // ✅ EXPORT CSV
  const exportCSV = () => {
    const headers = ["Date", "Name", "Course", "Year", "Purpose"];

    const rows = filteredData.map(item => [
      item.created_at,
      item.name,
      item.course,
      item.year,
      item.purpose
    ]);

    let csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map(e => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "attendance.csv";
    link.click();
  };

  // ✅ PRINT REPORT
  const printReport = () => {
    const printWindow = window.open('', '', 'width=900,height=650');

    const html = `
      <html>
        <head>
          <title>Attendance Report</title>
        </head>
        <body>
          <h2>Library Attendance Report</h2>
          <table border="1" cellpadding="8" cellspacing="0">
            <tr>
              <th>Date</th>
              <th>Name</th>
              <th>Course</th>
              <th>Year</th>
              <th>Purpose</th>
            </tr>
            ${filteredData.map(item => `
              <tr>
                <td>${item.created_at}</td>
                <td>${item.name}</td>
                <td>${item.course}</td>
                <td>${item.year}</td>
                <td>${item.purpose}</td>
              </tr>
            `).join("")}
          </table>
        </body>
      </html>
    `;

    printWindow?.document.write(html);
    printWindow?.document.close();
    printWindow?.print();
  };

  const courses = ['BSIT', 'BSBA', 'BSED', 'BSCRIM'];
  const yearLevels = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6">
        <div>
          <h2 className="text-[#4B4C58] mb-2">Attendance Records</h2>
          <p className="text-[#9DA4A6]">View and manage library attendance logs.</p>
        </div>

        {/* FILTERS */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#9DA4A6]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">

            {/* SEARCH */}
            <div className="lg:col-span-2">
              <label className="block mb-2">Search by Name</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search student name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 p-2 border rounded-lg"
                />
              </div>
            </div>

            {/* COURSE */}
            <div>
              <label className="block mb-2">Course</label>
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">All</option>
                {courses.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            {/* YEAR */}
            <div>
              <label className="block mb-2">Year Level</label>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">All</option>
                {yearLevels.map(y => <option key={y}>{y}</option>)}
              </select>
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex gap-3">
            <button onClick={exportCSV} className="bg-green-700 text-white px-4 py-2 rounded-lg flex gap-2">
              <Download size={16}/> Export CSV
            </button>

            <button onClick={printReport} className="border px-4 py-2 rounded-lg flex gap-2">
              <Printer size={16}/> Print Report
            </button>

            <button className="border px-4 py-2 rounded-lg flex gap-2">
              <Calendar size={16}/> Date Range
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Date & Time</th>
                <th className="p-3 text-left">Student Name</th>
                <th className="p-3 text-left">Course</th>
                <th className="p-3 text-left">Year</th>
                <th className="p-3 text-left">Purpose</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.map(item => (
                <tr key={item.id} className="border-t">
                  <td className="p-3">{item.created_at}</td>
                  <td className="p-3">{item.name}</td>
                  <td className="p-3">{item.course}</td>
                  <td className="p-3">{item.year}</td>
                  <td className="p-3">{item.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredData.length === 0 && (
            <p className="text-center p-6 text-gray-500">No records found</p>
          )}
        </div>
      </div>
    </Layout>
  );
}