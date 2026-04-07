import Layout from './Layout';
import { User } from '../App';
import { BookOpen, TrendingUp, AlertCircle, DollarSign, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const visitData = [
  { day: 'Mon', visits: 45 },
  { day: 'Tue', visits: 52 },
  { day: 'Wed', visits: 38 },
  { day: 'Thu', visits: 61 },
  { day: 'Fri', visits: 55 },
  { day: 'Sat', visits: 28 },
  { day: 'Sun', visits: 15 }
];

const recentActivities = [
  { id: 1, dateTime: '2026-02-10 14:32', user: 'Juan Dela Cruz', action: 'Book Borrowed', details: '"Introduction to Physics" borrowed by Maria Santos' },
  { id: 2, dateTime: '2026-02-10 14:15', user: 'Maria Santos', action: 'Book Returned', details: '"Data Structures" returned on time' },
  { id: 3, dateTime: '2026-02-10 13:45', user: 'Juan Dela Cruz', action: 'Fine Paid', details: '₱50 fine paid by Pedro Reyes' },
  { id: 4, dateTime: '2026-02-10 11:20', user: 'Juan Dela Cruz', action: 'Attendance', details: 'Student Anna Cruz logged attendance' }
];

export default function StaffDashboard({ user, onLogout }: DashboardProps) {
  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6">
        {/* Info Banner */}
        <div className="bg-[#1B764C]/10 border border-[#1B764C] rounded-lg p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-[#1B764C] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[#4B4C58]">Welcome, Library Staff</p>
            <p className="text-[#9DA4A6]">You can manage records but cannot change system configuration.</p>
          </div>
        </div>

        {/* Page Header */}
        <div>
          <h2 className="text-[#4B4C58] mb-2">Dashboard</h2>
          <p className="text-[#9DA4A6]">Welcome back, {user.fullName}! Here's your library overview.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-[#9DA4A6]">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#1B764C]/10 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-[#1B764C]" />
              </div>
            </div>
            <p className="text-[#9DA4A6] mb-1">Total Books</p>
            <p className="text-[#4B4C58]">2,847</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-[#9DA4A6]">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#79C39F]/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#016937]" />
              </div>
            </div>
            <p className="text-[#9DA4A6] mb-1">Books Borrowed Today</p>
            <p className="text-[#4B4C58]">24</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-[#9DA4A6]">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#EF8B2D]/10 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-[#EF8B2D]" />
              </div>
            </div>
            <p className="text-[#9DA4A6] mb-1">Overdue Books</p>
            <p className="text-[#4B4C58]">18</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-[#9DA4A6]">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#D72A24]/10 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-[#D72A24]" />
              </div>
            </div>
            <p className="text-[#9DA4A6] mb-1">Unpaid Fines</p>
            <p className="text-[#4B4C58]">₱1,250</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-[#9DA4A6]">
            <h3 className="text-[#4B4C58] mb-4">Library Visits (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={visitData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="visits" fill="#1B764C" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-[#9DA4A6]">
            <h3 className="text-[#4B4C58] mb-4">Recent Activity</h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="pb-3 border-b border-[#9DA4A6]/30 last:border-0">
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-[#4B4C58]">{activity.action}</span>
                    <span className="text-[#9DA4A6]">{activity.dateTime}</span>
                  </div>
                  <p className="text-[#9DA4A6]">{activity.details}</p>
                  <p className="text-[#9DA4A6]">by {activity.user}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}