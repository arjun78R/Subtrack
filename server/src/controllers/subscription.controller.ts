import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Subscription } from '../models/subscription.model';
import { Notification } from '../models/notification.model';
import { CalculationService } from '../services/calculation.service';

export const getSubscriptions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { search, category, billingCycle, status, usageStatus, sort } = req.query;

    const query: any = { userId };

    // Filter by Active status
    if (status === 'active') {
      query.active = true;
    } else if (status === 'inactive') {
      query.active = false;
    }

    // Filter by Category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter by Billing Cycle
    if (billingCycle && billingCycle !== 'All') {
      query.billingCycle = billingCycle;
    }

    // Filter by search string (name or provider)
    if (search && typeof search === 'string') {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { provider: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // Determine sort order
    let sortOptions: any = { renewalDate: 1 };
    if (sort === 'cost_desc') sortOptions = { cost: -1 };
    else if (sort === 'cost_asc') sortOptions = { cost: 1 };
    else if (sort === 'name_asc') sortOptions = { name: 1 };
    else if (sort === 'renewalDate_desc') sortOptions = { renewalDate: -1 };
    else if (sort === 'renewalDate_asc') sortOptions = { renewalDate: 1 };

    const rawSubscriptions = await Subscription.find(query).sort(sortOptions);
    const today = new Date();
    const threshold = req.user!.inactivityThreshold;

    // Enhance each subscription with up-to-date calculated properties
    const subscriptions = rawSubscriptions.map((sub) => {
      const monthly = CalculationService.getMonthlyEquivalent(sub.cost, sub.billingCycle);
      const annual = monthly * 12;
      const daysUntilRenewal = CalculationService.getDaysDifference(sub.renewalDate, today);
      const daysUntilTrial = sub.trialEndDate
        ? CalculationService.getDaysDifference(sub.trialEndDate, today)
        : null;

      const evalUsage = CalculationService.evaluateUsageStatus(
        sub.lastUsedDate,
        sub.createdAt,
        threshold,
        today
      );

      return {
        ...sub.toObject(),
        monthlyEquivalent: Math.round(monthly * 100) / 100,
        annualEquivalent: Math.round(annual * 100) / 100,
        daysUntilRenewal,
        daysUntilTrial,
        usageStatus: evalUsage.status,
        isUnusedFlagged: evalUsage.isUnusedFlagged,
        daysSinceLastUsed: evalUsage.daysSinceLastUsed,
      };
    });

    // Optional post-filter for dynamic usage status
    const filtered = usageStatus && usageStatus !== 'All'
      ? subscriptions.filter((s) => s.usageStatus === usageStatus)
      : subscriptions;

    res.status(200).json({ subscriptions: filtered });
  } catch (error) {
    next(error);
  }
};

export const getSubscriptionById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { id } = req.params;

    const sub = await Subscription.findOne({ _id: id, userId });
    if (!sub) {
      res.status(404).json({ message: 'Subscription not found or access denied.' });
      return;
    }

    const today = new Date();
    const monthly = CalculationService.getMonthlyEquivalent(sub.cost, sub.billingCycle);
    const annual = monthly * 12;
    const daysUntilRenewal = CalculationService.getDaysDifference(sub.renewalDate, today);
    const daysUntilTrial = sub.trialEndDate
      ? CalculationService.getDaysDifference(sub.trialEndDate, today)
      : null;

    const evalUsage = CalculationService.evaluateUsageStatus(
      sub.lastUsedDate,
      sub.createdAt,
      req.user!.inactivityThreshold,
      today
    );

    res.status(200).json({
      subscription: {
        ...sub.toObject(),
        monthlyEquivalent: Math.round(monthly * 100) / 100,
        annualEquivalent: Math.round(annual * 100) / 100,
        daysUntilRenewal,
        daysUntilTrial,
        usageStatus: evalUsage.status,
        isUnusedFlagged: evalUsage.isUnusedFlagged,
        daysSinceLastUsed: evalUsage.daysSinceLastUsed,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createSubscription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!._id;
    const subData = {
      ...req.body,
      userId,
      currency: req.body.currency || req.user!.preferredCurrency || 'INR',
      lastUsedDate: req.body.lastUsedDate || new Date(), // Default newly added to used today
      usageStatus: 'Used Recently',
    };

    const newSub = await Subscription.create(subData);
    res.status(201).json({
      message: 'Subscription registered successfully',
      subscription: newSub,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSubscription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { id } = req.params;

    const sub = await Subscription.findOneAndUpdate(
      { _id: id, userId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!sub) {
      res.status(404).json({ message: 'Subscription not found or access denied.' });
      return;
    }

    res.status(200).json({
      message: 'Subscription updated successfully',
      subscription: sub,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSubscription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { id } = req.params;

    const sub = await Subscription.findOneAndDelete({ _id: id, userId });
    if (!sub) {
      res.status(404).json({ message: 'Subscription not found or access denied.' });
      return;
    }

    // Rule 9: Cascade delete associated notifications
    await Notification.deleteMany({ subscriptionId: id, userId });

    res.status(200).json({ message: 'Subscription deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

export const markAsUsed = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { id } = req.params;

    const sub = await Subscription.findOne({ _id: id, userId });
    if (!sub) {
      res.status(404).json({ message: 'Subscription not found or access denied.' });
      return;
    }

    sub.lastUsedDate = new Date();
    sub.usageStatus = 'Used Recently';
    await sub.save();

    res.status(200).json({
      message: `Marked "${sub.name}" as used recently. Inactivity timer reset.`,
      subscription: sub,
    });
  } catch (error) {
    next(error);
  }
};
