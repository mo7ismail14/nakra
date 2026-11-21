// Vercel entry point: Vercel detects this file and runs the Express app as a function.
// (Locally use `npm run local`, which runs src/server.js.)
import { createApp } from './src/createApp.js';
import { bootstrap } from './src/services/setup.service.js';

await bootstrap();

export default createApp();
