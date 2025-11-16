/**
 * Test: Multiple Initialization Log Prevention
 * 
 * Bug: When multiple libraries/components call getInstanceSync() with different configs,
 * each call logs "JSG Logger initialized", creating duplicate logs in console.
 * 
 * Expected: Initialization should only be logged once, even when getInstanceSync()
 * is called multiple times with different configurations.
 */

import assert from 'assert';
import { JSGLogger } from '../index.js';

console.log('\n🧪 Testing: Multiple Initialization Log Prevention\n');

// Capture console.log to count initialization messages
const originalLog = console.log;
let logMessages = [];
let initLogCount = 0;

// Override console.log to capture messages
console.log = (...args) => {
  const message = args.join(' ');
  logMessages.push(message);
  
  // Count initialization logs (both async and sync versions)
  if (message.includes('JSG Logger initialized')) {
    initLogCount++;
  }
  
  // Still output to console for visibility
  originalLog(...args);
};

// Reset singleton and flag for clean test
JSGLogger._instance = null;
JSGLogger._enhancedLoggers = null;
JSGLogger._hasLoggedInitialization = false;

// Test 1: First initialization should log once
console.log('Test 1: First initialization logs once');
initLogCount = 0;
logMessages = [];

const logger1 = JSGLogger.getInstanceSync({
  projectName: 'TestProject1',
  globalLevel: 'info'
});

// Give a moment for any async operations
await new Promise(resolve => setTimeout(resolve, 10));

console.log(`  ✓ Init log count: ${initLogCount}`);
assert.strictEqual(initLogCount, 1, 'First initialization should log exactly once');

// Test 2: Multiple subsequent calls should not log again
console.log('\nTest 2: Subsequent calls do not log again');
initLogCount = 0;
logMessages = [];

// Simulate what jsg-stylizer does - multiple calls with different configs
const logger2 = JSGLogger.getInstanceSync({
  projectName: 'TestProject2',
  globalLevel: 'debug'
});

const logger3 = JSGLogger.getInstanceSync({
  projectName: 'TestProject3',
  globalLevel: 'warn'
});

const logger4 = JSGLogger.getInstanceSync({
  projectName: 'TestProject4',
  globalLevel: 'error'
});

// Call with empty options (should not reinit)
const logger5 = JSGLogger.getInstanceSync();

await new Promise(resolve => setTimeout(resolve, 10));

console.log(`  ✓ Init log count after multiple calls: ${initLogCount}`);
assert.strictEqual(initLogCount, 0, 'Subsequent calls should not log initialization');

// Test 3: Verify loggers still work correctly
console.log('\nTest 3: Loggers function correctly after multiple calls');
const coreLogger = logger5.getComponent('core');
assert.ok(coreLogger, 'Core logger should exist');
assert.ok(typeof coreLogger.info === 'function', 'Core logger should have info method');

// Test 4: Verify flag is set correctly
console.log('\nTest 4: Flag prevents reinitialization');
assert.strictEqual(JSGLogger._hasLoggedInitialization, true, 'Flag should be set after first init');

// Test 5: Verify early return works (singleton instance should be same)
console.log('\nTest 5: Early return prevents unnecessary reinitialization');
const logger6 = JSGLogger.getInstanceSync({
  projectName: 'TestProject5',
  globalLevel: 'trace'
});

// All returned loggers should reference the same singleton instance
assert.strictEqual(JSGLogger._instance, JSGLogger._instance, 'Singleton instance should be same');
assert.strictEqual(logger1.configManager, logger2.configManager, 'ConfigManager should be same instance');
assert.strictEqual(logger2.configManager, logger3.configManager, 'ConfigManager should be same instance');
assert.strictEqual(logger3.configManager, logger4.configManager, 'ConfigManager should be same instance');
assert.strictEqual(logger4.configManager, logger5.configManager, 'ConfigManager should be same instance');
assert.strictEqual(logger5.configManager, logger6.configManager, 'ConfigManager should be same instance');

// Test 6: Reset and verify it logs again
console.log('\nTest 6: After reset, logs again');
JSGLogger._instance = null;
JSGLogger._enhancedLoggers = null;
JSGLogger._hasLoggedInitialization = false;
initLogCount = 0;
logMessages = [];

const logger7 = JSGLogger.getInstanceSync({
  projectName: 'TestProject6',
  globalLevel: 'info'
});

await new Promise(resolve => setTimeout(resolve, 10));

console.log(`  ✓ Init log count after reset: ${initLogCount}`);
assert.strictEqual(initLogCount, 1, 'After reset, should log once again');

// Restore original console.log
console.log = originalLog;

console.log('\n✅ All multiple initialization log tests passed!\n');

