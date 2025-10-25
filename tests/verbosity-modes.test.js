/**
 * Test: Verbosity Modes and Log Level Filtering
 * 
 * Expected: Logs should be filtered based on globalLevel:
 * - trace: Shows all logs (trace, debug, info, warn, error, fatal)
 * - debug: Shows debug, info, warn, error, fatal
 * - info: Shows info, warn, error, fatal (default)
 * - warn: Shows warn, error, fatal
 * - error: Shows error, fatal
 */

import assert from 'assert';
import { JSGLogger } from '../index.js';

console.log('\n🧪 Testing: Verbosity Modes\n');

// Helper to capture log output
function captureLogs(fn) {
  const output = [];
  const originalLog = console.log;
  console.log = (...args) => {
    output.push(args.join(' '));
  };
  
  fn();
  
  console.log = originalLog;
  return output;
}

// Helper to count log level occurrences
function countLogLevels(output) {
  return {
    trace: output.filter(line => line.includes('🔍') || line.includes('TRACE')).length,
    debug: output.filter(line => line.includes('🐛') || line.includes('DEBUG')).length,
    info: output.filter(line => line.includes('✨') || line.includes('INFO')).length,
    warn: output.filter(line => line.includes('⚠️') || line.includes('WARN')).length,
    error: output.filter(line => line.includes('🚨') || line.includes('ERROR')).length,
  };
}

// Helper to generate all log levels
function generateAllLogs(logger) {
  const testLog = logger.getComponent('test');
  testLog.trace('Trace message');
  testLog.debug('Debug message');
  testLog.info('Info message');
  testLog.warn('Warn message');
  testLog.error('Error message');
}

// Test 1: Info level (default)
console.log('Test 1: Info level (default)');
JSGLogger._instance = null;
JSGLogger._enhancedLoggers = null;
const loggerInfo = JSGLogger.getInstanceSync({ globalLevel: 'info' });

const infoOutput = captureLogs(() => generateAllLogs(loggerInfo));
const infoCounts = countLogLevels(infoOutput);

console.log(`  trace: ${infoCounts.trace} (expected 0)`);
console.log(`  debug: ${infoCounts.debug} (expected 0)`);
console.log(`  info: ${infoCounts.info} (expected 1)`);
console.log(`  warn: ${infoCounts.warn} (expected 1)`);
console.log(`  error: ${infoCounts.error} (expected 1)`);

assert.strictEqual(infoCounts.trace, 0, 'Info level should not show trace');
assert.strictEqual(infoCounts.debug, 0, 'Info level should not show debug');
assert.ok(infoCounts.info > 0, 'Info level should show info');
assert.ok(infoCounts.warn > 0, 'Info level should show warn');
assert.ok(infoCounts.error > 0, 'Info level should show error');

// Test 2: Debug level
console.log('\nTest 2: Debug level');
JSGLogger._instance = null;
JSGLogger._enhancedLoggers = null;
const loggerDebug = JSGLogger.getInstanceSync({ globalLevel: 'debug' });

const debugOutput = captureLogs(() => generateAllLogs(loggerDebug));
const debugCounts = countLogLevels(debugOutput);

console.log(`  trace: ${debugCounts.trace} (expected 0)`);
console.log(`  debug: ${debugCounts.debug} (expected 1)`);
console.log(`  info: ${debugCounts.info} (expected 1)`);
console.log(`  warn: ${debugCounts.warn} (expected 1)`);
console.log(`  error: ${debugCounts.error} (expected 1)`);

assert.strictEqual(debugCounts.trace, 0, 'Debug level should not show trace');
assert.ok(debugCounts.debug > 0, 'Debug level should show debug');
assert.ok(debugCounts.info > 0, 'Debug level should show info');
assert.ok(debugCounts.warn > 0, 'Debug level should show warn');
assert.ok(debugCounts.error > 0, 'Debug level should show error');

// Test 3: Trace level (maximum verbosity)
console.log('\nTest 3: Trace level (maximum verbosity)');
JSGLogger._instance = null;
JSGLogger._enhancedLoggers = null;
const loggerTrace = JSGLogger.getInstanceSync({ globalLevel: 'trace' });

const traceOutput = captureLogs(() => generateAllLogs(loggerTrace));
const traceCounts = countLogLevels(traceOutput);

console.log(`  trace: ${traceCounts.trace} (expected 1)`);
console.log(`  debug: ${traceCounts.debug} (expected 1)`);
console.log(`  info: ${traceCounts.info} (expected 1)`);
console.log(`  warn: ${traceCounts.warn} (expected 1)`);
console.log(`  error: ${traceCounts.error} (expected 1)`);

assert.ok(traceCounts.trace > 0, 'Trace level should show trace');
assert.ok(traceCounts.debug > 0, 'Trace level should show debug');
assert.ok(traceCounts.info > 0, 'Trace level should show info');
assert.ok(traceCounts.warn > 0, 'Trace level should show warn');
assert.ok(traceCounts.error > 0, 'Trace level should show error');

// Test 4: Warn level (minimal verbosity)
console.log('\nTest 4: Warn level (minimal verbosity)');
JSGLogger._instance = null;
JSGLogger._enhancedLoggers = null;
const loggerWarn = JSGLogger.getInstanceSync({ globalLevel: 'warn' });

const warnOutput = captureLogs(() => generateAllLogs(loggerWarn));
const warnCounts = countLogLevels(warnOutput);

console.log(`  trace: ${warnCounts.trace} (expected 0)`);
console.log(`  debug: ${warnCounts.debug} (expected 0)`);
console.log(`  info: ${warnCounts.info} (expected 0)`);
console.log(`  warn: ${warnCounts.warn} (expected 1)`);
console.log(`  error: ${warnCounts.error} (expected 1)`);

assert.strictEqual(warnCounts.trace, 0, 'Warn level should not show trace');
assert.strictEqual(warnCounts.debug, 0, 'Warn level should not show debug');
assert.strictEqual(warnCounts.info, 0, 'Warn level should not show info');
assert.ok(warnCounts.warn > 0, 'Warn level should show warn');
assert.ok(warnCounts.error > 0, 'Warn level should show error');

console.log('\n✅ All verbosity mode tests passed!\n');

