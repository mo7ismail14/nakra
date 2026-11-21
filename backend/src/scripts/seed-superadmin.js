// Creates the default superadmin from SUPERADMIN_EMAIL / SUPERADMIN_PASSWORD in backend/.env.
// The server also does this automatically on start; this script is for doing it by hand.
import { ensureDataFiles } from '../db/jsonStore.js';
import { ensureSuperadmin } from '../services/setup.service.js';

await ensureDataFiles();
const result = await ensureSuperadmin();

if (result.status === 'exists') console.log(`[seed] A superadmin already exists (${result.email}). Nothing to do.`);
if (result.status === 'created') console.log(`[seed] Superadmin created: ${result.email}`);
if (result.status === 'missing-config') {
  console.error(`[seed] ${result.reason}. Fill it in backend/.env`);
  process.exit(1);
}
