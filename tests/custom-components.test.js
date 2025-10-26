/**
 * Test custom component handling
 * Validates v1.5.1 fixes for component initialization optimization
 */

import assert from 'assert';
import { JSGLogger } from '../index.js';
import { configManager } from '../config/config-manager.js';
import defaultConfig from '../config/default-config.json' with { type: 'json' };

console.log('\n🧪 Testing: Custom Component Initialization (v1.5.1)\n');

// Helper to reset singleton
function resetSingleton() {
    JSGLogger._instance = null;
    JSGLogger._enhancedLoggers = null;
    // Also reset configManager to default state
    configManager.config = {...defaultConfig};
    configManager.loadedPaths = [];
    configManager.currentFile = null;
}

// Test 1: Custom components only initialize configured components
console.log('Test 1: Only user-defined components are initialized');
resetSingleton();

const logger1 = JSGLogger.getInstanceSync({
    globalLevel: 'info',
    components: {
        'my-api': { emoji: '🔌', level: 'debug' },
        'my-database': { emoji: '💾', level: 'info' },
        'my-auth': { emoji: '🔐', level: 'info' }
    }
});

const availableComponents = logger1.configManager.getAvailableComponents();
console.log('  Available components:', availableComponents);

// Should only have 3 components, not 16 (3 + 13 defaults)
assert.strictEqual(availableComponents.length, 3, 'Should only have 3 components');
assert.ok(availableComponents.includes('my-api'), 'Should include my-api');
assert.ok(availableComponents.includes('my-database'), 'Should include my-database');
assert.ok(availableComponents.includes('my-auth'), 'Should include my-auth');
assert.ok(!availableComponents.includes('core'), 'Should NOT include default "core" component');
assert.ok(!availableComponents.includes('websocket'), 'Should NOT include default "websocket" component');

console.log('  ✓ Only user-defined components initialized\n');

// Test 2: Empty config falls back to COMPONENT_SCHEME
console.log('Test 2: Backward compatibility - empty config uses COMPONENT_SCHEME');
resetSingleton();

const logger2 = JSGLogger.getInstanceSync({
    globalLevel: 'info'
    // No components defined
});

const defaultComponents = logger2.configManager.getAvailableComponents();
console.log('  Available components:', defaultComponents);

// Should have COMPONENT_SCHEME components (backward compatibility)
assert.ok(defaultComponents.length > 0, 'Should have default components');
assert.ok(defaultComponents.includes('core'), 'Should include default "core" component');

console.log('  ✓ Falls back to COMPONENT_SCHEME defaults\n');

// Test 3: Component name formatting preserves separators
console.log('Test 3: Component names use MY-COMPONENT format');
resetSingleton();

const logger3 = JSGLogger.getInstanceSync({
    globalLevel: 'info',
    components: {
        'my-custom-component': { emoji: '🎯', level: 'info' }
    }
});

const componentConfig = logger3.configManager.getComponentConfig('my-custom-component');
console.log('  Component name:', componentConfig.name);

assert.strictEqual(componentConfig.name, 'MY-CUSTOM-COMPONENT', 'Should use MY-COMPONENT format');
assert.notStrictEqual(componentConfig.name, 'MyCustomComponent', 'Should NOT use PascalCase');

console.log('  ✓ Component names formatted correctly\n');

// Test 4: Auto-created components use new formatter
console.log('Test 4: Auto-created components use updated formatter');
resetSingleton();

const logger4 = JSGLogger.getInstanceSync({
    globalLevel: 'info',
    components: {
        'configured-component': { emoji: '✅', level: 'info' }
    }
});

// Get an undefined component - should auto-create with new formatter
const autoLogger = logger4.getComponent('auto-created-component');
const autoConfig = logger4.configManager.getComponentConfig('auto-created-component');

console.log('  Auto-created component name:', autoConfig.name);
assert.strictEqual(autoConfig.name, 'AUTO-CREATED-COMPONENT', 'Auto-created should use MY-COMPONENT format');
assert.strictEqual(autoConfig.emoji, '📦', 'Auto-created should use default emoji');
assert.strictEqual(autoConfig.color, '#999999', 'Auto-created should use default color');

console.log('  ✓ Auto-created components formatted correctly\n');

