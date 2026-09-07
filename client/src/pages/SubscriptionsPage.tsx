import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  ExternalLink,
  Edit2,
  Trash2,
  CheckCircle2,
  Eye,
  SlidersHorizontal,
  ArrowUpDown,
} from 'lucide-react';
import { subscriptionApi } from '../services/api';
import { Subscription, SubscriptionCategory, BillingCycle, UsageStatus } from '../types';
import { formatCurrency, formatDate, getCategoryColor } from '../utils/formatters';
import { UrgencyBadge } from '../components/UrgencyBadge';
import { EmptyState } from '../components/EmptyState';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const SubscriptionsPage: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [billingCycle, setBillingCycle] = useState('All');
  const [usageStatus, setUsageStatus] = useState('All');
  const [sort, setSort] = useState('renewalDate_asc');

  // Deletion Modal state
  const [deleteSubId, setDeleteSubId] = useState<string | null>(null);
  const [deleteSubName, setDeleteSubName] = useState<string>('');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const data = await subscriptionApi.getAll({
        search: search || undefined,
        category: category !== 'All' ? category : undefined,
        billingCycle: billingCycle !== 'All' ? billingCycle : undefined,
        usageStatus: usageStatus !== 'All' ? usageStatus : undefined,
        sort,
      });
      setSubscriptions(data.subscriptions);
    } catch (err) {
      console.error('Failed to load subscriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSubscriptions();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, category, billingCycle, usageStatus, sort]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleMarkUsed = async (id: string, name: string) => {
    try {
      await subscriptionApi.markAsUsed(id);
      showToast(`Marked "${name}" as used recently.`);
      fetchSubscriptions();
    } catch (err) {
      console.error('Error marking as used:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteSubId) return;
    try {
      await subscriptionApi.delete(deleteSubId);
      showToast(`Subscription "${deleteSubName}" deleted successfully.`);
      fetchSubscriptions();
    } catch (err) {
      console.error('Error deleting subscription:', err);
    } finally {
      setDeleteSubId(null);
    }
  };

  const categories: string[] = [
    'All',
    'Entertainment',
    'Cloud Storage',
    'Productivity',
    'Development',
    'Education',
    'Design',
    'Music',
    'Gaming',
    'Business',
    'Security',
    'Other',
  ];

  const cycles: string[] = ['All', 'Weekly', 'Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-2xl dark:bg-white dark:text-slate-900 border border-slate-700 animate-bounce">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Subscription Registry
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Maintain, filter, and track all your recurring subscriptions and official provider links.
          </p>
        </div>

        <Link
          to="/subscriptions/new"
          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors w-fit"
        >
          <Plus className="h-4 w-4" />
          Add Subscription
        </Link>
      </div>

      {/* Search and Filters Bar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by service or provider name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <ArrowUpDown className="h-4 w-4 text-slate-400 shrink-0 hidden sm:block" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full md:w-auto rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="renewalDate_asc">Renewal: Soonest First</option>
              <option value="renewalDate_desc">Renewal: Latest First</option>
              <option value="cost_desc">Cost: Highest First</option>
              <option value="cost_asc">Cost: Lowest First</option>
              <option value="name_asc">Name: Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="h-3 w-3" /> Filters:
          </span>

          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>

          {/* Billing Cycle Filter */}
          <select
            value={billingCycle}
            onChange={(e) => setBillingCycle(e.target.value)}
            className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            {cycles.map((cy) => (
              <option key={cy} value={cy}>
                Cycle: {cy}
              </option>
            ))}
          </select>

          {/* Usage Status Filter */}
          <select
            value={usageStatus}
            onChange={(e) => setUsageStatus(e.target.value)}
            className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <option value="All">Usage: All Statuses</option>
            <option value="Used Recently">Used Recently</option>
            <option value="Not Used Recently">Not Used Recently</option>
            <option value="Never Used">Never Used</option>
          </select>

          {(category !== 'All' || billingCycle !== 'All' || usageStatus !== 'All' || search) && (
            <button
              onClick={() => {
                setCategory('All');
                setBillingCycle('All');
                setUsageStatus('All');
                setSearch('');
              }}
              className="text-xs text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 ml-auto font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Subscription List Area */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="mx-auto h-7 w-7 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mb-3" />
          <p className="text-xs text-slate-500">Loading subscriptions...</p>
        </div>
      ) : subscriptions.length === 0 ? (
        <EmptyState
          title="No subscriptions found"
          description={
            search || category !== 'All'
              ? 'No subscriptions match your current filter parameters.'
              : 'Add your first subscription to start tracking your recurring commitments.'
          }
          actionText={!search ? 'Add Subscription' : undefined}
          onAction={!search ? () => (window.location.href = '/subscriptions/new') : undefined}
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-sm">
              <thead className="bg-slate-50/75 dark:bg-slate-800/50 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Service & Provider</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Cost & Cycle</th>
                  <th className="px-4 py-3.5">Renewal Date</th>
                  <th className="px-4 py-3.5">Trial</th>
                  <th className="px-4 py-3.5">Usage</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {subscriptions.map((sub) => (
                  <tr
                    key={sub._id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Service & Provider */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300 text-xs">
                          {sub.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <Link
                            to={`/subscriptions/${sub._id}`}
                            className="font-bold text-slate-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400"
                          >
                            {sub.name}
                          </Link>
                          <p className="text-xs text-slate-400">{sub.provider}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium border ${getCategoryColor(
                          sub.category
                        )}`}
                      >
                        {sub.category}
                      </span>
                    </td>

                    {/* Cost & Cycle */}
                    <td className="px-4 py-4">
                      <p className="font-bold text-slate-900 dark:text-white">
                        {formatCurrency(sub.cost, sub.currency)}
                      </p>
                      <p className="text-xs text-slate-400">
                        {sub.billingCycle} (~{formatCurrency(sub.monthlyEquivalent, sub.currency)}/mo)
                      </p>
                    </td>

                    {/* Renewal Date */}
                    <td className="px-4 py-4">
                      <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
                        {formatDate(sub.renewalDate)}
                      </p>
                      <div className="mt-1">
                        <UrgencyBadge daysRemaining={sub.daysUntilRenewal} />
                      </div>
                    </td>

                    {/* Trial */}
                    <td className="px-4 py-4">
                      {sub.isTrial ? (
                        <div>
                          <span className="inline-flex rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-700 dark:bg-orange-950/60 dark:text-orange-300">
                            Active Trial
                          </span>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Ends: {formatDate(sub.trialEndDate)}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Paid Plan</span>
                      )}
                    </td>

                    {/* Usage */}
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          sub.usageStatus === 'Used Recently'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 font-semibold'
                        }`}
                      >
                        {sub.usageStatus}
                      </span>
                      {sub.daysSinceLastUsed !== null && sub.daysSinceLastUsed !== undefined && (
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {sub.daysSinceLastUsed}d ago
                        </p>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleMarkUsed(sub._id, sub.name)}
                          title="Mark as Used (Reset inactivity)"
                          className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>

                        {sub.providerUrl && (
                          <a
                            href={sub.providerUrl}
                            target="_blank"
                            rel="noreferrer"
                            title="Manage on Provider Website"
                            className="rounded-lg p-1.5 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}

                        <Link
                          to={`/subscriptions/${sub._id}`}
                          title="View Details"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>

                        <Link
                          to={`/subscriptions/${sub._id}/edit`}
                          title="Edit"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Link>

                        <button
                          onClick={() => {
                            setDeleteSubId(sub._id);
                            setDeleteSubName(sub.name);
                          }}
                          title="Delete Subscription"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Grid View */}
          <div className="grid grid-cols-1 gap-4 lg:hidden">
            {subscriptions.map((sub) => (
              <div
                key={sub._id}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300 text-xs">
                      {sub.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <Link
                        to={`/subscriptions/${sub._id}`}
                        className="font-bold text-slate-900 dark:text-white"
                      >
                        {sub.name}
                      </Link>
                      <p className="text-xs text-slate-400">{sub.provider}</p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium border ${getCategoryColor(
                      sub.category
                    )}`}
                  >
                    {sub.category}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs border-y border-slate-100 py-3 dark:border-slate-800">
                  <div>
                    <span className="text-slate-400">Cost:</span>{' '}
                    <strong className="text-slate-800 dark:text-slate-200">
                      {formatCurrency(sub.cost, sub.currency)}/{sub.billingCycle}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Renewal:</span>{' '}
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      {formatDate(sub.renewalDate)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Usage:</span>{' '}
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {sub.usageStatus}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Status:</span>{' '}
                    <span className="font-medium text-emerald-600">Active</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <UrgencyBadge daysRemaining={sub.daysUntilRenewal} />

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMarkUsed(sub._id, sub.name)}
                      className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50"
                      title="Mark as Used"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                    {sub.providerUrl && (
                      <a
                        href={sub.providerUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50"
                        title="Manage on Provider Website"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    <Link
                      to={`/subscriptions/${sub._id}/edit`}
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => {
                        setDeleteSubId(sub._id);
                        setDeleteSubName(sub.name);
                      }}
                      className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Confirmation Dialog for Delete */}
      <ConfirmDialog
        isOpen={deleteSubId !== null}
        onClose={() => setDeleteSubId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Subscription"
        message={`Are you sure you want to delete "${deleteSubName}"? This action cannot be undone and will remove associated notifications.`}
        confirmText="Delete"
        isDangerous={true}
      />
    </div>
  );
};
