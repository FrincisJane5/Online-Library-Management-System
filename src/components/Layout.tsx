// React imports for state management and child rendering
import { ReactNode, useState, useRef, useEffect } from 'react';
// React Router for navigation links and current path detection
import { Link, useLocation } from 'react-router-dom';
// Lucide icons used in the sidebar navigation
import {
  BookOpen, LayoutDashboard, Users, BookMarked,
  AlertCircle, Bell, Settings, FileText, Activity,
  Menu, X, LogOut, User as UserIcon, Mail, Phone
} from 'lucide-react';
import { User } from '../types';
import logoImage from '../assets/logo.png';
import ProfilePicture from './ProfilePicture';
import { profileService } from '../api/profile';
import { toast } from 'sonner';

// Props accepted by the Layout wrapper component
interface LayoutProps {
  user: User;          // Logged-in user — used to show name, role badge, and filter menu items
  onLogout: () => void; // Called when the user clicks the Logout button
  onUserUpdate?: (user: User) => void; // Called when user data is updated (e.g., profile picture)
  children: ReactNode; // The page content rendered inside the main area
}

// Small helper to render a label/value row in the profile dropdown
function ProfileRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-[#9DA4A6] w-24 flex-shrink-0">{label}</span>
      <span className="text-[#4B4C58] font-medium text-right break-all">{value || '—'}</span>
    </div>
  );
}

/**
 * Layout — the shared shell for all authenticated pages.
 * Renders the top navigation bar, collapsible sidebar, and main content area.
 * Menu items are filtered based on the user's role (admin sees more items than staff).
 */
