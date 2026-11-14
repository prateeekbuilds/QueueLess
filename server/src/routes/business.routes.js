import { Router } from 'express';
import { z } from 'zod';
import businessController from '../controllers/business.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';

const router = Router();

const createBusinessSchema = z.object({
  name: z.string().trim().min(2, 'Business name must be at least 2 characters'),
  category: z.string().trim().optional(),
  address: z.string().trim().optional(),
});

const updateBusinessSchema = z.object({
  name: z.string().trim().min(2, 'Business name must be at least 2 characters').optional(),
  category: z.string().trim().optional().nullable(),
  address: z.string().trim().optional().nullable(),
});

const addStaffSchema = z.object({
  email: z.string().trim().email('Valid email is required'),
});

// All business routes require authentication
router.use(authenticate);

router.post(
  '/',
  authorize('BUSINESS_ADMIN', 'PLATFORM_ADMIN'),
  validate(createBusinessSchema),
  businessController.createBusiness
);

router.get('/mine', authorize('BUSINESS_ADMIN', 'PLATFORM_ADMIN'), businessController.getMyBusinesses);

router.get('/:id', businessController.getBusinessById);

router.patch(
  '/:id',
  authorize('BUSINESS_ADMIN', 'PLATFORM_ADMIN'),
  validate(updateBusinessSchema),
  businessController.updateBusiness
);

router.post(
  '/:id/staff',
  authorize('BUSINESS_ADMIN', 'PLATFORM_ADMIN'),
  validate(addStaffSchema),
  businessController.addStaff
);

router.get(
  '/:id/staff',
  authorize('BUSINESS_ADMIN', 'STAFF', 'PLATFORM_ADMIN'),
  businessController.getStaff
);

export default router;

