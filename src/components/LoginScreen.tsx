import { useState } from 'react';
import { User } from '../App';
import logoImage from '../assets/logo.png';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Mock authentication
    if (username === 'admin' && password === 'admin123') {
      onLogin({
        id: '1',
        username: 'admin',
        fullName: 'Frincis Jane P. Omadley',
        role: 'admin'
      });
    } else if (username === 'staff' && password === 'staff123') {
      onLogin({
        id: '2',
        username: 'staff',
        fullName: 'Jenyy Claire',
        role: 'staff'
      });
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center p-4 bg-gradient-to-r from-[#a6f5e3] to-[#98FF98]">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img src={logoImage} alt="Legacy College of Compostela Logo" className="w-32 h-32 object-contain" />
          </div>
          <h1 className="text-[#4B4C58] mb-2">Library Management System</h1>
          <p className="text-[#9DA4A6]">Legacy College of Compostela</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-[#4B4C58] mb-6 text-center">Sign In</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-[#4B4C58] mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-[#9DA4A6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B764C] focus:border-transparent"
                placeholder="Enter your username"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-[#4B4C58] mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-[#9DA4A6] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B764C] focus:border-transparent"
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-[#D72A24] text-[#D72A24] px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#1B764C] hover:bg-[#016937] text-white py-3 rounded-lg transition-colors"
            >
              Login
            </button>
          </form>

          <div className="mt-4 text-center">
            <a href="#" className="text-[#1B764C] hover:text-[#016937]">
              Forgot Password?
            </a>
          </div>
        </div>

       
        
      </div>
    </div>
  );
}