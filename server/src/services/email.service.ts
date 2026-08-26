import nodemailer from 'nodemailer';
import { config } from '../config/env';
import { logger } from '../utils/logger';

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export class EmailService {
  private static transporter: nodemailer.Transporter | null = null;
  private static isSmtpConfigured: boolean = false;

  public static initialize(): void {
    if (config.smtp.host && config.smtp.user && config.smtp.pass) {
      this.transporter = nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.port === 465,
        auth: {
          user: config.smtp.user,
          pass: config.smtp.pass,
        },
      });
      this.isSmtpConfigured = true;
      logger.info(`Email service initialized with SMTP host: ${config.smtp.host}`);
    } else {
      this.isSmtpConfigured = false;
      logger.info(
        'SMTP credentials not detected in .env. Running in EMAIL SIMULATION MODE (logs to console and saves in Notification Center).'
      );
    }
  }

  public static async sendEmail(options: EmailOptions): Promise<{ success: boolean; mode: 'SMTP' | 'SIMULATED' }> {
    if (!this.transporter && !this.isSmtpConfigured) {
      this.initialize();
    }

    if (this.isSmtpConfigured && this.transporter) {
      try {
        await this.transporter.sendMail({
          from: config.smtp.from,
          to: options.to,
          subject: options.subject,
          text: options.text,
          html: options.html,
        });
        logger.email(`[SMTP DELIVERED] To: ${options.to} | Subject: "${options.subject}"`);
        return { success: true, mode: 'SMTP' };
      } catch (err: any) {
        logger.error(`SMTP delivery failed, falling back to simulated log: ${err.message}`);
        this.logSimulatedEmail(options);
        return { success: true, mode: 'SIMULATED' };
      }
    } else {
      this.logSimulatedEmail(options);
      return { success: true, mode: 'SIMULATED' };
    }
  }

  private static logSimulatedEmail(options: EmailOptions): void {
    const border = '='.repeat(70);
    console.log('\n' + border);
    console.log('             [EMAIL SIMULATION MODE - SUBTRACK ALERT]');
    console.log(border);
    console.log(`To:      ${options.to}`);
    console.log(`From:    ${config.smtp.from}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Date:    ${new Date().toLocaleString()}`);
    console.log('-'.repeat(70));
    console.log(options.text);
    console.log(border + '\n');
  }

  // --- Reusable HTML Email Templates ---

  public static getRenewalTemplate(params: {
    userName: string;
    serviceName: string;
    amount: string;
    renewalDate: string;
    daysRemaining: number;
    providerUrl?: string;
  }): { subject: string; text: string; html: string } {
    const subject = `SubTrack: Upcoming Renewal for ${params.serviceName}`;
    const manageUrl = params.providerUrl || config.clientUrl;

    const text = `Hello ${params.userName},\n\nYour ${params.serviceName} subscription is scheduled to renew on ${params.renewalDate}.\n\nAmount: ${params.amount}\nDays remaining: ${params.daysRemaining}\n\nPlease review your subscription before renewal.\nManage or cancel at: ${manageUrl}\n\nRegards,\nSubTrack Team\nTrack. Understand. Optimize.`;

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9;">
          <h1 style="color: #4f46e5; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">SubTrack</h1>
          <p style="color: #64748b; margin: 4px 0 0 0; font-size: 13px;">Personal Subscription Management & Spend Optimizer</p>
        </div>
        <div style="padding: 24px 0;">
          <h2 style="color: #0f172a; font-size: 18px; margin: 0 0 16px 0;">Upcoming Renewal Alert</h2>
          <p style="color: #334155; font-size: 15px; line-height: 1.6;">Hello <strong>${params.userName}</strong>,</p>
          <p style="color: #334155; font-size: 15px; line-height: 1.6;">This is a friendly reminder that your subscription for <strong>${params.serviceName}</strong> is scheduled to renew soon.</p>
          
          <div style="background-color: #f8fafc; border-left: 4px solid #4f46e5; padding: 16px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0 0 8px 0; color: #475569; font-size: 14px;">Renewal Date: <strong style="color: #0f172a;">${params.renewalDate}</strong></p>
            <p style="margin: 0 0 8px 0; color: #475569; font-size: 14px;">Renewal Cost: <strong style="color: #0f172a;">${params.amount}</strong></p>
            <p style="margin: 0; color: #475569; font-size: 14px;">Time Remaining: <span style="background-color: #e0e7ff; color: #4338ca; padding: 2px 8px; border-radius: 9999px; font-size: 12px; font-weight: 600;">${params.daysRemaining} days</span></p>
          </div>

          <p style="color: #64748b; font-size: 14px; line-height: 1.6;">If you no longer use this service or wish to avoid an unexpected charge, you can review or modify it directly on the provider's official portal.</p>
          
          <div style="text-align: center; margin: 28px 0;">
            <a href="${manageUrl}" target="_blank" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">Manage Subscription on Provider Website</a>
          </div>
        </div>
        <div style="border-top: 1px solid #f1f5f9; padding-top: 16px; text-align: center; color: #94a3b8; font-size: 12px;">
          <p style="margin: 0;">SubTrack does not process payments or store credit cards. You received this because email notifications are enabled in your SubTrack settings.</p>
        </div>
      </div>
    `;

    return { subject, text, html };
  }

  public static getTrialTemplate(params: {
    userName: string;
    serviceName: string;
    trialEndDate: string;
    daysRemaining: number;
    amount?: string;
    providerUrl?: string;
  }): { subject: string; text: string; html: string } {
    const subject = `SubTrack: Free Trial Ending Soon for ${params.serviceName}`;
    const manageUrl = params.providerUrl || config.clientUrl;

    const text = `Hello ${params.userName},\n\nYour free trial for ${params.serviceName} is scheduled to end on ${params.trialEndDate} (${params.daysRemaining} days remaining).\n\nCost after trial: ${params.amount || 'Recurring charge'}\n\nTo avoid being billed automatically, review or cancel your trial at: ${manageUrl}\n\nRegards,\nSubTrack Team`;

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #fed7aa; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #ffedd5;">
          <h1 style="color: #ea580c; margin: 0; font-size: 24px; font-weight: 800;">SubTrack</h1>
          <p style="color: #9a3412; margin: 4px 0 0 0; font-size: 13px;">Free-Trial Expiration Monitor</p>
        </div>
        <div style="padding: 24px 0;">
          <h2 style="color: #0f172a; font-size: 18px; margin: 0 0 16px 0;">Free Trial Expiration Warning</h2>
          <p style="color: #334155; font-size: 15px; line-height: 1.6;">Hello <strong>${params.userName}</strong>,</p>
          <p style="color: #334155; font-size: 15px; line-height: 1.6;">Your free trial for <strong>${params.serviceName}</strong> will expire in <strong style="color: #ea580c;">${params.daysRemaining} days</strong> (on ${params.trialEndDate}).</p>
          
          <div style="background-color: #fff7ed; border-left: 4px solid #ea580c; padding: 16px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0 0 8px 0; color: #7c2d12; font-size: 14px;">Expiry Date: <strong>${params.trialEndDate}</strong></p>
            ${params.amount ? `<p style="margin: 0; color: #7c2d12; font-size: 14px;">Subsequent Recurring Cost: <strong>${params.amount}</strong></p>` : ''}
          </div>

          <p style="color: #64748b; font-size: 14px; line-height: 1.6;">Most providers automatically convert free trials into paid subscriptions. Please cancel beforehand if you do not plan to continue.</p>
          
          <div style="text-align: center; margin: 28px 0;">
            <a href="${manageUrl}" target="_blank" style="background-color: #ea580c; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">Manage Trial at Official Site</a>
          </div>
        </div>
      </div>
    `;

    return { subject, text, html };
  }

  public static getUnusedTemplate(params: {
    userName: string;
    serviceName: string;
    daysUnused: number;
    annualCost: string;
    providerUrl?: string;
  }): { subject: string; text: string; html: string } {
    const subject = `SubTrack: Review Inactive Subscription (${params.serviceName})`;
    const manageUrl = params.providerUrl || config.clientUrl;

    const text = `Hello ${params.userName},\n\nYou haven't marked ${params.serviceName} as used in ${params.daysUnused} days.\nPotential annual cost: ${params.annualCost}\n\nReview this subscription in your SubTrack dashboard or visit provider: ${manageUrl}\n\nRegards,\nSubTrack Team`;

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <h2 style="color: #4f46e5; margin: 0 0 12px 0;">SubTrack Inactivity Alert</h2>
        <p style="color: #334155; font-size: 15px;">Hello <strong>${params.userName}</strong>,</p>
        <p style="color: #334155; font-size: 15px;">You have not recorded usage for <strong>${params.serviceName}</strong> in <strong>${params.daysUnused} days</strong>.</p>
        <p style="color: #475569; font-size: 14px;">Potential annual commitment: <strong style="color: #0f172a;">${params.annualCost}</strong></p>
        <p style="color: #64748b; font-size: 14px;">Consider reviewing this subscription to optimize your spending.</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${manageUrl}" target="_blank" style="background-color: #4f46e5; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block;">Review Subscription</a>
        </div>
      </div>
    `;

    return { subject, text, html };
  }

  public static getPasswordResetTemplate(params: {
    userName: string;
    resetToken: string;
  }): { subject: string; text: string; html: string } {
    const subject = 'SubTrack: Password Reset Code';
    const text = `Hello ${params.userName},\n\nYour password reset verification code is:\n${params.resetToken}\n\nThis token will expire in 1 hour.\nIf you did not request this, please ignore this email.`;
    const html = `
      <div style="font-family: sans-serif; padding: 20px; max-width: 500px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #4f46e5;">SubTrack Password Reset</h2>
        <p>Hello <strong>${params.userName}</strong>,</p>
        <p>Use the following code to reset your password:</p>
        <div style="background-color: #f1f5f9; padding: 12px 20px; font-size: 22px; font-weight: bold; letter-spacing: 4px; text-align: center; border-radius: 6px; margin: 20px 0;">
          ${params.resetToken}
        </div>
        <p style="color: #64748b; font-size: 13px;">This token expires in 60 minutes.</p>
      </div>
    `;
    return { subject, text, html };
  }
}
