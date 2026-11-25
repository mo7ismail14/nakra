// Vercel Blob (private store). Used when deployed on Vercel, where the disk is not persistent.
// Every environment gets its own folder: "dev/...", "production/...", so they never share data.
import { BlobPreconditionFailedError, del, get, put } from '@vercel/blob';
import { config } from '../config/index.js';
import { ConflictError } from './errors.js';

const ACCESS = 'private';
const root = config.appEnv;
const dataKey = (name) => `${root}/data/${name}.json`;
const uploadKey = (key) => `${root}/uploads${key}`; // key = "/logos/abc.png"

async function readText(stream) {
  return new Response(stream).text();
}

// get() returns a weak ETag (W/"...") when the response is compressed (files over ~1KB),
// but put({ ifMatch }) only accepts the strong form. Always keep the strong one.
const strongEtag = (etag) => (etag ? etag.replace(/^W\//, '') : etag);

const isConflict = (err) =>
  err instanceof BlobPreconditionFailedError || /already exists/i.test(err?.message || '');

export const blobStorage = {
  name: 'vercel-blob',

  async init() {},

  async readCollection(name, knownVersion) {
    // useCache: false -> always read the latest version, not a CDN copy.
    const res = await get(dataKey(name), {
      access: ACCESS,
      useCache: false,
      ...(knownVersion ? { ifNoneMatch: knownVersion } : {}),
    });
    if (!res) return { data: [], version: null };
    if (res.statusCode === 304) return { unchanged: true };
    const raw = await readText(res.stream);
    return { data: raw.trim() ? JSON.parse(raw) : [], version: strongEtag(res.blob.etag) };
  },

  async writeCollection(name, data, expectedVersion) {
    try {
      const result = await put(dataKey(name), JSON.stringify(data), {
        access: ACCESS,
        contentType: 'application/json',
        addRandomSuffix: false,
        cacheControlMaxAge: 60,
        // Optimistic locking: fail if someone else wrote the file since we read it.
        ...(expectedVersion ? { ifMatch: expectedVersion } : { allowOverwrite: false }),
      });
      return strongEtag(result.etag);
    } catch (err) {
      if (isConflict(err)) throw new ConflictError(name);
      throw err;
    }
  },

  async saveUpload(key, buffer, contentType) {
    await put(uploadKey(key), buffer, {
      access: ACCESS,
      contentType,
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 60 * 60 * 24 * 30,
    });
  },

  async deleteUpload(key) {
    await del(uploadKey(key));
  },

  /** { stream, contentType, etag } or null */
  async readUpload(key) {
    const res = await get(uploadKey(key), { access: ACCESS });
    if (!res || res.statusCode !== 200) return null;
    return { stream: res.stream, contentType: res.blob.contentType, etag: res.blob.etag };
  },
};
