import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';

import LoginScreen from './components/LoginScreen';
import LibrarianDashboard from './components/LibrarianDashboard';
import StaffDashboard from './components/StaffDashboard';
import PublicAttendance from './components/PublicAttendance';

import AttendanceManagement from './components/AttendanceManagement';
import BooksInventory from './components/BooksInventory';
import BorrowingReturning from './components/BorrowingReturning';
import OverdueFines from './components/OverdueFines';
import Notifications from './components/Notifications';
import UserManagement from './components/UserManagement';
import Reports from './components/Reports';
import ActivityLogs from './components/ActivityLogs';
import Settings from './components/Settings';

import ProtectedRoute from './components/ProtectedRoute';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: 'admin' | 'staff';
}

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLogin = (user: User) => setCurrentUser(user);
  const handleLogout = () => setCurrentUser(null);

  return (
    <Router>
      <Routes>

        {/* PUBLIC */}
        <Route path="/LccLibraryAttendance" element={<PublicAttendance />} />

        {/* LOGIN */}
        <Route 
          path="/login" 
          element={
            currentUser
              ? <Navigate to={currentUser.role === 'admin' ? '/admin/dashboard' : '/staff/dashboard'} />
              : <LoginScreen onLogin={handleLogin} />
          } 
        />

        {/* ADMIN */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute user={currentUser} role="admin">
            <LibrarianDashboard user={currentUser!} onLogout={handleLogout} />
          </ProtectedRoute>
        } />

        <Route path="/admin/books" element={
          <ProtectedRoute user={currentUser} role="admin">
            <BooksInventory user={currentUser!} onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/users" element={
          <ProtectedRoute user={currentUser} role="admin">
            <UserManagement user={currentUser!} onLogout={handleLogout} />
          </ProtectedRoute>
        } />

        <Route path="/admin/notifications" element={
          <ProtectedRoute user={currentUser} role="admin">
            <Notifications user={currentUser!} onLogout={handleLogout} />
          </ProtectedRoute>
        } />

        <Route path="/admin/reports" element={
          <ProtectedRoute user={currentUser} role="admin">
            <Reports user={currentUser!} onLogout={handleLogout} />
          </ProtectedRoute>
        } />

        <Route path="/admin/settings" element={
          <ProtectedRoute user={currentUser} role="admin">
            <Settings user={currentUser!} onLogout={handleLogout} />
          </ProtectedRoute>
        } />

        <Route path="/admin/attendance" element={
          <ProtectedRoute user={currentUser} role="admin">
            <AttendanceManagement user={currentUser!} onLogout={handleLogout} />
          </ProtectedRoute>
        } />

        <Route path="/admin/borrowing" element={
          <ProtectedRoute user={currentUser} role="admin">
            <BorrowingReturning user={currentUser!} onLogout={handleLogout} />
          </ProtectedRoute>
        } />

        <Route path="/admin/overdue" element={
          <ProtectedRoute user={currentUser} role="admin">
            <OverdueFines user={currentUser!} onLogout={handleLogout} />
          </ProtectedRoute>
        } />

        <Route path="/admin/logs" element={
          <ProtectedRoute user={currentUser} role="admin">
            <ActivityLogs user={currentUser!} onLogout={handleLogout} />
          </ProtectedRoute>
        } />

        {/* STAFF */}
        <Route path="/staff/dashboard" element={
          <ProtectedRoute user={currentUser} role="staff">
            <StaffDashboard user={currentUser!} onLogout={handleLogout} />
          </ProtectedRoute>
        } />

        <Route path="/staff/books" element={
          <ProtectedRoute user={currentUser} role="staff">
            <BooksInventory user={currentUser!} onLogout={handleLogout} />
          </ProtectedRoute>
        } />

        <Route path="/staff/attendance" element={
          <ProtectedRoute user={currentUser} role="staff">
            <AttendanceManagement user={currentUser!} onLogout={handleLogout} />
          </ProtectedRoute>
        } />

        <Route path="/staff/borrowing" element={
          <ProtectedRoute user={currentUser} role="staff">
            <BorrowingReturning user={currentUser!} onLogout={handleLogout} />
          </ProtectedRoute>
        } />

        <Route path="/staff/overdue" element={
          <ProtectedRoute user={currentUser} role="staff">
            <OverdueFines user={currentUser!} onLogout={handleLogout} />
          </ProtectedRoute>
        } />

        <Route path="/staff/notifications" element={
          <ProtectedRoute user={currentUser} role="staff">
            <Notifications user={currentUser!} onLogout={handleLogout} />
          </ProtectedRoute>
        } />

        <Route path="/staff/reports" element={
          <ProtectedRoute user={currentUser} role="staff">
            <Reports user={currentUser!} onLogout={handleLogout} />
          </ProtectedRoute>
        } />

        {/* DEFAULT */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/login" />} />

      </Routes>
    </Router>
  );
}

export default App;