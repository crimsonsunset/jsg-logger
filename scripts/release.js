#!/usr/bin/env node

/**
 * Release script for @crimsonsunset/jsg-logger
 * Bumps version, commits, tags, and pushes — npm publish runs via GitHub Actions
 * (.github/workflows/publish.yml) using OIDC trusted publishing.
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const args = process.argv.slice(2);
const versionTypeArg = args[0] || 'patch';
let versionType = 'patch';

if (versionTypeArg === 'major' || versionTypeArg === 'minor' || versionTypeArg === 'patch') {
  versionType = versionTypeArg;
} else {
  console.warn(`⚠️  Unknown version type "${versionTypeArg}", defaulting to patch`);
  versionType = 'patch';
}

try {
  const packagePath = join(__dirname, '../package.json');
  const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
  const currentVersion = packageJson.version;
  const packageName = packageJson.name;

  console.log(`📦 Current version: ${currentVersion}`);

  console.log(`🔍 Checking git status...`);
  const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
  if (gitStatus.trim()) {
    console.log(`📝 Found uncommitted changes, committing them...`);
    execSync('git add -A', { stdio: 'inherit' });
    execSync('git commit -m "chore: prepare for release"', { stdio: 'inherit' });
    console.log(`✅ Changes committed`);
  } else {
    console.log(`✅ Git working directory is clean`);
  }

  console.log(`🔄 Bumping ${versionType} version...`);
  const versionOutput = execSync(`npm version ${versionType}`, {
    encoding: 'utf8',
    stdio: 'pipe',
  });
  const newVersion = versionOutput.trim().replace('v', '');
  console.log(`✅ Version bumped: ${currentVersion} → ${newVersion}`);

  console.log(`📤 Pushing commits to git...`);
  execSync('git push', { stdio: 'inherit' });
  console.log(`✅ Commits pushed successfully`);

  console.log(`🏷️  Pushing tags to git...`);
  execSync('git push --tags', { stdio: 'inherit' });
  console.log(`✅ Tags pushed successfully`);

  console.log(`\n🚀 Tag v${newVersion} pushed — GitHub Actions will publish via OIDC`);
  console.log(`   Workflow: .github/workflows/publish.yml`);
  console.log(`   Monitor:  https://github.com/crimsonsunset/jsg-logger/actions\n`);
  console.log(`📋 After publish completes: npm install ${packageName}@${newVersion}\n`);
} catch (error) {
  console.error('\n❌ Release failed:', error instanceof Error ? error.message : String(error));
  process.exit(1);
}
