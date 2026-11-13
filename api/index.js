import app, { serverReady } from '../server.js';

/**
 * Vercel Serverless Function Handler
 * Automatically handles API routes (/api/*) when deployed to Vercel
 */
export default async function handler(req, res) {
  // Ensure database connection and dynamic routes are mounted
  if (serverReady) {
    await serverReady;
  }
  return app(req, res);
}
