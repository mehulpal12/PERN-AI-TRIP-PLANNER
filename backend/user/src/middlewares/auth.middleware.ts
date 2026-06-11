import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import env from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import prisma from "../config/db.js";

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in', 401));
    }

    if (!env.ACCESS_TOKEN_SECRET) {
      return next(new Error('ACCESS_TOKEN_SECRET is not defined'));
    }

    const decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET) as any;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return next(new AppError('User no longer exists', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    next(new AppError('Invalid token or expired', 401));
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  };
};

export const authorizeSelfOrAdmin = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    const { id } = req.params;
    
    // If user is accessing their own ID, or has one of the allowed roles
    if (req.user.id === id || roles.includes(req.user.role)) {
      return next();
    }

    return next(new AppError('You do not have permission to perform this action', 403));
  };
};
