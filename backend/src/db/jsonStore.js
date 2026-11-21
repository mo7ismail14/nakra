// Tiny JSON "database" on top of src/storage (local files, or Vercel Blob when deployed).
// - Each collection is one JSON array: users, restaurants, tokens.
// - Reads use a cache that is re-validated every time (file mtime / blob ETag), so changes made
//   from outside (npm run seed, another server instance) are always seen.
// - Writes are queued per collection, applied to a copy (a thrown error leaves data untouched),
//   and saved only if nobody changed the file meanwhile; on a conflict the change is re-applied
//   to the fresh data (up to 5 times).
import { ConflictError, storage } from '../storage/index.js';

export const COLLECTIONS = ['users', 'restaurants', 'tokens'];
const MAX_ATTEMPTS = 5;

const cache = new Map(); // name -> { data, version }
const queues = new Map();

function assertCollection(name) {
  if (!COLLECTIONS.includes(name)) throw new Error(`Unknown collection "${name}"`);
}

async function load(name) {
  assertCollection(name);
  const cached = cache.get(name);
  const result = await storage.readCollection(name, cached?.version);
  if (result.unchanged) return cached;
  if (!Array.isArray(result.data)) throw new Error(`${name}.json must contain a JSON array`);
  const fresh = { data: result.data, version: result.version };
  cache.set(name, fresh);
  return fresh;
}

/** All documents matching predicate (deep copies). */
export async function findAll(name, predicate = () => true) {
  return structuredClone((await load(name)).data.filter(predicate));
}

/** First document matching predicate (deep copy) or null. */
export async function findOne(name, predicate) {
  const doc = (await load(name)).data.find(predicate);
  return doc ? structuredClone(doc) : null;
}

/**
 * Change a collection safely. `fn` receives a mutable copy of the array; change it in place
 * and return whatever you need. If `fn` throws, nothing is written.
 * `fn` may run more than once (on a write conflict), so it must only touch the draft.
 */
export function mutate(name, fn) {
  const run = async () => {
    for (let attempt = 1; ; attempt++) {
      const { data, version } = await load(name);
      const draft = structuredClone(data);
      const result = await fn(draft);
      try {
        const newVersion = await storage.writeCollection(name, draft, version);
        cache.set(name, { data: draft, version: newVersion });
        return structuredClone(result);
      } catch (err) {
        if (!(err instanceof ConflictError) || attempt >= MAX_ATTEMPTS) throw err;
      }
    }
  };
  const next = (queues.get(name) || Promise.resolve()).then(run);
  queues.set(name, next.catch(() => {}));
  return next;
}

/** Remove every document matching predicate; returns the removed documents. */
export function removeWhere(name, predicate) {
  return mutate(name, (docs) => {
    const removed = docs.filter(predicate);
    const kept = docs.filter((d) => !predicate(d));
    docs.length = 0;
    docs.push(...kept);
    return removed;
  });
}

/** Prepare storage (folders on local disk) and check every collection can be read. */
export async function ensureDataFiles() {
  await storage.init();
  await Promise.all(COLLECTIONS.map(load));
}
