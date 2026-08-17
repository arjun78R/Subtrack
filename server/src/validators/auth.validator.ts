import { z } from 'zod';

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters long'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    confirmPassword: z.string().min(6, 'Confirm password is required'),
    preferredCurrency: z.enum(['INR', 'USD', 'EUR', 'GBP']).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  resetToken: z.string().min(1, 'Reset verification code is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters long'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long').optional(),
  preferredCurrency: z.enum(['INR', 'USD', 'EUR', 'GBP']).optional(),
  reminderDays: z.number().int().min(1, 'Reminder days must be at least 1').max(60, 'Maximum 60 days').optional(),
  inactivityThreshold: z
    .number()
    .int()
    .min(7, 'Inactivity threshold must be at least 7 days')
    .max(365, 'Maximum 365 days')
    .optional(),
  emailNotificationsEnabled: z.boolean().optional(),
});
