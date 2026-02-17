import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function readEnvVar(key, fallback) {
  try {
    const content = readFileSync(resolve(__dirname, '..', '.env'), 'utf-8');
    const match = content.match(new RegExp(`^${key}=(\\S+)`, 'm'));
    return match ? match[1] : fallback;
  } catch {
    return fallback;
  }
}

const apiPort = readEnvVar('API_PORT', '3000');

export default {
  '/api': {
    target: `http://localhost:${apiPort}`,
    secure: false,
  },
};
