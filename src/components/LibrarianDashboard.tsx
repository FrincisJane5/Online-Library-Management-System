import { useEffect, useState } from "react";
import Layout from './Layout';
import { User } from '../types';
import { BookOpen, TrendingUp, AlertCircle, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

export default function LibrarianDashboard({ user, onLogout }: DashboardProps) {
  const [dashboard, setDashboard] = useState<any>(null);
  const [programs, setPrograms]   = useState<{ code: string }[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/dashboard").then(res => setDashboard(res.data)).catch(err => console.error(err));
    api.get("/programs").then(res => setPrograms(res.data)).catch(console.error);
  }, []);

  if (!dashboard) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <p className="p-6">Loading dashboard...</p>
      </Layout>
    );
  }

  // 📊 Transform API data for chart
  const visitData = dashboard.attendance_chart.map((item: any) => ({
    day: item.date,
    visits: item.total
  }));

  const deptData = programs.map(p => {
    const found = (dashboard.visits_by_department ?? []).find((d: any) => d.course === p.code);
    return { course: p.code, visits: found ? found.visits : 0 };
  });

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6">

        {/* Header */}
        <div>
          <h2 className="text-[#4B4C58] mb-2">Dashboard</h2>
          <p className="text-[#9DA4A6]">
            Welcome back, {user.fullName}! Here's your library overview.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* Books */}
          <button onClick={() => navigate('/admin/books')} className="bg-white p-6 rounded-lg shadow-sm border border-[#9DA4A6] cursor-pointer hover:scale-105 transition text-left">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#1B764C]/10 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-[#1B764C]" />
              </div>
            </div>
            <p className="text-[#9DA4A6] mb-1">Total Books</p>
            <p className="text-[#4B4C58] text-xl font-semibold">{dashboard.stats.books}</p>
          </button>

          {/* Borrowed */}
          <button onClick={() => navigate('/admin/borrowing')} className="bg-white p-6 rounded-lg shadow-sm border border-[#9DA4A6] cursor-pointer hover:scale-105 transition text-left">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#79C39F]/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#016937]" />
              </div>
            </div>
            <p className="text-[#9DA4A6] mb-1">Books Borrowed</p>
            <p className="text-[#4B4C58] text-xl font-semibold">{dashboard.stats.borrowed}</p>
          </button>

          {/* Students */}
          <button onClick={() => navigate('/admin/attendance')} className="bg-white p-6 rounded-lg shadow-sm border border-[#9DA4A6] cursor-pointer hover:scale-105 transition text-left">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#EF8B2D]/10 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-[#EF8B2D]" />
              </div>
            </div>
            <p className="text-[#9DA4A6] mb-1">Students</p>
            <p className="text-[#4B4C58] text-xl font-semibold">{dashboard.stats.students}</p>
          </button>

          {/* Placeholder for fines */}
          <button onClick={() => navigate('/admin/overdue')} className="bg-white p-6 rounded-lg shadow-sm border border-[#9DA4A6] cursor-pointer hover:scale-105 transition text-left">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#D72A24]/10 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-[#D72A24]" />
              </div>
            </div>
            <p className="text-[#9DA4A6] mb-1">Fines</p>
            <p className="text-[#4B4C58] text-xl font-semibold">₱{dashboard.stats.fines ?? 0}</p>
          </button>

        </div>

        {/* Charts + Department */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* 📊 Weekly visits chart */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-[#9DA4A6]">
            <h3 className="text-[#4B4C58] mb-4">Library Visits (Monday to Saturday)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={visitData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" />
                <YAxis domain={[0, 50]} tickCount={6} allowDecimals={false} interval={0} />
                <Tooltip cursor={{fill: '#f5f6f5'}} />
                <Bar dataKey="visits" fill="#1B764C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 📊 Visits by Department */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-[#9DA4A6]">
            <h3 className="text-[#4B4C58] mb-4">Visits by Department (Today)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="course" />
                <YAxis allowDecimals={false} />
                <Tooltip cursor={{fill: '#f5f6f5'}} />
                <Bar dataKey="visits" fill="#016937" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>

      </div>
    </Layout>
  );
}