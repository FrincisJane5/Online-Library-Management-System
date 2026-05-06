import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { User } from './types';

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

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('library_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (currentUser) localStorage.setItem('library_current_user', JSON.stringify(currentUser));
    else localStorage.removeItem('library_current_user');
  }, [currentUser]);

  const handleLogin = (user: User) => setCurrentUser(user);
  const handleLogout = () => setCurrentUser(null);

  // Wrap a feature page (no user/onLogout props needed inside) with Layout
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
  );
}

export default App;
