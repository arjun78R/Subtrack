import { BillingCycle, ISubscription, UsageStatus } from '../models/subscription.model';

export class CalculationService {
  /**
   * Normalizes any billing cycle cost to a standard monthly equivalent.
   */
  static getMonthlyEquivalent(cost: number, cycle: BillingCycle): number {
    if (cost <= 0) return 0;

    switch (cycle) {
      case 'Weekly':
        return (cost * 52) / 12;
      case 'Monthly':
        return cost;
      case 'Quarterly':
        return cost / 3;
      case 'Half-Yearly':
        return cost / 6;
      case 'Yearly':
        return cost / 12;
      default:
        return cost;
    }
  }

  /**
   * Calculates standard annual equivalent from monthly equivalent.
   */
  static getAnnualEquivalent(cost: number, cycle: BillingCycle): number {
    const monthly = this.getMonthlyEquivalent(cost, cycle);
    return monthly * 12;
  }

  /**
   * Calculates the difference in integer calendar days between two dates.
   * Positive means futureDate is in the future.
   */
  static getDaysDifference(targetDate: Date, baseDate: Date = new Date()): number {
    const target = new Date(targetDate);
    const base = new Date(baseDate);

    // Normalize to midnight UTC for consistent day counting
    const utcTarget = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());
    const utcBase = Date.UTC(base.getFullYear(), base.getMonth(), base.getDate());

    const diffMs = utcTarget - utcBase;
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
  }

  /**
   * Evaluates the rule-based usage status of a subscription.
   * If never used, returns 'Never Used'.
   * If days since last used > inactivityThreshold, returns 'Not Used Recently'.
   * Otherwise returns 'Used Recently'.
   */
  static evaluateUsageStatus(
    lastUsedDate: Date | null | undefined,
    createdDate: Date,
    inactivityThresholdDays: number = 30,
    currentDate: Date = new Date()
  ): { status: UsageStatus; isUnusedFlagged: boolean; daysSinceLastUsed: number | null } {
    if (!lastUsedDate) {
      const daysSinceCreated = Math.abs(this.getDaysDifference(currentDate, createdDate));
      return {
        status: 'Never Used',
        isUnusedFlagged: daysSinceCreated >= inactivityThresholdDays,
        daysSinceLastUsed: null,
      };
    }

    const daysSinceLastUsed = Math.abs(this.getDaysDifference(currentDate, lastUsedDate));
    const isUnused = daysSinceLastUsed >= inactivityThresholdDays;

    return {
      status: isUnused ? 'Not Used Recently' : 'Used Recently',
      isUnusedFlagged: isUnused,
      daysSinceLastUsed,
    };
  }

  /**
   * Aggregates financial metrics across a list of subscriptions.
   */
  static calculateDashboardMetrics(
    subscriptions: ISubscription[],
    inactivityThresholdDays: number = 30
  ) {
    let totalActive = 0;
    let monthlyRecurringSpend = 0;
    let annualRecurringSpend = 0;
    let potentialSavings = 0;
    let upcomingRenewalsCount = 0;
    let trialExpirationsCount = 0;
    let unusedSubscriptionsCount = 0;

    const today = new Date();

    subscriptions.forEach((sub) => {
      if (!sub.active) return;

      totalActive += 1;
      const monthlyCost = this.getMonthlyEquivalent(sub.cost, sub.billingCycle);
      const annualCost = monthlyCost * 12;

      monthlyRecurringSpend += monthlyCost;
      annualRecurringSpend += annualCost;

      // Check upcoming renewals (within next 30 days)
      const daysToRenewal = this.getDaysDifference(sub.renewalDate, today);
      if (daysToRenewal >= 0 && daysToRenewal <= 30) {
        upcomingRenewalsCount += 1;
      }

      // Check trial status
      if (sub.isTrial && sub.trialEndDate) {
        const daysToTrial = this.getDaysDifference(sub.trialEndDate, today);
        if (daysToTrial >= 0 && daysToTrial <= 30) {
          trialExpirationsCount += 1;
        }
      }

      // Check unused rule
      const usageEvaluation = this.evaluateUsageStatus(
        sub.lastUsedDate,
        sub.createdAt,
        inactivityThresholdDays,
        today
      );

      if (usageEvaluation.isUnusedFlagged) {
        unusedSubscriptionsCount += 1;
        potentialSavings += annualCost;
      }
    });

    return {
      totalActive,
      monthlyRecurringSpend: Math.round(monthlyRecurringSpend * 100) / 100,
      annualRecurringSpend: Math.round(annualRecurringSpend * 100) / 100,
      potentialSavings: Math.round(potentialSavings * 100) / 100,
      upcomingRenewalsCount,
      trialExpirationsCount,
      unusedSubscriptionsCount,
    };
  }
}
