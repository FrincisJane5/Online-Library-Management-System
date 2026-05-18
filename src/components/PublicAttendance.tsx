import { useState, useEffect } from 'react';
import api from '../api/axios';
import logoImage from '../assets/logo.png';

interface Program { id: number; code: string; name: string; year_levels: string[]; }

const PURPOSES = [
  'Research',
  'Borrowing / Returning Books',
  'Reading / Studying',
  'Internet / Computer Use',
  'Group Study',
  'Thesis / Capstone Work',
  'Others',
];

const SUFFIXES = ['', 'Jr.', 'Sr.', 'II', 'III', 'IV', 'V'];

const EMPTY = {
  id_number: '',
  first_name: '',
  middle_name: '',
  last_name: '',
  suffix: '',
  email: '',
  phone: '',
  course: '',
  year: '',
  purpose: '',
};

// Only letters, spaces, hyphens, apostrophes
const nameRegex = /^[a-zA-ZÀ-ÿ\s'\-]+$/;

export default function PublicAttendance() {
  const [form, setForm]         = useState(EMPTY);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading]   = useState(false);
  const [done, setDone]         = useState(false);
  const [error, setError]       = useState('');
  const [idError, setIdError]   = useState('');
  const [nameErrors, setNameErrors] = useState({ first_name: '', middle_name: '', last_name: '' });

  useEffect(() => {
    api.get('/programs').then(r => setPrograms(r.data)).catch(console.error);
  }, []);

  const selectedProgram = programs.find(p => p.code === form.course);
  const yearLevels = selectedProgram?.year_levels ?? [];

  const checkIdNumber = async () => {
    if (!form.id_number) return;
    try {
      const res = await api.get(`/attendance/check-id?id_number=${encodeURIComponent(form.id_number)}`);
      setIdError(res.data.exists ? '⚠️ This ID number has already been recorded today.' : '');
    } catch {
      setIdError('');
    }
  };

  const validateName = (key: 'first_name' | 'middle_name' | 'last_name', value: string) => {
    if (!value) return '';
    return nameRegex.test(value) ? '' : 'Letters only (no numbers or special characters)';
  };

  const handleNameChange = (key: 'first_name' | 'middle_name' | 'last_name') =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setForm(f => ({ ...f, [key]: value }));
      setNameErrors(prev => ({ ...prev, [key]: validateName(key, value) }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (idError) return;
    // Validate names before submit
    const firstErr = validateName('first_name', form.first_name);
    const midErr   = validateName('middle_name', form.middle_name);
    const lastErr  = validateName('last_name', form.last_name);
    if (firstErr || midErr || lastErr) {
      setNameErrors({ first_name: firstErr, middle_name: midErr, last_name: lastErr });
      return;
    }
    setLoading(true);
    setError('');
    try {
      const fullName = [form.first_name, form.middle_name, form.last_name, form.suffix]
        .map(s => s.trim()).filter(Boolean).join(' ');
      await api.post('/attendance', {
        id_number: form.id_number, first_name: form.first_name,
        middle_name: form.middle_name, last_name: form.last_name,
        suffix: form.suffix, name: fullName,
        email: form.email, phone: form.phone,
        course: form.course, year: form.year, purpose: form.purpose,
      });
      setDone(true);
      setForm(EMPTY);
      setIdError('');
      setNameErrors({ first_name: '', middle_name: '', last_name: '' });
      setTimeout(() => setDone(false), 5000);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.response?.data?.errors
        ?? '❌ Could not save attendance. Make sure the server is running.';
      setError(typeof msg === 'object' ? Object.values(msg).flat().join(' ') : msg);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B764C] text-sm";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-md space-y-5">
          {/* Logo + Header */}
          <div className="flex flex-col items-center gap-2 pb-3 border-b border-gray-100">
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

          {/* ID Number — digits only, format YYYY-NNNNN */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">ID Number <span className="text-red-500">*</span></label>
            <input
              value={form.id_number}
              onChange={e => {
                // Allow digits and one hyphen only, max 10 chars
                const val = e.target.value.replace(/[^0-9\-]/g, '').slice(0, 10);
                setForm(f => ({ ...f, id_number: val }));
                setIdError('');
              }}
              onBlur={checkIdNumber}
              placeholder="e.g. 2024-00001"
              required
              maxLength={10}
              inputMode="numeric"
              className={`${inputCls} ${idError ? 'border-red-400' : ''}`}
            />
            {idError
              ? <p className="text-red-500 text-xs mt-1">{idError}</p>
              : <p className="text-gray-400 text-xs mt-1">Numbers and hyphen only (e.g. 2024-00001)</p>
            }
          </div>

          {/* First + Last name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">First Name <span className="text-red-500">*</span></label>
              <input
                value={form.first_name}
                onChange={handleNameChange('first_name')}
                placeholder="e.g. Juan" required maxLength={50}
                className={`${inputCls} ${nameErrors.first_name ? 'border-red-400' : ''}`}
              />
              {nameErrors.first_name && <p className="text-red-500 text-xs mt-1">{nameErrors.first_name}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Last Name <span className="text-red-500">*</span></label>
              <input
                value={form.last_name}
                onChange={handleNameChange('last_name')}
                placeholder="e.g. Dela Cruz" required maxLength={50}
                className={`${inputCls} ${nameErrors.last_name ? 'border-red-400' : ''}`}
              />
              {nameErrors.last_name && <p className="text-red-500 text-xs mt-1">{nameErrors.last_name}</p>}
            </div>
          </div>

          {/* Middle name + Suffix */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Middle Name <span className="text-gray-400">(optional)</span></label>
              <input
                value={form.middle_name}
                onChange={handleNameChange('middle_name')}
                placeholder="e.g. Santos" maxLength={50}
                className={`${inputCls} ${nameErrors.middle_name ? 'border-red-400' : ''}`}
              />
              {nameErrors.middle_name && <p className="text-red-500 text-xs mt-1">{nameErrors.middle_name}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Suffix <span className="text-gray-400">(optional)</span></label>
              <select
                value={form.suffix}
                onChange={e => setForm(f => ({ ...f, suffix: e.target.value }))}
                className={inputCls}
              >
                {SUFFIXES.map(s => <option key={s} value={s}>{s || '— None —'}</option>)}
              </select>
            </div>
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email <span className="text-red-500">*</span></label>
              <input type="email" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="e.g. juan@email.com" required maxLength={100} className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Phone Number <span className="text-red-500">*</span></label>
              <input
                type="tel" value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 11) }))}
                placeholder="e.g. 09123456789" required
                maxLength={11} inputMode="numeric"
                pattern="\d{11}" title="Must be exactly 11 digits"
                className={inputCls}
              />
              <p className={`text-xs mt-1 ${form.phone.length === 11 ? 'text-green-600' : 'text-gray-400'}`}>
                {form.phone.length}/11 digits
              </p>
            </div>
          </div>

          {/* Course + Year Level */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Course <span className="text-red-500">*</span></label>
              <select value={form.course}
                onChange={e => setForm(f => ({ ...f, course: e.target.value, year: '' }))}
                required className={inputCls}>
                <option value="">Select Course</option>
                {programs.map(p => <option key={p.code} value={p.code}>{p.code} — {p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Year Level <span className="text-red-500">*</span></label>
              <select value={form.year}
                onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
                required disabled={!selectedProgram} className={`${inputCls} disabled:opacity-50`}>
                <option value="">Select Year Level</option>
                {yearLevels.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Purpose of Visit <span className="text-red-500">*</span></label>
            <select value={form.purpose}
              onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))}
              required className={inputCls}>
              <option value="">Select Purpose</option>
              {PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <button type="submit" disabled={loading || !!idError || !!nameErrors.first_name || !!nameErrors.last_name || !!nameErrors.middle_name}
            className="w-full bg-[#1B764C] text-white py-2.5 rounded-lg hover:bg-[#016937] disabled:opacity-60 font-medium transition-colors text-sm">
            {loading ? 'Submitting...' : 'Submit Attendance'}
          </button>
        </form>
      </div>
    </div>
  );
}
