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
  
  // Check npm public registry authentication
  console.log(`🔐 Checking npm public registry authentication...`);
  try {
    const npmUser = execSync('npm whoami --registry=https://registry.npmjs.org/', { encoding: 'utf8' }).trim();
    console.log(`✅ Authenticated as: ${npmUser}`);
  } catch (error) {
    console.error('❌ Not authenticated to npm public registry');
    console.log('🔑 Please login to npm public registry...');
    execSync('npm login --registry=https://registry.npmjs.org/', { stdio: 'inherit' });
    // Verify login worked
    const npmUser = execSync('npm whoami --registry=https://registry.npmjs.org/', { encoding: 'utf8' }).trim();
    console.log(`✅ Authenticated as: ${npmUser}`);
  }
  
  // Check GitHub registry authentication
  console.log(`🔐 Checking GitHub registry authentication...`);
  try {
    const githubUser = execSync('npm whoami --registry=https://npm.pkg.github.com/', { encoding: 'utf8' }).trim();
    console.log(`✅ Authenticated to GitHub registry as: ${githubUser}`);
  } catch (error) {
    console.error('❌ Not authenticated to GitHub registry');
    console.log('🔑 Attempting GitHub registry login...');
    try {
      execSync('npm login --registry=https://npm.pkg.github.com/', { stdio: 'inherit' });
      // Verify login worked
      const githubUser = execSync('npm whoami --registry=https://npm.pkg.github.com/', { encoding: 'utf8' }).trim();
      console.log(`✅ Authenticated to GitHub registry as: ${githubUser}`);
    } catch (loginError) {
      console.error('❌ npm login failed for GitHub registry');
      console.error('Please authenticate using one of these methods:');
      console.error('  1. Create GitHub Personal Access Token with "write:packages" permission');
      console.error('  2. Run: npm config set //npm.pkg.github.com/:_authToken YOUR_TOKEN');
      console.error('  3. Or set GITHUB_TOKEN environment variable');
      console.error('  Get token at: https://github.com/settings/tokens');
      process.exit(1);
    }
  }
  
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
  
  // Publish to public npm registry
  try {
    execSync('npm publish --access public', { stdio: 'inherit' });
    console.log(`✅ Published to npm public registry`);
  } catch (error) {
    console.error('❌ Failed to publish to npm public registry:', error instanceof Error ? error.message : String(error));
    throw error;
  }
  
  // Publish to GitHub registry (non-blocking - continue even if this fails)
  try {
    execSync('npm publish --registry=https://npm.pkg.github.com/ --access public', { stdio: 'inherit' });
    console.log(`✅ Published to GitHub registry`);
  } catch (error) {
    console.warn(`⚠️  Failed to publish to GitHub registry (non-blocking):`, error instanceof Error ? error.message : String(error));
    console.warn(`⚠️  Release still successful - package is available on npm public registry`);
  }
  
  console.log(`\n🎉 Successfully released ${packageName}@${newVersion}`);
  console.log(`📋 Install with: npm install ${packageName}@${newVersion}\n`);
  
} catch (error) {
  console.error('\n❌ Release failed:', error instanceof Error ? error.message : String(error));
  process.exit(1);
}

