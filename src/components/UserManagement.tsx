import { useState } from 'react';
import Layout from './Layout';
import { User } from '../App';
import { Plus, Edit, AlertCircle, X } from 'lucide-react';

interface UserManagementProps {
  user: User;
  onLogout: () => void;
}

interface StaffUser {
  id: number;
  fullName: string;
  username: string;
  role: 'Admin' | 'Staff';
  status: 'Active' | 'Deactivated';
  dateCreated: string;
  lastLogin: string;
}

const mockStaffUsers: StaffUser[] = [
  { id: 1, fullName: 'Maria Santos', username: 'admin', role: 'Admin', status: 'Active', dateCreated: '2024-01-15', lastLogin: '2025-02-10 08:30' },
  { id: 2, fullName: 'Juan Dela Cruz', username: 'staff', role: 'Staff', status: 'Active', dateCreated: '2024-03-20', lastLogin: '2025-02-10 09:15' },
  { id: 3, fullName: 'Rosa Garcia', username: 'rosa.garcia', role: 'Staff', status: 'Active', dateCreated: '2024-06-10', lastLogin: '2025-02-09 14:20' },
  { id: 4, fullName: 'Carlos Reyes', username: 'carlos.reyes', role: 'Staff', status: 'Deactivated', dateCreated: '2024-02-05', lastLogin: '2025-01-15 10:00' }
];

export default function UserManagement({ user, onLogout }: UserManagementProps) {
  const [staffUsers] = useState<StaffUser[]>(mockStaffUsers);
  const [showAddModal, setShowAddModal] = useState(false);

  const getStatusColor = (status: string) => {
    return status === 'Active' 
      ? 'bg-green-100 text-green-700 border-green-200' 
      : 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getRoleColor = (role: string) => {
    return role === 'Admin' 
      ? 'bg-purple-100 text-purple-700 border-purple-200' 
      : 'bg-blue-100 text-blue-700 border-blue-200';
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-slate-900 mb-2">User Management – Staff Accounts</h2>
            <p className="text-slate-600">Manage library staff accounts and permissions.</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Staff Account
          </button>
        </div>

        {/* Warning Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-900">Admin Access Required</p>
            <p className="text-amber-700">Only the librarian (admin) can create or deactivate staff accounts. There is no public sign-up.</p>
          </div>
        </div>

        {/* Staff Users Table */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-slate-700">Full Name</th>
                  <th className="px-6 py-3 text-left text-slate-700">Username</th>
                  <th className="px-6 py-3 text-left text-slate-700">Role</th>
                  <th className="px-6 py-3 text-left text-slate-700">Status</th>
                  <th className="px-6 py-3 text-left text-slate-700">Date Created</th>
                  <th className="px-6 py-3 text-left text-slate-700">Last Login</th>
                  <th className="px-6 py-3 text-center text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {staffUsers.map((staffUser) => (
                  <tr key={staffUser.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-slate-900">{staffUser.fullName}</td>
                    <td className="px-6 py-4 text-slate-900">{staffUser.username}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded border ${getRoleColor(staffUser.role)}`}>
                        {staffUser.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded border ${getStatusColor(staffUser.status)}`}>
                        {staffUser.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{staffUser.dateCreated}</td>
                    <td className="px-6 py-4 text-slate-600">{staffUser.lastLogin}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button className="px-3 py-1 text-blue-600 border border-blue-600 hover:bg-blue-50 rounded transition-colors">
                          Edit
                        </button>
                        {staffUser.status === 'Active' && staffUser.role !== 'Admin' && (
                          <button className="px-3 py-1 text-red-600 border border-red-600 hover:bg-red-50 rounded transition-colors">
                            Deactivate
                          </button>
                        )}
                        {staffUser.status === 'Deactivated' && (
                          <button className="px-3 py-1 text-green-600 border border-green-600 hover:bg-green-50 rounded transition-colors">
                            Activate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Staff Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-slate-900">Add Staff Account</h3>
                <button onClick={() => setShowAddModal(false)} className="p-1 hover:bg-slate-100 rounded">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form className="p-6 space-y-4">
                <div>
                  <label className="block text-slate-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-2">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Enter username"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-2">
                    Temporary Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Enter temporary password"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-2">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  >
                    <option value="Staff">Staff</option>
                  </select>
                  <p className="text-slate-500 mt-1">Only staff accounts can be created via UI</p>
                </div>
                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowAddModal(false);
                    }}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
                  >
                    Create Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
