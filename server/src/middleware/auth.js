import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma.js';
import AppError from '../utils/AppError.js';

/**
 * Authentication middleware.
 * Validates the JWT Bearer token and attaches the authenticated user to `req.user`.
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(AppError.unauthorized('No authentication token provided'));
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return next(AppError.unauthorized('No authentication token provided'));
    }

    const jwtSecret = process.env.JWT_SECRET || 'queueless-default-jwt-secret-key-32chars';
    const decoded = jwt.verify(token, jwtSecret);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return next(AppError.unauthorized('User belonging to this token no longer exists'));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(AppError.unauthorized('Invalid authentication token'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(AppError.unauthorized('Authentication token has expired'));
    }
    next(error);
  }
};

export default authenticate;

