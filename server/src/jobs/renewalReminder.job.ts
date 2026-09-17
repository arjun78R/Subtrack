import { ReminderService } from '../services/reminder.service';
import { logger } from '../utils/logger';

export const runRenewalReminderJob = async (): Promise<void> => {
  logger.info('[CRON JOB] Starting daily renewal reminder check...');
  try {
    const result = await ReminderService.checkRenewalReminders();
    logger.success(`[CRON JOB] Renewal reminder check finished. Processed users: ${result.processed}, Reminders sent: ${result.sent}`);
  } catch (err: any) {
    logger.error(`[CRON JOB ERROR] Renewal reminder check failed: ${err.message}`);
  }
};
