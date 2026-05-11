import { useEffect, useState } from 'react';
import Layout from './Layout';
import { User } from '../types';
import { Plus, AlertCircle, X, KeyRound } from 'lucide-react';
import api from '../api/axios';
import { usePagination } from '../hooks/usePagination';
import Pagination from './Pagination';

interface UserManagementProps {
  user: User;
  onLogout: () => void;
  onCurrentUserUpdated?: (user: User) => void;
}

interface StaffUser {
  id: number;
  fullName: string;
  username: string;
  email: string;
  role: 'Admin' | 'Staff';
  status: 'Active' | 'Inactive';
  dateCreated: string;
  lastLogin: string;
}

const emptyForm = { fullName: '', email: '', username: '', password: '', role: 'staff' as 'staff' | 'admin' };

export default function UserManagement({ user, onLogout, onCurrentUserUpdated }: UserManagementProps) {
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<StaffUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  // Reset password modal
  const [resetTarget, setResetTarget] = useState<StaffUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const fetchUsers = async () => {
    setFetchError(null);
    try {
      const res = await api.get('/users');
      setStaffUsers(Array.isArray(res.data) ? res.data : []);
    } catch (error: any) {
      setFetchError(
        error.code === 'ERR_NETWORK'
          ? 'Cannot reach the backend. Make sure the Laravel server is running.'
          : (error.response?.data?.message ?? 'Unable to fetch users.')
      );
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const { paged, page, totalPages, setPage, total } = usePagination(staffUsers);

  const resetForm = () => { setFormData(emptyForm); setEditingUser(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);
    try {
      if (editingUser) {
        const payload: any = {
          full_name: formData.fullName,
          email: formData.email,
          username: formData.username,
        };
        if (formData.password) payload.password = formData.password;
        const res = await api.put(`/users/${editingUser.id}`, payload);
        if (editingUser.id.toString() === user.id) {
          onCurrentUserUpdated?.({ ...user, fullName: res.data.fullName, username: res.data.username });
        }
      } else {
        await api.post('/users', {
          full_name: formData.fullName,
          email: formData.email,
          username: formData.username,
          password: formData.password,
          role: formData.role,
        });
      }
      setShowModal(false);
      resetForm();
      await fetchUsers();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to save account.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (su: StaffUser, status: 'Active' | 'Inactive') => {
    try {
      await api.patch(`/users/${su.id}/status`, { status });
      await fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTarget) return;
    setResetLoading(true);
    setResetError('');
    try {
      await api.patch(`/users/${resetTarget.id}/reset-password`, { password: newPassword });
      setResetTarget(null);
      setNewPassword('');
    } catch (err: any) {
      setResetError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setResetLoading(false);
    }
  };

  const inputCls = 'w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm';
  const labelCls = 'block text-slate-700 text-sm font-medium mb-1';

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-slate-900 mb-2">User Management – Staff Accounts</h2>
            <p className="text-slate-600">Manage library staff accounts and permissions.</p>
          </div>
          <button onClick={() => { resetForm(); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> Add Staff Account
          </button>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-amber-800 text-sm">Only the Librarian (Admin) can create or deactivate staff accounts. Staff password resets must be done by the Admin.</p>
        </div>

        {fetchError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">{fetchError}</div>
            <button onClick={fetchUsers} className="underline">Retry</button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Full Name','Email','Username','Role','Status','Date Created','Last Login','Actions'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-slate-700 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {paged.map(su => {
                const isInactive = su.status === 'Inactive';
                return (
                  <tr key={su.id} className={isInactive ? 'bg-red-50 opacity-70' : 'hover:bg-slate-50'}>
                    <td className="px-5 py-4 font-medium text-slate-900">{su.fullName}</td>
                    <td className="px-5 py-4 text-slate-600">{su.email}</td>
                    <td className="px-5 py-4 text-slate-900">{su.username}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 rounded text-xs border ${su.role === 'Admin' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
                        {su.role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 rounded text-xs border ${isInactive ? 'bg-red-100 text-red-700 border-red-200' : 'bg-green-100 text-green-700 border-green-200'}`}>
                        {su.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{su.dateCreated}</td>
                    <td className="px-5 py-4 text-slate-600">{su.lastLogin}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button onClick={() => {
                          setEditingUser(su);
                          setFormData({ fullName: su.fullName, email: su.email, username: su.username, password: '', role: su.role.toLowerCase() as 'staff' | 'admin' });
                          setShowModal(true);
                        }} className="px-3 py-1 text-blue-600 border border-blue-600 hover:bg-blue-50 rounded text-xs transition-colors">
                          Edit
                        </button>
                        {/* Reset Password — available for all users */}
                        <button onClick={() => { setResetTarget(su); setNewPassword(''); setResetError(''); }}
                          className="px-3 py-1 text-orange-600 border border-orange-500 hover:bg-orange-50 rounded text-xs transition-colors flex items-center gap-1">
                          <KeyRound className="w-3 h-3" /> Reset PW
                        </button>
                        {su.role !== 'Admin' && (
                          isInactive ? (
                            <button onClick={() => handleStatusChange(su, 'Active')}
                              className="px-3 py-1 text-green-600 border border-green-600 hover:bg-green-50 rounded text-xs transition-colors">
                              Activate
                            </button>
                          ) : (
                            <button onClick={() => handleStatusChange(su, 'Inactive')}
                              className="px-3 py-1 text-red-600 border border-red-600 hover:bg-red-50 rounded text-xs transition-colors">
                              Deactivate
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {staffUsers.length === 0 && (
                <tr><td colSpan={8} className="px-5 py-10 text-center text-slate-400">No users found.</td></tr>
              )}
            </tbody>
          </table>
          <Pagination page={page} totalPages={totalPages} total={total} onPage={setPage} />
        </div>

        {/* Add / Edit Modal — white */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center px-6 py-4 border-b">
                <h3 className="text-slate-900 font-bold text-lg">
                  {editingUser ? 'Edit Account' : 'Add Staff Account'}
                </h3>
                <button onClick={() => { setShowModal(false); resetForm(); setFormError(null); }}>
                  <X className="w-5 h-5 text-slate-400 hover:text-slate-700" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                <div>
                  <label className={labelCls}>Full Name <span className="text-red-500">*</span></label>
                  <input type="text" required value={formData.fullName} className={inputCls}
                    placeholder="Enter full name"
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Email <span className="text-red-500">*</span></label>
                  <input type="email" required value={formData.email} className={inputCls}
                    placeholder="Enter email address"
                    onChange={e => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Username <span className="text-red-500">*</span></label>
                  <input type="text" required value={formData.username} className={inputCls}
                    placeholder="Enter username"
                    onChange={e => setFormData({ ...formData, username: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>
                    {editingUser ? 'New Password (leave blank to keep current)' : 'Password'} {!editingUser && <span className="text-red-500">*</span>}
                  </label>
                  <input type="password" value={formData.password} className={inputCls}
                    required={!editingUser}
                    placeholder={editingUser ? 'Leave blank to keep current' : 'Enter password'}
                    onChange={e => setFormData({ ...formData, password: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Role <span className="text-red-500">*</span></label>
                  <select value={formData.role} disabled={!!editingUser} className={inputCls + ' disabled:bg-slate-100'}
                    onChange={e => setFormData({ ...formData, role: e.target.value as 'staff' | 'admin' })}>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                  {editingUser && <p className="text-slate-400 text-xs mt-1">Role cannot be changed after creation.</p>}
                </div>

                {formError && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /><span>{formError}</span>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowModal(false); resetForm(); setFormError(null); }}
                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-sm transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={isLoading}
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg text-sm transition-colors">
                    {isLoading ? 'Saving...' : (editingUser ? 'Save Changes' : 'Create Account')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reset Password Modal */}
        {resetTarget && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl">
              <div className="flex justify-between items-center px-6 py-4 border-b">
                <h3 className="text-slate-900 font-bold text-lg">Reset Password</h3>
                <button onClick={() => setResetTarget(null)}><X className="w-5 h-5 text-slate-400 hover:text-slate-700" /></button>
              </div>
              <form onSubmit={handleResetPassword} className="px-6 py-5 space-y-4">
                <p className="text-sm text-slate-600">
                  Setting new password for <span className="font-semibold text-slate-900">{resetTarget.fullName}</span> ({resetTarget.role})
                </p>
                <div>
                  <label className={labelCls}>New Password <span className="text-red-500">*</span></label>
                  <input type="password" required minLength={6} value={newPassword} className={inputCls}
                    placeholder="Enter new password"
                    onChange={e => setNewPassword(e.target.value)} />
                </div>
                {resetError && <p className="text-red-600 text-sm">{resetError}</p>}
                <div className="flex gap-3">
                  <button type="button" onClick={() => setResetTarget(null)}
                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-sm transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={resetLoading}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg text-sm transition-colors">
                    {resetLoading ? 'Resetting...' : 'Reset Password'}
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
