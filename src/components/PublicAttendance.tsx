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

const SUFFIXES = ['', 'Jr.', 'Sr.', 'II', 'III'];

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

const nameRegex = /^[a-zA-ZÀ-ÿ\s'\-]+$/;

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

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

  const inputCls = (hasError?: boolean) =>
    `w-full px-3 py-2.5 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#1B764C] focus:border-transparent ${
      hasError ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'
    }`;

  const sectionCls = "space-y-4";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f7f4] to-gray-100 p-3 sm:p-6">
      <div className="w-full max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg overflow-hidden">

          {/* Header Banner */}
          <div className="bg-[#1B764C] px-6 py-6 flex items-center gap-4">
            <img src={logoImage} alt="Legacy College Logo" className="w-16 h-16 object-contain flex-shrink-0" />
            <div>
              <h1 className="text-white text-xl font-bold leading-tight">Library Student Record Form</h1>
              <p className="text-white/70 text-sm mt-0.5">Legacy College of Compostela</p>
            </div>
          </div>

          <div className="p-5 sm:p-7 space-y-6">

            {done && (
              <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3.5 text-center text-sm font-medium">
                ✅ Attendance recorded successfully! Thank you.
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3.5 text-sm">{error}</div>
            )}

            {/* Section: ID */}
            <div className={sectionCls}>
              <div className="flex items-center gap-2 pb-1 border-b border-gray-100">
                <span className="w-5 h-5 rounded-full bg-[#1B764C] text-white text-xs flex items-center justify-center font-bold flex-shrink-0">1</span>
                <h3 className="text-sm font-semibold text-[#4B4C58]">Student ID</h3>
              </div>
              <div>
                <FieldLabel required>ID Number</FieldLabel>
                <input
                  value={form.id_number}
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setForm(f => ({ ...f, id_number: val }));
                    setIdError('');
                  }}
                  onBlur={() => {
                    if (form.id_number && (form.id_number.length < 4 || parseInt(form.id_number.slice(0, 4)) < 2022)) {
                      setIdError('ID number must start with 2022 or later.');
                    } else {
                      checkIdNumber();
                    }
                  }}
                  placeholder="e.g. 2022000000"
                  required maxLength={10} inputMode="numeric"
                  className={inputCls(!!idError)}
                />
                {idError
                  ? <p className="text-red-500 text-xs mt-1.5">{idError}</p>
                  : <p className="text-gray-400 text-xs mt-1.5">10-digit number starting with 2022 or later</p>
                }
              </div>
            </div>

            {/* Section: Name */}
            <div className={sectionCls}>
              <div className="flex items-center gap-2 pb-1 border-b border-gray-100">
                <span className="w-5 h-5 rounded-full bg-[#1B764C] text-white text-xs flex items-center justify-center font-bold flex-shrink-0">2</span>
                <h3 className="text-sm font-semibold text-[#4B4C58]">Full Name</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <FieldLabel required>First Name</FieldLabel>
                  <input value={form.first_name} onChange={handleNameChange('first_name')}
                    placeholder="e.g. Juan" required maxLength={50}
                    className={inputCls(!!nameErrors.first_name)} />
                  {nameErrors.first_name && <p className="text-red-500 text-xs mt-1.5">{nameErrors.first_name}</p>}
                </div>
                <div>
                  <FieldLabel required>Last Name</FieldLabel>
                  <input value={form.last_name} onChange={handleNameChange('last_name')}
                    placeholder="e.g. Dela Cruz" required maxLength={50}
                    className={inputCls(!!nameErrors.last_name)} />
                  {nameErrors.last_name && <p className="text-red-500 text-xs mt-1.5">{nameErrors.last_name}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <FieldLabel>Middle Name <span className="text-gray-400 font-normal normal-case">(optional)</span></FieldLabel>
                  <input value={form.middle_name} onChange={handleNameChange('middle_name')}
                    placeholder="e.g. Santos" maxLength={50}
                    className={inputCls(!!nameErrors.middle_name)} />
                  {nameErrors.middle_name && <p className="text-red-500 text-xs mt-1.5">{nameErrors.middle_name}</p>}
                </div>
                <div>
                  <FieldLabel>Suffix <span className="text-gray-400 font-normal normal-case">(optional)</span></FieldLabel>
                  <select value={form.suffix} onChange={e => setForm(f => ({ ...f, suffix: e.target.value }))}
                    className={inputCls()}>
                    {SUFFIXES.map(s => <option key={s} value={s}>{s || '— None —'}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Section: Contact */}
            <div className={sectionCls}>
              <div className="flex items-center gap-2 pb-1 border-b border-gray-100">
                <span className="w-5 h-5 rounded-full bg-[#1B764C] text-white text-xs flex items-center justify-center font-bold flex-shrink-0">3</span>
                <h3 className="text-sm font-semibold text-[#4B4C58]">Contact Information</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <FieldLabel required>Email Address</FieldLabel>
                  <input type="email" value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="e.g. juan@email.com" required maxLength={100}
                    className={inputCls()} />
                </div>
                <div>
                  <FieldLabel required>Phone Number</FieldLabel>
                  <input type="tel" value={form.phone}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                      setForm(f => ({ ...f, phone: val }));
                    }}
                    placeholder="e.g. 09123456789" required maxLength={11} inputMode="numeric"
                    pattern="09\d{9}" title="Must start with 09 and be exactly 11 digits"
                    className={inputCls(form.phone.length > 0 && (!form.phone.startsWith('09') || form.phone.length !== 11))} />
                  <p className={`text-xs mt-1.5 ${form.phone.length === 11 && form.phone.startsWith('09') ? 'text-green-600' : 'text-gray-400'}`}>
                    {form.phone.length}/11 digits{form.phone.length > 0 && !form.phone.startsWith('09') ? ' — must start with 09' : ''}
                  </p>
                </div>
              </div>
            </div>

            {/* Section: Academic */}
            <div className={sectionCls}>
              <div className="flex items-center gap-2 pb-1 border-b border-gray-100">
                <span className="w-5 h-5 rounded-full bg-[#1B764C] text-white text-xs flex items-center justify-center font-bold flex-shrink-0">4</span>
                <h3 className="text-sm font-semibold text-[#4B4C58]">Academic Information</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <FieldLabel required>Course</FieldLabel>
                  <select value={form.course}
                    onChange={e => setForm(f => ({ ...f, course: e.target.value, year: '' }))}
                    required className={inputCls()}>
                    <option value="">Select Course</option>
                    {programs.map(p => <option key={p.code} value={p.code}>{p.code} — {p.name}</option>)}
                  </select>
                </div>
                <div>
                  <FieldLabel required>Year Level</FieldLabel>
                  <select value={form.year}
                    onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
                    required disabled={!selectedProgram} className={`${inputCls()} disabled:opacity-50 disabled:cursor-not-allowed`}>
                    <option value="">Select Year Level</option>
                    {yearLevels.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Section: Purpose */}
            <div className={sectionCls}>
              <div className="flex items-center gap-2 pb-1 border-b border-gray-100">
                <span className="w-5 h-5 rounded-full bg-[#1B764C] text-white text-xs flex items-center justify-center font-bold flex-shrink-0">5</span>
                <h3 className="text-sm font-semibold text-[#4B4C58]">Purpose of Visit</h3>
              </div>
              <div>
                <FieldLabel required>Why are you visiting the library today?</FieldLabel>
                <select value={form.purpose}
                  onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))}
                  required className={inputCls()}>
                  <option value="">Select Purpose</option>
                  {PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !!idError || !!nameErrors.first_name || !!nameErrors.last_name || !!nameErrors.middle_name}
              className="w-full bg-[#1B764C] text-white py-3 rounded-xl hover:bg-[#016937] disabled:opacity-60 disabled:cursor-not-allowed font-semibold transition-colors text-sm shadow-sm"
            >
              {loading ? 'Submitting...' : 'Submit Attendance'}
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}
