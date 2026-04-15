import { useState } from 'react';
import { useAuthActions } from '@/features/auth/hooks/useAuthActions';

const Login = () => {
  const { login, setAppLoading } = useAuthActions();
  const [formData, setFormData] = useState({
    email: 'admin@qhmanage.com',
    password: 'Admin@123'
  });
  const [error, setError] = useState('');
  const [loading, setLocalLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalLoading(true);
    setError('');
    setAppLoading(true);

    try {
      await login({
        email: formData.email,
        password: formData.password,
      });
    } catch (err) {
      setError('Invalid email or password. Please check your account in database.');
      console.error('Login error:', err);
    } finally {
      setLocalLoading(false);
      setAppLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8 bg-gray-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        {/* Logo */}
        <div className="mx-auto h-12 w-12 flex items-center justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-lg blur opacity-75"></div>
            <div className="relative bg-gray-900 rounded-lg p-2">
              <svg className="h-8 w-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>
        <h2 className="mt-10 text-center text-2xl font-bold tracking-tight text-white">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-100">
              Email address
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="text"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 transition-all sm:text-sm"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-gray-100">
                Password
              </label>
              <div className="text-sm">
                <a href="#" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                  Forgot password?
                </a>
              </div>
            </div>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 transition-all sm:text-sm"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-red-500/10 p-4 border border-red-500/20">
              <div className="flex">
                <svg className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="ml-3 text-sm font-medium text-red-300">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Sign In Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center items-center rounded-md bg-indigo-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>

        {/* Login Info Box */}
        <div className="mt-6 p-3 bg-indigo-500/10 rounded-md border border-indigo-500/20">
          <p className="text-xs text-indigo-300">
            <strong>Database Credentials:</strong><br />
            Email: <code className="bg-black/30 px-1.5 py-0.5 rounded text-indigo-400 font-mono">admin@qhmanage.com</code><br />
            Password: <code className="bg-black/30 px-1.5 py-0.5 rounded text-indigo-400 font-mono">Admin@123</code>
          </p>
        </div>

        {/* Sign Up Link */}
        <p className="mt-10 text-center text-sm text-gray-400">
          Not a member?{' '}
          <a href="#" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
            Start a 14 day free trial
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;