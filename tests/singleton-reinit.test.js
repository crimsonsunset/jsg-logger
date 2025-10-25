/**
 * Test: Singleton Reinitialization with New Options
 * 
 * Bug: When module is imported, it calls getInstanceSync() with no options,
 * creating a singleton. Subsequent calls with options were ignored.
 * 
 * Expected: New options should trigger reinitialization of the singleton.
 */

import assert from 'assert';
import { JSGLogger } from '../index.js';

console.log('\n🧪 Testing: Singleton Reinitialization\n');

// Reset singleton for test
JSGLogger._instance = null;
JSGLogger._enhancedLoggers = null;

// Test 1: First initialization with default options
console.log('Test 1: First initialization (default)');
const logger1 = JSGLogger.getInstanceSync();
// Check component logger level instead (controls API may not expose config)
const defaultLogger = logger1.getComponent('core');
const defaultLevel = defaultLogger._effectiveLevel;
console.log(`  ✓ First init effectiveLevel: ${defaultLevel}`);
assert.strictEqual(defaultLevel, 'info', 'Default globalLevel should be "info"');

// Test 2: Reinitialize with new options
console.log('\nTest 2: Reinitialize with new options');
const logger2 = JSGLogger.getInstanceSync({
  projectName: 'TestProject',
  globalLevel: 'debug'
});
// Verify through component logger level
const reinitLogger = logger2.getComponent('core');
const newLevel = reinitLogger._effectiveLevel;
console.log(`  ✓ After reinit effectiveLevel: ${newLevel}`);
assert.strictEqual(newLevel, 'debug', 'GlobalLevel should be updated to "debug"');

// Test 3: Verify component loggers reflect new level
console.log('\nTest 3: Verify component loggers use new level');
const coreLogger = logger2.getComponent('core');
const effectiveLevel = coreLogger._effectiveLevel;
console.log(`  ✓ Core logger effectiveLevel: ${effectiveLevel}`);
assert.strictEqual(effectiveLevel, 'debug', 'Component logger should use new globalLevel');

console.log('\n✅ All singleton reinitialization tests passed!\n');