export default function Layout({ user, onLogout, onUserUpdate, children }: LayoutProps) {
  const location = useLocation();                    // Used to highlight the active menu item
  const [sidebarOpen, setSidebarOpen] = useState(false); // Controls mobile sidebar visibility
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const isAdmin  = user.role === 'admin';
  const basePath = isAdmin ? '/admin' : '/staff';    // Route prefix differs by role

  // Handle profile picture upload
  const handleProfilePictureChange = async (file: File) => {
    try {
      const response = await profileService.uploadProfilePicture(file);
      const updatedUser = { ...user, profilePicture: response.profile_picture };
      
      // Update localStorage
      localStorage.setItem('library_current_user', JSON.stringify(updatedUser));
      
      // Update parent component state
      if (onUserUpdate) {
        onUserUpdate(updatedUser);
      }
      
      toast.success('Profile picture updated successfully');
    } catch (error) {
      console.error('Failed to upload profile picture:', error);
      toast.error('Failed to upload profile picture');
    }
  };

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Build the sidebar menu — admin-only items are conditionally included
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard',            path: `${basePath}/dashboard` },
    { icon: Users,           label: 'Attendance',           path: `${basePath}/attendance` },
    { icon: BookOpen,        label: 'Books & Inventory',    path: `${basePath}/books` },
    { icon: BookMarked,      label: 'Borrowing & Returning',path: `${basePath}/borrowing` },
    { icon: AlertCircle,     label: 'Overdue & Fines',      path: `${basePath}/overdue` },
    { icon: Bell,            label: 'Notifications',        path: `${basePath}/notifications` },
    // User Management — admin only
    ...(isAdmin ? [{ icon: Users, label: 'User Management', path: `${basePath}/users` }] : []),
    { icon: FileText, label: 'Reports', path: `${basePath}/reports` },
    // Activity Logs and Settings — admin only
    ...(isAdmin ? [
      { icon: Activity, label: 'Activity Logs', path: `${basePath}/logs` },
      { icon: Settings, label: 'Settings',      path: `${basePath}/settings` },
    ] : []),
  ];

  return (
    <div className="min-h-screen bg-[#F5F6F5]">
      {/* ── Top Navigation Bar ─────────────────────────────────────────── */}
      <header className="bg-white border-b border-[#9DA4A6] sticky top-0 z-40">
        <div className="px-4 lg:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Hamburger button — only visible on mobile */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-[#F5F6F5] rounded-lg"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            {/* Logo and system title */}
            <div className="flex items-center gap-3">
              <img src={logoImage} alt="Legacy College Logo" className="w-10 h-10 object-contain" />
              <div className="hidden sm:block">
                <h1 className="text-[#4B4C58]">Library Management System</h1>
                <p className="text-[#9DA4A6]">Legacy College of Compostela</p>
              </div>
            </div>
          </div>

          {/* User info and avatar — clickable to open profile dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-3 hover:bg-[#F5F6F5] rounded-lg px-2 py-1 transition-colors"
            >
              <div className="text-right hidden sm:block">
                <p className="text-[#4B4C58]">{user.fullName}</p>
                <div className="flex items-center justify-end gap-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-white ${
                    isAdmin ? 'bg-[#EF8B2D]' : 'bg-[#1B764C]'
                  }`}>
                    {isAdmin ? 'Admin' : 'Staff'}
                  </span>
                </div>
              </div>
              <ProfilePicture 
                currentPicture={user.profilePicture} 
                onPictureChange={handleProfilePictureChange}
                size="small"
                editable={false}
              />
            </button>

            {/* Profile dropdown */}
            {showProfile && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl border border-[#E5E7EB] z-50 overflow-hidden">
                {/* Header with avatar + greeting */}
                <div className="bg-[#1B764C] px-6 py-5 flex items-center gap-4">
                  <ProfilePicture 
                    currentPicture={user.profilePicture} 
                    onPictureChange={handleProfilePictureChange}
                    size="large"
                    editable={true}
                  />
                  <div className="flex-1">
                    <p className="text-white/80 text-xs">Welcome,</p>
                    <p className="text-white font-semibold leading-tight text-lg">{user.fullName}</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-white text-xs mt-1 ${
                      isAdmin ? 'bg-[#EF8B2D]' : 'bg-[#016937]'
                    }`}>
                      {isAdmin ? 'Admin' : 'Staff'}
                    </span>
                  </div>
                </div>

                {/* Profile details */}
                <div className="px-6 py-5 space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <UserIcon className="w-4 h-4 text-[#9DA4A6]" />
                    <div className="flex-1">
                      <p className="text-[#9DA4A6] text-xs">Username</p>
                      <p className="text-[#4B4C58] font-medium">{user.username}</p>
                    </div>
                  </div>
                  
                  {user.email && (
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-[#9DA4A6]" />
                      <div className="flex-1">
                        <p className="text-[#9DA4A6] text-xs">Email</p>
                        <p className="text-[#4B4C58] font-medium break-all">{user.email}</p>
                      </div>
                    </div>
                  )}
                  
                  {user.contactNumber && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="w-4 h-4 text-[#9DA4A6]" />
                      <div className="flex-1">
                        <p className="text-[#9DA4A6] text-xs">Contact Number</p>
                        <p className="text-[#4B4C58] font-medium">{user.contactNumber}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="pt-2 border-t border-[#E5E7EB]">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-4 h-4 flex items-center justify-center">
                        <div className={`w-2 h-2 rounded-full ${user.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      </div>
                      <div className="flex-1">
                        <p className="text-[#9DA4A6] text-xs">Status</p>
                        <p className="text-[#4B4C58] font-medium">{user.status || 'Active'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Sidebar ────────────────────────────────────────────────────── */}
      {/* Fixed position so it stays in place while the main content scrolls */}
      <aside className={`
        fixed top-[73px] left-0 z-30 h-[calc(100vh-73px)] w-64 bg-[#1B764C] border-r border-[#016937]
        transition-transform duration-300 lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <nav className="p-4 space-y-1 overflow-y-auto h-full">
          {menuItems.map((item) => {
            const Icon     = item.icon;
            const isActive = location.pathname === item.path; // Highlight the current page
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)} // Close sidebar on mobile after navigation
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[#016937] text-white'
                    : 'text-white/90 hover:bg-[#016937]/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          {/* Logout button — turns red on hover to signal a destructive action */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/90 hover:bg-[#D72A24] transition-colors mt-4"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* ── Mobile overlay — dims the page when the sidebar is open ───── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main Content ───────────────────────────────────────────────── */}
      {/* Offset by sidebar width (lg:ml-64) on desktop */}
      <main className="lg:ml-64 min-h-[calc(100vh-73px)] bg-[#F5F6F5] p-4 sm:p-6 lg:p-8">
        {children}
      </main>

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Confirm Logout</h3>
            <p className="text-slate-600 text-sm mb-6">Are you sure you want to log out?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-sm transition-colors">
                Cancel
              </button>
              <button onClick={onLogout}
                className="flex-1 px-4 py-2 bg-[#D72A24] hover:bg-red-700 text-white rounded-lg text-sm transition-colors">
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
