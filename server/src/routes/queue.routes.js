import { Router } from 'express';
import { z } from 'zod';
import queueController from '../controllers/queue.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const createQueueSchema = z.object({
  businessId: z.string().min(1, 'Business ID is required'),
  name: z.string().trim().min(2, 'Queue name must be at least 2 characters'),
  description: z.string().trim().optional(),
  averageServiceTime: z.number().int().positive().optional().default(5),
  maxCapacity: z.number().int().positive().optional().default(100),
});

const updateQueueSchema = z.object({
  name: z.string().trim().min(2, 'Queue name must be at least 2 characters').optional(),
  description: z.string().trim().optional().nullable(),
  averageServiceTime: z.number().int().positive().optional(),
  maxCapacity: z.number().int().positive().optional(),
  status: z.enum(['ACTIVE', 'PAUSED', 'CLOSED']).optional(),
});

// PUBLIC ROUTE - Customers view queue before joining
router.get('/public/:id', queueController.getPublicInfo);

// Protected routes
router.use(authenticate);

router.post(
  '/',
  authorize('BUSINESS_ADMIN', 'PLATFORM_ADMIN'),
  validate(createQueueSchema),
  queueController.createQueue
);

router.get(
  '/business/:businessId',
  authorize('BUSINESS_ADMIN', 'STAFF', 'PLATFORM_ADMIN'),
  queueController.getQueuesByBusiness
);

router.get('/:id', queueController.getQueueById);

router.patch(
  '/:id',
  authorize('BUSINESS_ADMIN', 'PLATFORM_ADMIN'),
  validate(updateQueueSchema),
  queueController.updateQueue
);

router.delete(
  '/:id',
  authorize('BUSINESS_ADMIN', 'PLATFORM_ADMIN'),
  queueController.deleteQueue
);

router.post(
  '/:id/pause',
  authorize('BUSINESS_ADMIN', 'STAFF', 'PLATFORM_ADMIN'),
  queueController.pauseQueue
);

router.post(
  '/:id/resume',
  authorize('BUSINESS_ADMIN', 'STAFF', 'PLATFORM_ADMIN'),
  queueController.resumeQueue
);

export default router;

