import type { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authservice.js';
import { UserService } from '../services/userService.js';
import type { IUser } from '../models/user.ts';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

const authService = new AuthService();
const userService = new UserService();

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.substring(7);
    const decoded = authService.verifyToken(token);
    
    const user = await userService.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return requireAuth(req, res, next);
  }
  
  next();
}