import api, { setToken, clearToken } from './api';

const authService = {
  async register(data) {
    const res = await api.post('/api/auth/register', data);
    const token = res?.data?.token || res?.token;
    if (token) {
      setToken(token);
    }
    return res;
  },

  async login(data) {
    const res = await api.post('/api/auth/login', data);
    const token = res?.data?.token || res?.token;
    if (token) {
      setToken(token);
    }
    return res;
  },

  async getMe() {
    const res = await api.get('/api/auth/me');
    return res;
  },

  logout() {
    clearToken();
  },
};

export default authService;
