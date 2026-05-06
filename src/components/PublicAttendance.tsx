import { useState } from 'react';
import axios from 'axios';
import logoImage from '../assets/logo.png';

const COURSES = ['BSIT', 'BSBA', 'BSED', 'BSCRIM'];
const YEARS   = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const EMPTY   = { id_number: '', name: '', email: '', phone: '', course: '', year: '', purpose: '' };

export default function PublicAttendance() {
  const [form, setForm]       = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState('');

  const set = (key: keyof typeof EMPTY) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('http://127.0.0.1:8000/api/attendance', form, {
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      });
      setDone(true);
      setForm(EMPTY);
      setTimeout(() => setDone(false), 5000);
    } catch (err: any) {
      const msg = err?.response?.data?.message
        ?? err?.response?.data?.errors
        ?? '❌ Could not save attendance. Make sure the server is running.';
      setError(typeof msg === 'object' ? Object.values(msg).flat().join(' ') : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md w-full max-w-md space-y-4">

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
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <input value={form.id_number} onChange={set('id_number')} placeholder="ID Number" required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B764C]" />

          <input value={form.name} onChange={set('name')} placeholder="Full Name" required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B764C]" />

          <input value={form.phone} onChange={set('phone')} placeholder="Contact Number" required
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B764C]" />

          <input value={form.email} onChange={set('email')} type="email" placeholder="Gmail Address (optional)"
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
  );
}
