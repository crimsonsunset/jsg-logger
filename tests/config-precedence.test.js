/**
 * Test: Config Precedence When Multiple Configs Are Passed
 * 
 * Question: If different configs are passed to getInstanceSync() multiple times,
 * which one wins?
 * 
 * Expected: configure() merges settings post-init. getInstanceSync() with options
 * after init is ignored (reinit guard) — use configure() to update settings.
 */

import assert from 'assert';
import { JSGLogger } from '../index.js';

console.log('\n🧪 Testing: Config Precedence\n');

// Reset singleton for test
JSGLogger._instance = null;
JSGLogger._enhancedLoggers = null;
JSGLogger._hasLoggedInitialization = false;

// Test 1: First config is applied
console.log('Test 1: First config is applied');
const logger1 = JSGLogger.getInstanceSync({
  projectName: 'FirstProject',
  globalLevel: 'debug'
});

const firstProjectName = logger1.configManager.getProjectName();
const firstLevel = logger1.getComponent('core')._effectiveLevel;

console.log(`  ✓ First projectName: ${firstProjectName}`);
console.log(`  ✓ First globalLevel: ${firstLevel}`);
assert.strictEqual(firstProjectName, 'FirstProject', 'First config projectName should be applied');
assert.strictEqual(firstLevel, 'debug', 'First config globalLevel should be applied');

// Test 2: configure() overwrites first config
console.log('\nTest 2: configure() overwrites first config');
JSGLogger.configure({
  projectName: 'SecondProject',
  globalLevel: 'warn'
});

const secondProjectName = logger1.configManager.getProjectName();
const secondLevel = logger1.getComponent('core')._effectiveLevel;

console.log(`  ✓ Second projectName: ${secondProjectName}`);
console.log(`  ✓ Second globalLevel: ${secondLevel}`);
assert.strictEqual(secondProjectName, 'SecondProject', 'Second config projectName should overwrite first');
assert.strictEqual(secondLevel, 'warn', 'Second config globalLevel should overwrite first');

// Test 3: configure() overwrites again
console.log('\nTest 3: configure() overwrites again');
JSGLogger.configure({
  projectName: 'ThirdProject',
  globalLevel: 'error'
});

const thirdProjectName = logger1.configManager.getProjectName();
const thirdLevel = logger1.getComponent('core')._effectiveLevel;

console.log(`  ✓ Third projectName: ${thirdProjectName}`);
console.log(`  ✓ Third globalLevel: ${thirdLevel}`);
assert.strictEqual(thirdProjectName, 'ThirdProject', 'Third config projectName should overwrite second');
assert.strictEqual(thirdLevel, 'error', 'Third config globalLevel should overwrite second');

// Test 4: Singleton retains latest config across configure() calls
console.log('\nTest 4: Singleton retains latest config after configure()');
const logger2 = JSGLogger.getInstanceSync();
const logger3 = JSGLogger.getInstanceSync();

assert.strictEqual(logger1, logger2, 'getInstanceSync() should return same singleton');
assert.strictEqual(logger2, logger3, 'getInstanceSync() should return same singleton');
assert.strictEqual(logger1.configManager.getProjectName(), 'ThirdProject', 'Singleton should have latest projectName');
assert.strictEqual(logger1.getComponent('core')._effectiveLevel, 'error', 'Singleton should have latest globalLevel');

// Test 5: Partial config merges with defaults
console.log('\nTest 5: Partial config merges with defaults');
JSGLogger._instance = null;
JSGLogger._enhancedLoggers = null;
JSGLogger._hasLoggedInitialization = false;

const logger4 = JSGLogger.getInstanceSync({
  projectName: 'PartialProject'
});

const partialProjectName = logger4.configManager.getProjectName();
const partialLevel = logger4.getComponent('core')._effectiveLevel;

console.log(`  ✓ Partial projectName: ${partialProjectName}`);
console.log(`  ✓ Partial globalLevel (default): ${partialLevel}`);
assert.strictEqual(partialProjectName, 'PartialProject', 'Partial config projectName should be applied');
assert.strictEqual(partialLevel, 'info', 'Partial config should use default globalLevel');

// Test 6: Components are replaced entirely (not merged)
console.log('\nTest 6: Components config is replaced entirely');
JSGLogger._instance = null;
JSGLogger._enhancedLoggers = null;
JSGLogger._hasLoggedInitialization = false;

const logger5 = JSGLogger.getInstanceSync({
  projectName: 'ComponentTest',
  components: {
    custom: {
      emoji: '🎨',
      color: '#FF0000',
      name: 'CUSTOM'
    }
  }
});

const availableComponents = logger5.configManager.getAvailableComponents();
console.log(`  ✓ Available components: ${availableComponents.join(', ')}`);
assert.ok(availableComponents.includes('custom'), 'Custom component should exist');
assert.strictEqual(availableComponents.length, 1, 'Only custom component should exist (defaults replaced)');

console.log('\n✅ All config precedence tests passed!\n');
console.log('📝 Summary: configure() merges settings post-init. Use a fresh getInstanceSync()\n   only on first init; subsequent updates go through configure().\n');









