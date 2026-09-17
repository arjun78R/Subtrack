import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { subscriptionApi } from '../services/api';
import { SubscriptionCategory, BillingCycle } from '../types';
import { CreditCard, ArrowLeft, Save, AlertCircle, Sparkles } from 'lucide-react';

export const SubscriptionFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    provider: '',
    category: 'Entertainment' as SubscriptionCategory,
    cost: '',
    currency: 'INR',
    billingCycle: 'Monthly' as BillingCycle,
    startDate: new Date().toISOString().split('T')[0],
    renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isTrial: false,
    trialEndDate: '',
    providerUrl: '',
    notes: '',
  });

  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);

  useEffect(() => {
    if (isEditing && id) {
      const loadSub = async () => {
        try {
          const res = await subscriptionApi.getById(id);
          const s = res.subscription;
          setFormData({
            name: s.name,
            provider: s.provider,
            category: s.category,
            cost: s.cost.toString(),
            currency: s.currency,
            billingCycle: s.billingCycle,
            startDate: s.startDate ? new Date(s.startDate).toISOString().split('T')[0] : '',
            renewalDate: new Date(s.renewalDate).toISOString().split('T')[0],
            isTrial: s.isTrial,
            trialEndDate: s.trialEndDate ? new Date(s.trialEndDate).toISOString().split('T')[0] : '',
            providerUrl: s.providerUrl || '',
            notes: s.notes || '',
          });
        } catch (err: any) {
          setError('Failed to fetch subscription details.');
        } finally {
          setFetching(false);
        }
      };
      loadSub();
    }
  }, [id, isEditing]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const target = e.target;
    const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;
    const name = target.name;

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Validate trial date against renewal date
      if (updated.isTrial && updated.trialEndDate && updated.renewalDate) {
        if (new Date(updated.trialEndDate) > new Date(updated.renewalDate)) {
          setWarning('Note: Trial end date is after renewal date. Typically trials expire before or on renewal.');
        } else {
          setWarning(null);
        }
      } else {
        setWarning(null);
      }

      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const costNum = parseFloat(formData.cost);
    if (isNaN(costNum) || costNum < 0) {
      setError('Cost cannot be negative or invalid.');
      return;
    }

    if (formData.isTrial && !formData.trialEndDate) {
      setError('Trial expiration date is required when free trial is active.');
      return;
    }

    if (formData.startDate && formData.renewalDate) {
      if (new Date(formData.renewalDate) < new Date(formData.startDate)) {
        setError('Renewal date cannot be earlier than start date.');
        return;
      }
    }

    setLoading(true);

    try {
      const payload: any = {
        name: formData.name.trim(),
        provider: formData.provider.trim(),
        category: formData.category,
        cost: costNum,
        currency: formData.currency,
        billingCycle: formData.billingCycle,
        startDate: formData.startDate ? new Date(formData.startDate) : undefined,
        renewalDate: new Date(formData.renewalDate),
        isTrial: formData.isTrial,
        trialEndDate: formData.isTrial && formData.trialEndDate ? new Date(formData.trialEndDate) : undefined,
        providerUrl: formData.providerUrl.trim() || undefined,
        notes: formData.notes.trim(),
      };

      if (isEditing && id) {
        await subscriptionApi.update(id, payload);
      } else {
        await subscriptionApi.create(payload);
      }

      navigate('/subscriptions');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error saving subscription.');
    } finally {
      setLoading(false);
    }
  };

  const categories: SubscriptionCategory[] = [
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

  const cycles: BillingCycle[] = ['Weekly', 'Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'];

  if (fetching) {
    return (
      <div className="py-20 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        <p className="mt-3 text-xs text-slate-500">Loading subscription details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back Link & Header */}
      <div>
        <Link
          to="/subscriptions"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Subscriptions
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {isEditing ? 'Edit Subscription' : 'Add New Subscription'}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Enter subscription specifications for tracking and renewal reminders.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl bg-rose-50 p-4 text-xs font-medium text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {warning && (
        <div className="flex items-center gap-2 rounded-2xl bg-amber-50 p-4 text-xs font-medium text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{warning}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6"
      >
        {/* Basic Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Service / Subscription Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Netflix Premium, Spotify, AWS"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Provider / Company <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="provider"
              required
              value={formData.provider}
              onChange={handleChange}
              placeholder="e.g. Netflix, Amazon, Google"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>

        {/* Category & Billing Cycle */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Billing Cycle <span className="text-rose-500">*</span>
            </label>
            <select
              name="billingCycle"
              value={formData.billingCycle}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {cycles.map((cy) => (
                <option key={cy} value={cy}>
                  {cy}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Cost & Currency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Cost Amount <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              name="cost"
              required
              value={formData.cost}
              onChange={handleChange}
              placeholder="e.g. 649"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Currency
            </label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </div>

        {/* Start Date & Renewal Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Next Renewal Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              name="renewalDate"
              required
              value={formData.renewalDate}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>

        {/* Free Trial Toggle & Expiry Date */}
        <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="isTrial"
              checked={formData.isTrial}
              onChange={handleChange}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                This is a Free Trial Subscription
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Track trial expiration to receive advance cancellation reminders before automatic conversion.
              </p>
            </div>
          </label>

          {formData.isTrial && (
            <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-700">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Trial Expiration Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                name="trialEndDate"
                required={formData.isTrial}
                value={formData.trialEndDate}
                onChange={handleChange}
                className="w-full sm:w-1/2 rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          )}
        </div>

        {/* Provider Official URL */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Official Provider Management URL
          </label>
          <input
            type="url"
            name="providerUrl"
            value={formData.providerUrl}
            onChange={handleChange}
            placeholder="https://example.com/account/billing"
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          <p className="mt-1 text-[11px] text-slate-400">
            SubTrack will provide a safe direct link to manage or cancel your subscription on the official provider website.
          </p>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Personal Notes & Details
          </label>
          <textarea
            name="notes"
            rows={3}
            value={formData.notes}
            onChange={handleChange}
            placeholder="e.g. Family plan shared with 4 devices, billing card ending in 4242"
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => navigate('/subscriptions')}
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 disabled:opacity-50 transition-colors"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Saving...' : isEditing ? 'Update Subscription' : 'Save Subscription'}
          </button>
        </div>
      </form>
    </div>
  );
};
