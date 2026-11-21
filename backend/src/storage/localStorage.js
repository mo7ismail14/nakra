// Local disk: src/data/*.json and uploads/ (used by `npm run local` and on any server with a real disk).
import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from '../config/index.js';
import { ConflictError } from './errors.js';

const dataFile = (name) => path.join(config.paths.data, `${name}.json`);
const versionOf = (file) => fs.stat(file).then((s) => String(s.mtimeMs), () => null);
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Safe path inside uploads/ for "/logos/x.png"-style keys. */
function uploadPath(key) {
  const abs = path.resolve(config.paths.uploads, `.${key}`);
  if (!abs.startsWith(config.paths.uploads + path.sep)) throw new Error('Invalid upload path');
  return abs;
}

async function writeAtomic(file, content) {
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, content);
  // On Windows, rename can fail briefly if another program (editor, antivirus) has the file open.
  for (let attempt = 1; ; attempt++) {
    try {
      await fs.rename(tmp, file);
      return;
    } catch (err) {
      if (attempt >= 6 || !['EPERM', 'EBUSY', 'EACCES'].includes(err.code)) {
        await fs.rm(tmp, { force: true });
        throw err;
      }
      await wait(50 * attempt);
    }
  }
}

export const localStorage = {
  name: 'local',

  async init() {
    await fs.mkdir(config.paths.data, { recursive: true });
    await Promise.all(['logos', 'items'].map((d) => fs.mkdir(path.join(config.paths.uploads, d), { recursive: true })));
  },

  /** { data, version } or { unchanged: true } when knownVersion is still current. */
  async readCollection(name, knownVersion) {
    const file = dataFile(name);
    const version = await versionOf(file);
    if (knownVersion !== undefined && version === knownVersion) return { unchanged: true };
    if (!version) return { data: [], version: null };
    const raw = await fs.readFile(file, 'utf8');
    return { data: raw.trim() ? JSON.parse(raw) : [], version };
  },

  /** Writes only if the file is still at expectedVersion (else ConflictError). Returns the new version. */
  async writeCollection(name, data, expectedVersion) {
    const file = dataFile(name);
    if ((await versionOf(file)) !== expectedVersion) throw new ConflictError(name);
    await writeAtomic(file, `${JSON.stringify(data, null, 2)}\n`);
    return versionOf(file);
  },

  async saveUpload(key, buffer) {
    await writeAtomic(uploadPath(key), buffer);
  },

  async deleteUpload(key) {
    await fs.rm(uploadPath(key), { force: true });
  },

  // Local uploads are served by express.static (see app.js).
  readUpload: null,
};
