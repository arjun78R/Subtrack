import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  CreditCard,
  Calendar,
  PieChart,
  ShieldCheck,
  BellRing,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                Sub<span className="text-indigo-600 dark:text-indigo-400">Track</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900 mb-6">
            <Zap className="h-3.5 w-3.5 text-indigo-500" />
            MCA 5th Semester Mini Project
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-slate-950 dark:text-white max-w-4xl mx-auto leading-tight">
            Take Control of Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600">Subscriptions</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Track recurring payments, stay ahead of renewals, and identify subscriptions you may no longer use.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={user ? '/dashboard' : '/login'}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-500 transition-all hover:scale-[1.02]"
            >
              Explore Demo Dashboard
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl border border-slate-200 px-6 py-3.5 text-base font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900 transition-colors"
            >
              How It Works
            </a>
          </div>

          {/* Quick Stat Pill */}
          <div className="mt-12 inline-flex items-center gap-6 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-left">
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase">Demo Login</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">demo@subtrack.local</p>
            </div>
            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700" />
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase">Password</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Demo@12345</p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem & Solution Section */}
      <section className="border-t border-slate-100 bg-slate-50/60 py-20 dark:border-slate-800/80 dark:bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              The Recurring Payment Dilemma
            </h2>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Why Centralized Subscription Tracking Matters
            </p>
            <p className="mt-4 text-base text-slate-600 dark:text-slate-400">
              Modern digital life is filled with recurring services: streaming, developer tools, cloud storage, and productivity apps. Without centralized tracking, forgotten subscriptions quietly drain financial resources.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 mb-6">
                <CreditCard className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Unwanted Renewal Charges</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Subscriptions renew automatically in the background without advance reminder, charging accounts for services no longer required.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 mb-6">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Forgotten Free Trials</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Free trials convert to paid commitments overnight. SubTrack monitors trial expiration dates and sends advance warning alerts.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 mb-6">
                <PieChart className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Inactive Subscription Waste</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                SubTrack’s rule-based usage engine monitors last-used timestamps and highlights services that have sat idle beyond your threshold.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Core Capabilities
            </h2>
            <p className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
              Everything You Need in One Centralized System
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: CreditCard,
                title: 'Subscription Registry',
                desc: 'Maintain all services, categories, currencies, and billing cycles (Weekly, Monthly, Quarterly, Yearly) with full CRUD support.',
              },
              {
                icon: Calendar,
                title: 'Renewal Calendar',
                desc: 'Visual timeline with Month, Week, and List views highlighting upcoming renewals and trial milestones.',
              },
              {
                icon: PieChart,
                title: 'Spending Analytics',
                desc: 'Normalized expenditure calculations with Recharts category donut charts, monthly trends, and cost distribution.',
              },
              {
                icon: BellRing,
                title: 'Configurable Reminders',
                desc: 'Automated Node-Cron daily checks dispatching email alerts and in-app notifications according to your preferences.',
              },
              {
                icon: ShieldCheck,
                title: 'Rule-Based Usage Detection',
                desc: 'Inactivity threshold checks evaluate when a subscription has not been used, calculating potential annual savings.',
              },
              {
                icon: ExternalLink,
                title: 'Direct Provider Access',
                desc: 'Convenient 1-click links to official provider portals to safely review or cancel subscriptions directly.',
              },
            ].map((f, idx) => {
              const Icon = f.icon;
              return (
                <div key={idx} className="flex gap-4 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{f.title}</h3>
                    <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-400">
          <p className="font-semibold text-slate-600 dark:text-slate-300">
            SUBTRACK: A Personal Subscription Management & Spend Optimizer
          </p>
          <p className="mt-1">MCA Fifth-Semester Mini Project Demonstration & Viva Submission</p>
          <p className="mt-2 text-indigo-600 dark:text-indigo-400 font-medium">
            Tagline: Track. Understand. Optimize.
          </p>
        </div>
      </footer>
    </div>
  );
};
