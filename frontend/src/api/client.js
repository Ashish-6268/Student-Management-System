const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('access_token');
  const headers = new Headers(options.headers || {});

  if (token && token !== 'undefined' && token !== 'null') {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (options.method && ['POST', 'PUT', 'PATCH'].includes(options.method.toUpperCase())) {
    if (!headers.has('Content-Type') && !(options.body instanceof FormData) && !(options.body instanceof URLSearchParams)) {
      headers.set('Content-Type', 'application/json');
    }
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, config);

    if (response.status === 401) {
      if (!endpoint.includes('/auth/login')) {
        localStorage.removeItem('access_token');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
      let errDetail = 'Invalid credentials or unauthorized';
      try {
        const errorData = await response.json();
        errDetail = errorData.detail || errorData.message || errDetail;
      } catch (e) {
        errDetail = response.statusText || errDetail;
      }
      throw new Error(errDetail);
    }

    if (!response.ok) {
      let errorMessage = 'An error occurred';
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch (e) {
        errorMessage = response.statusText;
      }
      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

export const get = (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'GET' });
export const post = (endpoint, data, options = {}) => apiRequest(endpoint, { ...options, method: 'POST', body: data instanceof FormData || data instanceof URLSearchParams ? data : JSON.stringify(data) });
export const put = (endpoint, data, options = {}) => apiRequest(endpoint, { ...options, method: 'PUT', body: data instanceof FormData || data instanceof URLSearchParams ? data : JSON.stringify(data) });
export const patch = (endpoint, data, options = {}) => apiRequest(endpoint, { ...options, method: 'PATCH', body: data instanceof FormData || data instanceof URLSearchParams ? data : JSON.stringify(data) });
export const del = (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'DELETE' });
