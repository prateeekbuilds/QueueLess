import { Router } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import entryController from '../controllers/entry.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import prisma from '../utils/prisma.js';

const router = Router();

// Optional auth helper: if bearer token is present, populate req.user, else continue as guest
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  const token = authHeader.split(' ')[1];
  if (!token) return next();

  try {
    const jwtSecret = process.env.JWT_SECRET || 'queueless-default-jwt-secret-key-32chars';
    const decoded = jwt.verify(token, jwtSecret);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, role: true },
    });
    if (user) req.user = user;
  } catch (err) {
    // ignore token errors for optional auth
  }
  next();
};

const joinQueueSchema = z.object({
  customerName: z.string().trim().min(1, 'Name is required'),
  customerPhone: z.string().trim().optional().nullable(),
});

// -----------------------------------------------------------------------------
// CUSTOMER ENDPOINTS (Public / Guest accessible)
// -----------------------------------------------------------------------------
router.post('/queues/:id/join', optionalAuth, validate(joinQueueSchema), entryController.joinQueue);
router.get('/queues/:id/status', entryController.getQueueStatus);
router.get('/entries/:id', entryController.getEntryStatus);
router.delete('/entries/:id', optionalAuth, entryController.leaveQueue);

// -----------------------------------------------------------------------------
// STAFF & ADMIN ACTIONS (Authentication + Authorization required)
// -----------------------------------------------------------------------------
router.post(
  '/queues/:id/next',
  authenticate,
  authorize('STAFF', 'BUSINESS_ADMIN', 'PLATFORM_ADMIN'),
  entryController.callNext
);

router.post(
  '/entries/:id/skip',
  authenticate,
  authorize('STAFF', 'BUSINESS_ADMIN', 'PLATFORM_ADMIN'),
  entryController.skipEntry
);

router.post(
  '/entries/:id/start',
  authenticate,
  authorize('STAFF', 'BUSINESS_ADMIN', 'PLATFORM_ADMIN'),
  entryController.startService
);

router.post(
  '/entries/:id/complete',
  authenticate,
  authorize('STAFF', 'BUSINESS_ADMIN', 'PLATFORM_ADMIN'),
  entryController.completeService
);

export default router;

