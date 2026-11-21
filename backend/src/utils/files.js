import { config } from '../config/index.js';
import { storage } from '../storage/index.js';

// Stored in JSON as "/uploads/<folder>/<name>.<ext>"; same URL shape locally and on Vercel.
const KEY_RE = /^\/(logos|items)\/[A-Za-z0-9_-]{8,64}\.(jpg|png|webp)$/;

/** Full URL returned to the frontend, e.g. "http://localhost:4000/uploads/logos/abc.png". */
export const absoluteUrl = (relativeUrl) => (relativeUrl ? `${config.backendUrl}${relativeUrl}` : null);

/** "/uploads/logos/x.png" -> "/logos/x.png" (or null if it isn't one of our uploads). */
export function uploadKey(relativeUrl) {
  if (!relativeUrl?.startsWith('/uploads/')) return null;
  const key = relativeUrl.slice('/uploads'.length);
  return KEY_RE.test(key) ? key : null;
}

/** Saves a multer file (memory storage, see middleware/upload.js) and returns its stored URL. */
export async function saveUpload(folder, file) {
  const key = `/${folder}/${file.filename}`;
  await storage.saveUpload(key, file.buffer, file.mimetype);
  return `/uploads${key}`;
}

/** Delete an uploaded image by its stored URL. Never throws (a missing file is fine). */
export async function removeUpload(relativeUrl) {
  const key = uploadKey(relativeUrl);
  if (!key) return;
  await storage.deleteUpload(key).catch((err) => console.warn(`[uploads] could not delete ${key}: ${err.message}`));
}

/**
 * Saves an optional image, runs `work(url)`, and deletes the image again if `work` fails,
 * so a failed request never leaves an orphan file behind.
 */
export async function withUpload(folder, file, work) {
  const url = file ? await saveUpload(folder, file) : null;
  try {
    return await work(url);
  } catch (err) {
    if (url) await removeUpload(url);
    throw err;
  }
}
