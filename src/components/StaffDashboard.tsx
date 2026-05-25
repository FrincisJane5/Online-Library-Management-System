import { useEffect, useMemo, useState } from "react";
import api from '../api/axios';
import Layout from './Layout';
import { User } from '../types';
import { BookOpen, RefreshCcw, Users, Activity } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { useNavigate } from 'react-router-dom';

interface StaffDashboardProps {
  user: User;
  onLogout: () => void;
}

const PIE_COLORS = ['#1B764C', '#EF8B2D', '#D72A24'];

export default function StaffDashboard({ user, onLogout }: StaffDashboardProps) {
  const [dashboard, setDashboard] = useState<any>(null);
  const [programs, setPrograms]   = useState<{ code: string }[]>([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/dashboard')
      .then(res => setDashboard(res.data))
      .catch(() => setError('Could not load dashboard. Make sure the backend is running.'));
    api.get('/programs').then(res => setPrograms(res.data)).catch(console.error);
  }, []);

  const deptData = useMemo(() => {
    const visitMap: Record<string, number> = {};
    (dashboard?.visits_by_department ?? []).forEach((d: any) => { visitMap[d.course] = d.visits; });
    const keys = programs.length > 0 ? programs.map(p => p.code) : Object.keys(visitMap);
    return keys.map(code => ({ course: code, visits: visitMap[code] ?? 0 }));
  }, [programs, dashboard]);

  if (error) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <div className="p-5 bg-red-50 border border-red-200 rounded-xl text-red-700">{error}</div>
      </Layout>
    );
  }

  if (!dashboard) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <div className="flex items-center justify-center h-64">
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
  const borrowed  = Number(stats.borrowed ?? 0);
  const available = Number(stats.books ?? 0) - borrowed;
  const overdue   = Number(stats.overdue ?? 0);

  const borrowingPieData = [
    { name: 'Available', value: Math.max(available, 0) },
    { name: 'Borrowed',  value: borrowed },
    { name: 'Overdue',   value: overdue },
  ].filter(d => d.value > 0);

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6">

        {/* Header */}
        <div>
          <h2 className="text-[#4B4C58] text-2xl font-bold mb-1">Staff Dashboard</h2>
          <p className="text-[#9DA4A6]">Welcome, {user.fullName}. Here's today's library overview.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button onClick={() => navigate('/staff/books')} className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-[#1B764C] hover:shadow-md hover:-translate-y-0.5 transition-all text-left">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[#9DA4A6] text-sm font-medium">Total Books</p>
              <BookOpen className="w-5 h-5 text-[#1B764C]" />
            </div>
            <p className="text-[#4B4C58] text-2xl font-bold">{stats.books}</p>
          </button>

          <button onClick={() => navigate('/staff/borrowing')} className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-[#EF8B2D] hover:shadow-md hover:-translate-y-0.5 transition-all text-left">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[#9DA4A6] text-sm font-medium">Books Borrowed</p>
              <RefreshCcw className="w-5 h-5 text-[#EF8B2D]" />
            </div>
            <p className="text-[#4B4C58] text-2xl font-bold">{stats.borrowed}</p>
          </button>

          <button onClick={() => navigate('/staff/attendance')} className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-[#4B4C58] hover:shadow-md hover:-translate-y-0.5 transition-all text-left">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[#9DA4A6] text-sm font-medium">Students</p>
              <Users className="w-5 h-5 text-[#4B4C58]" />
            </div>
            <p className="text-[#4B4C58] text-2xl font-bold">{stats.students}</p>
          </button>

          <button onClick={() => navigate('/staff/overdue')} className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-[#D72A24] hover:shadow-md hover:-translate-y-0.5 transition-all text-left">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[#9DA4A6] text-sm font-medium">Unpaid Fines</p>
              <Activity className="w-5 h-5 text-[#D72A24]" />
            </div>
            <p className="text-[#4B4C58] text-2xl font-bold">₱{Number(stats.fines ?? 0).toFixed(2)}</p>
          </button>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Weekly visits chart */}
          <div className="lg:col-span-2 bg-white p-5 rounded-xl shadow-sm border border-[#E5E7EB]">
            <h3 className="text-[#4B4C58] font-semibold mb-4">Library Visits (Mon–Sat)</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9DA4A6' }} />
                <YAxis domain={[0, 50]} tickCount={6} allowDecimals={false} interval={0} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9DA4A6' }} />
                <Tooltip cursor={{ fill: '#F9FAFB' }} />
                <Bar dataKey="visits" fill="#1B764C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Book Status Pie Chart */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-[#E5E7EB]">
            <h3 className="text-[#4B4C58] font-semibold mb-4">Book Status</h3>
            {borrowingPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={borrowingPieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {borrowingPieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [value, '']} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-[#9DA4A6] text-sm">No data</div>
            )}
          </div>

        </div>

        {/* Charts Row 2 */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-[#E5E7EB]">
          <h3 className="text-[#4B4C58] font-semibold mb-4">Visits by Department (Today)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={deptData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis dataKey="course" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9DA4A6' }} />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9DA4A6' }} />
              <Tooltip cursor={{ fill: '#F9FAFB' }} />
              <Bar dataKey="visits" fill="#016937" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </Layout>
  );
}
