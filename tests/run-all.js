#!/usr/bin/env node
/**
 * Test Runner for JSG Logger
 * Runs all test files and reports results
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdir } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('═══════════════════════════════════════════════════════');
console.log('   JSG Logger Test Suite');
console.log('═══════════════════════════════════════════════════════\n');

async function runTest(testFile) {
  return new Promise((resolve) => {
    const testPath = join(__dirname, testFile);
    const testProcess = spawn('node', [testPath], {
      stdio: 'inherit',
      cwd: dirname(__dirname)
    });

    testProcess.on('close', (code) => {
      resolve({ file: testFile, passed: code === 0 });
    });

    testProcess.on('error', (error) => {
      console.error(`Failed to run ${testFile}:`, error);
      resolve({ file: testFile, passed: false });
    });
  });
}

async function main() {
  try {
    // Get all test files
    const files = await readdir(__dirname);
    const testFiles = files.filter(f => f.endsWith('.test.js'));

    if (testFiles.length === 0) {
      console.log('No test files found!\n');
      process.exit(1);
    }

    console.log(`Found ${testFiles.length} test file(s)\n`);

    // Run tests sequentially
    const results = [];
    for (const testFile of testFiles) {
      const result = await runTest(testFile);
      results.push(result);
    }

    // Summary
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('   Test Summary');
    console.log('═══════════════════════════════════════════════════════\n');

    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;

    results.forEach(result => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`  ${status} ${result.file}`);
    });

    console.log(`\n  Total: ${results.length}`);
    console.log(`  Passed: ${passed}`);
    console.log(`  Failed: ${failed}\n`);

    if (failed > 0) {
      console.log('❌ Some tests failed\n');
      process.exit(1);
    } else {
      console.log('✅ All tests passed!\n');
      process.exit(0);
    }

  } catch (error) {
    console.error('Test runner error:', error);
    process.exit(1);
  }
}

main();




