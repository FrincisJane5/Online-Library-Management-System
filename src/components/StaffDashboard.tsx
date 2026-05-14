import { useEffect, useState } from "react";
import api from '../api/axios';
import Layout from './Layout';
import { User } from '../types';
import { BookOpen, RefreshCcw, Users, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

interface StaffDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function StaffDashboard({ user, onLogout }: StaffDashboardProps) {
  const [dashboard, setDashboard] = useState<any>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/dashboard')
      .then(res => setDashboard(res.data))
      .catch(() => setError('Could not load dashboard. Make sure the backend is running.'));
  }, []);

  if (error) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>
      </Layout>
    );
  }

  if (!dashboard) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <div className="p-6 flex items-center justify-center h-64">
          <p className="text-[#9DA4A6] animate-pulse">Loading workspace...</p>
        </div>
      </Layout>
    );
  }

  const chartData = dashboard.attendance_chart.map((item: any) => ({
    day: item.date,
    visits: item.total,
  }));

  const stats = dashboard.stats;
  const recentActivity = dashboard.recent_activity;

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6">

        {/* Header */}
        <div>
          <h2 className="text-[#4B4C58] text-2xl font-bold mb-1">Staff Dashboard</h2>
          <p className="text-[#9DA4A6]">Welcome, {user.fullName}. Here's today's library overview.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* ... KPI Cards remain same ... */}
          <button onClick={() => navigate('/staff/books')} className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-[#1B764C] hover:shadow-md transition text-left">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[#9DA4A6] font-medium">Total Books</p>
              <BookOpen className="w-5 h-5 text-[#1B764C]" />
            </div>
            <p className="text-[#4B4C58] text-2xl font-bold">{stats.books}</p>
          </button>

          <button onClick={() => navigate('/staff/borrowing')} className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-[#EF8B2D] hover:shadow-md transition text-left">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[#9DA4A6] font-medium">Books Borrowed</p>
              <RefreshCcw className="w-5 h-5 text-[#EF8B2D]" />
            </div>
            <p className="text-[#4B4C58] text-2xl font-bold">{stats.borrowed}</p>
          </button>

          <button onClick={() => navigate('/staff/attendance')} className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-[#4B4C58] hover:shadow-md transition text-left">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[#9DA4A6] font-medium">Students</p>
              <Users className="w-5 h-5 text-[#4B4C58]" />
            </div>
            <p className="text-[#4B4C58] text-2xl font-bold">{stats.students}</p>
          </button>

          <button onClick={() => navigate('/staff/overdue')} className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-[#D72A24] hover:shadow-md transition text-left">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[#9DA4A6] font-medium">Unpaid Fines</p>
              <Activity className="w-5 h-5 text-[#D72A24]" />
            </div>
            <p className="text-[#4B4C58] text-2xl font-bold">₱{Number(stats.fines ?? 0).toFixed(2)}</p>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Updated Chart to match Librarian specs */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-[#9DA4A6]/30">
            <h3 className="text-[#4B4C58] font-semibold mb-4">Library Visits (Mon–Sat)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} />
                
                {/* YAxis Configured for 0-500 with 100 increments */}
                <YAxis 
                  domain={[0, 500]} 
                  tickCount={6} 
                  allowDecimals={false} 
                  interval={0}
                  axisLine={false} 
                  tickLine={false} 
                />
                
                <Tooltip cursor={{ fill: '#f3f4f6' }} />
                <Bar dataKey="visits" fill="#1B764C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-[#9DA4A6]/30">
            <h3 className="text-[#4B4C58] font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2">
              {recentActivity.length === 0 ? (
                <p className="text-[#9DA4A6] text-center py-10">No recent activity</p>
              ) : recentActivity.map((a: any, i: number) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="mt-1.5 w-2 h-2 rounded-full bg-[#1B764C] shrink-0" />
                  <div>
                    <p className="text-sm text-[#4B4C58] font-medium leading-tight">{a.action}</p>
                    <p className="text-xs text-[#9DA4A6]">{a.description}</p>
                    <p className="text-xs text-[#9DA4A6]">{a.created_at}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}