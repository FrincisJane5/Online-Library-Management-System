import { useState } from 'react';
import Layout from './Layout';
import { User } from '../App';
import { Download, Printer, Calendar } from 'lucide-react';

interface ReportsProps {
  user: User;
  onLogout: () => void;
}

type ReportType = 'attendance' | 'borrowing' | 'inventory' | 'overdue';

export default function Reports({ user, onLogout }: ReportsProps) {
  const [activeReport, setActiveReport] = useState<ReportType>('attendance');

  const attendanceData = [
    { date: '2025-02-10', name: 'Maria Santos', course: 'BS Computer Science', year: '3rd Year', time: '09:15', purpose: 'Study/Research' },
    { date: '2025-02-10', name: 'Juan Reyes', course: 'BS Information Technology', year: '2nd Year', time: '09:30', purpose: 'Borrow Books' },
    { date: '2025-02-10', name: 'Anna Cruz', course: 'BS Business Administration', year: '4th Year', time: '10:05', purpose: 'Group Study' }
  ];

  const borrowingData = [
    { date: '2025-02-10', student: 'Maria Santos', book: 'Introduction to Algorithms', action: 'Borrowed', dueDate: '2025-02-17' },
    { date: '2025-02-10', student: 'Pedro Garcia', book: 'Physics for Scientists', action: 'Returned', dueDate: 'N/A' },
    { date: '2025-02-09', student: 'Lisa Tan', book: 'Human Resource Management', action: 'Borrowed', dueDate: '2025-02-16' }
  ];

  const inventoryData = [
    { category: 'Computer Science', total: 450, available: 320, borrowed: 105, damaged: 15, lost: 10 },
    { category: 'Physics', total: 280, available: 210, borrowed: 55, damaged: 10, lost: 5 },
    { category: 'Business', total: 350, available: 260, borrowed: 75, damaged: 10, lost: 5 },
    { category: 'Nursing', total: 520, available: 380, borrowed: 120, damaged: 15, lost: 5 }
  ];

  const overdueData = [
    { student: 'Pedro Reyes', book: 'Database System Concepts', daysOverdue: 19, fine: 95, status: 'Unpaid' },
    { student: 'Anna Cruz', book: 'Physics for Scientists', daysOverdue: 14, fine: 70, status: 'Unpaid' },
    { student: 'Carlos Mendoza', book: 'Human Resource Management', daysOverdue: 24, fine: 120, status: 'Paid' }
  ];

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h2 className="text-slate-900 mb-2">Reports</h2>
          <p className="text-slate-600">Generate and export various library reports.</p>
        </div>

        {/* Report Type Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="border-b border-slate-200 flex flex-wrap">
            <button
              onClick={() => setActiveReport('attendance')}
              className={`px-6 py-4 transition-colors ${
                activeReport === 'attendance'
                  ? 'border-b-2 border-teal-600 text-teal-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Attendance Report
            </button>
            <button
              onClick={() => setActiveReport('borrowing')}
              className={`px-6 py-4 transition-colors ${
                activeReport === 'borrowing'
                  ? 'border-b-2 border-teal-600 text-teal-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Borrowing & Returning
            </button>
            <button
              onClick={() => setActiveReport('inventory')}
              className={`px-6 py-4 transition-colors ${
                activeReport === 'inventory'
                  ? 'border-b-2 border-teal-600 text-teal-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Inventory Status
            </button>
            <button
              onClick={() => setActiveReport('overdue')}
              className={`px-6 py-4 transition-colors ${
                activeReport === 'overdue'
                  ? 'border-b-2 border-teal-600 text-teal-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Overdue & Fines
            </button>
          </div>

          <div className="p-6">
            {/* Filter Controls */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 mb-2">Start Date</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-slate-700 mb-2">End Date</label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="flex items-end gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg transition-colors">
                  <Printer className="w-4 h-4" />
                  Print
                </button>
              </div>
            </div>

            {/* Attendance Report */}
            {activeReport === 'attendance' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-slate-700">Date</th>
                      <th className="px-6 py-3 text-left text-slate-700">Time</th>
                      <th className="px-6 py-3 text-left text-slate-700">Name</th>
                      <th className="px-6 py-3 text-left text-slate-700">Course</th>
                      <th className="px-6 py-3 text-left text-slate-700">Year</th>
                      <th className="px-6 py-3 text-left text-slate-700">Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {attendanceData.map((record, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-slate-900">{record.date}</td>
                        <td className="px-6 py-4 text-slate-600">{record.time}</td>
                        <td className="px-6 py-4 text-slate-900">{record.name}</td>
                        <td className="px-6 py-4 text-slate-600">{record.course}</td>
                        <td className="px-6 py-4 text-slate-600">{record.year}</td>
                        <td className="px-6 py-4 text-slate-600">{record.purpose}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Borrowing Report */}
            {activeReport === 'borrowing' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-slate-700">Date</th>
                      <th className="px-6 py-3 text-left text-slate-700">Student</th>
                      <th className="px-6 py-3 text-left text-slate-700">Book</th>
                      <th className="px-6 py-3 text-left text-slate-700">Action</th>
                      <th className="px-6 py-3 text-left text-slate-700">Due Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {borrowingData.map((record, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-slate-900">{record.date}</td>
                        <td className="px-6 py-4 text-slate-900">{record.student}</td>
                        <td className="px-6 py-4 text-slate-600">{record.book}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 rounded border ${
                            record.action === 'Borrowed' 
                              ? 'bg-orange-100 text-orange-700 border-orange-200' 
                              : 'bg-green-100 text-green-700 border-green-200'
                          }`}>
                            {record.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600">{record.dueDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Inventory Report */}
            {activeReport === 'inventory' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-slate-700">Category</th>
                      <th className="px-6 py-3 text-center text-slate-700">Total</th>
                      <th className="px-6 py-3 text-center text-slate-700">Available</th>
                      <th className="px-6 py-3 text-center text-slate-700">Borrowed</th>
                      <th className="px-6 py-3 text-center text-slate-700">Damaged</th>
                      <th className="px-6 py-3 text-center text-slate-700">Lost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {inventoryData.map((record, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-slate-900">{record.category}</td>
                        <td className="px-6 py-4 text-center text-slate-900">{record.total}</td>
                        <td className="px-6 py-4 text-center text-slate-900">{record.available}</td>
                        <td className="px-6 py-4 text-center text-slate-900">{record.borrowed}</td>
                        <td className="px-6 py-4 text-center text-slate-900">{record.damaged}</td>
                        <td className="px-6 py-4 text-center text-slate-900">{record.lost}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Overdue Report */}
            {activeReport === 'overdue' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-slate-700">Student</th>
                      <th className="px-6 py-3 text-left text-slate-700">Book</th>
                      <th className="px-6 py-3 text-center text-slate-700">Days Overdue</th>
                      <th className="px-6 py-3 text-left text-slate-700">Fine Amount</th>
                      <th className="px-6 py-3 text-left text-slate-700">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {overdueData.map((record, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-slate-900">{record.student}</td>
                        <td className="px-6 py-4 text-slate-900">{record.book}</td>
                        <td className="px-6 py-4 text-center text-slate-900">{record.daysOverdue}</td>
                        <td className="px-6 py-4 text-slate-900">₱{record.fine}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 rounded border ${
                            record.status === 'Paid' 
                              ? 'bg-green-100 text-green-700 border-green-200' 
                              : 'bg-red-100 text-red-700 border-red-200'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
