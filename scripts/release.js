#!/usr/bin/env node

/**
 * Release script for @crimsonsunset/jsg-logger
 * Handles version bumping, git operations, and npm publishing
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse command line arguments
// Accept version type as first argument: patch, minor, or major
const args = process.argv.slice(2);
const versionTypeArg = args[0] || 'patch';
let versionType = 'patch'; // default

// Validate and set version type
if (versionTypeArg === 'major' || versionTypeArg === 'minor' || versionTypeArg === 'patch') {
  versionType = versionTypeArg;
} else {
  console.warn(`⚠️  Unknown version type "${versionTypeArg}", defaulting to patch`);
  versionType = 'patch';
}

try {
  // Get current version
  const packagePath = join(__dirname, '../package.json');
  const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
  const currentVersion = packageJson.version;
  const packageName = packageJson.name;
  
  console.log(`📦 Current version: ${currentVersion}`);
  
  // Check git status before proceeding
  console.log(`🔍 Checking git status...`);
  try {
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
    if (gitStatus.trim()) {
      console.log(`📝 Found uncommitted changes, committing them...`);
      execSync('git add -A', { stdio: 'inherit' });
      execSync('git commit -m "chore: prepare for release"', { stdio: 'inherit' });
      console.log(`✅ Changes committed`);
    } else {
      console.log(`✅ Git working directory is clean`);
    }
  } catch (error) {
    console.error('❌ Failed to check/commit git status:', error instanceof Error ? error.message : String(error));
    throw error;
  }
  
  console.log(`🔄 Bumping ${versionType} version...`);
  
  // Bump version (npm version creates commit and tag automatically)
  const versionOutput = execSync(`npm version ${versionType}`, { 
    encoding: 'utf8',
    stdio: 'pipe'
  });
  const newVersion = versionOutput.trim().replace('v', '');
  
  console.log(`✅ Version bumped: ${currentVersion} → ${newVersion}`);
  
  // Push commits to git
  console.log(`📤 Pushing commits to git...`);
  try {
    execSync('git push', { stdio: 'inherit' });
    console.log(`✅ Commits pushed successfully`);
  } catch (error) {
    console.error('❌ Failed to push commits:', error instanceof Error ? error.message : String(error));
    throw error;
  }
  
  // Push tags to git
  console.log(`🏷️  Pushing tags to git...`);
  try {
    execSync('git push --tags', { stdio: 'inherit' });
    console.log(`✅ Tags pushed successfully`);
  } catch (error) {
    console.error('❌ Failed to push tags:', error instanceof Error ? error.message : String(error));
    throw error;
  }
  
  // Publish to npm (always dual publish: public + GitHub)
  console.log(`📦 Publishing to npm (public + GitHub)...`);
  execSync('npm publish --access public', { stdio: 'inherit' });
  execSync('npm publish --registry=https://npm.pkg.github.com/ --access public', { stdio: 'inherit' });
  console.log(`✅ Published to both registries`);
  
  console.log(`\n🎉 Successfully released ${packageName}@${newVersion}`);
  console.log(`📋 Install with: npm install ${packageName}@${newVersion}\n`);
  
} catch (error) {
  console.error('\n❌ Release failed:', error instanceof Error ? error.message : String(error));
  process.exit(1);
}

