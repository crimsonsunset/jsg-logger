/**
 * Test: Redaction Feature
 * 
 * Tests configurable redaction of sensitive keys in logged objects.
 * Validates pattern matching (exact and wildcard), nested objects, arrays,
 * case-insensitivity, custom censor text, and file-specific overrides.
 */

import assert from 'assert';
import { JSGLogger } from '../index.js';
import { configManager } from '../config/config-manager.js';

console.log('\n🧪 Testing: Redaction Feature\n');

// Reset singleton for test
JSGLogger._instance = null;
JSGLogger._enhancedLoggers = null;

// Test 1: Basic redaction with exact match patterns
console.log('\nTest 1: Basic redaction with exact match patterns');
const logger1 = JSGLogger.getInstanceSync({
  projectName: 'RedactionTest',
  globalLevel: 'info',
  redact: {
    paths: ['password', 'token'],
    censor: '[REDACTED]'
  }
});

const testLogger1 = logger1.getComponent('test');

const originalLog = console.log;
const logOutput = [];
console.log = (...args) => {
  logOutput.push(args.join(' '));
  originalLog(...args);
};

testLogger1.info('Test with sensitive data', {
  username: 'john',
  password: 'secret123',
  token: 'abc123xyz',
  email: 'john@example.com'
});

const output1 = logOutput.join('\n');
const hasPasswordRedacted = output1.includes('password') && output1.includes('[REDACTED]');
const hasTokenRedacted = output1.includes('token') && output1.includes('[REDACTED]');
const hasUsernameVisible = output1.includes('username') && output1.includes('john');
const hasEmailVisible = output1.includes('email') && output1.includes('john@example.com');

assert.strictEqual(hasPasswordRedacted, true, 'Password should be redacted');
assert.strictEqual(hasTokenRedacted, true, 'Token should be redacted');
assert.strictEqual(hasUsernameVisible, true, 'Username should be visible');
assert.strictEqual(hasEmailVisible, true, 'Email should be visible');

console.log('  ✓ Password redacted');
console.log('  ✓ Token redacted');
console.log('  ✓ Username visible');
console.log('  ✓ Email visible');

// Test 2: Wildcard pattern matching
console.log('\nTest 2: Wildcard pattern matching (*key, *secret)');
logOutput.length = 0;

const logger2 = JSGLogger.getInstanceSync({
  projectName: 'RedactionTest2',
  globalLevel: 'info',
  redact: {
    paths: ['*key', '*secret'],
    censor: '[REDACTED]'
  }
});

const testLogger2 = logger2.getComponent('test');

testLogger2.info('Test with wildcard patterns', {
  apiKey: 'secret-api-key',
  googleApiKey: 'google-secret',
  secretKey: 'my-secret',
  publicKey: 'public-value',
  normalField: 'visible'
});

const output2 = logOutput.join('\n');
const hasApiKeyRedacted = output2.includes('apiKey') && output2.includes('[REDACTED]');
const hasGoogleApiKeyRedacted = output2.includes('googleApiKey') && output2.includes('[REDACTED]');
const hasSecretKeyRedacted = output2.includes('secretKey') && output2.includes('[REDACTED]');
const hasPublicKeyRedacted = output2.includes('publicKey') && output2.includes('[REDACTED]');
const hasNormalFieldVisible = output2.includes('normalField') && output2.includes('visible');

assert.strictEqual(hasApiKeyRedacted, true, 'apiKey should be redacted (matches *key)');
assert.strictEqual(hasGoogleApiKeyRedacted, true, 'googleApiKey should be redacted (matches *key)');
assert.strictEqual(hasSecretKeyRedacted, true, 'secretKey should be redacted (matches *key and *secret)');
assert.strictEqual(hasPublicKeyRedacted, true, 'publicKey should be redacted (matches *key)');
assert.strictEqual(hasNormalFieldVisible, true, 'normalField should be visible');

console.log('  ✓ apiKey redacted');
console.log('  ✓ googleApiKey redacted');
console.log('  ✓ secretKey redacted');
console.log('  ✓ publicKey redacted');
console.log('  ✓ normalField visible');

// Test 3: Case-insensitive matching
console.log('\nTest 3: Case-insensitive matching');
logOutput.length = 0;

