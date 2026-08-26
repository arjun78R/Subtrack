import { ReminderService } from '../services/reminder.service';
import { logger } from '../utils/logger';

export const runUsageCheckJob = async (): Promise<void> => {
  logger.info('[CRON JOB] Starting daily rule-based unused subscription detection...');
  try {
    const updatedCount = await ReminderService.checkUnusedSubscriptions();
    logger.success(`[CRON JOB] Usage check finished. Updated status on ${updatedCount} subscriptions.`);
  } catch (err: any) {
    logger.error(`[CRON JOB ERROR] Usage check failed: ${err.message}`);
  }
};
