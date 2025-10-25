/**
 * Test: Pino Logger Wrapper
 * 
 * Bug: Pino's native API is logger.info({context}, 'message')
 * but more intuitive API is logger.info('message', {context})
 * 
 * Expected: Wrapper should transform both syntaxes correctly
 */

import assert from 'assert';
import { JSGLogger } from '../index.js';

console.log('\n🧪 Testing: Pino Wrapper Argument Transformation\n');

// Reset singleton for test
JSGLogger._instance = null;
JSGLogger._enhancedLoggers = null;

const logger = JSGLogger.getInstanceSync({
  projectName: 'PinoWrapperTest',
  globalLevel: 'info'
});

const testLogger = logger.getComponent('test');

// Capture output to verify both syntaxes work
const output = [];
const originalLog = console.log;
console.log = (...args) => {
  output.push(args.join(' '));
  originalLog(...args);
};

console.log('Test 1: Message-first syntax - logger.info("message", {context})');
testLogger.info('User logged in', { userId: 123, ip: '192.168.1.1' });

console.log('\nTest 2: Context-first syntax - logger.info({context}, "message")');
testLogger.info({ sessionId: 'abc123', duration: 150 }, 'Session ended');

console.log('\nTest 3: Message only - logger.info("message")');
testLogger.info('Simple log message');

console.log('\nTest 4: Context only - logger.info({context})');
testLogger.info({ event: 'system_startup', version: '2.0.0' });

console.log('\nTest 5: Multiple context properties');
testLogger.warn('API rate limit exceeded', {
  endpoint: '/api/users',
  limit: 100,
  current: 105,
  timeWindow: '1m'
});

console.log('\nTest 6: Nested objects in context');
testLogger.error('Database connection failed', {
  error: {
    code: 'ECONNREFUSED',
    message: 'Connection refused'
  },
  config: {
    host: 'localhost',
    port: 5432
  }
});

// Restore console.log
console.log = originalLog;

// Verify all messages and context data appear
console.log('\nVerifying output contains expected data:');

const checks = [
  { name: 'Message "User logged in"', test: () => output.some(l => l.includes('User logged in')) },
  { name: 'Context userId: 123', test: () => output.some(l => l.includes('userId') && l.includes('123')) },
  { name: 'Message "Session ended"', test: () => output.some(l => l.includes('Session ended')) },
  { name: 'Context sessionId', test: () => output.some(l => l.includes('sessionId')) },
  { name: 'Message "Simple log message"', test: () => output.some(l => l.includes('Simple log message')) },
  { name: 'Event system_startup', test: () => output.some(l => l.includes('system_startup')) },
  { name: 'Rate limit context', test: () => output.some(l => l.includes('endpoint') && l.includes('/api/users')) },
  { name: 'Nested error object', test: () => output.some(l => l.includes('ECONNREFUSED') || l.includes('code')) }
];

let passed = 0;
checks.forEach(check => {
  const result = check.test();
  console.log(`  ${result ? '✓' : '✗'} ${check.name}`);
  if (result) passed++;
  assert.strictEqual(result, true, check.name);
});

console.log(`\n✅ All pino wrapper tests passed (${passed}/${checks.length})!\n`);

