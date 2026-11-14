import api from './api';

const businessService = {
  createBusiness(data) {
    return api.post('/api/businesses', data);
  },

  getMyBusinesses() {
    return api.get('/api/businesses/mine');
  },

  getBusiness(id) {
    return api.get(`/api/businesses/${id}`);
  },

  updateBusiness(id, data) {
    return api.patch(`/api/businesses/${id}`, data);
  },

  addStaff(businessId, data) {
    return api.post(`/api/businesses/${businessId}/staff`, data);
  },

  getStaff(businessId) {
    return api.get(`/api/businesses/${businessId}/staff`);
  },
};

export default businessService;
