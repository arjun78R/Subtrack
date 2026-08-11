import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { config } from './env';
import { logger } from '../utils/logger';

let memoryServer: MongoMemoryServer | null = null;

export const connectDB = async (): Promise<void> => {
  try {
    // Attempt connecting to the configured URI (e.g. local mongod or Atlas)
    logger.info(`Attempting database connection to: ${config.mongodbUri}`);
    await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 3000,
    });
    logger.success('Connected to external/local MongoDB instance successfully.');
  } catch (error: any) {
    logger.warn(`Could not connect to ${config.mongodbUri}: ${error.message}`);
    logger.info('Starting embedded in-memory MongoDB server for zero-friction development/viva demo...');

    try {
      memoryServer = await MongoMemoryServer.create();
      const memoryUri = memoryServer.getUri();
      await mongoose.connect(memoryUri);
      logger.success(`Embedded MongoDB running at: ${memoryUri}`);
    } catch (memError: any) {
      logger.error('Failed to start in-memory MongoDB server:', memError.message);
      throw memError;
    }
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    if (memoryServer) {
      await memoryServer.stop();
      memoryServer = null;
    }
    logger.info('Database disconnected cleanly.');
  } catch (err: any) {
    logger.error('Error disconnecting database:', err.message);
  }
};
