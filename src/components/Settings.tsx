import { useEffect, useState } from 'react';
import Layout from './Layout';
import { User } from '../types';
import { Save, Plus, Trash2, Edit, X } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'sonner';

interface SettingsProps {
  user: User;
  onLogout: () => void;
}

export default function Settings({ user, onLogout }: SettingsProps) {
  const [settings, setSettings] = useState({
    loanDuration: '7',
    fineRate: '5',
    damagedFine: '100',
    lostFine: '500',
    openTime: '08:00',
    closeTime: '17:00',
    emailNotifications: true,
    smsNotifications: false,
    libraryPolicies: ''
  });

  const [saved, setSaved] = useState(false);
  interface Program { id: number; code: string; name: string; total_years: number; }
  const [programs, setPrograms]       = useState<Program[]>([]);
  const [progForm, setProgForm]       = useState({ code: '', name: '', total_years: 4 });
  const [editingProg, setEditingProg] = useState<Program | null>(null);
  const [showProgModal, setShowProgModal] = useState(false);
  const [progError, setProgError]     = useState('');

  const fetchPrograms = () => api.get('/programs').then(r => setPrograms(r.data)).catch(console.error);

  useEffect(() => { fetchPrograms(); }, []);

  useEffect(() => {
    api.get('/settings').then((res) => {
      const payload = res.data;
      setSettings({
        loanDuration: String(payload.loan_duration ?? 7),
        fineRate: String(payload.fine_rate ?? 5),
        damagedFine: String(payload.damaged_fine ?? 100),
        lostFine: String(payload.lost_fine ?? 500),
        openTime: String(payload.open_time ?? '08:00'),
        closeTime: String(payload.close_time ?? '17:00'),
        emailNotifications: Boolean(payload.email_notifications),
        smsNotifications: Boolean(payload.sms_notifications),
        libraryPolicies: payload.library_policies ?? '',
      });
    }).catch(console.error);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    api.put('/settings', {
      loan_duration:        Number(settings.loanDuration),
      fine_rate:            Number(settings.fineRate),
      damaged_fine:         Number(settings.damagedFine),
      lost_fine:            Number(settings.lostFine),
      open_time:            settings.openTime,
      close_time:           settings.closeTime,
      email_notifications:  settings.emailNotifications,
      sms_notifications:    settings.smsNotifications,
      library_policies:     settings.libraryPolicies,
    }).then(() => {
      toast.success('Settings saved successfully!');
    }).catch(() => toast.error('Failed to save settings.'));
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h2 className="text-slate-900 mb-2">Settings</h2>
          <p className="text-slate-600">Configure system settings and library policies.</p>
        </div>



        {/* Settings Form */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* Borrowing Rules */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="text-slate-900 mb-4">Borrowing Rules</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="loanDuration" className="block text-slate-700 mb-2">
                  Loan Duration (days)
                </label>
                <input
                  id="loanDuration"
                  type="number"
                  min="1"
                  value={settings.loanDuration}
                  onChange={(e) => setSettings({ ...settings, loanDuration: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <p className="text-slate-500 mt-1">Default number of days for book borrowing</p>
              </div>

              <div>
                <label htmlFor="fineRate" className="block text-slate-700 mb-2">
                  Fine Rate per Day (₱)
                </label>
                <input
                  id="fineRate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={settings.fineRate}
                  onChange={(e) => setSettings({ ...settings, fineRate: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <p className="text-slate-500 mt-1">Amount charged per day for overdue books</p>
              </div>
            </div>
          </div>

          {/* Penalty Fines */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="text-slate-900 mb-4">Penalty Fines</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="damagedFine" className="block text-slate-700 mb-2">
                  Damaged Book Fine (₱)
                </label>
                <input
                  id="damagedFine"
                  type="number"
                  min="0"
                  step="0.01"
                  value={settings.damagedFine}
                  onChange={(e) => setSettings({ ...settings, damagedFine: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <p className="text-slate-500 mt-1">One-time fee when a book is returned damaged</p>
              </div>
              <div>
                <label htmlFor="lostFine" className="block text-slate-700 mb-2">
                  Lost Book Fine (₱)
                </label>
                <input
                  id="lostFine"
                  type="number"
                  min="0"
                  step="0.01"
                  value={settings.lostFine}
                  onChange={(e) => setSettings({ ...settings, lostFine: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <p className="text-slate-500 mt-1">One-time fee when a book is reported lost</p>
              </div>
            </div>
          </div>

          {/* Library Hours */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="text-slate-900 mb-4">Library Hours</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="openTime" className="block text-slate-700 mb-2">
                  Opening Time
                </label>
                <input
                  id="openTime"
                  type="time"
                  value={settings.openTime}
                  onChange={(e) => setSettings({ ...settings, openTime: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label htmlFor="closeTime" className="block text-slate-700 mb-2">
                  Closing Time
                </label>
                <input
                  id="closeTime"
                  type="time"
                  value={settings.closeTime}
                  onChange={(e) => setSettings({ ...settings, closeTime: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
            <p className="text-slate-500 mt-4">These hours are for reference and display purposes</p>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="text-slate-900 mb-4">Notification Channels</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                <div>
                  <p className="text-slate-900">Email Notifications</p>
                  <p className="text-slate-600">Send overdue and fine reminders via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                <div>
                  <p className="text-slate-900">SMS Notifications</p>
                  <p className="text-slate-600">Send notifications via SMS for due and overdue alerts</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.smsNotifications}
                    onChange={(e) => setSettings({ ...settings, smsNotifications: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
            <h3 className="text-slate-900 mb-4">Library Policies</h3>
            <textarea
              value={settings.libraryPolicies}
              onChange={(e) => setSettings({ ...settings, libraryPolicies: e.target.value })}
              className="w-full min-h-36 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Enter library policies..."
            />
          </div>

          {/* System Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-blue-900 mb-2">System Information</h3>
            <div className="space-y-2 text-blue-700">
              <p>Version: 1.0.0</p>
              <p>Last Updated: February 10, 2026</p>
              <p>Legacy College of Compostela - Library Management System</p>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Settings
            </button>
          </div>
        </form>

        {/* ── Program Management ─────────────────────────────────────── */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-slate-900">Program Management</h3>
            <button onClick={() => { setProgForm({ code: '', name: '', total_years: 4 }); setEditingProg(null); setProgError(''); setShowProgModal(true); }}
              className="flex items-center gap-2 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm transition-colors">
              <Plus className="w-4 h-4" /> Add Program
            </button>
          </div>
          <p className="text-slate-500 text-sm mb-4">Degree programs available in the attendance form. Year levels are generated automatically from the program duration.</p>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-2 text-left text-slate-700">Code</th>
                <th className="px-4 py-2 text-left text-slate-700">Program Name</th>
                <th className="px-4 py-2 text-center text-slate-700">Years</th>
                <th className="px-4 py-2 text-center text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {programs.map(p => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono font-medium">{p.code}</td>
                  <td className="px-4 py-3 text-slate-700">{p.name}</td>
                  <td className="px-4 py-3 text-center">{p.total_years}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => { setEditingProg(p); setProgForm({ code: p.code, name: p.name, total_years: p.total_years }); setProgError(''); setShowProgModal(true); }}
                        className="text-blue-600 hover:text-blue-800"><Edit className="w-4 h-4" /></button>
                      <button onClick={async () => { if (!confirm(`Delete ${p.code}?`)) return; await api.delete(`/programs/${p.id}`); fetchPrograms(); }}
                        className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {programs.length === 0 && <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">No programs yet.</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Program Modal */}
        {showProgModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center px-6 py-4 border-b">
                <h3 className="font-bold text-slate-900">{editingProg ? 'Edit Program' : 'Add Program'}</h3>
                <button onClick={() => setShowProgModal(false)}><X className="w-5 h-5 text-slate-400 hover:text-slate-700" /></button>
              </div>
              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Code <span className="text-red-500">*</span></label>
                  <input value={progForm.code} onChange={e => setProgForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                    placeholder="e.g. BSIT" maxLength={20}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm font-mono" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Program Name <span className="text-red-500">*</span></label>
                  <input value={progForm.name} onChange={e => setProgForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Bachelor of Science in Information Technology"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Duration (Years) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    min="1"
                    value={progForm.total_years}
                    onChange={e => {
                      const val = Math.max(1, Number(e.target.value));
                      setProgForm(f => ({ ...f, total_years: val }));
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                  />
                  <p className="text-slate-400 text-xs mt-1">Year levels will be auto-generated based on the number of years.</p>
                </div>
                {progError && <p className="text-red-600 text-sm">{progError}</p>}
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowProgModal(false)}
                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg text-sm transition-colors">Cancel</button>
                  <button onClick={async () => {
                    if (!progForm.code || !progForm.name) { setProgError('Code and name are required.'); return; }
                    try {
                      if (editingProg) await api.put(`/programs/${editingProg.id}`, progForm);
                      else await api.post('/programs', progForm);
                      setShowProgModal(false);
                      fetchPrograms();
                    } catch (err: any) { setProgError(err.response?.data?.message || 'Failed to save.'); }
                  }} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg text-sm transition-colors">
                    {editingProg ? 'Save Changes' : 'Add Program'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}