const logger3 = JSGLogger.getInstanceSync({
  projectName: 'RedactionTest3',
  globalLevel: 'info',
  redact: {
    paths: ['password', '*key'],
    censor: '[REDACTED]'
  }
});

const testLogger3 = logger3.getComponent('test');

testLogger3.info('Test case-insensitive', {
  Password: 'secret1',
  PASSWORD: 'secret2',
  API_KEY: 'secret3',
  api_key: 'secret4'
});

const output3 = logOutput.join('\n');
const hasPasswordUpperRedacted = output3.includes('Password') && output3.includes('[REDACTED]');
const hasPasswordAllCapsRedacted = output3.includes('PASSWORD') && output3.includes('[REDACTED]');
const hasApiKeyUpperRedacted = output3.includes('API_KEY') && output3.includes('[REDACTED]');
const hasApiKeyLowerRedacted = output3.includes('api_key') && output3.includes('[REDACTED]');

assert.strictEqual(hasPasswordUpperRedacted, true, 'Password (mixed case) should be redacted');
assert.strictEqual(hasPasswordAllCapsRedacted, true, 'PASSWORD (all caps) should be redacted');
assert.strictEqual(hasApiKeyUpperRedacted, true, 'API_KEY should be redacted (matches *key)');
assert.strictEqual(hasApiKeyLowerRedacted, true, 'api_key should be redacted (matches *key)');

console.log('  ✓ Password (mixed case) redacted');
console.log('  ✓ PASSWORD (all caps) redacted');
console.log('  ✓ API_KEY redacted');
console.log('  ✓ api_key redacted');

// Test 4: Nested object redaction
console.log('\nTest 4: Nested object redaction');
logOutput.length = 0;

const logger4 = JSGLogger.getInstanceSync({
  projectName: 'RedactionTest4',
  globalLevel: 'info',
  redact: {
    paths: ['*key', 'password'],
    censor: '[REDACTED]'
  }
});

const testLogger4 = logger4.getComponent('test');

testLogger4.info('Test nested objects', {
  user: {
    name: 'John',
    password: 'secret',
    apiKey: 'key123'
  },
  config: {
    public: true,
    secretKey: 'hidden'
  },
  public: 'visible'
});

const output4 = logOutput.join('\n');
const hasNestedPasswordRedacted = output4.includes('password') && output4.includes('[REDACTED]');
const hasNestedApiKeyRedacted = output4.includes('apiKey') && output4.includes('[REDACTED]');
const hasNestedSecretKeyRedacted = output4.includes('secretKey') && output4.includes('[REDACTED]');
const hasNestedNameVisible = output4.includes('name') && output4.includes('John');
const hasPublicVisible = output4.includes('public') && (output4.includes('visible') || output4.includes('true'));

assert.strictEqual(hasNestedPasswordRedacted, true, 'Nested password should be redacted');
assert.strictEqual(hasNestedApiKeyRedacted, true, 'Nested apiKey should be redacted');
assert.strictEqual(hasNestedSecretKeyRedacted, true, 'Nested secretKey should be redacted');
assert.strictEqual(hasNestedNameVisible, true, 'Nested name should be visible');
assert.strictEqual(hasPublicVisible, true, 'Public fields should be visible');

console.log('  ✓ Nested password redacted');
console.log('  ✓ Nested apiKey redacted');
console.log('  ✓ Nested secretKey redacted');
console.log('  ✓ Nested name visible');
console.log('  ✓ Public fields visible');

// Test 5: Array redaction
console.log('\nTest 5: Array redaction');
logOutput.length = 0;

const logger5 = JSGLogger.getInstanceSync({
  projectName: 'RedactionTest5',
  globalLevel: 'info',
  redact: {
    paths: ['*key'],
    censor: '[REDACTED]'
  }
});

const testLogger5 = logger5.getComponent('test');

testLogger5.info('Test arrays', {
  users: [
    { name: 'John', apiKey: 'key1' },
    { name: 'Jane', apiKey: 'key2' }
  ],
  tokens: ['token1', 'token2']
});

