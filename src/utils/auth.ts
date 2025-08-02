import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import User from '../models/User';

// JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

// Interface for JWT payload
interface JwtPayload {
  id: string;
  role: string;
}

// Generate JWT token for a user
export const generateToken = (user: User): string => {
  const payload: JwtPayload = {
    id: user.id,
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

// Verify JWT token
export const verifyToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Express middleware to authenticate requests
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401).json({ message: 'Authentication token missing' });
      return;
    }

    // Verify token
    const decoded = verifyToken(token);

    // Find user by id
    const user = await User.findByPk(decoded.id);
    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    // Add user to request object
    (req as any).user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid authentication token' });
  }
};

// Express middleware to authorize admin access
export const authorizeAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const user = (req as any).user as User;
  
  if (!user || user.role !== 'admin') {
    res.status(403).json({ message: 'Access denied: Admin privileges required' });
    return;
  }
  
  next();
};