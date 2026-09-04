import React from 'react';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface UrgencyBadgeProps {
  daysRemaining: number;
  isTrial?: boolean;
}

export const UrgencyBadge: React.FC<UrgencyBadgeProps> = ({ daysRemaining, isTrial }) => {
  if (daysRemaining < 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
        <Clock className="w-3 h-3" />
        Past Due
      </span>
    );
  }

  if (daysRemaining === 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 animate-pulse">
        <AlertTriangle className="w-3 h-3" />
        {isTrial ? 'Trial Expires Today' : 'Renews Today'}
      </span>
    );
  }

  if (daysRemaining <= 3) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900">
        <AlertTriangle className="w-3 h-3 text-rose-600" />
        {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left
      </span>
    );
  }

  if (daysRemaining <= 7) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900">
        <Clock className="w-3 h-3 text-amber-600" />
        in {daysRemaining} days
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
      in {daysRemaining} days
    </span>
  );
};
