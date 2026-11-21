// Long-running server: `npm run local` / `npm run dev` / `npm start` (and any host with a real disk).
// On Vercel, index.js (project root) is used instead.
import { createApp } from './app.js';
import { config } from './config/index.js';
import { bootstrap } from './services/setup.service.js';
import { storage } from './storage/index.js';

await bootstrap();

const server = createApp().listen(config.port, () => {
  console.log(`Nakra API  [APP_ENV=${config.appEnv}]`);
  console.log(`  listening   http://localhost:${config.port}`);
  console.log(`  public url  ${config.backendUrl}`);
  console.log(`  frontend    ${config.frontendUrl}`);
  console.log(`  cors        ${config.corsOrigins.join(', ') || '(none)'}${config.isLocal ? ' + any localhost port' : ''}`);
  console.log(`  storage     ${storage.name}`);
  console.log(`  mail        ${config.smtp.host ? `SMTP ${config.smtp.host}` : 'not configured (links printed here)'}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') console.error(`Port ${config.port} is already in use. Stop the other server or change PORT.`);
  else console.error(err);
  process.exit(1);
});
