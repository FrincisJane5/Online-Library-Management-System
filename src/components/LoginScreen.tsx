import { useState } from 'react';
import { User } from '../types';
import api from '../api/axios';
import logoImage from '../assets/logo.png';
import { X } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot password modal state
  const [showForgot, setShowForgot] = useState(false);
  const [forgotUsername, setForgotUsername] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  // After username verified — set new password step
  const [resetToken, setResetToken] = useState('');
  const [resetName, setResetName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const response = await api.post('/auth/login', { username, password });
      onLogin(response.data as User);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid username or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 1: verify username
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { username: forgotUsername });
      setResetToken(res.data.token);
      setResetName(res.data.name);
    } catch (err: any) {
      setForgotError(err.response?.data?.message || 'No account found with that username.');
    } finally {
      setForgotLoading(false);
    }
  };

  // Step 2: set new password
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { setResetError('Passwords do not match.'); return; }
    setResetError('');
    setResetLoading(true);
    try {
      await api.post('/auth/reset-password', { token: resetToken, password: newPassword });
      setResetDone(true);
    } catch (err: any) {
      setResetError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setResetLoading(false);
    }
  };

  const closeForgot = () => {
    setShowForgot(false);
    setForgotUsername(''); setForgotError('');
    setResetToken(''); setResetName('');
    setNewPassword(''); setConfirmPassword(''); setResetError('');
    setResetDone(false);
  };

  const isDeactivated = error.toLowerCase().includes('deactivated');

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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-[#4B4C58] mb-2">Username</label>
              <input id="username" type="text" value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-[#9DA4A6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B764C]"
                placeholder="Enter your username" required />
            </div>
            <div>
              <label htmlFor="password" className="block text-[#4B4C58] mb-2">Password</label>
              <input id="password" type="password" value={password}
                onChange={e => setPassword(e.target.value)}
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
            <button onClick={() => setShowForgot(true)}
              className="text-[#1B764C] hover:text-[#016937] text-sm underline">
              Forgot Password?
            </button>
          </div>
        </div>
      </div>

      {/* Forgot / Reset Password Modal */}
      {showForgot && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-[#4B4C58]">
                {resetDone ? 'Password Updated' : resetToken ? 'Set New Password' : 'Forgot Password'}
              </h3>
              <button onClick={closeForgot}><X className="w-5 h-5 text-gray-500 hover:text-black" /></button>
            </div>

            {/* Step 3: Done */}
            {resetDone && (
              <div className="text-center space-y-3">
                <div className="text-green-600 text-4xl">✓</div>
                <p className="text-sm text-gray-700">Password updated successfully. You can now log in.</p>
                <button onClick={closeForgot}
                  className="w-full bg-[#1B764C] text-white py-2 rounded-lg text-sm hover:bg-[#016937] transition-colors">
                  Back to Login
                </button>
              </div>
            )}

            {/* Step 2: Set new password */}
            {!resetDone && resetToken && (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  Hello <span className="font-semibold text-[#1B764C]">{resetName}</span>, enter your new password below.
                </p>
                <form onSubmit={handleResetSubmit} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-[#4B4C58] mb-1">New Password</label>
                    <input type="password" required minLength={6} value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B764C] text-sm"
                      placeholder="At least 6 characters" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#4B4C58] mb-1">Confirm Password</label>
                    <input type="password" required value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B764C] text-sm"
                      placeholder="Re-enter new password" />
                  </div>
                  {resetError && <p className="text-red-600 text-sm">{resetError}</p>}
                  <button type="submit" disabled={resetLoading}
                    className="w-full bg-[#1B764C] hover:bg-[#016937] disabled:opacity-60 text-white py-2 rounded-lg text-sm transition-colors">
                    {resetLoading ? 'Saving...' : 'Save New Password'}
                  </button>
                </form>
              </>
            )}

            {/* Step 1: Enter username */}
            {!resetDone && !resetToken && (
              <>
                <p className="text-sm text-gray-600 mb-4">
                  Enter your username to reset your password. Works for both <span className="font-semibold">Admin</span> and <span className="font-semibold">Staff</span> accounts.
                </p>
                <form onSubmit={handleForgotSubmit} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-[#4B4C58] mb-1">Username</label>
                    <input type="text" required value={forgotUsername}
                      onChange={e => setForgotUsername(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B764C] text-sm"
                      placeholder="Enter your username" />
                  </div>
                  {forgotError && <p className="text-red-600 text-sm">{forgotError}</p>}
                  <button type="submit" disabled={forgotLoading}
                    className="w-full bg-[#1B764C] hover:bg-[#016937] disabled:opacity-60 text-white py-2 rounded-lg text-sm transition-colors">
                    {forgotLoading ? 'Verifying...' : 'Continue'}
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
