const TOKEN_KEY = 'queueless_token';
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(endpoint, options = {}) {
  const token = getToken();

  // If endpoint is relative and API_BASE_URL is set, prepend it
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (error) {
    throw new Error('Network error. Please check your connection and server status.');
  }

  // Handle 401
  if (response.status === 401) {
    if (token && !endpoint.includes('/api/auth/login') && !endpoint.includes('/api/auth/register')) {
      clearToken();
    }
  }

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      throw new Error(`Request failed with status ${response.status}`);
    }
    const message = errorData?.message || errorData?.error || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

const api = {
  get(url) {
    return request(url, { method: 'GET' });
  },

  post(url, data) {
    return request(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  patch(url, data) {
    return request(url, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  delete(url) {
    return request(url, { method: 'DELETE' });
  },
};

export default api;
