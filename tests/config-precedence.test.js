/**
 * Test: Config Precedence When Multiple Configs Are Passed
 * 
 * Question: If different configs are passed to getInstanceSync() multiple times,
 * which one wins?
 * 
 * Expected: The LAST config passed wins. Each reinit resets to defaults and
 * applies the new config, so subsequent calls overwrite previous configs.
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

// Test 2: Second config overwrites first
console.log('\nTest 2: Second config overwrites first');
const logger2 = JSGLogger.getInstanceSync({
  projectName: 'SecondProject',
  globalLevel: 'warn'
});

const secondProjectName = logger2.configManager.getProjectName();
const secondLevel = logger2.getComponent('core')._effectiveLevel;

console.log(`  ✓ Second projectName: ${secondProjectName}`);
console.log(`  ✓ Second globalLevel: ${secondLevel}`);
assert.strictEqual(secondProjectName, 'SecondProject', 'Second config projectName should overwrite first');
assert.strictEqual(secondLevel, 'warn', 'Second config globalLevel should overwrite first');

// Test 3: Third config overwrites second
console.log('\nTest 3: Third config overwrites second');
const logger3 = JSGLogger.getInstanceSync({
  projectName: 'ThirdProject',
  globalLevel: 'error'
});

const thirdProjectName = logger3.configManager.getProjectName();
const thirdLevel = logger3.getComponent('core')._effectiveLevel;

console.log(`  ✓ Third projectName: ${thirdProjectName}`);
console.log(`  ✓ Third globalLevel: ${thirdLevel}`);
assert.strictEqual(thirdProjectName, 'ThirdProject', 'Third config projectName should overwrite second');
assert.strictEqual(thirdLevel, 'error', 'Third config globalLevel should overwrite second');

// Test 4: All loggers reference same instance with latest config
console.log('\nTest 4: All loggers share same instance with latest config');
assert.strictEqual(logger1.configManager, logger2.configManager, 'ConfigManager should be same instance');
assert.strictEqual(logger2.configManager, logger3.configManager, 'ConfigManager should be same instance');

// All should have the latest config (third)
assert.strictEqual(logger1.configManager.getProjectName(), 'ThirdProject', 'logger1 should have latest config');
assert.strictEqual(logger2.configManager.getProjectName(), 'ThirdProject', 'logger2 should have latest config');
assert.strictEqual(logger3.configManager.getProjectName(), 'ThirdProject', 'logger3 should have latest config');

// Test 5: Partial config merges with defaults
console.log('\nTest 5: Partial config merges with defaults');
const logger4 = JSGLogger.getInstanceSync({
  projectName: 'PartialProject'
  // No globalLevel specified - should use default
});

const partialProjectName = logger4.configManager.getProjectName();
const partialLevel = logger4.getComponent('core')._effectiveLevel;

console.log(`  ✓ Partial projectName: ${partialProjectName}`);
console.log(`  ✓ Partial globalLevel (default): ${partialLevel}`);
assert.strictEqual(partialProjectName, 'PartialProject', 'Partial config projectName should be applied');
assert.strictEqual(partialLevel, 'info', 'Partial config should use default globalLevel');

// Test 6: Components are replaced entirely (not merged)
console.log('\nTest 6: Components config is replaced entirely');
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
console.log('📝 Summary: The LAST config passed wins. Each reinit resets to defaults\n   and applies the new config, overwriting previous configs.\n');





