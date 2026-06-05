#!/usr/bin/env node

/**
 * CI publish script for @crimsonsunset/jsg-logger.
 * Invoked by .github/workflows/publish.yml after a release tag is pushed.
 *
 * Local release flow (scripts/release.js):
 *   1. bump version + tag + push
 *   2. tag push triggers this workflow
 *
 * This script:
 *   1. npm run check  — tests must pass
 *   2. npm publish    — prepublishOnly runs build:devtools before tarball upload
 */

import { execSync } from 'child_process';

try {
  console.log('🔍 Running pre-publish checks...');
  execSync('npm run check', { stdio: 'inherit' });

  console.log('📦 Publishing to npm (prepublishOnly will build devtools)...');
  execSync('npm publish --access public', { stdio: 'inherit' });

  console.log('\n✅ Publish complete\n');
} catch (error) {
  console.error('\n❌ Publish failed:', error instanceof Error ? error.message : String(error));
  process.exit(1);
}
