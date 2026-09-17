import React, { useState, useEffect } from 'react';
import { notificationApi } from '../services/api';
import { NotificationItem } from '../types';
import {
  Bell,
  CheckCheck,
  Play,
  Clock,
  AlertTriangle,
  CreditCard,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { formatDate } from '../utils/formatters';
import { EmptyState } from '../components/EmptyState';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [scanLoading, setScanLoading] = useState<boolean>(false);
  const [scanFeedback, setScanFeedback] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationApi.getAll();
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      fetchNotifications();
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      fetchNotifications();
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleTriggerScan = async () => {
    try {
      setScanLoading(true);
      setScanFeedback(null);
      const res = await notificationApi.triggerScan();
      setScanFeedback(
        `Scan executed! Sent: ${res.renewalsSent} renewal alerts, ${res.trialsSent} trial alerts. Updated: ${res.subscriptionsUsageUpdated} usage statuses. Check server console for simulated emails.`
      );
      fetchNotifications();
    } catch (err: any) {
      setScanFeedback('Scan error: ' + (err.response?.data?.message || err.message));
    } finally {
      setScanLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'RENEWAL_REMINDER':
        return <CreditCard className="h-4 w-4 text-indigo-500" />;
      case 'TRIAL_EXPIRY':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'UNUSED_ALERT':
        return <ShieldAlert className="h-4 w-4 text-rose-500" />;
      default:
        return <Info className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Notification Center
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Audit history of dispatched email alerts, free trial reminders, and inactivity notifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark All Read
            </button>
          )}

          {/* Viva Demonstration Manual Trigger Button */}
          <button
            onClick={handleTriggerScan}
            disabled={scanLoading}
            title="Execute background check immediately for demo and viva presentation"
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors shadow-sm"
          >
            <Play className="h-3.5 w-3.5" />
            {scanLoading ? 'Scanning...' : 'Trigger Viva Demo Scan'}
          </button>
        </div>
      </div>

      {/* Viva Feedback Alert */}
      {scanFeedback && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/80 p-4 text-xs font-medium text-indigo-800 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 shrink-0 mt-0.5 text-indigo-600 dark:text-indigo-400" />
            <p>{scanFeedback}</p>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            <p className="mt-3 text-xs text-slate-500">Loading notification history...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Bell}
              title="No notifications yet"
              description="When your subscriptions approach renewal or trials reach expiration, alerts will appear here."
              actionText="Trigger Viva Demo Scan"
              onAction={handleTriggerScan}
            />
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.map((n) => (
              <div
                key={n._id}
                className={`flex items-start justify-between p-4 sm:p-5 transition-colors ${
                  !n.isRead
                    ? 'bg-indigo-50/25 dark:bg-indigo-950/20'
                    : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                    {getIcon(n.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        {n.title}
                      </h4>
                      {!n.isRead && (
                        <span className="h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {n.message}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(n.createdAt)}
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                        {n.status === 'SIMULATED' ? 'Simulated Log' : 'Delivered'}
                      </span>
                    </div>
                  </div>
                </div>

                {!n.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(n._id)}
                    className="shrink-0 text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 pl-2"
                  >
                    Mark Read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
