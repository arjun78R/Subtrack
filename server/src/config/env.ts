import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/subtrack',
  jwtSecret: process.env.JWT_SECRET || 'subtrack_super_secret_jwt_key_mca_2026_demo_key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASSWORD || '',
    from: process.env.EMAIL_FROM || '"SubTrack Alerts" <no-reply@subtrack.local>',
  },
};
