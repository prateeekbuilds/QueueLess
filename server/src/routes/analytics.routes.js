import { Router } from 'express';
import analyticsController from '../controllers/analytics.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';

const router = Router();

router.use(authenticate);

router.get(
  '/business/:businessId',
  authorize('BUSINESS_ADMIN', 'PLATFORM_ADMIN', 'STAFF'),
  analyticsController.getBusinessAnalytics
);

router.get(
  '/queue/:queueId',
  authorize('BUSINESS_ADMIN', 'STAFF', 'PLATFORM_ADMIN'),
  analyticsController.getQueueAnalytics
);

router.get(
  '/dashboard/:businessId',
  authorize('BUSINESS_ADMIN', 'PLATFORM_ADMIN'),
  analyticsController.getDashboardSummary
);

export default router;

