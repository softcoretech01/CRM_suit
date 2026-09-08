export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';

/**
 * Safely generates a full URL for uploaded media files.
 * Uses BACKEND_URL for production where relative paths won't work on the frontend server.
 */
export function getMediaUrl(path) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const baseUrl = BACKEND_URL.replace(/\/+$/, '');
  return `${baseUrl}${cleanPath}`;
}


/**
 * Helper utility to perform HTTP requests to the backend API.
 */
export async function apiFetch(endpoint, options = {}) {
  const baseUrl = API_BASE_URL.replace(/\/+$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${baseUrl}${cleanEndpoint}`;
  
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(!isFormData && { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
  };

  // Check if we have an auth token in sessionStorage (if auth is fully integrated)
  const token = sessionStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  if (!isFormData && config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, config);
  let data;
  
  try {
    data = await response.json();
  } catch (err) {
    // Some endpoints (like DELETE) might return 204 No Content
    data = null;
  }

  if (!response.ok) {
    // FastAPI returns validation errors as { detail: [{ loc, msg, type }, ...] }
    let message = response.statusText;
    const d = data?.detail;
    if (typeof d === 'string') {
      message = d;
    } else if (Array.isArray(d)) {
      message = d
        .map((e) => {
          const field = Array.isArray(e.loc) ? e.loc[e.loc.length - 1] : '';
          return field ? `${field}: ${e.msg}` : e.msg;
        })
        .join('; ');
    } else if (d) {
      message = JSON.stringify(d);
    }
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}
