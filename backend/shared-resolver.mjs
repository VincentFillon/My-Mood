// ESM resolve hook implementation for @shared/* path aliases
// Intercepts @shared/* specifiers and resolves them to dist/shared/*
import { resolve as pathResolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const SHARED_DIR = pathResolve(import.meta.dirname, 'dist', 'shared');

export function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@shared/')) {
    const relativePath = specifier.slice('@shared/'.length);
    const resolved = pathToFileURL(pathResolve(SHARED_DIR, relativePath));
    return { url: resolved.href, shortCircuit: true };
  }
  return nextResolve(specifier, context);
}
