import React, { useState, useEffect } from 'react';
import { evaluationApi } from '../services/api';
import { EvaluationData } from '../types';
import {
  Scale,
  TrendingDown,
  Percent,
  PiggyBank,
  CheckCircle2,
  Save,
  Info,
  BarChart2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from 'recharts';
import { formatCurrency } from '../utils/formatters';

export const EvaluationPage: React.FC = () => {
  const [data, setData] = useState<EvaluationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState({
    period: 'MCA Semester 5 Pilot Study',
    beforeUnwantedCharges: '4',
    beforeUnusedSpend: '8400',
    afterUnwantedCharges: '1',
    afterUnusedSpend: '1600',
    notes: 'Comparison of 60-day baseline before vs after adopting SubTrack.',
  });

  const fetchEvaluation = async () => {
    try {
      setLoading(true);
      const res = await evaluationApi.getData();
      setData(res);
      if (res.evaluation) {
        setForm({
          period: res.evaluation.period,
          beforeUnwantedCharges: res.evaluation.beforeUnwantedCharges.toString(),
          beforeUnusedSpend: res.evaluation.beforeUnusedSpend.toString(),
          afterUnwantedCharges: res.evaluation.afterUnwantedCharges.toString(),
          afterUnusedSpend: res.evaluation.afterUnusedSpend.toString(),
          notes: res.evaluation.notes || '',
        });
      }
    } catch (err) {
      console.error('Error fetching evaluation data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluation();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);

    try {
      await evaluationApi.saveData({
        period: form.period,
        beforeUnwantedCharges: Number(form.beforeUnwantedCharges),
        beforeUnusedSpend: Number(form.beforeUnusedSpend),
        afterUnwantedCharges: Number(form.afterUnwantedCharges),
        afterUnusedSpend: Number(form.afterUnusedSpend),
        notes: form.notes,
      });

      setSuccessMsg('Evaluation data updated successfully! Recalculated metrics.');
      setTimeout(() => setSuccessMsg(null), 3500);
      fetchEvaluation();
    } catch (err: any) {
      console.error('Error saving evaluation data:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="py-20 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        <p className="mt-3 text-xs text-slate-500">Loading project evaluation metrics...</p>
      </div>
    );
  }

  const currency = data.metrics.currency || 'INR';

  // Prepare chart dataset
  const comparisonChargesData = [
    {
      metric: 'Unwanted Renewal Charges (Count)',
      'Before SubTrack': data.evaluation.beforeUnwantedCharges,
      'After SubTrack': data.evaluation.afterUnwantedCharges,
    },
  ];

  const comparisonSpendData = [
    {
      metric: 'Unused Subscription Spend',
      'Before SubTrack': data.evaluation.beforeUnusedSpend,
      'After SubTrack': data.evaluation.afterUnusedSpend,
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900 mb-2">
          <Scale className="h-3.5 w-3.5" />
          Academic Research & Evaluation Module
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          System Effectiveness Evaluation
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Empirical comparison of unwanted renewal charges and unused spend before vs after using SubTrack.
        </p>
      </div>

      {/* Mandatory Academic Disclaimer Banner */}
      <div className="flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-blue-900 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300">
        <Info className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
        <p>
          <strong>Project Requirement Notice:</strong> This section compares user-reported metrics to evaluate the practical impact of SubTrack's reminder and rule-based usage algorithms. Clearly identified as <em>User-entered evaluation data</em>.
        </p>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 text-xs font-medium text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Calculated Improvement Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Unwanted Charges Reduced
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {data.metrics.chargesSaved} Charges
            </h3>
          </div>
          <p className="mt-1 text-xs text-emerald-600 font-semibold">
            {data.metrics.chargesReductionPercent}% Reduction
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Unused Spend Eliminated
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(data.metrics.spendSaved, currency)}
            </h3>
          </div>
          <p className="mt-1 text-xs text-emerald-600 font-semibold">
            {data.metrics.spendReductionPercent}% Expenditure Saved
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Charges: Before vs After
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {data.evaluation.beforeUnwantedCharges} → {data.evaluation.afterUnwantedCharges}
          </p>
          <p className="mt-1 text-xs text-slate-500">Unintentional renewal charges</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Spend: Before vs After
          </p>
          <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white truncate">
            {formatCurrency(data.evaluation.beforeUnusedSpend, currency)} →{' '}
            {formatCurrency(data.evaluation.afterUnusedSpend, currency)}
          </p>
          <p className="mt-1 text-xs text-slate-500">Unused subscription spend</p>
        </div>
      </div>

      {/* Comparison Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Unwanted Renewal Charges Count */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
            <BarChart2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            Unwanted Renewal Charges (Count)
          </h3>
          <p className="text-xs text-slate-500 mb-4">Comparison of unexpected billings before vs after</p>

          <div className="h-64 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonChargesData} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="metric" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Before SubTrack" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                <Bar dataKey="After SubTrack" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Unused Subscription Spending */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
            <PiggyBank className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            Unused Subscription Expenditure ({currency})
          </h3>
          <p className="text-xs text-slate-500 mb-4">Financial commitment to services with zero active usage</p>

          <div className="h-64 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonSpendData} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="metric" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val: any) => formatCurrency(val, currency)} />
                <Legend />
                <Bar dataKey="Before SubTrack" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                <Bar dataKey="After SubTrack" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Manual Input Form for Custom Viva / Project Testing */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-3 dark:border-slate-800">
          Modify Evaluation Dataset
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
          Update the baseline and post-adoption numbers to demonstrate system evaluation for your project report.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Study Evaluation Period / Cohort Name
            </label>
            <input
              type="text"
              value={form.period}
              onChange={(e) => setForm({ ...form, period: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Before SubTrack: Unwanted Renewal Charges (Count)
              </label>
              <input
                type="number"
                min="0"
                value={form.beforeUnwantedCharges}
                onChange={(e) => setForm({ ...form, beforeUnwantedCharges: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                After SubTrack: Unwanted Renewal Charges (Count)
              </label>
              <input
                type="number"
                min="0"
                value={form.afterUnwantedCharges}
                onChange={(e) => setForm({ ...form, afterUnwantedCharges: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Before SubTrack: Unused Subscription Spend ({currency})
              </label>
              <input
                type="number"
                min="0"
                value={form.beforeUnusedSpend}
                onChange={(e) => setForm({ ...form, beforeUnusedSpend: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                After SubTrack: Unused Subscription Spend ({currency})
              </label>
              <input
                type="number"
                min="0"
                value={form.afterUnusedSpend}
                onChange={(e) => setForm({ ...form, afterUnusedSpend: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Study Methodology Notes
            </label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors shadow-sm"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Update Evaluation Dataset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
