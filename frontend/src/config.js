// Backend URL.
// - On Vercel: VITE_API_URL is set per environment in the Vercel project (production / development branch).
// - Locally: picked by the npm script (Vite mode) from frontend/.env.
const API_URLS = {
  localhost: import.meta.env.VITE_API_URL_LOCAL,
  dev: import.meta.env.VITE_API_URL_DEV,
  production: import.meta.env.VITE_API_URL_PROD,
};

export const API_URL = (import.meta.env.VITE_API_URL || API_URLS[import.meta.env.MODE] || '').replace(/\/+$/, '');

if (!API_URL) {
  throw new Error(`No API URL for mode "${import.meta.env.MODE}". Set VITE_API_URL or check frontend/.env`);
}
