/**
 * Test: Singleton Functions Working Across Bundles
 * 
 * Bug: When separate bundles (main app vs devtools bundle) import JSGLogger,
 * each bundle gets its own copy of the class. This means JSGLogger._instance
 * is separate in each bundle, breaking the singleton pattern.
 * 
 * Fix: getInstanceSync() and getControls() now check window.JSG_Logger first
 * to ensure singleton works across separate module bundles.
 * 
 * Expected:
 * - getInstanceSync() with options reinitializes even when window.JSG_Logger exists
 * - Devtools config is applied correctly during reinitialization
 * - getControls() checks window.JSG_Logger first
 * - Singleton works across "bundles" via window references
 */

import assert from 'assert';
import { JSGLogger } from '../index.js';
import { forceEnvironment } from '../utils/environment-detector.js';

console.log('\n🧪 Testing: Singleton Cross-Bundle Behavior\n');

// Simulate browser environment
forceEnvironment('browser');

// Set up global window object for testing
if (typeof global !== 'undefined') {
  global.window = global.window || {};
  global.document = global.document || {};
}

// Test 1: Initial setup - first bundle creates instance
console.log('Test 1: First bundle creates instance');
JSGLogger._instance = null;
JSGLogger._enhancedLoggers = null;
delete global.window?.JSG_Logger;
delete global.window?.__JSG_Logger_Enhanced__;

const logger1 = JSGLogger.getInstanceSync({
  projectName: 'TestProject',
  globalLevel: 'info'
});

// Verify window references are set
assert.ok(global.window.JSG_Logger, 'window.JSG_Logger should be set');
assert.ok(global.window.__JSG_Logger_Enhanced__, '__JSG_Logger_Enhanced__ should be set');
console.log('  ✓ First bundle created instance and set window references');

// Test 2: Second bundle (simulated) calls getInstanceSync() without options
console.log('\nTest 2: Second bundle calls getInstanceSync() without options');
// Simulate a different bundle by clearing the static instance but keeping window
JSGLogger._instance = null;
JSGLogger._enhancedLoggers = null;

const logger2 = JSGLogger.getInstanceSync();
// Should return the same instance from window
assert.strictEqual(logger2, global.window.__JSG_Logger_Enhanced__, 'Should return window.__JSG_Logger_Enhanced__');
assert.strictEqual(logger2.getComponent('core'), logger1.getComponent('core'), 'Should return same logger instance');
console.log('  ✓ Second bundle retrieved existing instance from window');

// Test 3: Reinitialize with options (like stylizer-config.js does)
console.log('\nTest 3: Reinitialize with new options (devtools enabled)');
// This simulates stylizer-config.js calling getInstanceSync() with devtools config
const logger3 = JSGLogger.getInstanceSync({
  devtools: { enabled: true },
  components: {
    core: {
      emoji: '🎯',
      color: '#4A90E2',
      name: 'JSG-CORE',
      level: 'info'
    },
    webComponents: {
      emoji: '📦',
      color: '#4A90E2',
      name: 'WEB-COMPONENTS',
      level: 'info'
    }
  }
});

// Verify devtools config is applied
const configManager = logger3.configManager;
const config = configManager?.config || {};
assert.strictEqual(config.devtools?.enabled, true, 'Devtools should be enabled');
console.log('  ✓ Devtools config applied correctly');

// Verify components are created
const webComponentsLogger = logger3.getComponent('webComponents');
assert.ok(webComponentsLogger, 'webComponents logger should exist');
console.log('  ✓ Components created correctly');

// Verify window references are updated
assert.strictEqual(global.window.JSG_Logger, logger3.controls, 'window.JSG_Logger should be updated');
assert.strictEqual(global.window.__JSG_Logger_Enhanced__, logger3, '__JSG_Logger_Enhanced__ should be updated');
console.log('  ✓ Window references updated after reinitialization');

// Test 4: getControls() checks window.JSG_Logger first
console.log('\nTest 4: getControls() checks window.JSG_Logger first');
// Simulate another bundle by clearing static instance
JSGLogger._instance = null;
JSGLogger._enhancedLoggers = null;

const controls = JSGLogger.getControls();
assert.ok(controls, 'getControls() should return controls');
assert.strictEqual(controls, global.window.JSG_Logger, 'getControls() should return window.JSG_Logger');
assert.ok(controls.listComponents, 'Controls should have listComponents method');
const components = controls.listComponents();
assert.ok(Array.isArray(components), 'listComponents() should return array');
assert.ok(components.includes('core'), 'Should include core component');
assert.ok(components.includes('webComponents'), 'Should include webComponents component');
console.log('  ✓ getControls() returns window.JSG_Logger');

// Test 5: Verify singleton consistency across "bundles"
console.log('\nTest 5: Singleton consistency across bundles');
// Simulate multiple bundles accessing the logger
JSGLogger._instance = null;
JSGLogger._enhancedLoggers = null;

const instance1 = JSGLogger.getInstanceSync();
const instance2 = JSGLogger.getInstanceSync();
const controls1 = JSGLogger.getControls();
const controls2 = JSGLogger.getControls();

assert.strictEqual(instance1, instance2, 'getInstanceSync() should return same instance');
assert.strictEqual(controls1, controls2, 'getControls() should return same controls');
assert.strictEqual(instance1, global.window.__JSG_Logger_Enhanced__, 'Instance should match window reference');
assert.strictEqual(controls1, global.window.JSG_Logger, 'Controls should match window reference');
console.log('  ✓ Singleton consistency maintained across bundles');

// Test 6: Verify options are applied even when window.JSG_Logger exists
console.log('\nTest 6: Options applied even when window.JSG_Logger exists');
// Set up existing window reference
const existingLogger = JSGLogger.getInstanceSync({ globalLevel: 'warn' });
const existingLevel = existingLogger.getComponent('core')._effectiveLevel;
assert.strictEqual(existingLevel, 'warn', 'Existing logger should have warn level');

// Now call with new options - should reinitialize
const newLogger = JSGLogger.getInstanceSync({ globalLevel: 'debug' });
const newLevel = newLogger.getComponent('core')._effectiveLevel;
assert.strictEqual(newLevel, 'debug', 'New logger should have debug level');
assert.notStrictEqual(existingLevel, newLevel, 'Level should have changed');
console.log('  ✓ Options applied correctly even with existing window reference');

// Cleanup
forceEnvironment(null);
if (typeof global !== 'undefined') {
  delete global.window?.JSG_Logger;
  delete global.window?.__JSG_Logger_Enhanced__;
}

console.log('\n✅ All singleton cross-bundle tests passed!\n');



