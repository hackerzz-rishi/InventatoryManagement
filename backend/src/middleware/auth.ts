import { Request, Response, NextFunction } from 'express';

import { UserSession } from '../types/index.js';

interface AuthRequest extends Request {
  user?: UserSession;
}

// Simple session-based authentication check
export const checkAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.session?.user) {
    return res.status(401).json({
      status: 'error',
      message: 'Not authenticated'
    });
  }
  req.user = req.session.user;
  next();
};

export const hasRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};