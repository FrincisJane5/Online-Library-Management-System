import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  LayoutDashboard, 
  Users, 
  BookMarked, 
  AlertCircle,
  Bell,
  Settings,
  FileText,
  Activity,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { User } from '../App';
import logoImage from '../assets/logo.png';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  children: ReactNode;
}

export default function Layout({ user, onLogout, children }: LayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isAdmin = user.role === 'admin';
  const basePath = isAdmin ? '/admin' : '/staff';

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: `${basePath}/dashboard` },
    { icon: Users, label: 'Attendance', path: `${basePath}/attendance` },
    { icon: BookOpen, label: 'Books & Inventory', path: `${basePath}/books` },
    { icon: BookMarked, label: 'Borrowing & Returning', path: `${basePath}/borrowing` },
    { icon: AlertCircle, label: 'Overdue & Fines', path: `${basePath}/overdue` },
    { icon: Bell, label: 'Notifications', path: `${basePath}/notifications` },
    ...(isAdmin ? [
      { icon: Users, label: 'User Management', path: `${basePath}/users` }
    ] : []),
    { icon: FileText, label: 'Reports', path: `${basePath}/reports` },
    ...(isAdmin ? [
      { icon: Activity, label: 'Activity Logs', path: `${basePath}/logs` },
      { icon: Settings, label: 'Settings', path: `${basePath}/settings` }
    ] : [])
  ];

  return (
    <div className="min-h-screen bg-[#F5F6F5]">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-[#9DA4A6] sticky top-0 z-40">
        <div className="px-4 lg:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-[#F5F6F5] rounded-lg"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="flex items-center gap-3">
              <img src={logoImage} alt="Legacy College Logo" className="w-10 h-10 object-contain" />
              <div className="hidden sm:block">
                <h1 className="text-[#4B4C58]">Library Management System</h1>
                <p className="text-[#9DA4A6]">Legacy College of Compostela</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
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
            <div className="w-10 h-10 bg-[#79C39F] rounded-full flex items-center justify-center">
              <span className="text-[#4B4C58]">{user.fullName.charAt(0)}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:sticky top-0 left-0 z-30 h-screen lg:h-[calc(100vh-73px)] w-64 bg-[#1B764C] border-r border-[#016937]
          transition-transform duration-300 lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <nav className="p-4 space-y-1 overflow-y-auto h-full">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
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
            
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/90 hover:bg-[#D72A24] transition-colors mt-4"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}