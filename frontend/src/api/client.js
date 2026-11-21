import { API_URL } from '../config.js';
import { translateError } from '../utils/errors.js';

const TOKEN_KEY = 'nakra_token';

// localStorage can throw (private mode, blocked storage): never let that break the app.
export const tokenStore = {
  get() {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token) {
    try {
      if (token) localStorage.setItem(TOKEN_KEY, token);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
  },
};

export class ApiError extends Error {
  constructor(status, message, details = []) {
    super(translateError(message));
    this.status = status;
    this.details = details.map((d) => ({ ...d, message: translateError(d.message) }));
  }

  /** { fieldName: 'message' } for showing errors under inputs */
  get fieldErrors() {
    return Object.fromEntries(this.details.map((d) => [d.field, d.message]));
  }
}

let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

/**
 * One place for every HTTP call: base URL, JWT, JSON / FormData, errors.
 * @param {object} [options]
 * @param {object|FormData} [options.body]
 * @param {boolean} [options.auth=true] send the token
 */
export async function request(method, path, { body, auth = true } = {}) {
  const headers = {};
  const token = tokenStore.get();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let payload;
  if (body instanceof FormData) payload = body;
  else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, { method, headers, body: payload });
  } catch {
    throw new ApiError(0, 'مش قادر أوصل للسيرفر. اتأكد إن الـ backend شغال والإنترنت متصل.');
  }

  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401 && auth && token) onUnauthorized();
    throw new ApiError(res.status, data.error || 'Something went wrong', data.details);
  }
  return data;
}

export const http = {
  get: (path, options) => request('GET', path, options),
  post: (path, body, options) => request('POST', path, { ...options, body }),
  patch: (path, body, options) => request('PATCH', path, { ...options, body }),
  put: (path, body, options) => request('PUT', path, { ...options, body }),
  delete: (path, options) => request('DELETE', path, options),
};
