import axios from 'axios';
import {
  User,
  Subscription,
  DashboardSummary,
  UpcomingRenewalItem,
  UnusedSubscriptionItem,
  NotificationItem,
  CalendarEventItem,
  EvaluationData,
} from '../types';

export const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('subtrack_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 session expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized and not on login/register, clear token
      if (
        !window.location.pathname.includes('/login') &&
        !window.location.pathname.includes('/register')
      ) {
        localStorage.removeItem('subtrack_token');
        localStorage.removeItem('subtrack_user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await api.post<{ token: string; user: User; message: string }>('/auth/login', credentials);
    return res.data;
  },
  register: async (userData: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    preferredCurrency?: string;
  }) => {
    const res = await api.post<{ token: string; user: User; message: string }>('/auth/register', userData);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get<{ user: User }>('/auth/me');
    return res.data;
  },
  forgotPassword: async (data: { email: string }) => {
    const res = await api.post<{ message: string }>('/auth/forgot-password', data);
    return res.data;
  },
  resetPassword: async (data: { email: string; resetToken: string; newPassword: string }) => {
    const res = await api.post<{ message: string }>('/auth/reset-password', data);
    return res.data;
  },
  updateProfile: async (data: Partial<User>) => {
    const res = await api.put<{ user: User; message: string }>('/auth/profile', data);
    return res.data;
  },
};

export const subscriptionApi = {
  getAll: async (params?: {
    search?: string;
    category?: string;
    billingCycle?: string;
    status?: string;
    usageStatus?: string;
    sort?: string;
  }) => {
    const res = await api.get<{ subscriptions: Subscription[] }>('/subscriptions', { params });
    return res.data;
  },
  getById: async (id: string) => {
    const res = await api.get<{ subscription: Subscription }>(`/subscriptions/${id}`);
    return res.data;
  },
  create: async (data: Partial<Subscription>) => {
    const res = await api.post<{ subscription: Subscription; message: string }>('/subscriptions', data);
    return res.data;
  },
  update: async (id: string, data: Partial<Subscription>) => {
    const res = await api.put<{ subscription: Subscription; message: string }>(`/subscriptions/${id}`, data);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete<{ message: string }>(`/subscriptions/${id}`);
    return res.data;
  },
  markAsUsed: async (id: string) => {
    const res = await api.patch<{ subscription: Subscription; message: string }>(
      `/subscriptions/${id}/mark-used`
    );
    return res.data;
  },
};

export const dashboardApi = {
  getSummary: async () => {
    const res = await api.get<DashboardSummary>('/dashboard/summary');
    return res.data;
  },
  getUpcomingRenewals: async () => {
    const res = await api.get<{ upcomingRenewals: UpcomingRenewalItem[] }>(
      '/dashboard/upcoming-renewals'
    );
    return res.data;
  },
  getUnused: async () => {
    const res = await api.get<{
      unusedSubscriptions: UnusedSubscriptionItem[];
      totalPotentialSavings: number;
      currency: string;
    }>('/dashboard/unused');
    return res.data;
  },
};

export const analyticsApi = {
  getCategorySpending: async () => {
    const res = await api.get<{
      currency: string;
      grandTotalMonthly: number;
      categories: { category: string; monthlySpend: number; count: number; percentage: number }[];
    }>('/analytics/category');
    return res.data;
  },
  getMonthlyBreakdown: async () => {
    const res = await api.get<{
      currency: string;
      breakdown: {
        cycle: string;
        monthlyNormalized: number;
        annualNormalized: number;
        count: number;
      }[];
    }>('/analytics/monthly');
    return res.data;
  },
  getSpendingTrend: async () => {
    const res = await api.get<{
      currency: string;
      trend: { month: string; projectedSpend: number; renewalsCount: number }[];
    }>('/analytics/trend');
    return res.data;
  },
  getCostDistribution: async () => {
    const res = await api.get<{
      currency: string;
      distribution: { range: string; count: number; totalMonthly: number }[];
    }>('/analytics/distribution');
    return res.data;
  },
};

export const calendarApi = {
  getEvents: async () => {
    const res = await api.get<{ events: CalendarEventItem[] }>('/calendar/events');
    return res.data;
  },
};

export const notificationApi = {
  getAll: async () => {
    const res = await api.get<{ notifications: NotificationItem[]; unreadCount: number }>(
      '/notifications'
    );
    return res.data;
  },
  markAsRead: async (id: string) => {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },
  markAllAsRead: async () => {
    const res = await api.patch('/notifications/read-all');
    return res.data;
  },
  triggerScan: async () => {
    const res = await api.post<{ message: string; renewalsSent: number; trialsSent: number; subscriptionsUsageUpdated: number }>(
      '/notifications/trigger-scan'
    );
    return res.data;
  },
};

export const evaluationApi = {
  getData: async () => {
    const res = await api.get<EvaluationData>('/evaluation');
    return res.data;
  },
  saveData: async (data: any) => {
    const res = await api.post<{ evaluation: any; message: string }>('/evaluation', data);
    return res.data;
  },
};

export default api;
