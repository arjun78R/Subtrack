import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { subscriptionApi } from '../services/api';
import { Subscription } from '../types';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Calendar,
  CreditCard,
  Clock,
  PiggyBank,
  ShieldAlert,
} from 'lucide-react';
import { formatCurrency, formatDate, getCategoryColor } from '../utils/formatters';
import { UrgencyBadge } from '../components/UrgencyBadge';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const SubscriptionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchSubscription = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await subscriptionApi.getById(id);
      setSubscription(res.subscription);
    } catch (err) {
      console.error('Failed to load subscription:', err);
      navigate('/subscriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [id]);

  const handleMarkUsed = async () => {
    if (!subscription) return;
    try {
      await subscriptionApi.markAsUsed(subscription._id);
      setToastMessage('Subscription marked as used recently! Inactivity counter reset.');
      setTimeout(() => setToastMessage(null), 3500);
      fetchSubscription();
    } catch (err) {
      console.error('Error marking as used:', err);
    }
  };

  const handleDelete = async () => {
    if (!subscription) return;
    try {
      await subscriptionApi.delete(subscription._id);
      navigate('/subscriptions');
    } catch (err) {
      console.error('Error deleting subscription:', err);
    }
  };

  if (loading || !subscription) {
    return (
      <div className="py-20 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        <p className="mt-3 text-xs text-slate-500">Loading subscription details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-2xl dark:bg-white dark:text-slate-900 border border-slate-700 animate-bounce">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Back */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/subscriptions"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Subscriptions
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {subscription.name}
            </h1>
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold border ${getCategoryColor(
                subscription.category
              )}`}
            >
              {subscription.category}
            </span>
          </div>
          <p className="text-xs text-slate-400">Provider: {subscription.provider}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleMarkUsed}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 transition-colors"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Mark as Used
          </button>

          {subscription.providerUrl && (
            <a
              href={subscription.providerUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Manage Subscription
            </a>
          )}

          <Link
            to={`/subscriptions/${subscription._id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 transition-colors"
          >
            <Edit2 className="h-3.5 w-3.5" />
            Edit
          </Link>

          <button
            onClick={() => setDeleteOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </div>

      {/* Inactivity Alert if Unused */}
      {subscription.isUnusedFlagged && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-5 dark:border-rose-900/60 dark:bg-rose-950/30">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Potentially Unused Subscription
              </h3>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                This service has not been marked as used for{' '}
                <strong>{subscription.daysSinceLastUsed || 'many'} days</strong>. Consider reviewing this subscription to achieve potential annual savings of{' '}
                <strong className="text-rose-600 dark:text-rose-400 font-bold">
                  {formatCurrency(subscription.annualEquivalent, subscription.currency)}
                </strong>
                .
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Financial Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Billing Amount
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(subscription.cost, subscription.currency)}
          </p>
          <p className="mt-1 text-xs text-slate-500">Every {subscription.billingCycle}</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Monthly Normalized Cost
          </p>
          <p className="mt-2 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {formatCurrency(subscription.monthlyEquivalent, subscription.currency)}
          </p>
          <p className="mt-1 text-xs text-slate-500">Standard monthly equivalent</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Annual Commitment
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(subscription.annualEquivalent, subscription.currency)}
          </p>
          <p className="mt-1 text-xs text-slate-500">12-month projection</p>
        </div>
      </div>

      {/* Subscription Information Table */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-3 dark:border-slate-800">
          Subscription Parameters
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block mb-1">Renewal Schedule</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                {formatDate(subscription.renewalDate)}
              </span>
              <UrgencyBadge daysRemaining={subscription.daysUntilRenewal} />
            </div>
          </div>

          <div>
            <span className="text-slate-400 block mb-1">Start Date</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
              {formatDate(subscription.startDate)}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block mb-1">Free Trial Status</span>
            {subscription.isTrial ? (
              <div>
                <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                  Active Free Trial
                </span>
                <p className="text-[11px] text-slate-500 mt-1">
                  Expires: {formatDate(subscription.trialEndDate)} ({subscription.daysUntilTrial} days left)
                </p>
              </div>
            ) : (
              <span className="font-medium text-slate-600 dark:text-slate-400">Regular Paid Plan</span>
            )}
          </div>

          <div>
            <span className="text-slate-400 block mb-1">Last Usage Timestamp</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
              {subscription.lastUsedDate ? formatDate(subscription.lastUsedDate) : 'Never Recorded'}
            </span>
            <span className="ml-2 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {subscription.usageStatus}
            </span>
          </div>
        </div>

        {subscription.notes && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-400 block mb-1">Personal Notes</span>
            <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 p-3 rounded-xl dark:bg-slate-800/50">
              {subscription.notes}
            </p>
          </div>
        )}

        {subscription.providerUrl && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Official Provider Website
              </p>
              <p className="text-[11px] text-slate-400">
                SubTrack does not store provider passwords or process automatic cancellation.
              </p>
            </div>
            <a
              href={subscription.providerUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
            >
              <span>Visit {subscription.provider}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Subscription"
        message={`Are you sure you want to delete ${subscription.name}?`}
        confirmText="Delete"
        isDangerous={true}
      />
    </div>
  );
};
