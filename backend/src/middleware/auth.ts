import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { rateLimit } from 'express-rate-limit';

// Interface for the decoded JWT token
interface DecodedToken {
  id: string;
  iat: number;
  exp: number;
}

// Interface to extend the Request object with user info
interface AuthRequest extends Request {
  user?: any;
}

// Create a rate limiter for sensitive routes
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  }
});

// Protect routes
export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token;
    
    // Check if token exists in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      // Check if token is in cookies as an alternative
      token = req.cookies.token;
    }
    
    // Make sure token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
    
    try {
      // Get JWT secret from environment or fail securely
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        console.error('JWT_SECRET is not set in environment variables');
        return res.status(500).json({
          success: false,
          message: 'Server configuration error'
        });
      }
      
      // Verify token
      const decoded = jwt.verify(token, jwtSecret) as DecodedToken;
      
      // Check token expiration
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < now) {
        return res.status(401).json({
          success: false,
          message: 'Token has expired. Please login again.',
          code: 'TOKEN_EXPIRED'
        });
      }
      
      // Get user from the token
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }
      
      // Set user in request object
      req.user = user;
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      
      // Provide specific error messages for different JWT errors
      if (error instanceof jwt.JsonWebTokenError) {
        if (error.name === 'TokenExpiredError') {
          return res.status(401).json({
            success: false,
            message: 'Token has expired. Please login again.',
            code: 'TOKEN_EXPIRED'
          });
        } else if (error.name === 'NotBeforeError') {
          return res.status(401).json({
            success: false,
            message: 'Token not yet valid',
            code: 'TOKEN_NOT_ACTIVE'
          });
        }
      }
      
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
        code: 'INVALID_TOKEN'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error in authentication middleware',
      error: (error as Error).message
    });
  }
};

// Grant access to specific roles
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route. Required roles: ${roles.join(', ')}`
      });
    }
    
    next();
  };
}; 