import mongoose, { Document, Schema } from 'mongoose';

export type NotificationType = 'RENEWAL_REMINDER' | 'TRIAL_EXPIRY' | 'UNUSED_ALERT' | 'GENERAL';
export type NotificationStatus = 'DELIVERED' | 'FAILED' | 'SIMULATED';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  subscriptionId?: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  sentAt: Date;
  status: NotificationStatus;
  eventDate?: string;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: 'Subscription',
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['RENEWAL_REMINDER', 'TRIAL_EXPIRY', 'UNUSED_ALERT', 'GENERAL'],
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['DELIVERED', 'FAILED', 'SIMULATED'],
      default: 'DELIVERED',
    },
    eventDate: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
