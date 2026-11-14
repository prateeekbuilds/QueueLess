import api from './api';

const analyticsService = {
  getBusinessAnalytics(businessId) {
    return api.get(`/api/analytics/business/${businessId}`);
  },

  getQueueAnalytics(queueId) {
    return api.get(`/api/analytics/queue/${queueId}`);
  },

  getDashboardSummary(businessId) {
    return api.get(`/api/analytics/dashboard/${businessId}`);
  },
};

export default analyticsService;
