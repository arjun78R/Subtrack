import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Subscription } from '../models/subscription.model';
import { CalculationService } from '../services/calculation.service';

export const getCategorySpending = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!._id;
    const subscriptions = await Subscription.find({ userId, active: true });

    const categoryTotals: Record<string, { monthlySpend: number; count: number }> = {};
    let grandTotalMonthly = 0;

    subscriptions.forEach((sub) => {
      const monthly = CalculationService.getMonthlyEquivalent(sub.cost, sub.billingCycle);
      grandTotalMonthly += monthly;

      if (!categoryTotals[sub.category]) {
        categoryTotals[sub.category] = { monthlySpend: 0, count: 0 };
      }
      categoryTotals[sub.category].monthlySpend += monthly;
      categoryTotals[sub.category].count += 1;
    });

    const categories = Object.keys(categoryTotals).map((cat) => {
      const spend = Math.round(categoryTotals[cat].monthlySpend * 100) / 100;
      const percentage = grandTotalMonthly > 0 ? Math.round((spend / grandTotalMonthly) * 1000) / 10 : 0;
      return {
        category: cat,
        monthlySpend: spend,
        count: categoryTotals[cat].count,
        percentage,
      };
    });

    // Sort descending by monthlySpend
    categories.sort((a, b) => b.monthlySpend - a.monthlySpend);

    res.status(200).json({
      currency: req.user!.preferredCurrency,
      grandTotalMonthly: Math.round(grandTotalMonthly * 100) / 100,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

export const getMonthlyBreakdown = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!._id;
    const subscriptions = await Subscription.find({ userId, active: true });

    // Group spending by billing cycle
    const cycleTotals: Record<string, { totalNormalized: number; rawCount: number }> = {
      Weekly: { totalNormalized: 0, rawCount: 0 },
      Monthly: { totalNormalized: 0, rawCount: 0 },
      Quarterly: { totalNormalized: 0, rawCount: 0 },
      'Half-Yearly': { totalNormalized: 0, rawCount: 0 },
      Yearly: { totalNormalized: 0, rawCount: 0 },
    };

    subscriptions.forEach((sub) => {
      const monthly = CalculationService.getMonthlyEquivalent(sub.cost, sub.billingCycle);
      if (cycleTotals[sub.billingCycle]) {
        cycleTotals[sub.billingCycle].totalNormalized += monthly;
        cycleTotals[sub.billingCycle].rawCount += 1;
      }
    });

    const breakdown = Object.keys(cycleTotals).map((cycle) => ({
      cycle,
      monthlyNormalized: Math.round(cycleTotals[cycle].totalNormalized * 100) / 100,
      annualNormalized: Math.round(cycleTotals[cycle].totalNormalized * 12 * 100) / 100,
      count: cycleTotals[cycle].rawCount,
    }));

    res.status(200).json({
      currency: req.user!.preferredCurrency,
      breakdown,
    });
  } catch (error) {
    next(error);
  }
};

export const getSpendingTrend = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!._id;
    const subscriptions = await Subscription.find({ userId, active: true });

    // Project monthly spend across the upcoming 6-12 calendar months
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const trend: { month: string; projectedSpend: number; renewalsCount: number }[] = [];

    // Calculate baseline monthly recurring
    const baseMonthly = subscriptions.reduce((acc, s) => {
      return acc + CalculationService.getMonthlyEquivalent(s.cost, s.billingCycle);
    }, 0);

    for (let i = 0; i < 6; i++) {
      const targetMonth = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const label = `${monthNames[targetMonth.getMonth()]} ${targetMonth.getFullYear().toString().substring(2)}`;
      
      // Count renewals falling in this month
      const monthRenewals = subscriptions.filter((sub) => {
        const d = new Date(sub.renewalDate);
        return d.getMonth() === targetMonth.getMonth();
      }).length;

      trend.push({
        month: label,
        projectedSpend: Math.round(baseMonthly * 100) / 100,
        renewalsCount: monthRenewals,
      });
    }

    res.status(200).json({
      currency: req.user!.preferredCurrency,
      trend,
    });
  } catch (error) {
    next(error);
  }
};

export const getCostDistribution = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!._id;
    const subscriptions = await Subscription.find({ userId, active: true });

    const buckets = [
      { range: '₹0 - ₹500', min: 0, max: 500, count: 0, total: 0 },
      { range: '₹501 - ₹1,000', min: 501, max: 1000, count: 0, total: 0 },
      { range: '₹1,001 - ₹2,000', min: 1001, max: 2000, count: 0, total: 0 },
      { range: '₹2,001+', min: 2001, max: Infinity, count: 0, total: 0 },
    ];

    subscriptions.forEach((sub) => {
      const monthly = CalculationService.getMonthlyEquivalent(sub.cost, sub.billingCycle);
      const match = buckets.find((b) => monthly >= b.min && monthly <= b.max);
      if (match) {
        match.count += 1;
        match.total += monthly;
      }
    });

    res.status(200).json({
      currency: req.user!.preferredCurrency,
      distribution: buckets.map((b) => ({
        range: b.range,
        count: b.count,
        totalMonthly: Math.round(b.total * 100) / 100,
      })),
    });
  } catch (error) {
    next(error);
  }
};
