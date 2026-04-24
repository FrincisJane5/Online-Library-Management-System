import { useEffect, useState } from "react";
import axios from "axios";
import Layout from './Layout';
import { User } from '../App';
import { BookOpen, RefreshCcw, Clock, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface StaffDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function StaffDashboard({ user, onLogout }: StaffDashboardProps) {
  const [dashboard, setDashboard] = useState<any>(null);

  useEffect(() => {
    // Assuming a specific endpoint for staff metrics
    axios.get("http://localhost:8000/api/staff/dashboard")
      .then(res => setDashboard(res.data))
      .catch(err => console.error(err));
  }, []);

  if (!dashboard) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <div className="p-6 flex items-center justify-center h-64">
           <p className="text-[#9DA4A6] animate-pulse">Loading workspace...</p>
        </div>
      </Layout>
    );
  }

  // Focus on operational data (e.g., transactions handled)
  const transactionData = dashboard.daily_stats.map((item: any) => ({
    day: item.date,
    processed: item.total_actions
  }));

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6">

        {/* Header */}
        <div>
          <h2 className="text-[#4B4C58] text-2xl font-bold mb-1">Staff Terminal</h2>
          <p className="text-[#9DA4A6]">
            Welcome, {user.fullName}. You are logged in as Library Staff.
          </p>
        </div>

        {/* Task-Oriented KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* Pending Approvals */}
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-[#EF8B2D] hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
               <p className="text-[#9DA4A6] font-medium">Pending Requests</p>
               <Clock className="w-5 h-5 text-[#EF8B2D]" />
            </div>
            <p className="text-[#4B4C58] text-2xl font-bold">{dashboard.stats.pending_requests}</p>
          </div>

          {/* Books to Return Today */}
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-[#1B764C] hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
               <p className="text-[#9DA4A6] font-medium">Returns Due Today</p>
               <RefreshCcw className="w-5 h-5 text-[#1B764C]" />
            </div>
            <p className="text-[#4B4C58] text-2xl font-bold">{dashboard.stats.due_today}</p>
          </div>

          {/* Active Borrows */}
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-[#4B4C58] hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
               <p className="text-[#9DA4A6] font-medium">Books Out</p>
               <BookOpen className="w-5 h-5 text-[#4B4C58]" />
            </div>
            <p className="text-[#4B4C58] text-2xl font-bold">{dashboard.stats.active_loans}</p>
          </div>

          {/* Completed Today */}
          <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-[#79C39F] hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2">
               <p className="text-[#9DA4A6] font-medium">Processed Today</p>
               <CheckCircle className="w-5 h-5 text-[#79C39F]" />
            </div>
            <p className="text-[#4B4C58] text-2xl font-bold">{dashboard.stats.completed_today}</p>
          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* 📊 Staff Activity Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-[#9DA4A6]/30">
            <h3 className="text-[#4B4C58] font-semibold mb-4">Transaction Volume (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={transactionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f3f4f6'}} />
                <Bar dataKey="processed" fill="#1B764C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 🕒 My Recent Actions */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-[#9DA4A6]/30">
            <h3 className="text-[#4B4C58] font-semibold mb-4">Your Recent Actions</h3>
            <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2">
              {dashboard.my_activity.length === 0 ? (
                <p className="text-[#9DA4A6] text-center py-10">No recent actions</p>
              ) : (
                dashboard.my_activity.map((activity: any, index: number) => (
                  <div key={index} className="flex gap-3 items-start">
                    <div className="mt-1 w-2 h-2 rounded-full bg-[#1B764C] shrink-0" />
                    <div>
                      <p className="text-sm text-[#4B4C58] font-medium leading-tight">{activity.action}</p>
                      <p className="text-xs text-[#9DA4A6]">{activity.time_ago}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}
