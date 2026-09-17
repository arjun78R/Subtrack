import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { Notification } from '../models/notification.model';
import { ReminderService } from '../services/reminder.service';

export const getNotifications = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!._id;
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    res.status(200).json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!._id;
    const { id } = req.params;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { $set: { isRead: true } },
      { new: true }
    );

    if (!notification) {
      res.status(404).json({ message: 'Notification not found.' });
      return;
    }

    res.status(200).json({ message: 'Marked as read', notification });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!._id;
    await Notification.updateMany({ userId, isRead: false }, { $set: { isRead: true } });

    res.status(200).json({ message: 'All notifications marked as read.' });
  } catch (error) {
    next(error);
  }
};

export const triggerScan = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Manual trigger for viva demo
    const renewals = await ReminderService.checkRenewalReminders();
    const trials = await ReminderService.checkTrialReminders();
    const usageUpdated = await ReminderService.checkUnusedSubscriptions();

    res.status(200).json({
      message: 'Reminder and usage check scan executed successfully',
      renewalsSent: renewals.sent,
      trialsSent: trials.sent,
      subscriptionsUsageUpdated: usageUpdated,
    });
  } catch (error) {
    next(error);
  }
};
