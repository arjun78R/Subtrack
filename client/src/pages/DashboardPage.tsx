import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard,
  TrendingUp,
  Calendar,
  AlertTriangle,
  PiggyBank,
  CheckCircle2,
  Clock,
  ExternalLink,
  RefreshCw,
  Plus,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { dashboardApi, subscriptionApi } from '../services/api';
import { DashboardSummary, UpcomingRenewalItem, UnusedSubscriptionItem } from '../types';
import { StatCard } from '../components/StatCard';
import { UrgencyBadge } from '../components/UrgencyBadge';
import { EmptyState } from '../components/EmptyState';
import { formatCurrency, formatDate } from '../utils/formatters';

export const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [upcomingRenewals, setUpcomingRenewals] = useState<UpcomingRenewalItem[]>([]);
  const [unusedSubs, setUnusedSubs] = useState<UnusedSubscriptionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [sumData, renewalsData, unusedData] = await Promise.all([
        dashboardApi.getSummary(),
        dashboardApi.getUpcomingRenewals(),
        dashboardApi.getUnused(),
      ]);

      setSummary(sumData);
      setUpcomingRenewals(renewalsData.upcomingRenewals);
      setUnusedSubs(unusedData.unusedSubscriptions);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleMarkAsUsed = async (id: string) => {
    try {
      setActionLoadingId(id);
      await subscriptionApi.markAsUsed(id);
      // Refresh dashboard to recalculate savings and usage
      await fetchDashboardData();
    } catch (error) {
      console.error('Error marking as used:', error);
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading && !summary) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm font-medium text-slate-500">Loading your subscription dashboard...</p>
        </div>
      </div>
    );
  }

  const currency = summary?.currency || 'INR';

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Subscription Overview
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time breakdown of recurring commitments, upcoming renewals, and spend optimization.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            title="Refresh metrics"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
          <Link
            to="/subscriptions/new"
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Subscription
          </Link>
        </div>
      </div>

      {/* 7 Stat Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Active Subscriptions */}
        <StatCard
          title="Active Subscriptions"
          value={summary?.totalActive || 0}
          subtitle="Currently active tracking"
          icon={CreditCard}
          colorScheme="indigo"
        />

        {/* Card 2: Monthly Recurring Spend */}
        <StatCard
          title="Monthly Recurring Spend"
          value={formatCurrency(summary?.monthlyRecurringSpend || 0, currency)}
          subtitle="Normalized monthly commitment"
          icon={TrendingUp}
          colorScheme="purple"
        />

        {/* Card 3: Annual Recurring Spend */}
        <StatCard
          title="Annual Recurring Spend"
          value={formatCurrency(summary?.annualRecurringSpend || 0, currency)}
          subtitle="Projected 12-month expense"
          icon={Calendar}
          colorScheme="sky"
        />

        {/* Card 6: Potential Savings */}
        <StatCard
          title="Potential Savings"
          value={formatCurrency(summary?.potentialSavings || 0, currency)}
          subtitle="Annual spend on inactive services"
          icon={PiggyBank}
          colorScheme="emerald"
          badge={summary && summary.potentialSavings > 0 ? 'Action Recommended' : undefined}
        />
      </div>

      {/* Secondary Quick Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Card 4: Upcoming Renewals */}
        <StatCard
          title="Upcoming Renewals (30 Days)"
          value={summary?.upcomingRenewalsCount || 0}
          subtitle="Subscriptions due for renewal soon"
          icon={Clock}
          colorScheme="amber"
        />

        {/* Card 5: Trial Expirations */}
        <StatCard
          title="Active Free Trials"
          value={summary?.trialExpirationsCount || 0}
          subtitle="Trials converting to paid plans soon"
          icon={AlertTriangle}
          colorScheme="rose"
        />

        {/* Card 7: Potentially Unused Subscriptions */}
        <StatCard
          title="Potentially Unused"
          value={summary?.unusedSubscriptionsCount || 0}
          subtitle="Idle beyond inactivity threshold"
          icon={ShieldAlert}
          colorScheme={summary && summary.unusedSubscriptionsCount > 0 ? 'rose' : 'slate'}
        />
      </div>

      {/* Potentially Unused Alert Banner & Table (Requirements 21, 22) */}
      <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50/50 to-orange-50/30 p-6 dark:border-amber-900/50 dark:from-amber-950/20 dark:to-orange-950/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Potentially Unused Subscriptions
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Rule-based usage detection: Consider reviewing these services to reduce recurring costs.
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 w-fit">
            Potential Annual Savings: {formatCurrency(summary?.potentialSavings || 0, currency)}
          </span>
        </div>

        {unusedSubs.length === 0 ? (
          <div className="rounded-xl bg-white/80 p-6 text-center dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500 mb-2" />
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              No unused subscriptions detected!
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              All your tracked subscriptions have been used within your configured inactivity threshold.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {unusedSubs.map((sub) => (
              <div
                key={sub.id}
                className="flex flex-col justify-between rounded-xl bg-white p-4 shadow-sm border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{sub.name}</h4>
                      <p className="text-xs text-slate-500">{sub.provider} • {sub.category}</p>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900">
                      {sub.usageStatus}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs border-y border-slate-100 py-2.5 dark:border-slate-800">
                    <div>
                      <span className="text-slate-400">Current Cost:</span>{' '}
                      <strong className="text-slate-800 dark:text-slate-200">
                        {formatCurrency(sub.cost, sub.currency)}/{sub.billingCycle}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-400">Annual Waste:</span>{' '}
                      <strong className="text-rose-600 dark:text-rose-400">
                        {formatCurrency(sub.potentialAnnualCost, sub.currency)}
                      </strong>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400">Inactivity:</span>{' '}
                      <span className="text-slate-600 dark:text-slate-300">
                        {sub.daysUnused !== null && sub.daysUnused !== undefined
                          ? `Last used ${sub.daysUnused} days ago`
                          : 'Never recorded as used'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions: Mark Used, Review, Provider Link */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-1">
                  <button
                    onClick={() => handleMarkAsUsed(sub.id)}
                    disabled={actionLoadingId === sub.id}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 transition-colors"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {actionLoadingId === sub.id ? 'Updating...' : 'Mark as Used'}
                  </button>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/subscriptions/${sub.id}`}
                      className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    >
                      Review
                    </Link>

                    {sub.providerUrl && (
                      <a
                        href={sub.providerUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                      >
                        <span>Manage Subscription</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Renewals Section (Requirement 16) */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Upcoming Renewals</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Subscriptions scheduled to renew in the next 30 days
            </p>
          </div>
          <Link
            to="/calendar"
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
          >
            <span>Open Calendar</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {upcomingRenewals.length === 0 ? (
          <EmptyState
            title="No upcoming renewals"
            description="You have no subscriptions due for renewal in the next 30 days."
          />
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {upcomingRenewals.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200 text-xs">
                    {item.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {item.provider} • Renews on {formatDate(item.renewalDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {formatCurrency(item.cost, item.currency)}
                    </p>
                    <p className="text-[11px] text-slate-400">{item.billingCycle}</p>
                  </div>

                  <UrgencyBadge daysRemaining={item.daysRemaining} />

                  {item.providerUrl && (
                    <a
                      href={item.providerUrl}
                      target="_blank"
                      rel="noreferrer"
                      title="Open official provider website"
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
