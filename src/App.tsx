import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { User } from './types';
import { Toaster } from './components/ui/sonner';

import LoginScreen from './components/LoginScreen';
import LibrarianDashboard from './components/LibrarianDashboard';
import StaffDashboard from './components/StaffDashboard';
import PublicAttendance from './components/PublicAttendance';
import AttendanceManagement from './components/AttendanceManagement';
import BooksInventory from './components/BooksInventory';
import OverdueFines from './components/OverdueFines';
import Notifications from './components/Notifications';
import UserManagement from './components/UserManagement';
import Settings from './components/Settings';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Feature pages (clean architecture)
import BorrowingPage from './features/borrowing/BorrowingPage';
import ReportsPage from './features/reports/ReportsPage';
import ActivityLogsPage from './features/logs/ActivityLogsPage';
import api from './api/axios';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('library_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [closedPopup, setClosedPopup] = useState(false);

  // Library hours screen-lock check — only runs on interval, not on mount
  useEffect(() => {
    if (!currentUser) return;

    const checkHours = async () => {
      try {
        const res = await api.get('/settings');
        const closeTime: string = res.data.close_time ?? '17:00';
        const openTime: string  = res.data.open_time  ?? '08:00';

        const now   = new Date();
        const [ch, cm] = closeTime.split(':').map(Number);
        const [oh, om] = openTime.split(':').map(Number);
        const closeMinutes = ch * 60 + cm;
        const openMinutes  = oh * 60 + om;
        const nowMinutes   = now.getHours() * 60 + now.getMinutes();

        if (nowMinutes >= closeMinutes || nowMinutes < openMinutes) {
          setClosedPopup(true);
        }
      } catch { /* ignore */ }
    };

    // Delay first check by 2 minutes so saving settings doesn't trigger it
    const timeout = setTimeout(() => {
      checkHours();
      const interval = setInterval(checkHours, 60_000);
      return () => clearInterval(interval);
    }, 120_000);

    return () => clearTimeout(timeout);
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) localStorage.setItem('library_current_user', JSON.stringify(currentUser));
    else localStorage.removeItem('library_current_user');
  }, [currentUser]);

  const handleLogin = (user: User) => { setCurrentUser(user); setClosedPopup(false); };
  const handleLogout = () => { setCurrentUser(null); setClosedPopup(false); };

  const withLayout = (element: React.ReactNode) => (
    <Layout user={currentUser!} onLogout={handleLogout}>{element}</Layout>
  );

  const protect = (element: React.ReactNode, role: 'admin' | 'staff') => (
    <ProtectedRoute user={currentUser} role={role}>{element}</ProtectedRoute>
  );

  const adminRoute = (path: string, element: React.ReactNode) => (
    <Route key={path} path={path} element={protect(element, 'admin')} />
  );

  const staffRoute = (path: string, element: React.ReactNode) => (
    <Route key={path} path={path} element={protect(element, 'staff')} />
  );

  return (
    <>
      <Toaster position="top-right" richColors closeButton />
      {/* Library Closed Screen-Lock Popup */}
      {closedPopup && currentUser && (
        <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center">
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Library is Closed</h2>
            <p className="text-slate-600 mb-6">
              The library is currently outside operating hours. The system is locked.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setClosedPopup(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-sm transition-colors">
                Dismiss
              </button>
              <button onClick={handleLogout}
                className="flex-1 px-4 py-2 bg-[#1B764C] hover:bg-[#016937] text-white rounded-lg text-sm transition-colors">
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      <Router>
        <Routes>
          {/* Public */}
          <Route path="/LccLibraryAttendance" element={<PublicAttendance />} />

          {/* Auth */}
          <Route path="/login" element={
            currentUser
              ? <Navigate to={currentUser.role === 'admin' ? '/admin/dashboard' : '/staff/dashboard'} />
              : <LoginScreen onLogin={handleLogin} />
          } />

          {/* Admin routes */}
          {adminRoute('/admin/dashboard',  <LibrarianDashboard user={currentUser!} onLogout={handleLogout} />)}
          {adminRoute('/admin/books',      <BooksInventory user={currentUser!} onLogout={handleLogout} />)}
          {adminRoute('/admin/attendance', <AttendanceManagement user={currentUser!} onLogout={handleLogout} />)}
          {adminRoute('/admin/borrowing',  withLayout(<BorrowingPage />))}
          {adminRoute('/admin/overdue',    <OverdueFines user={currentUser!} onLogout={handleLogout} />)}
          {adminRoute('/admin/reports',    withLayout(<ReportsPage />))}
          {adminRoute('/admin/logs',       withLayout(<ActivityLogsPage />))}
          {adminRoute('/admin/users',      <UserManagement user={currentUser!} onLogout={handleLogout} onCurrentUserUpdated={setCurrentUser} />)}
          {adminRoute('/admin/notifications', <Notifications user={currentUser!} onLogout={handleLogout} />)}
          {adminRoute('/admin/settings',   <Settings user={currentUser!} onLogout={handleLogout} />)}

          {/* Staff routes */}
          {staffRoute('/staff/dashboard',  <StaffDashboard user={currentUser!} onLogout={handleLogout} />)}
          {staffRoute('/staff/books',      <BooksInventory user={currentUser!} onLogout={handleLogout} />)}
          {staffRoute('/staff/attendance', <AttendanceManagement user={currentUser!} onLogout={handleLogout} />)}
          {staffRoute('/staff/borrowing',  withLayout(<BorrowingPage />))}
          {staffRoute('/staff/overdue',    <OverdueFines user={currentUser!} onLogout={handleLogout} />)}
          {staffRoute('/staff/reports',    withLayout(<ReportsPage />))}
          {staffRoute('/staff/notifications', <Notifications user={currentUser!} onLogout={handleLogout} />)}

          {/* Fallback */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
