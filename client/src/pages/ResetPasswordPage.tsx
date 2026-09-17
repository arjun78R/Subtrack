import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../services/api';
import { ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    if (emailParam) setEmail(emailParam);
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await authApi.resetPassword({ email, resetToken, newPassword });
      setMessage(res.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-6">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Enter Verification Code
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Check your email or server log for your 6-digit code
        </p>
      </div>

      {message && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            6-Digit Verification Code
          </label>
          <input
            type="text"
            required
            value={resetToken}
            onChange={(e) => setResetToken(e.target.value)}
            placeholder="e.g. 123456"
            className="w-full text-center tracking-widest font-mono text-base rounded-xl border border-slate-300 px-3.5 py-2.5 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            New Password
          </label>
          <input
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Min 6 chars"
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Resetting password...' : 'Update Password'}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-500">
        Remembered password?{' '}
        <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
          Sign in
        </Link>
      </div>
    </div>
  );
};
