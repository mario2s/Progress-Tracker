import { useState } from 'react';
import { authService } from '../lib/supabase';
import { ThemeToggleButton } from '../components/ThemeToggleButton';

export const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        await authService.signIn(email, password);
      } else {
        const result = await authService.signUp(email, password);
        if (result.user && !result.session) {
          setMessage('Check your email for a confirmation link!');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setMessage(null);
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen bg-blue-200 dark:bg-zinc-950 flex items-center justify-center px-4 transition-colors duration-200">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-zinc-800 dark:text-zinc-100 mb-2">Progress Tracker</h1>
          <p className="text-zinc-500">Track your goals with clarity and purpose</p>
        </div>

        <div className="bg-blue-300 dark:bg-zinc-900 rounded-2xl border border-blue-400 dark:border-zinc-800 p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
              {isLogin ? 'Sign In' : 'Create Account'}
            </h2>
            <ThemeToggleButton />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 p-3 rounded-xl mb-4 text-sm">
              {error}
            </div>
          )}
          {message && (
            <div className="bg-green-50 dark:bg-green-950 border border-green-300 dark:border-green-800 text-green-700 dark:text-green-300 p-3 rounded-xl mb-4 text-sm">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-zinc-400 mb-2">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full px-4 py-2.5 bg-blue-200 dark:bg-zinc-800 border border-blue-400 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-800 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 transition"
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-2">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                className="w-full px-4 py-2.5 bg-blue-200 dark:bg-zinc-800 border border-blue-400 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-800 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 transition"
                disabled={loading}
              />
            </div>
            {!isLogin && (
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-semibold text-zinc-500 dark:text-zinc-400 mb-2">Confirm Password</label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="w-full px-4 py-2.5 bg-blue-200 dark:bg-zinc-800 border border-blue-400 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-800 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 transition"
                  disabled={loading}
                />
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-500 disabled:bg-blue-300 dark:disabled:bg-zinc-800 disabled:text-slate-400 dark:disabled:text-zinc-600 text-white rounded-xl font-semibold transition mt-2"
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-zinc-400 dark:text-zinc-500 text-sm mt-6">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={switchMode}
              className="text-orange-500 hover:text-orange-400 font-semibold transition"
            >
              {isLogin ? 'Register' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
