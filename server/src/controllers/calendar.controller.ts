import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Subscription } from '../models/subscription.model';
import { CalculationService } from '../services/calculation.service';

export const getCalendarEvents = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!._id;
    const subscriptions = await Subscription.find({ userId, active: true });
    const today = new Date();

    const events: any[] = [];

    subscriptions.forEach((sub) => {
      // 1. Subscription Renewal Event
      const daysToRenewal = CalculationService.getDaysDifference(sub.renewalDate, today);
      events.push({
        id: `renewal-${sub._id}`,
        subscriptionId: sub._id,
        title: `${sub.name} (${sub.currency} ${sub.cost})`,
        serviceName: sub.name,
        provider: sub.provider,
        cost: sub.cost,
        currency: sub.currency,
        billingCycle: sub.billingCycle,
        date: sub.renewalDate,
        type: 'RENEWAL',
        category: sub.category,
        daysRemaining: daysToRenewal,
        providerUrl: sub.providerUrl,
        color: daysToRenewal <= 3 ? '#ef4444' : '#4f46e5', // Red if urgent, indigo otherwise
      });

      // 2. Trial Expiration Event (if trial is active)
      if (sub.isTrial && sub.trialEndDate) {
        const daysToTrial = CalculationService.getDaysDifference(sub.trialEndDate, today);
        events.push({
          id: `trial-${sub._id}`,
          subscriptionId: sub._id,
          title: `Trial Ends: ${sub.name}`,
          serviceName: sub.name,
          provider: sub.provider,
          cost: sub.cost,
          currency: sub.currency,
          billingCycle: sub.billingCycle,
          date: sub.trialEndDate,
          type: 'TRIAL_EXPIRY',
          category: sub.category,
          daysRemaining: daysToTrial,
          providerUrl: sub.providerUrl,
          color: '#f97316', // Orange for trial expiry
        });
      }
    });

    // Sort chronologically by date
    events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    res.status(200).json({ events });
  } catch (error) {
    next(error);
  }
};
