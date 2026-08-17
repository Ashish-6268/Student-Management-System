const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('access_token');
  const headers = new Headers(options.headers || {});

  if (token) {
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
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (response.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      let errorMessage = 'An error occurred';
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
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
export const del = (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'DELETE' });\n