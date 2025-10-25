/**
 * Test: GlobalLevel Configuration
 * 
 * Bug #1: Component-specific levels in default config were overriding globalLevel
 * Bug #2: Loggers weren't being recreated on reinit, so they kept old levels
 * 
 * Expected: GlobalLevel should apply to all components unless explicitly overridden
 */

import assert from 'assert';
import { JSGLogger } from '../index.js';

console.log('\n🧪 Testing: GlobalLevel Configuration\n');

// Reset singleton for test
JSGLogger._instance = null;
JSGLogger._enhancedLoggers = null;

// Test 1: All components should respect globalLevel
console.log('Test 1: Components respect globalLevel');
const logger = JSGLogger.getInstanceSync({
  projectName: 'GlobalLevelTest',
  globalLevel: 'trace'
});

const components = ['core', 'api', 'ui', 'database', 'auth'];
const levels = components.map(comp => {
  const compLogger = logger.getComponent(comp);
  return { comp, level: compLogger._effectiveLevel };
});

console.log('  Component levels:');
levels.forEach(({ comp, level }) => {
  console.log(`    ${comp}: ${level}`);
  assert.strictEqual(level, 'trace', `${comp} should have globalLevel "trace"`);
});

// Test 2: Change globalLevel and verify loggers update
console.log('\nTest 2: Changing globalLevel updates all loggers');
JSGLogger.getInstanceSync({
  projectName: 'GlobalLevelTest',
  globalLevel: 'warn'
});

const newLevels = components.map(comp => {
  const compLogger = logger.getComponent(comp);
  return { comp, level: compLogger._effectiveLevel };
});

console.log('  Updated component levels:');
newLevels.forEach(({ comp, level }) => {
  console.log(`    ${comp}: ${level}`);
  assert.strictEqual(level, 'warn', `${comp} should have updated to "warn"`);
});

// Test 3: Component-specific level should override globalLevel
console.log('\nTest 3: Component-specific level overrides globalLevel');

// Reset singleton for clean state
JSGLogger._instance = null;
JSGLogger._enhancedLoggers = null;

const logger3 = JSGLogger.getInstanceSync({
  projectName: 'GlobalLevelTest',
  globalLevel: 'info',
  components: {
    core: {
      emoji: '🎯',
      level: 'debug'  // Explicit override
    }
  }
});

const coreLogger3 = logger3.getComponent('core');
const apiLogger3 = logger3.getComponent('api');

console.log(`  core level (with override): ${coreLogger3._effectiveLevel}`);
console.log(`  api level (no override): ${apiLogger3._effectiveLevel}`);

assert.strictEqual(coreLogger3._effectiveLevel, 'debug', 'core should use component-specific level');
assert.strictEqual(apiLogger3._effectiveLevel, 'info', 'api should use globalLevel');

console.log('\n✅ All globalLevel tests passed!\n');

