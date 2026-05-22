import { useState } from 'react';
import { User } from '../types';
import api from '../api/axios';
import logoImage from '../assets/logo.png';
import { X } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

// Steps: 'email' | 'otp' | 'password' | 'done'
type ForgotStep = 'email' | 'otp' | 'password' | 'done';

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot password
  const [showForgot, setShowForgot] = useState(false);
  const [step, setStep] = useState<ForgotStep>('email');
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [stepError, setStepError] = useState('');
  const [stepLoading, setStepLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const res = await api.post('/auth/login', { username, password });
      onLogin(res.data as User);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid username or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 1: send OTP to email
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setStepError('');
    setStepLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: forgotEmail });
      setStep('otp'); // Always advance — backend never reveals if email exists
    } catch {
      setStep('otp');
    } finally {
      setStepLoading(false);
    }
  };

  // Step 2: verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setStepError('');
    setStepLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { email: forgotEmail, otp });
      setResetToken(res.data.token);
      setStep('password');
    } catch (err: any) {
      setStepError(err.response?.data?.message || 'Invalid or expired code.');
    } finally {
      setStepLoading(false);
    }
  };

  // Step 3: set new password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setStepError('Passwords do not match.'); return; }
    setStepError('');
    setStepLoading(true);
    try {
      await api.post('/auth/reset-password', { token: resetToken, password: newPassword });
      setStep('done');
    } catch (err: any) {
      setStepError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setStepLoading(false);
    }
  };

  const closeForgot = () => {
    setShowForgot(false);
    setStep('email');
    setForgotEmail(''); setOtp(''); setResetToken('');
    setNewPassword(''); setConfirmPassword(''); setStepError('');
  };

  const isDeactivated = error.toLowerCase().includes('deactivated');

  const stepTitle: Record<ForgotStep, string> = {
    email: 'Forgot Password',
    otp: 'Enter Reset Code',
    password: 'Set New Password',
    done: 'Password Updated',
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-r from-[#a6f5e3] to-[#98FF98]">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-8">
          <img src={logoImage} alt="Legacy College Logo" className="w-32 h-32 object-contain mb-4" />
          <h1 className="text-[#4B4C58] text-2xl font-bold mb-1">Library Management System</h1>
          <p className="text-[#9DA4A6] text-sm">Legacy College of Compostela</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-[#4B4C58] mb-6 text-center">Sign In</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-[#4B4C58] mb-2">Username</label>
              <input id="username" type="text" value={username} onChange={e => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-[#9DA4A6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B764C]"
                placeholder="Enter your username" required />
            </div>
            <div>
              <label htmlFor="password" className="block text-[#4B4C58] mb-2">Password</label>
              <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-[#9DA4A6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B764C]"
                placeholder="Enter your password" required />
            </div>

            {error && (
              <div className={`px-4 py-3 rounded-lg border text-sm ${isDeactivated ? 'bg-red-100 border-red-400 text-red-800' : 'bg-red-50 border-[#D72A24] text-[#D72A24]'}`}>
                {isDeactivated && <p className="font-semibold mb-1">⚠ Account Restricted</p>}
                {error}
              </div>
            )}

            <button type="submit" disabled={isSubmitting}
              className="w-full bg-[#1B764C] hover:bg-[#016937] disabled:opacity-60 text-white py-3 rounded-lg transition-colors">
              {isSubmitting ? 'Signing in...' : 'Login'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button onClick={() => setShowForgot(true)} className="text-[#1B764C] hover:text-[#016937] text-sm underline">
              Forgot Password?
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-[#4B4C58]">{stepTitle[step]}</h3>
              <button onClick={closeForgot}><X className="w-5 h-5 text-gray-500 hover:text-black" /></button>
            </div>

            {/* Step indicator */}
            {step !== 'done' && (
              <div className="flex items-center gap-1 mb-5">
                {(['email', 'otp', 'password'] as ForgotStep[]).map((s, i) => (
                  <div key={s} className="flex items-center gap-1 flex-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                      ${step === s ? 'bg-[#1B764C] text-white' :
                        ['email','otp','password'].indexOf(step) > i ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                      {['email','otp','password'].indexOf(step) > i ? '✓' : i + 1}
                    </div>
                    {i < 2 && <div className={`flex-1 h-0.5 ${['email','otp','password'].indexOf(step) > i ? 'bg-green-500' : 'bg-gray-200'}`} />}
                  </div>
                ))}
              </div>
            )}

            {/* Done */}
            {step === 'done' && (
              <div className="text-center space-y-3">
                <div className="text-green-600 text-4xl">✓</div>
                <p className="text-sm text-gray-700">Password updated successfully. You can now log in.</p>
                <button onClick={closeForgot}
                  className="w-full bg-[#1B764C] text-white py-2 rounded-lg text-sm hover:bg-[#016937] transition-colors">
                  Back to Login
                </button>
              </div>
            )}

            {/* Step 1: Email */}
            {step === 'email' && (
              <>
                <p className="text-sm text-gray-600 mb-4">Enter your account email. We'll send a 6-digit reset code.</p>
                <form onSubmit={handleSendOtp} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-[#4B4C58] mb-1">Email Address</label>
                    <input type="email" required value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B764C] text-sm"
                      placeholder="Enter your email" />
                  </div>
                  <button type="submit" disabled={stepLoading}
                    className="w-full bg-[#1B764C] hover:bg-[#016937] disabled:opacity-60 text-white py-2 rounded-lg text-sm transition-colors">
                    {stepLoading ? 'Sending...' : 'Send Code'}
                  </button>
                </form>
              </>
            )}

            {/* Step 2: OTP */}
            {step === 'otp' && (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  A 6-digit code was sent to <span className="font-semibold">{forgotEmail}</span>. Enter it below. The code expires in 15 minutes.
                </p>
                <form onSubmit={handleVerifyOtp} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-[#4B4C58] mb-1">Reset Code</label>
                    <input type="text" required maxLength={6} value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B764C] text-sm text-center tracking-[0.5em] font-mono text-lg"
                      placeholder="000000" />
                  </div>
                  {stepError && <p className="text-red-600 text-sm">{stepError}</p>}
                  <button type="submit" disabled={stepLoading || otp.length < 6}
                    className="w-full bg-[#1B764C] hover:bg-[#016937] disabled:opacity-60 text-white py-2 rounded-lg text-sm transition-colors">
                    {stepLoading ? 'Verifying...' : 'Verify Code'}
                  </button>
                  <button type="button" onClick={() => { setStep('email'); setOtp(''); setStepError(''); }}
                    className="w-full text-sm text-gray-500 hover:text-gray-700 underline">
                    Use a different email
                  </button>
                </form>
              </>
            )}

            {/* Step 3: New password */}
            {step === 'password' && (
              <>
                <p className="text-sm text-gray-600 mb-4">Code verified. Enter your new password.</p>
                <form onSubmit={handleResetPassword} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-[#4B4C58] mb-1">New Password</label>
                    <input type="password" required minLength={6} value={newPassword} onChange={e => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B764C] text-sm"
                      placeholder="At least 6 characters" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4B4C58] mb-1">Confirm Password</label>
                    <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B764C] text-sm"
                      placeholder="Re-enter new password" />
                  </div>
                  {stepError && <p className="text-red-600 text-sm">{stepError}</p>}
                  <button type="submit" disabled={stepLoading}
                    className="w-full bg-[#1B764C] hover:bg-[#016937] disabled:opacity-60 text-white py-2 rounded-lg text-sm transition-colors">
                    {stepLoading ? 'Saving...' : 'Save New Password'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
