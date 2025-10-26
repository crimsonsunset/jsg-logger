/**
 * Test: Context Data Display in CLI Format
 * 
 * Bug: Pino expects logger.info({context}, 'message') but common usage is
 * logger.info('message', {context}). Context data wasn't being passed to formatter.
 * 
 * Expected: Both argument orders should work and context data should be displayed
 */

import assert from 'assert';
import { JSGLogger } from '../index.js';

console.log('\n🧪 Testing: Context Data Display\n');

// Reset singleton for test
JSGLogger._instance = null;
JSGLogger._enhancedLoggers = null;

const logger = JSGLogger.getInstanceSync({
  projectName: 'ContextTest',
  globalLevel: 'info'
});

const testLogger = logger.getComponent('test');

// Capture console.log output to verify context data is shown
const originalLog = console.log;
const logOutput = [];
console.log = (...args) => {
  logOutput.push(args.join(' '));
  originalLog(...args);
};

console.log('\nTest 1: Message-first syntax (message, context)');
testLogger.info('Test message 1', {
  version: '1.0.0',
  status: 'success'
});

console.log('\nTest 2: Context-first syntax (context, message)');
testLogger.info({
  build: '123',
  environment: 'test'
}, 'Test message 2');

console.log('\nTest 3: Nested objects in context');
testLogger.info('Test message 3', {
  config: {
    enabled: true,
    timeout: 5000
  },
  tags: ['test', 'ci']
});

console.log('\nTest 4: Different log levels with context');
testLogger.warn('Warning message', {
  code: 'WARN_001',
  details: 'This is a warning'
});

testLogger.error('Error message', {
  code: 'ERR_500',
  stack: 'Error at line 42'
});

// Restore console.log
console.log = originalLog;

// Verify context data appears in output
console.log('\nTest 5: Verify context data in output');
const hasVersionContext = logOutput.some(line => line.includes('version') && line.includes('1.0.0'));
const hasBuildContext = logOutput.some(line => line.includes('build') && line.includes('123'));
const hasCodeContext = logOutput.some(line => line.includes('code') && line.includes('WARN_001'));
const hasTreeFormat = logOutput.some(line => line.includes('├─') || line.includes('└─'));

console.log(`  ✓ Version context found: ${hasVersionContext}`);
console.log(`  ✓ Build context found: ${hasBuildContext}`);
console.log(`  ✓ Code context found: ${hasCodeContext}`);
console.log(`  ✓ Tree format used: ${hasTreeFormat}`);

assert.strictEqual(hasVersionContext, true, 'Context data should include version');
assert.strictEqual(hasBuildContext, true, 'Context data should include build');
assert.strictEqual(hasCodeContext, true, 'Context data should include warning code');
assert.strictEqual(hasTreeFormat, true, 'Context should use tree format (├─ or └─)');

console.log('\n✅ All context data tests passed!\n');




