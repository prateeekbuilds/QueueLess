import api from './api';

const queueService = {
  getPublicQueueInfo(queueId) {
    return api.get(`/api/queues/public/${queueId}`);
  },

  joinQueue(queueId, data) {
    return api.post(`/api/queues/${queueId}/join`, data);
  },

  getQueueStatus(queueId) {
    return api.get(`/api/queues/${queueId}/status`);
  },

  getEntryStatus(entryId) {
    return api.get(`/api/entries/${entryId}`);
  },

  leaveQueue(entryId) {
    return api.delete(`/api/entries/${entryId}`);
  },

  createQueue(data) {
    return api.post('/api/queues', data);
  },

  updateQueue(queueId, data) {
    return api.patch(`/api/queues/${queueId}`, data);
  },

  deleteQueue(queueId) {
    return api.delete(`/api/queues/${queueId}`);
  },

  pauseQueue(queueId) {
    return api.post(`/api/queues/${queueId}/pause`);
  },

  resumeQueue(queueId) {
    return api.post(`/api/queues/${queueId}/resume`);
  },

  getQueuesByBusiness(businessId) {
    return api.get(`/api/queues/business/${businessId}`);
  },

  callNext(queueId) {
    return api.post(`/api/queues/${queueId}/next`);
  },

  skipEntry(entryId) {
    return api.post(`/api/entries/${entryId}/skip`);
  },

  startService(entryId) {
    return api.post(`/api/entries/${entryId}/start`);
  },

  completeService(entryId) {
    return api.post(`/api/entries/${entryId}/complete`);
  },
};

export default queueService;
