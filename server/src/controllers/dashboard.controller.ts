import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Subscription } from '../models/subscription.model';
import { CalculationService } from '../services/calculation.service';

export const getDashboardSummary = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!._id;
    const subscriptions = await Subscription.find({ userId, active: true });
    const threshold = req.user!.inactivityThreshold;

    const metrics = CalculationService.calculateDashboardMetrics(subscriptions, threshold);

    res.status(200).json({
      currency: req.user!.preferredCurrency,
      ...metrics,
    });
  } catch (error) {
    next(error);
  }
};

export const getUpcomingRenewals = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!._id;
    const today = new Date();

    // Fetch active subscriptions
    const subscriptions = await Subscription.find({
      userId,
      active: true,
    }).sort({ renewalDate: 1 });

    const upcoming = subscriptions
      .map((sub) => {
        const daysRemaining = CalculationService.getDaysDifference(sub.renewalDate, today);
        return {
          id: sub._id,
          name: sub.name,
          provider: sub.provider,
          cost: sub.cost,
          currency: sub.currency,
          billingCycle: sub.billingCycle,
          renewalDate: sub.renewalDate,
          daysRemaining,
          providerUrl: sub.providerUrl,
          isUrgent: daysRemaining <= 3,
        };
      })
      .filter((sub) => sub.daysRemaining >= 0) // Future renewals
      .slice(0, 10); // Next 10 renewals

    res.status(200).json({ upcomingRenewals: upcoming });
  } catch (error) {
    next(error);
  }
};

export const getUnusedSubscriptions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!._id;
    const subscriptions = await Subscription.find({ userId, active: true });
    const today = new Date();
    const threshold = req.user!.inactivityThreshold;

    const unusedList = subscriptions
      .map((sub) => {
        const evalUsage = CalculationService.evaluateUsageStatus(
          sub.lastUsedDate,
          sub.createdAt,
          threshold,
          today
        );

        if (!evalUsage.isUnusedFlagged) return null;

        const monthly = CalculationService.getMonthlyEquivalent(sub.cost, sub.billingCycle);
        const annual = monthly * 12;

        return {
          id: sub._id,
          name: sub.name,
          provider: sub.provider,
          category: sub.category,
          cost: sub.cost,
          currency: sub.currency,
          billingCycle: sub.billingCycle,
          monthlyEquivalent: Math.round(monthly * 100) / 100,
          potentialAnnualCost: Math.round(annual * 100) / 100,
          lastUsedDate: sub.lastUsedDate,
          daysUnused: evalUsage.daysSinceLastUsed,
          usageStatus: evalUsage.status,
          providerUrl: sub.providerUrl,
        };
      })
      .filter(Boolean);

    res.status(200).json({
      unusedSubscriptions: unusedList,
      totalPotentialSavings: Math.round(
        unusedList.reduce((acc, curr: any) => acc + curr.potentialAnnualCost, 0) * 100
      ) / 100,
      currency: req.user!.preferredCurrency,
    });
  } catch (error) {
    next(error);
  }
};
