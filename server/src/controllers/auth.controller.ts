import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { config } from '../config/env';
import { AuthRequest } from '../middleware/auth.middleware';
import { EmailService } from '../services/email.service';

const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn as any,
  });
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, preferredCurrency } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(409).json({ message: 'An account with this email address already exists.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      preferredCurrency: preferredCurrency || 'INR',
    });

    const token = generateToken(user._id.toString());

    res.status(201).json({
      message: 'Account registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferredCurrency: user.preferredCurrency,
        reminderDays: user.reminderDays,
        inactivityThreshold: user.inactivityThreshold,
        emailNotificationsEnabled: user.emailNotificationsEnabled,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password credentials.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid email or password credentials.' });
      return;
    }

    const token = generateToken(user._id.toString());

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferredCurrency: user.preferredCurrency,
        reminderDays: user.reminderDays,
        inactivityThreshold: user.inactivityThreshold,
        emailNotificationsEnabled: user.emailNotificationsEnabled,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    res.status(200).json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        preferredCurrency: req.user.preferredCurrency,
        reminderDays: req.user.reminderDays,
        inactivityThreshold: req.user.inactivityThreshold,
        emailNotificationsEnabled: req.user.emailNotificationsEnabled,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Return 200 to prevent email enumeration
      res.status(200).json({
        message: 'If the email exists in our system, a password reset verification code has been sent.',
      });
      return;
    }

    // Generate 6-digit numeric token
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const template = EmailService.getPasswordResetTemplate({
      userName: user.name,
      resetToken,
    });

    await EmailService.sendEmail({
      to: user.email,
      subject: template.subject,
      text: template.text,
      html: template.html,
    });

    res.status(200).json({
      message: 'Password reset code has been sent to your email address.',
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, resetToken, newPassword } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase(),
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      res.status(400).json({ message: 'Invalid or expired password reset verification code.' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully. You can now log in.' });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { name, preferredCurrency, reminderDays, inactivityThreshold, emailNotificationsEnabled } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (name !== undefined) user.name = name;
    if (preferredCurrency !== undefined) user.preferredCurrency = preferredCurrency;
    if (reminderDays !== undefined) user.reminderDays = reminderDays;
    if (inactivityThreshold !== undefined) user.inactivityThreshold = inactivityThreshold;
    if (emailNotificationsEnabled !== undefined) user.emailNotificationsEnabled = emailNotificationsEnabled;

    await user.save();

    res.status(200).json({
      message: 'Profile settings updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferredCurrency: user.preferredCurrency,
        reminderDays: user.reminderDays,
        inactivityThreshold: user.inactivityThreshold,
        emailNotificationsEnabled: user.emailNotificationsEnabled,
      },
    });
  } catch (error) {
    next(error);
  }
};
