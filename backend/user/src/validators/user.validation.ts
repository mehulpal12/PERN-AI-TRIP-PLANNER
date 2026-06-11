import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';

export const validateRegistration = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;

  if (!name || name.trim().length < 2) {
    return next(new AppError('Name must be at least 2 characters long', 400));
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return next(new AppError('Please provide a valid email address', 400));
  }

  if (!password || password.length < 8) {
    return next(new AppError('Password must be at least 8 characters long', 400));
  }

  next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Email and password are required', 400));
  }

  next();
};

export const validatePasswordChange = (req: Request, res: Response, next: NextFunction) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return next(new AppError('Both old and new passwords are required', 400));
  }

  if (newPassword.length < 8) {
    return next(new AppError('New password must be at least 8 characters long', 400));
  }

  next();
};