const output5 = logOutput.join('\n');
const hasArrayApiKeyRedacted = output5.includes('apiKey') && output5.includes('[REDACTED]');
const hasArrayNameVisible = output5.includes('name') && (output5.includes('John') || output5.includes('Jane'));

assert.strictEqual(hasArrayApiKeyRedacted, true, 'Array item apiKey should be redacted');
assert.strictEqual(hasArrayNameVisible, true, 'Array item name should be visible');

console.log('  ✓ Array item apiKey redacted');
console.log('  ✓ Array item name visible');

// Test 6: Custom censor text
console.log('\nTest 6: Custom censor text');
logOutput.length = 0;

const logger6 = JSGLogger.getInstanceSync({
  projectName: 'RedactionTest6',
  globalLevel: 'info',
  redact: {
    paths: ['password'],
    censor: '***HIDDEN***'
  }
});

const testLogger6 = logger6.getComponent('test');

testLogger6.info('Test custom censor', {
  username: 'john',
  password: 'secret123'
});

const output6 = logOutput.join('\n');
const hasCustomCensor = output6.includes('***HIDDEN***');
const hasDefaultCensorAbsent = !output6.includes('[REDACTED]');

assert.strictEqual(hasCustomCensor, true, 'Custom censor text should be used');
assert.strictEqual(hasDefaultCensorAbsent, true, 'Default censor should not appear');

console.log('  ✓ Custom censor text used');
console.log('  ✓ Default censor not present');

// Test 7: Empty paths array (no redaction)
console.log('\nTest 7: Empty paths array (no redaction)');
logOutput.length = 0;

const logger7 = JSGLogger.getInstanceSync({
  projectName: 'RedactionTest7',
  globalLevel: 'info',
  redact: {
    paths: [],
    censor: '[REDACTED]'
  }
});

const testLogger7 = logger7.getComponent('test');

testLogger7.info('Test empty paths', {
  password: 'secret123',
  apiKey: 'key123'
});

const output7 = logOutput.join('\n');
const hasPasswordVisible = output7.includes('password') && output7.includes('secret123');
const hasApiKeyVisible = output7.includes('apiKey') && output7.includes('key123');

assert.strictEqual(hasPasswordVisible, true, 'Password should be visible when paths is empty');
assert.strictEqual(hasApiKeyVisible, true, 'ApiKey should be visible when paths is empty');

console.log('  ✓ Password visible (no redaction)');
console.log('  ✓ ApiKey visible (no redaction)');

// Test 8: Config manager getRedactConfig
console.log('\nTest 8: Config manager getRedactConfig method');
JSGLogger._instance = null;
JSGLogger._enhancedLoggers = null;

const logger8 = JSGLogger.getInstanceSync({
  projectName: 'RedactionTest8',
  globalLevel: 'info',
  redact: {
    paths: ['test', '*key'],
    censor: 'CUSTOM'
  }
});

const redactConfig = configManager.getRedactConfig();
assert.strictEqual(Array.isArray(redactConfig.paths), true, 'paths should be an array');
assert.strictEqual(redactConfig.paths.includes('test'), true, 'paths should include exact match');
assert.strictEqual(redactConfig.paths.includes('*key'), true, 'paths should include wildcard');
assert.strictEqual(redactConfig.censor, 'CUSTOM', 'censor should match config');

console.log('  ✓ getRedactConfig returns correct structure');
console.log('  ✓ paths array contains configured patterns');
console.log('  ✓ censor text matches config');

// Test 9: Default redact config (when not configured)
console.log('\nTest 9: Default redact config');
JSGLogger._instance = null;
JSGLogger._enhancedLoggers = null;

// Load default config
configManager.config = { ...configManager.config };
if (configManager.config.redact) {
  delete configManager.config.redact;
}

const defaultRedactConfig = configManager.getRedactConfig();
assert.strictEqual(Array.isArray(defaultRedactConfig.paths), true, 'default paths should be an array');
assert.strictEqual(defaultRedactConfig.censor, '[REDACTED]', 'default censor should be [REDACTED]');

console.log('  ✓ Default paths is array');
console.log('  ✓ Default censor is [REDACTED]');

// Restore console.log
console.log = originalLog;

console.log('\n✅ All redaction tests passed!\n');



