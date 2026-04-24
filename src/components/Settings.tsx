import { useEffect, useState } from 'react';
import Layout from './Layout';
import { User } from '../App';
import { Save, Info } from 'lucide-react';
import api from '../api/axios';

interface SettingsProps {
  user: User;
  onLogout: () => void;
}

export default function Settings({ user, onLogout }: SettingsProps) {
  const [settings, setSettings] = useState({
    loanDuration: '7',
    fineRate: '5',
    openTime: '08:00',
    closeTime: '17:00',
    emailNotifications: true,
    smsNotifications: false,
    libraryPolicies: ''
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/settings').then((res) => {
      const payload = res.data;
      setSettings({
        loanDuration: String(payload.loan_duration ?? 7),
        fineRate: String(payload.fine_rate ?? 5),
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
      loan_duration: Number(settings.loanDuration),
      fine_rate: Number(settings.fineRate),
      open_time: settings.openTime,
      close_time: settings.closeTime,
      email_notifications: settings.emailNotifications,
      sms_notifications: settings.smsNotifications,
      library_policies: settings.libraryPolicies,
    }).then(() => {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }).catch(() => alert('Failed to save settings.'));
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h2 className="text-slate-900 mb-2">Settings</h2>
          <p className="text-slate-600">Configure system settings and library policies.</p>
        </div>

        {saved && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <Info className="w-5 h-5 text-green-600" />
            <p className="text-green-900">Settings saved successfully!</p>
          </div>
        )}

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
              <p>Last Updated: February 10, 2025</p>
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
      </div>
    </Layout>
  );
}
