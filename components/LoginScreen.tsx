
import React, { useState } from 'react';
import { odooService } from '../services/odooService';
import { User } from '../types';
import Button from './common/Button';
import Spinner from './common/Spinner';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('demo@odoo.com');
  const [password, setPassword] = useState('password');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const user = await odooService.login(email, password);
      onLoginSuccess(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg">
        <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-auto text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className="mt-4 text-3xl font-extrabold text-gray-900">
                Odoo Live Attendance
            </h1>
            <p className="mt-2 text-sm text-gray-600">
                Sign in to your Odoo account
            </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password-sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          
          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <div>
            <Button type="submit" className="w-full justify-center" disabled={isLoading}>
              {isLoading ? <Spinner /> : 'Sign In'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;
