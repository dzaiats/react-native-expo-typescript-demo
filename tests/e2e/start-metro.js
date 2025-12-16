#!/usr/bin/env node

/**
 * Script to start Metro bundler for Detox E2E tests
 * This ensures Metro is running before Detox launches the app
 */

const { spawn } = require('child_process');
const { waitFor } = require('@detox/runners/jest/utils');

const METRO_PORT = 8081;
const METRO_URL = `http://localhost:${METRO_PORT}`;

function checkMetroRunning() {
  return new Promise((resolve) => {
    const http = require('http');
    const req = http.get(METRO_URL, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function startMetro() {
  // Check if Metro is already running
  if (await checkMetroRunning()) {
    console.log('Metro bundler is already running');
    return null;
  }

  console.log('Starting Metro bundler...');
  const metro = spawn('npx', ['expo', 'start', '--no-dev', '--minify'], {
    stdio: 'inherit',
    shell: true,
  });

  // Wait for Metro to be ready
  let attempts = 0;
  const maxAttempts = 30;
  while (attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (await checkMetroRunning()) {
      console.log('Metro bundler is ready');
      return metro;
    }
    attempts++;
  }

  throw new Error('Metro bundler failed to start');
}

if (require.main === module) {
  startMetro().catch((error) => {
    console.error('Failed to start Metro:', error);
    process.exit(1);
  });
}

module.exports = { startMetro, checkMetroRunning };

