// Vercel entry point: Vercel detects this file (it must import "express") and runs the app as a function.
// Locally use `npm run local`, which runs src/startServer.js.
import express from 'express';
import { createApp } from './src/createApp.js';
import { bootstrap } from './src/services/setup.service.js';

await bootstrap();

const app = express();
app.use(createApp());

export default app;
