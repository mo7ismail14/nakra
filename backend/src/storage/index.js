// Picks where data and images are stored:
//   STORAGE=local | blob   (explicit), otherwise
//   on Vercel (VERCEL env var is set) -> Vercel Blob, anywhere else -> local disk.
import { blobStorage } from './blobStorage.js';
import { localStorage } from './localStorage.js';

const choice = process.env.STORAGE || (process.env.VERCEL ? 'blob' : 'local');
if (!['local', 'blob'].includes(choice)) throw new Error(`STORAGE must be "local" or "blob" (got "${choice}")`);

export const storage = choice === 'blob' ? blobStorage : localStorage;
export { ConflictError } from './errors.js';
