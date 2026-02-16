// ESM resolve hook for @shared/* path aliases (dev mode only)
// Registers a custom resolver so Node.js can resolve @shared/* imports
// without tsc-alias running in watch mode (which causes EMFILE on Windows).
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

register('./shared-resolver.mjs', pathToFileURL(import.meta.filename));
