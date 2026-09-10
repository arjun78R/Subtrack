import React, { useState, useEffect } from 'react';
import { analyticsApi } from '../services/api';
import {
  PieChart as PieIcon,
  BarChart3,
  TrendingUp,
  CreditCard,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { formatCurrency } from '../utils/formatters';

const COLORS = [
  '#4f46e5', // indigo
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#8b5cf6', // purple
  '#f43f5e', // rose
  '#3b82f6', // blue
  '#14b8a6', // teal
  '#64748b', // slate
];

export const AnalyticsPage: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [cycles, setCycles] = useState<any[]>([]);
  const [trend, setTrend] = useState<any[]>([]);
  const [distribution, setDistribution] = useState<any[]>([]);
  const [grandTotalMonthly, setGrandTotalMonthly] = useState<number>(0);
  const [currency, setCurrency] = useState<string>('INR');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [catData, cycleData, trendData, distData] = await Promise.all([
          analyticsApi.getCategorySpending(),
          analyticsApi.getMonthlyBreakdown(),
          analyticsApi.getSpendingTrend(),
          analyticsApi.getCostDistribution(),
        ]);

        setCategories(catData.categories);
        setGrandTotalMonthly(catData.grandTotalMonthly);
        setCurrency(catData.currency);
        setCycles(cycleData.breakdown);
        setTrend(trendData.trend);
        setDistribution(distData.distribution);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        <p className="mt-3 text-xs text-slate-500">Calculating analytics and expenditure trends...</p>
      </div>
    );
  }

  const annualTotal = grandTotalMonthly * 12;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Spending Analytics & Insights
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Normalized expenditure breakdowns, category distribution, and future commitments.
        </p>
      </div>

      {/* Summary Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Monthly Commitment
          </p>
          <p className="mt-2 text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {formatCurrency(grandTotalMonthly, currency)}
          </p>
          <p className="mt-1 text-xs text-slate-500">Across all active categories</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Annualized Spend
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(annualTotal, currency)}
          </p>
          <p className="mt-1 text-xs text-slate-500">12-month projection</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Top Spending Category
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {categories[0]?.category || 'None'}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {categories[0] ? `${formatCurrency(categories[0].monthlySpend, currency)}/mo` : 'No subscriptions'}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Spending by Category (Donut/Pie Chart) */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PieIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              Spending by Category
            </h3>
            <p className="text-xs text-slate-500">Monthly normalized expenditure by service category</p>
          </div>

          <div className="h-72 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categories}
                  dataKey="monthlySpend"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                >
                  {categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [formatCurrency(value, currency), 'Monthly Spend']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Monthly Breakdown by Billing Cycle */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              Normalized Spend by Billing Cycle
            </h3>
            <p className="text-xs text-slate-500">How commitment distributes across billing frequencies</p>
          </div>

          <div className="h-72 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cycles} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="cycle" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value: any) => [formatCurrency(value, currency), 'Monthly Equivalent']}
                />
                <Bar dataKey="monthlyNormalized" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: 6-Month Projected Spending Trend */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              Projected Monthly Spend Timeline
            </h3>
            <p className="text-xs text-slate-500">Forecast of recurring commitments across next 6 months</p>
          </div>

          <div className="h-72 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value: any) => [formatCurrency(value, currency), 'Projected Spend']}
                />
                <Line
                  type="monotone"
                  dataKey="projectedSpend"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Subscription Cost Distribution */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              Cost Distribution by Price Tier
            </h3>
            <p className="text-xs text-slate-500">Count of subscriptions grouped by monthly price brackets</p>
          </div>

          <div className="h-72 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distribution} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value: any, name: any) => [
                    name === 'count' ? `${value} subscriptions` : formatCurrency(value, currency),
                    name === 'count' ? 'Count' : 'Total Spend',
                  ]}
                />
                <Bar dataKey="count" fill="#ec4899" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