// Test 5: camelCase and snake_case normalization
console.log('Test 5: camelCase and snake_case normalization');
resetSingleton();

const logger5 = JSGLogger.getInstanceSync({
    globalLevel: 'info',
    components: {}
});

const configMgr = logger5.configManager;

// Test camelCase conversion
const camelConfig = configMgr.getComponentConfig('myCustomComponent');
console.log('  myCustomComponent →', camelConfig.name);
assert.strictEqual(camelConfig.name, 'MY-CUSTOM-COMPONENT', 'camelCase should convert to MY-CUSTOM-COMPONENT');

// Test snake_case conversion
const snakeConfig = configMgr.getComponentConfig('my_custom_component');
console.log('  my_custom_component →', snakeConfig.name);
assert.strictEqual(snakeConfig.name, 'MY-CUSTOM-COMPONENT', 'snake_case should convert to MY-CUSTOM-COMPONENT');

// Test already uppercase
const upperConfig = configMgr.getComponentConfig('MY-COMPONENT');
console.log('  MY-COMPONENT →', upperConfig.name);
assert.strictEqual(upperConfig.name, 'MY-COMPONENT', 'Already uppercase should remain unchanged');

console.log('  ✓ Naming convention conversions work correctly\n');

// Test 6: CLI formatter uses custom component names (not hardcoded COMPONENT_SCHEME)
console.log('Test 6: CLI formatter displays custom component names');
resetSingleton();

const logger6 = JSGLogger.getInstanceSync({
    globalLevel: 'info',
    forceEnvironment: 'cli',  // Force CLI mode for formatter testing
    components: {
        'setup': { emoji: '🎯', level: 'info', name: 'SETUP' },
        'installer': { emoji: '📦', level: 'info', name: 'INSTALLER' },
        'config-loader': { emoji: '⚙️', level: 'info', name: 'CONFIG-LOADER' }
    }
});

// Capture console output
const originalLog = console.log;
let capturedOutput = [];
console.log = (...args) => {
    const line = args.join(' ');
    capturedOutput.push(line);
    originalLog(...args);
};

// Log with custom components
const setupLogger = logger6.getComponent('setup');
setupLogger.info('Test message from setup component');

const installerLogger = logger6.getComponent('installer');
installerLogger.info('Test message from installer component');

const configLogger = logger6.getComponent('config-loader');
configLogger.info('Test message from config loader');

// Restore console.log
console.log = originalLog;

// Validate output contains custom component names
const setupOutput = capturedOutput.find(line => line.includes('Test message from setup'));
const installerOutput = capturedOutput.find(line => line.includes('Test message from installer'));
const configOutput = capturedOutput.find(line => line.includes('Test message from config loader'));

console.log('  Setup output:', setupOutput);
console.log('  Installer output:', installerOutput);
console.log('  Config output:', configOutput);

// Assert custom component names appear (not defaults)
assert.ok(setupOutput && setupOutput.includes('[SETUP]'), 'Formatter should display [SETUP], not [JSG-CORE]');
assert.ok(installerOutput && installerOutput.includes('[INSTALLER]'), 'Formatter should display [INSTALLER], not [JSG-CORE]');
assert.ok(configOutput && configOutput.includes('[CONFIG-LOADER]'), 'Formatter should display [CONFIG-LOADER], not [JSG-CORE]');

// Assert it doesn't fall back to defaults
assert.ok(!setupOutput.includes('[JSG-CORE]'), 'Should NOT fall back to [JSG-CORE]');
assert.ok(!installerOutput.includes('[JSG-CORE]'), 'Should NOT fall back to [JSG-CORE]');
assert.ok(!configOutput.includes('[JSG-CORE]'), 'Should NOT fall back to [JSG-CORE]');

console.log('  ✓ CLI formatter uses custom component names correctly\n');

console.log('✅ All custom component tests passed!\n');
console.log('📊 Summary:');
console.log('  - Only user-defined components initialized (no pollution)');
console.log('  - Backward compatibility maintained (empty config → COMPONENT_SCHEME)');
console.log('  - Component names use MY-COMPONENT format');
console.log('  - Auto-created components properly formatted');
console.log('  - camelCase/snake_case normalization working');
console.log('  - CLI formatter displays custom component names\n');

