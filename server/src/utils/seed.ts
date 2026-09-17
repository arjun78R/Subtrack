import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../config/db';
import { User } from '../models/user.model';
import { Subscription } from '../models/subscription.model';
import { Notification } from '../models/notification.model';
import { EvaluationRecord } from '../models/evaluation.model';
import { logger } from './logger';

export const seedDatabase = async (disconnectAfter: boolean = true) => {
  logger.info('--- Starting Database Seeding Process ---');
  if (mongoose.connection.readyState !== 1) {
    await connectDB();
  }

  try {
    const demoEmail = 'demo@subtrack.local';
    let demoUser = await User.findOne({ email: demoEmail });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Demo@12345', salt);

    if (!demoUser) {
      demoUser = await User.create({
        name: 'MCA Demo Student',
        email: demoEmail,
        passwordHash,
        preferredCurrency: 'INR',
        reminderDays: 7,
        inactivityThreshold: 30,
        emailNotificationsEnabled: true,
      });
      logger.success(`Created demo user: ${demoEmail} (Password: Demo@12345)`);
    } else {
      demoUser.passwordHash = passwordHash;
      await demoUser.save();
      logger.info(`Updated demo user: ${demoEmail}`);
    }

    // Clean previous demo user subscriptions, notifications, and evaluations
    await Subscription.deleteMany({ userId: demoUser._id });
    await Notification.deleteMany({ userId: demoUser._id });
    await EvaluationRecord.deleteMany({ userId: demoUser._id });

    const now = new Date();
    const addDays = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    const subtractDays = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const subscriptionsData = [
      {
        userId: demoUser._id,
        name: 'Netflix Premium (4K)',
        provider: 'Netflix',
        category: 'Entertainment',
        cost: 649,
        currency: 'INR',
        billingCycle: 'Monthly',
        startDate: subtractDays(90),
        renewalDate: addDays(3), // Renews in 3 days -> URGENT ALERT
        isTrial: false,
        providerUrl: 'https://www.netflix.com/youraccount',
        lastUsedDate: now,
        usageStatus: 'Used Recently',
        notes: 'Family 4K plan shared with home TV',
        active: true,
      },
      {
        userId: demoUser._id,
        name: 'Spotify Premium Individual',
        provider: 'Spotify',
        category: 'Music',
        cost: 119,
        currency: 'INR',
        billingCycle: 'Monthly',
        startDate: subtractDays(180),
        renewalDate: addDays(14),
        isTrial: false,
        providerUrl: 'https://www.spotify.com/account/overview',
        lastUsedDate: subtractDays(2),
        usageStatus: 'Used Recently',
        notes: 'Daily music and podcasts',
        active: true,
      },
      {
        userId: demoUser._id,
        name: 'AWS Cloud Services',
        provider: 'Amazon Web Services',
        category: 'Cloud Storage',
        cost: 1850,
        currency: 'INR',
        billingCycle: 'Monthly',
        startDate: subtractDays(60),
        renewalDate: addDays(7), // Renews in 7 days -> Reminder window
        isTrial: false,
        providerUrl: 'https://console.aws.amazon.com/billing/home',
        lastUsedDate: subtractDays(8),
        usageStatus: 'Used Recently',
        notes: 'EC2 & S3 bucket hosting for academic project',
        active: true,
      },
      {
        userId: demoUser._id,
        name: 'Adobe Creative Cloud All Apps',
        provider: 'Adobe Systems',
        category: 'Design',
        cost: 1675,
        currency: 'INR',
        billingCycle: 'Monthly',
        startDate: subtractDays(120),
        renewalDate: addDays(21),
        isTrial: false,
        providerUrl: 'https://account.adobe.com/plans',
        lastUsedDate: subtractDays(48), // Unused for 48 days -> FLAGGED UNUSED!
        usageStatus: 'Not Used Recently',
        notes: 'Subscribed for semester multimedia course',
        active: true,
      },
      {
        userId: demoUser._id,
        name: 'Canva Pro for Teams',
        provider: 'Canva',
        category: 'Design',
        cost: 3999,
        currency: 'INR',
        billingCycle: 'Yearly',
        startDate: subtractDays(100),
        renewalDate: addDays(45),
        isTrial: false,
        providerUrl: 'https://www.canva.com/settings/billing',
        lastUsedDate: subtractDays(1),
        usageStatus: 'Used Recently',
        notes: 'Annual subscription for slide decks and graphics',
        active: true,
      },
      {
        userId: demoUser._id,
        name: 'Google One (2TB Cloud Storage)',
        provider: 'Google',
        category: 'Cloud Storage',
        cost: 650,
        currency: 'INR',
        billingCycle: 'Quarterly',
        startDate: subtractDays(70),
        renewalDate: addDays(20),
        isTrial: false,
        providerUrl: 'https://one.google.com/storage',
        lastUsedDate: subtractDays(4),
        usageStatus: 'Used Recently',
        notes: 'Phone backup and Google Drive',
        active: true,
      },
      {
        userId: demoUser._id,
        name: 'GitHub Copilot Individual',
        provider: 'GitHub',
        category: 'Development',
        cost: 850,
        currency: 'INR',
        billingCycle: 'Monthly',
        startDate: subtractDays(26),
        renewalDate: addDays(12),
        isTrial: true,
        trialEndDate: addDays(4), // Trial ends in 4 days -> TRIAL EXPIRING ALERT!
        providerUrl: 'https://github.com/settings/billing',
        lastUsedDate: subtractDays(1),
        usageStatus: 'Used Recently',
        notes: 'AI developer autocomplete trial',
        active: true,
      },
      {
        userId: demoUser._id,
        name: 'Microsoft 365 Personal',
        provider: 'Microsoft',
        category: 'Productivity',
        cost: 4899,
        currency: 'INR',
        billingCycle: 'Yearly',
        startDate: subtractDays(40),
        renewalDate: addDays(90),
        isTrial: false,
        providerUrl: 'https://account.microsoft.com/services',
        lastUsedDate: null, // Never used -> FLAGGED UNUSED!
        usageStatus: 'Never Used',
        notes: 'Bundled with laptop purchase, not utilized',
        active: true,
      },
    ];

    const insertedSubs = await Subscription.insertMany(subscriptionsData);
    logger.success(`Seeded ${insertedSubs.length} subscriptions for demo user.`);

    // Seed sample initial notifications
    await Notification.create([
      {
        userId: demoUser._id,
        subscriptionId: insertedSubs[0]._id, // Netflix
        type: 'RENEWAL_REMINDER',
        title: 'Upcoming Renewal: Netflix Premium',
        message: 'Your Netflix subscription renews in 3 days on ' + addDays(3).toLocaleDateString() + ' for INR 649.',
        isRead: false,
        status: 'SIMULATED',
        sentAt: subtractDays(1),
      },
      {
        userId: demoUser._id,
        subscriptionId: insertedSubs[6]._id, // GitHub Copilot
        type: 'TRIAL_EXPIRY',
        title: 'Free Trial Expiring: GitHub Copilot',
        message: 'Your free trial ends in 4 days on ' + addDays(4).toLocaleDateString() + '. Review to avoid unwanted charge.',
        isRead: false,
        status: 'SIMULATED',
        sentAt: subtractDays(1),
      },
      {
        userId: demoUser._id,
        subscriptionId: insertedSubs[3]._id, // Adobe CC
        type: 'UNUSED_ALERT',
        title: 'Potentially Unused Service: Adobe Creative Cloud',
        message: 'You have not recorded usage for 48 days. Potential annual commitment: INR 20,100.',
        isRead: true,
        status: 'SIMULATED',
        sentAt: subtractDays(3),
      },
    ]);

    // Seed Academic Evaluation Record for Before vs After study
    await EvaluationRecord.create({
      userId: demoUser._id,
      period: 'Semester 5 Evaluation Cohort',
      beforeUnwantedCharges: 5,
      beforeUnusedSpend: 9800,
      afterUnwantedCharges: 1,
      afterUnusedSpend: 1675,
      notes: 'Pilot testing: 80% reduction in unexpected charges, ~83% reduction in unused subscription expenditure.',
    });

    logger.success('Seeded initial notifications and MCA evaluation research record.');
    logger.success('--- Database Seeding Complete! ---');
    logger.info('Demo Credentials:');
    logger.info('  Email:    demo@subtrack.local');
    logger.info('  Password: Demo@12345');
  } catch (error: any) {
    logger.error('Error during database seed:', error.message);
  } finally {
    if (disconnectAfter) {
      await disconnectDB();
    }
  }
};

// Run directly if invoked from CLI
if (require.main === module) {
  seedDatabase(true).then(() => process.exit(0));
}
