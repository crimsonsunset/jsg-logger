/**
 * Test: Singleton Configuration Updates
 *
 * Post-init option changes go through configure(), not a second getInstanceSync(options).
 * getInstanceSync(options) on an initialized instance is ignored (reinit guard).
 *
 * Expected: configure() updates globalLevel and refreshes component loggers.
 */

import assert from 'assert';
import { JSGLogger } from '../index.js';

console.log('\n🧪 Testing: Singleton Reinitialization\n');

// Reset singleton for test
JSGLogger._instance = null;
JSGLogger._enhancedLoggers = null;
JSGLogger._hasLoggedInitialization = false;

// Test 1: First initialization with default options
console.log('Test 1: First initialization (default)');
const logger1 = JSGLogger.getInstanceSync();
const defaultLogger = logger1.getComponent('core');
const defaultLevel = defaultLogger._effectiveLevel;
console.log(`  ✓ First init effectiveLevel: ${defaultLevel}`);
assert.strictEqual(defaultLevel, 'info', 'Default globalLevel should be "info"');

// Test 2: configure() updates options post-init
console.log('\nTest 2: configure() updates options post-init');
JSGLogger.configure({
  projectName: 'TestProject',
  globalLevel: 'debug'
});
const reinitLogger = logger1.getComponent('core');
const newLevel = reinitLogger._effectiveLevel;
console.log(`  ✓ After configure effectiveLevel: ${newLevel}`);
assert.strictEqual(newLevel, 'debug', 'GlobalLevel should be updated to "debug"');

// Test 3: getInstanceSync(options) is ignored after init
console.log('\nTest 3: getInstanceSync(options) ignored after init');
const logger2 = JSGLogger.getInstanceSync({ globalLevel: 'error' });
const stillDebug = logger2.getComponent('core')._effectiveLevel;
assert.strictEqual(stillDebug, 'debug', 'Second getInstanceSync(options) should not change level');
assert.strictEqual(logger1, logger2, 'Should return same singleton reference');

// Test 4: configure() can update again
console.log('\nTest 4: configure() can update level again');
JSGLogger.configure({ globalLevel: 'warn' });
const warnLevel = logger1.getComponent('core')._effectiveLevel;
console.log(`  ✓ Core logger effectiveLevel: ${warnLevel}`);
assert.strictEqual(warnLevel, 'warn', 'Component logger should use updated globalLevel');

console.log('\n✅ All singleton reinitialization tests passed!\n');
