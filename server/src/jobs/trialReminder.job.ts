import { ReminderService } from '../services/reminder.service';
import { logger } from '../utils/logger';

export const runTrialReminderJob = async (): Promise<void> => {
  logger.info('[CRON JOB] Starting daily free-trial expiration check...');
  try {
    const result = await ReminderService.checkTrialReminders();
    logger.success(`[CRON JOB] Free-trial reminder check finished. Reminders sent: ${result.sent}`);
  } catch (err: any) {
    logger.error(`[CRON JOB ERROR] Free-trial reminder check failed: ${err.message}`);
  }
};
