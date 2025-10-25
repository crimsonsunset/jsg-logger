# JSG Logger Test Suite

Comprehensive tests for JSG Logger covering all critical functionality and bug fixes.

## Running Tests

```bash
# Run all tests
npm test

# Run a specific test
node tests/singleton-reinit.test.js
node tests/global-level.test.js
node tests/context-data.test.js
node tests/verbosity-modes.test.js
node tests/pino-wrapper.test.js
```

## Test Coverage

### 1. `singleton-reinit.test.js`
**Tests**: Singleton reinitialization with new options

**Bug Fixed**: When the module is imported, it calls `getInstanceSync()` with no options, creating a singleton. Subsequent calls with options were ignored.

**Validates**:
- First initialization uses default options
- Reinitialization with new options updates config
- Component loggers reflect new configuration

### 2. `global-level.test.js`
**Tests**: Global log level configuration

**Bugs Fixed**: 
- Component-specific levels in default config were overriding globalLevel
- Loggers weren't being recreated on reinit, so they kept old levels

**Validates**:
- All components respect globalLevel by default
- Changing globalLevel updates all logger instances
- Component-specific levels can override globalLevel
- Logger recreation works correctly

### 3. `context-data.test.js`
**Tests**: Context data display in CLI format

**Bug Fixed**: Pino expects `logger.info({context}, 'message')` but intuitive usage is `logger.info('message', {context})`. Context data wasn't being passed to formatter.

**Validates**:
- Message-first syntax works: `logger.info('msg', {ctx})`
- Context-first syntax works: `logger.info({ctx}, 'msg')`
- Context data is displayed in tree format
- Nested objects are handled correctly
- All log levels support context data

### 4. `verbosity-modes.test.js`
**Tests**: Log level filtering based on globalLevel

**Validates**:
- `trace` level: Shows all logs (trace, debug, info, warn, error, fatal)
- `debug` level: Shows debug, info, warn, error, fatal
- `info` level: Shows info, warn, error, fatal (default)
- `warn` level: Shows warn, error, fatal
- `error` level: Shows error, fatal
- Proper filtering at each level

### 5. `pino-wrapper.test.js`
**Tests**: Pino logger wrapper argument transformation

**Bug Fixed**: Pino's native API is `logger.info({context}, 'message')` but more intuitive is `logger.info('message', {context})`.

**Validates**:
- Both argument orders work correctly
- Message-only calls work
- Context-only calls work
- Multiple context properties are passed
- Nested objects in context are preserved

## Test Architecture

All tests use Node.js built-in `assert` module for zero external dependencies.

Each test:
1. Resets the singleton to ensure clean state
2. Tests specific functionality
3. Validates output and behavior
4. Reports results with clear pass/fail indicators

## Adding New Tests

1. Create a new file: `tests/your-test.test.js`
2. Import necessary modules
3. Reset singleton at test start
4. Write test cases with clear assertions
5. Run with `npm test` or `node tests/your-test.test.js`

Example structure:

```javascript
import assert from 'assert';
import { JSGLogger } from '../index.js';

console.log('\n🧪 Testing: Your Feature\n');

// Reset singleton
JSGLogger._instance = null;
JSGLogger._enhancedLoggers = null;

// Test 1
console.log('Test 1: Description');
const logger = JSGLogger.getInstanceSync();
// ... test code ...
assert.strictEqual(actual, expected, 'Error message');

console.log('\n✅ All tests passed!\n');
```

## CI/CD Integration

Tests are designed to be CI-friendly:
- Exit code 0 on success
- Exit code 1 on failure
- Clear console output for logs
- No external dependencies required
- Runs quickly (< 10 seconds total)

Add to your CI pipeline:

```yaml
- name: Run tests
  run: npm test
```

