import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
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

const port = readEnvVar('FRONTEND_PORT', '4270');
execSync(`ng serve --port ${port}`, { stdio: 'inherit' });
