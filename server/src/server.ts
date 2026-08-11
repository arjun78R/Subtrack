import app from './app';
import { config } from './config/env';
import { connectDB } from './config/db';
import { EmailService } from './services/email.service';
import { initializeScheduler } from './jobs/scheduler';
import { logger } from './utils/logger';
import { User } from './models/user.model';
import { seedDatabase } from './utils/seed';

const startServer = async () => {
  try {
    logger.info('Starting SubTrack Server Initialization...');

    // 1. Connect to Database (with in-memory fallback for zero-friction setup)
    await connectDB();

    // 2. Initialize Email System
    EmailService.initialize();

    // 3. Initialize Background Cron Scheduler
    initializeScheduler();

    // 4. Auto-seed demo account if database has no users
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      logger.info('No user accounts detected. Auto-seeding default demo dataset...');
      await seedDatabase(false); // Do not disconnect!
    }

    // 5. Start HTTP Listener
    const server = app.listen(config.port, () => {
      logger.success(`=======================================================`);
      logger.success(`  SUBTRACK BACKEND SERVER READY ON PORT ${config.port}`);
      logger.success(`  URL: http://localhost:${config.port}`);
      logger.success(`  Health: http://localhost:${config.port}/api/health`);
      logger.success(`  Demo Account: demo@subtrack.local / Demo@12345`);
      logger.success(`=======================================================`);
    });

    // Graceful Shutdown Handlers
    const shutdown = async () => {
      logger.info('Shutting down server gracefully...');
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error: any) {
    logger.error('Fatal error during server startup:', error.message);
    process.exit(1);
  }
};

startServer();
