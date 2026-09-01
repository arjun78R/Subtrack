export type BillingCycle = 'Weekly' | 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Yearly';

export type SubscriptionCategory =
  | 'Entertainment'
  | 'Cloud Storage'
  | 'Productivity'
  | 'Development'
  | 'Education'
  | 'Design'
  | 'Music'
  | 'Gaming'
  | 'Business'
  | 'Security'
  | 'Other';

export type UsageStatus = 'Used Recently' | 'Not Used Recently' | 'Never Used';

export interface User {
  id: string;
  name: string;
  email: string;
  preferredCurrency: string;
  reminderDays: number;
  inactivityThreshold: number;
  emailNotificationsEnabled: boolean;
}

export interface Subscription {
  _id: string;
  userId: string;
  name: string;
  provider: string;
  category: SubscriptionCategory;
  cost: number;
  currency: string;
  billingCycle: BillingCycle;
  startDate: string;
  renewalDate: string;
  isTrial: boolean;
  trialEndDate?: string;
  providerUrl?: string;
  lastUsedDate?: string | null;
  usageStatus: UsageStatus;
  notes?: string;
  active: boolean;
  monthlyEquivalent: number;
  annualEquivalent: number;
  daysUntilRenewal: number;
  daysUntilTrial?: number | null;
  isUnusedFlagged: boolean;
  daysSinceLastUsed?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSummary {
  currency: string;
  totalActive: number;
  monthlyRecurringSpend: number;
  annualRecurringSpend: number;
  potentialSavings: number;
  upcomingRenewalsCount: number;
  trialExpirationsCount: number;
  unusedSubscriptionsCount: number;
}

export interface UpcomingRenewalItem {
  id: string;
  name: string;
  provider: string;
  cost: number;
  currency: string;
  billingCycle: BillingCycle;
  renewalDate: string;
  daysRemaining: number;
  providerUrl?: string;
  isUrgent: boolean;
}

export interface UnusedSubscriptionItem {
  id: string;
  name: string;
  provider: string;
  category: SubscriptionCategory;
  cost: number;
  currency: string;
  billingCycle: BillingCycle;
  monthlyEquivalent: number;
  potentialAnnualCost: number;
  lastUsedDate?: string | null;
  daysUnused?: number | null;
  usageStatus: UsageStatus;
  providerUrl?: string;
}

export interface NotificationItem {
  _id: string;
  userId: string;
  subscriptionId?: string;
  type: 'RENEWAL_REMINDER' | 'TRIAL_EXPIRY' | 'UNUSED_ALERT' | 'GENERAL';
  title: string;
  message: string;
  isRead: boolean;
  sentAt: string;
  status: 'DELIVERED' | 'FAILED' | 'SIMULATED';
  createdAt: string;
}

export interface CalendarEventItem {
  id: string;
  subscriptionId: string;
  title: string;
  serviceName: string;
  provider: string;
  cost: number;
  currency: string;
  billingCycle: BillingCycle;
  date: string;
  type: 'RENEWAL' | 'TRIAL_EXPIRY';
  category: SubscriptionCategory;
  daysRemaining: number;
  providerUrl?: string;
  color: string;
}

export interface EvaluationData {
  evaluation: {
    _id: string;
    period: string;
    beforeUnwantedCharges: number;
    beforeUnusedSpend: number;
    afterUnwantedCharges: number;
    afterUnusedSpend: number;
    notes?: string;
  };
  metrics: {
    chargesSaved: number;
    chargesReductionPercent: number;
    spendSaved: number;
    spendReductionPercent: number;
    currency: string;
  };
}
