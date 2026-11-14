import analyticsService from '../services/analytics.service.js';

export const getBusinessAnalytics = async (req, res, next) => {
  try {
    const analytics = await analyticsService.getBusinessAnalytics(
      req.params.businessId,
      req.user.id,
      req.user.role
    );
    res.status(200).json({
      success: true,
      data: { analytics },
    });
  } catch (error) {
    next(error);
  }
};

export const getQueueAnalytics = async (req, res, next) => {
  try {
    const analytics = await analyticsService.getQueueAnalytics(
      req.params.queueId,
      req.user.id,
      req.user.role
    );
    res.status(200).json({
      success: true,
      data: { analytics },
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboardSummary = async (req, res, next) => {
  try {
    const summary = await analyticsService.getDashboardSummary(
      req.params.businessId,
      req.user.id,
      req.user.role
    );
    res.status(200).json({
      success: true,
      data: { summary },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getBusinessAnalytics,
  getQueueAnalytics,
  getDashboardSummary,
};

