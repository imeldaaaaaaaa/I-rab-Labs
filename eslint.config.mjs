import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals.js';
import nextTs from 'eslint-config-next/typescript.js';

// Some eslint-config-next releases expose a single config object while others
// expose an array. Normalize both forms so Vercel's build doesn't fail on spread.
const asConfigs = (value) => Array.isArray(value) ? value : [value];

export default defineConfig([
  ...asConfigs(nextVitals),
  ...asConfigs(nextTs),
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
]);
