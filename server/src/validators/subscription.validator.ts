import { z } from 'zod';

export const subscriptionCategoryEnum = z.enum([
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
]);

export const billingCycleEnum = z.enum([
  'Weekly',
  'Monthly',
  'Quarterly',
  'Half-Yearly',
  'Yearly',
]);

export const createSubscriptionSchema = z
  .object({
    name: z.string().min(1, 'Subscription or service name is required').trim(),
    provider: z.string().min(1, 'Provider name is required').trim(),
    category: subscriptionCategoryEnum,
    cost: z.number().min(0, 'Cost cannot be negative'),
    currency: z.string().default('INR'),
    billingCycle: billingCycleEnum,
    startDate: z.string().or(z.date()).optional(),
    renewalDate: z.string().or(z.date()),
    isTrial: z.boolean().default(false),
    trialEndDate: z.string().or(z.date()).optional().nullable(),
    providerUrl: z
      .string()
      .url('Please provide a valid URL (e.g., https://example.com)')
      .or(z.literal(''))
      .optional(),
    notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
    active: z.boolean().default(true),
  })
  .refine(
    (data) => {
      if (data.isTrial && (!data.trialEndDate || data.trialEndDate === '')) {
        return false;
      }
      return true;
    },
    {
      message: 'Trial end date is required when free trial is active',
      path: ['trialEndDate'],
    }
  )
  .refine(
    (data) => {
      if (data.startDate && data.renewalDate) {
        const start = new Date(data.startDate);
        const renewal = new Date(data.renewalDate);
        return renewal >= start;
      }
      return true;
    },
    {
      message: 'Renewal date cannot be earlier than start date',
      path: ['renewalDate'],
    }
  );

export const updateSubscriptionSchema = z
  .object({
    name: z.string().min(1).trim().optional(),
    provider: z.string().min(1).trim().optional(),
    category: subscriptionCategoryEnum.optional(),
    cost: z.number().min(0).optional(),
    currency: z.string().optional(),
    billingCycle: billingCycleEnum.optional(),
    startDate: z.string().or(z.date()).optional(),
    renewalDate: z.string().or(z.date()).optional(),
    isTrial: z.boolean().optional(),
    trialEndDate: z.string().or(z.date()).optional().nullable(),
    providerUrl: z.string().url().or(z.literal('')).optional(),
    notes: z.string().max(500).optional(),
    active: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.renewalDate) {
        return new Date(data.renewalDate) >= new Date(data.startDate);
      }
      return true;
    },
    {
      message: 'Renewal date cannot be earlier than start date',
      path: ['renewalDate'],
    }
  );
