import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import logoImage from '../assets/logo.png';

interface Program { id: number; code: string; name: string; year_levels: string[]; }

const PURPOSES = [
  'Research', 'Borrowing / Returning Books', 'Reading / Studying',
  'Internet / Computer Use', 'Group Study', 'Thesis / Capstone Work', 'Others',
];
const SUFFIXES = ['', 'Jr.', 'Sr.', 'II', 'III'];
const EMPTY = { id_number: '', first_name: '', middle_name: '', last_name: '', suffix: '', email: '', phone: '', course: '', year: '', purpose: '' };
const nameRegex = /^[a-zA-ZÀ-ÿ\s'\-]+$/;

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
      {children}{required && <span className="text-red-500 ml-0.5">*</span>}
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
  const [idStatus, setIdStatus] = useState<'idle' | 'checking' | 'found' | 'new'>('idle');
  const [nameErrors, setNameErrors] = useState({ first_name: '', middle_name: '', last_name: '' });
  const lookupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    api.get('/programs').then(r => setPrograms(r.data)).catch(console.error);
  }, []);

  const selectedProgram = programs.find(p => p.code === form.course);
  const yearLevels = selectedProgram?.year_levels ?? [];

  // Auto-fill + duplicate check when ID reaches 10 digits
  const handleIdChange = (val: string) => {
    setForm(f => ({ ...f, id_number: val }));
    setIdError('');
    setIdStatus('idle');

    if (lookupTimer.current) clearTimeout(lookupTimer.current);

    if (val.length === 10) {
      if (parseInt(val.slice(0, 4)) < 2022) {
        setIdError('ID number must start with 2022 or later.');
        return;
      }
      setIdStatus('checking');
      lookupTimer.current = setTimeout(async () => {
        try {
          // Check duplicate first
          const dupRes = await api.get(`/attendance/check-id?id_number=${encodeURIComponent(val)}`);
          if (dupRes.data.exists) {
            setIdError('⚠️ This ID number has already been recorded today.');
            setIdStatus('idle');
            return;
          }
          // Auto-fill from previous record
          const lookupRes = await api.get(`/attendance/lookup?id_number=${encodeURIComponent(val)}`);
          if (lookupRes.data.found) {
            const d = lookupRes.data;
            // Parse name back into parts (best-effort)
            const nameParts = (d.name ?? '').trim().split(/\s+/);
            setForm(f => ({
              ...f,
              first_name:  d.first_name  ?? nameParts[0] ?? f.first_name,
              middle_name: d.middle_name ?? '',
              last_name:   d.last_name   ?? nameParts.slice(1).join(' ') ?? f.last_name,
              email:       d.email  ?? f.email,
              phone:       d.phone  ?? f.phone,
              course:      d.course ?? f.course,
              year:        d.year   ?? f.year,
            }));
            setIdStatus('found');
          } else {
            setIdStatus('new');
          }
        } catch {
          setIdStatus('idle');
        }
      }, 400);
    }
  };

  const validateName = (key: 'first_name' | 'middle_name' | 'last_name', value: string) =>
    value && !nameRegex.test(value) ? 'Letters only' : '';

  const handleNameChange = (key: 'first_name' | 'middle_name' | 'last_name') =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm(f => ({ ...f, [key]: e.target.value }));
      setNameErrors(p => ({ ...p, [key]: validateName(key, e.target.value) }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (idError) return;
    const errs = {
      first_name:  validateName('first_name',  form.first_name),
      middle_name: validateName('middle_name', form.middle_name),
      last_name:   validateName('last_name',   form.last_name),
    };
    if (errs.first_name || errs.middle_name || errs.last_name) { setNameErrors(errs); return; }

    setLoading(true); setError('');
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
      setIdError(''); setIdStatus('idle');
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

  const inp = (hasError?: boolean) =>
    `w-full px-3 py-2.5 border rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#1B764C] focus:border-transparent ${
      hasError ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white hover:border-gray-300'
    }`;

  const Section = ({ n, title }: { n: number; title: string }) => (
    <div className="flex items-center gap-2 pb-1 border-b border-gray-100">
      <span className="w-5 h-5 rounded-full bg-[#1B764C] text-white text-xs flex items-center justify-center font-bold flex-shrink-0">{n}</span>
      <h3 className="text-sm font-semibold text-[#4B4C58]">{title}</h3>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f7f4] to-gray-100 p-3 sm:p-6">
      <div className="w-full max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg overflow-hidden">

          {/* Header */}
          <div className="bg-[#1B764C] px-6 py-6 flex items-center gap-4">
            <img src={logoImage} alt="Logo" className="w-16 h-16 object-contain flex-shrink-0" />
            <div>
              <h1 className="text-white text-xl font-bold leading-tight">Library Attendance Form</h1>
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

            {/* 1. Student ID */}
            <div className="space-y-3">
              <Section n={1} title="Student ID" />
              <div>
                <Label required>ID Number</Label>
                <div className="relative">
                  <input
                    value={form.id_number}
                    onChange={e => handleIdChange(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="e.g. 2022000000"
                    required maxLength={10} inputMode="numeric"
                    className={inp(!!idError)}
                  />
                  {idStatus === 'checking' && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 animate-pulse">Looking up…</span>
                  )}
                  {idStatus === 'found' && !idError && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-green-600 font-medium">✓ Auto-filled</span>
                  )}
                </div>
                {idError
                  ? <p className="text-red-500 text-xs mt-1.5">{idError}</p>
                  : idStatus === 'new'
                    ? <p className="text-blue-500 text-xs mt-1.5">New student — please fill in your details below.</p>
                    : <p className="text-gray-400 text-xs mt-1.5">10-digit number starting with 2022 or later</p>
                }
              </div>
            </div>

            {/* 2. Full Name */}
            <div className="space-y-3">
              <Section n={2} title="Full Name" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label required>First Name</Label>
                  <input value={form.first_name} onChange={handleNameChange('first_name')}
                    placeholder="e.g. Juan" required maxLength={50} className={inp(!!nameErrors.first_name)} />
                  {nameErrors.first_name && <p className="text-red-500 text-xs mt-1.5">{nameErrors.first_name}</p>}
                </div>
                <div>
                  <Label required>Last Name</Label>
                  <input value={form.last_name} onChange={handleNameChange('last_name')}
                    placeholder="e.g. Dela Cruz" required maxLength={50} className={inp(!!nameErrors.last_name)} />
                  {nameErrors.last_name && <p className="text-red-500 text-xs mt-1.5">{nameErrors.last_name}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label>Middle Name <span className="text-gray-400 font-normal normal-case">(optional)</span></Label>
                  <input value={form.middle_name} onChange={handleNameChange('middle_name')}
                    placeholder="e.g. Santos" maxLength={50} className={inp(!!nameErrors.middle_name)} />
                  {nameErrors.middle_name && <p className="text-red-500 text-xs mt-1.5">{nameErrors.middle_name}</p>}
                </div>
                <div>
                  <Label>Suffix <span className="text-gray-400 font-normal normal-case">(optional)</span></Label>
                  <select value={form.suffix} onChange={e => setForm(f => ({ ...f, suffix: e.target.value }))} className={inp()}>
                    {SUFFIXES.map(s => <option key={s} value={s}>{s || '— None —'}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Contact */}
            <div className="space-y-3">
              <Section n={3} title="Contact Information" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label required>Email Address</Label>
                  <input type="email" value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="e.g. juan@email.com" required maxLength={100} className={inp()} />
                </div>
                <div>
                  <Label required>Phone Number</Label>
                  <input type="tel" value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, '').slice(0, 11) }))}
                    placeholder="e.g. 09123456789" required maxLength={11} inputMode="numeric"
                    pattern="09\d{9}" title="Must start with 09 and be exactly 11 digits"
                    className={inp(form.phone.length > 0 && (!form.phone.startsWith('09') || form.phone.length !== 11))} />
                  <p className={`text-xs mt-1.5 ${form.phone.length === 11 && form.phone.startsWith('09') ? 'text-green-600' : 'text-gray-400'}`}>
                    {form.phone.length}/11{form.phone.length > 0 && !form.phone.startsWith('09') ? ' — must start with 09' : ''}
                  </p>
                </div>
              </div>
            </div>

            {/* 4. Academic */}
            <div className="space-y-3">
              <Section n={4} title="Academic Information" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label required>Course</Label>
                  <select value={form.course}
                    onChange={e => setForm(f => ({ ...f, course: e.target.value, year: '' }))}
                    required className={inp()}>
                    <option value="">Select Course</option>
                    {programs.map(p => <option key={p.code} value={p.code}>{p.code} — {p.name}</option>)}
                  </select>
                </div>
                <div>
                  <Label required>Year Level</Label>
                  <select value={form.year}
                    onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
                    required disabled={!selectedProgram}
                    className={`${inp()} disabled:opacity-50 disabled:cursor-not-allowed`}>
                    <option value="">Select Year Level</option>
                    {yearLevels.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* 5. Purpose */}
            <div className="space-y-3">
              <Section n={5} title="Purpose of Visit" />
              <div>
                <Label required>Why are you visiting the library today?</Label>
                <select value={form.purpose}
                  onChange={e => setForm(f => ({ ...f, purpose: e.target.value }))}
                  required className={inp()}>
                  <option value="">Select Purpose</option>
                  {PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <button type="submit"
              disabled={loading || !!idError || !!nameErrors.first_name || !!nameErrors.last_name || !!nameErrors.middle_name}
              className="w-full bg-[#1B764C] text-white py-3 rounded-xl hover:bg-[#016937] disabled:opacity-60 disabled:cursor-not-allowed font-semibold transition-colors text-sm shadow-sm">
              {loading ? 'Submitting…' : 'Submit Attendance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
