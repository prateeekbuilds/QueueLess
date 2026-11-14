import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma.js';
import AppError from '../utils/AppError.js';
import { formatUser } from '../utils/helpers.js';

const JWT_SECRET = process.env.JWT_SECRET || 'queueless-default-jwt-secret-key-32chars';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate JWT token for a user.
 */
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

/**
 * Register a new user.
 */
export const register = async ({ name, email, phone, password, role = 'CUSTOMER' }) => {
  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw AppError.conflict('An account with this email address already exists');
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      phone: phone ? phone.trim() : null,
      passwordHash,
      role: role || 'CUSTOMER',
    },
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

  const token = generateToken(user.id);

  return {
    user,
    token,
  };
};

/**
 * Log in a user.
 */
export const login = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: {
      staff: {
        include: {
          business: {
            select: { id: true, name: true },
          },
        },
      },
    },
  });

  if (!user) {
    throw AppError.unauthorized('Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw AppError.unauthorized('Invalid email or password');
  }

  const token = generateToken(user.id);
  const sanitizedUser = formatUser(user);

  return {
    user: sanitizedUser,
    token,
  };
};

/**
 * Get current authenticated user profile.
 */
export const getMe = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      businesses: {
        select: {
          id: true,
          name: true,
          category: true,
        },
      },
      staff: {
        include: {
          business: {
            select: { id: true, name: true },
          },
        },
      },
    },
  });

  if (!user) {
    throw AppError.notFound('User not found');
  }

  return user;
};

export default {
  register,
  login,
  getMe,
};

