import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col justify-center bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/30 px-4 py-12 sm:px-6 lg:px-8 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-lg shadow-indigo-500/25">
            <Sparkles className="h-6 w-6" />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Sub<span className="text-indigo-600 dark:text-indigo-400">Track</span>
          </span>
        </Link>
        <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
          Personal Subscription Management & Spend Optimizer
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-3xl bg-white px-6 py-8 shadow-xl shadow-slate-200/50 border border-slate-200/80 sm:px-10 dark:bg-slate-900 dark:border-slate-800 dark:shadow-none">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
