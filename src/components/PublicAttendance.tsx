import { useState } from 'react';
import api from '../api/axios';
import { QRCodeSVG } from 'qrcode.react';
import logoImage from '../assets/logo.png';

const COURSES = ['BSIT', 'BSBA', 'BSED', 'BSCRIM'];
const YEARS   = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const EMPTY   = { id_number: '', name: '', course: '', year: '', purpose: '' };
const ATTENDANCE_URL = `${window.location.origin}/LccLibraryAttendance`;

export default function PublicAttendance() {
  const [form, setForm]       = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState('');
  const [showQR, setShowQR]   = useState(false);

  const set = (key: keyof typeof EMPTY) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/attendance', form);
      setDone(true);
      setForm(EMPTY);
      setTimeout(() => setDone(false), 5000);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.response?.data?.errors
        ?? '❌ Could not save attendance. Make sure the server is running.';
      setError(typeof msg === 'object' ? Object.values(msg).flat().join(' ') : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md space-y-4">

        {/* QR Code toggle button */}
        <div className="text-center">
          <button onClick={() => setShowQR(v => !v)}
            className="text-sm text-[#1B764C] underline hover:text-[#016937]">
            {showQR ? 'Hide QR Code' : '📱 Show QR Code to scan with phone'}
          </button>
        </div>

        {/* QR Code panel */}
        {showQR && (
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center gap-3">
            <p className="text-sm text-gray-600 text-center">Scan this QR code with any phone camera to open the attendance form</p>
            <QRCodeSVG value={ATTENDANCE_URL} size={200} level="H" includeMargin />
            <p className="text-xs text-gray-400 break-all text-center">{ATTENDANCE_URL}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md space-y-4">
          {/* Logo + Header */}
          <div className="flex flex-col items-center gap-2 pb-2 border-b border-gray-100">
            <img src={logoImage} alt="Legacy College Logo" className="w-20 h-20 object-contain" />
            <div className="text-center">
              <h2 className="text-xl font-bold text-[#1B764C]">Library Attendance</h2>
              <p className="text-sm text-gray-500">Legacy College of Compostela</p>
            </div>
          </div>

          {done && (
            <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 text-center text-sm">
              ✅ Attendance recorded successfully!
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-3 text-sm">{error}</div>
          )}

          <div className="space-y-3">
            <input value={form.id_number} onChange={set('id_number')} placeholder="ID Number" required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B764C]" />
            <input value={form.name} onChange={set('name')} placeholder="Full Name" required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B764C]" />
            <select value={form.course} onChange={set('course')} required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B764C]">
              <option value="">Select Course</option>
              {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={form.year} onChange={set('year')} required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B764C]">
              <option value="">Select Year Level</option>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <input value={form.purpose} onChange={set('purpose')} placeholder="Purpose of Visit" required
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B764C]" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-[#1B764C] text-white py-2 rounded-lg hover:bg-[#016937] disabled:opacity-60 font-medium transition-colors">
            {loading ? 'Submitting...' : 'Submit Attendance'}
          </button>
        </form>
      </div>
    </div>
  );
}
