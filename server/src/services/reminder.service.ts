import { User } from '../models/user.model';
import { Subscription } from '../models/subscription.model';
import { Notification } from '../models/notification.model';
import { CalculationService } from './calculation.service';
import { EmailService } from './email.service';
import { logger } from '../utils/logger';

export class ReminderService {
  /**
   * Scans all active subscriptions across users and sends renewal reminders.
   */
  static async checkRenewalReminders(): Promise<{ processed: number; sent: number }> {
    let sentCount = 0;
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const users = await User.find();

    for (const user of users) {
      if (!user.emailNotificationsEnabled) continue;

      const subscriptions = await Subscription.find({
        userId: user._id,
        active: true,
      });

      for (const sub of subscriptions) {
        const daysRemaining = CalculationService.getDaysDifference(sub.renewalDate, today);

        // Within user's reminder threshold (e.g. within 7 days, and not yet past)
        if (daysRemaining >= 0 && daysRemaining <= user.reminderDays) {
          const renewalDateStr = new Date(sub.renewalDate).toISOString().split('T')[0];
          const eventKey = `${sub._id}_RENEWAL_${renewalDateStr}`;

          // Check if notification already sent for this renewal cycle
          const existingNotification = await Notification.findOne({
            userId: user._id,
            subscriptionId: sub._id,
            type: 'RENEWAL_REMINDER',
            eventDate: eventKey,
          });

          if (!existingNotification) {
            const formattedCost = `${sub.currency} ${sub.cost}`;
            const emailTemplate = EmailService.getRenewalTemplate({
              userName: user.name,
              serviceName: sub.name,
              amount: formattedCost,
              renewalDate: renewalDateStr,
              daysRemaining,
              providerUrl: sub.providerUrl,
            });

            const emailResult = await EmailService.sendEmail({
              to: user.email,
              subject: emailTemplate.subject,
              text: emailTemplate.text,
              html: emailTemplate.html,
            });

            await Notification.create({
              userId: user._id,
              subscriptionId: sub._id,
              type: 'RENEWAL_REMINDER',
              title: `Upcoming Renewal: ${sub.name}`,
              message: `Your ${sub.name} subscription renews on ${renewalDateStr} (${daysRemaining} days remaining) for ${formattedCost}.`,
              status: emailResult.mode === 'SMTP' ? 'DELIVERED' : 'SIMULATED',
              eventDate: eventKey,
            });

            sentCount++;
          }
        }
      }
    }

    logger.info(`Renewal reminder scan completed. Processed for ${users.length} users, sent ${sentCount} reminders.`);
    return { processed: users.length, sent: sentCount };
  }

  /**
   * Scans active trials approaching expiration and sends alerts.
   */
  static async checkTrialReminders(): Promise<{ processed: number; sent: number }> {
    let sentCount = 0;
    const today = new Date();

    const users = await User.find();

    for (const user of users) {
      if (!user.emailNotificationsEnabled) continue;

      const trials = await Subscription.find({
        userId: user._id,
        active: true,
        isTrial: true,
        trialEndDate: { $exists: true, $ne: null },
      });

      for (const trial of trials) {
        if (!trial.trialEndDate) continue;

        const daysRemaining = CalculationService.getDaysDifference(trial.trialEndDate, today);

        if (daysRemaining >= 0 && daysRemaining <= user.reminderDays) {
          const trialEndStr = new Date(trial.trialEndDate).toISOString().split('T')[0];
          const eventKey = `${trial._id}_TRIAL_${trialEndStr}`;

          const existingNotification = await Notification.findOne({
            userId: user._id,
            subscriptionId: trial._id,
            type: 'TRIAL_EXPIRY',
            eventDate: eventKey,
          });

          if (!existingNotification) {
            const formattedCost = `${trial.currency} ${trial.cost} (${trial.billingCycle})`;
            const emailTemplate = EmailService.getTrialTemplate({
              userName: user.name,
              serviceName: trial.name,
              trialEndDate: trialEndStr,
              daysRemaining,
              amount: formattedCost,
              providerUrl: trial.providerUrl,
            });

            const emailResult = await EmailService.sendEmail({
              to: user.email,
              subject: emailTemplate.subject,
              text: emailTemplate.text,
              html: emailTemplate.html,
            });

            await Notification.create({
              userId: user._id,
              subscriptionId: trial._id,
              type: 'TRIAL_EXPIRY',
              title: `Trial Expiring Soon: ${trial.name}`,
              message: `Your free trial for ${trial.name} ends in ${daysRemaining} days on ${trialEndStr}.`,
              status: emailResult.mode === 'SMTP' ? 'DELIVERED' : 'SIMULATED',
              eventDate: eventKey,
            });

            sentCount++;
          }
        }
      }
    }

    logger.info(`Trial reminder scan completed. Sent ${sentCount} reminders.`);
    return { processed: users.length, sent: sentCount };
  }

  /**
   * Rule-based inactivity check: updates status and optionally notifies.
   */
  static async checkUnusedSubscriptions(): Promise<number> {
    let updatedCount = 0;
    const users = await User.find();
    const today = new Date();

    for (const user of users) {
      const subscriptions = await Subscription.find({
        userId: user._id,
        active: true,
      });

      for (const sub of subscriptions) {
        const evalResult = CalculationService.evaluateUsageStatus(
          sub.lastUsedDate,
          sub.createdAt,
          user.inactivityThreshold,
          today
        );

        if (sub.usageStatus !== evalResult.status) {
          sub.usageStatus = evalResult.status;
          await sub.save();
          updatedCount++;
        }
      }
    }

    logger.info(`Unused subscriptions check completed. Updated ${updatedCount} subscriptions.`);
    return updatedCount;
  }
}
