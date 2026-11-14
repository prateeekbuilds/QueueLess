const TOKEN_KEY = 'queueless_token';

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

async function request(url, options = {}) {
  const token = getToken();

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

  // Handle 401: clear token, but don't hard reload if already on auth page or checking me
  if (response.status === 401) {
    if (token && !url.includes('/api/auth/login') && !url.includes('/api/auth/register')) {
      clearToken();
      if (!window.location.pathname.startsWith('/login')) {
        // Softly clear token rather than force window.location hard reload loop
      }
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
