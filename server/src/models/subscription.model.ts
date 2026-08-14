import mongoose, { Document, Schema } from 'mongoose';

export type BillingCycle = 'Weekly' | 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Yearly';

export type SubscriptionCategory =
  | 'Entertainment'
  | 'Cloud Storage'
  | 'Productivity'
  | 'Development'
  | 'Education'
  | 'Design'
  | 'Music'
  | 'Gaming'
  | 'Business'
  | 'Security'
  | 'Other';

export type UsageStatus = 'Used Recently' | 'Not Used Recently' | 'Never Used';

export interface ISubscription extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  provider: string;
  category: SubscriptionCategory;
  cost: number;
  currency: string;
  billingCycle: BillingCycle;
  startDate: Date;
  renewalDate: Date;
  isTrial: boolean;
  trialEndDate?: Date;
  providerUrl?: string;
  lastUsedDate?: Date | null;
  usageStatus: UsageStatus;
  notes?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    provider: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Entertainment',
        'Cloud Storage',
        'Productivity',
        'Development',
        'Education',
        'Design',
        'Music',
        'Gaming',
        'Business',
        'Security',
        'Other',
      ],
      default: 'Other',
    },
    cost: {
      type: Number,
      required: true,
      min: [0, 'Cost cannot be negative'],
    },
    currency: {
      type: String,
      default: 'INR',
    },
    billingCycle: {
      type: String,
      required: true,
      enum: ['Weekly', 'Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'],
      default: 'Monthly',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    renewalDate: {
      type: Date,
      required: true,
      index: true,
    },
    isTrial: {
      type: Boolean,
      default: false,
    },
    trialEndDate: {
      type: Date,
    },
    providerUrl: {
      type: String,
      trim: true,
      default: '',
    },
    lastUsedDate: {
      type: Date,
      default: null,
    },
    usageStatus: {
      type: String,
      enum: ['Used Recently', 'Not Used Recently', 'Never Used'],
      default: 'Used Recently',
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient user-scoped queries
subscriptionSchema.index({ userId: 1, active: 1, renewalDate: 1 });

export const Subscription = mongoose.model<ISubscription>('Subscription', subscriptionSchema);
