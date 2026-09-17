import cron from 'node-cron';
import { runRenewalReminderJob } from './renewalReminder.job';
import { runTrialReminderJob } from './trialReminder.job';
import { runUsageCheckJob } from './usageCheck.job';
import { logger } from '../utils/logger';

export const initializeScheduler = (): void => {
  logger.info('Initializing Node-Cron background jobs scheduler...');

  // Run daily at 08:00 AM
  cron.schedule('0 8 * * *', async () => {
    logger.info('[CRON TRIGGER] Executing scheduled morning routine...');
    await runRenewalReminderJob();
    await runTrialReminderJob();
    await runUsageCheckJob();
  });

  logger.success('Scheduler initialized: Daily renewal, trial, and usage checks configured at 08:00 AM.');
};
