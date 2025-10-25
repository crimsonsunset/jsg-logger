# JSG Logger Testing Guide

## Quick Start

```bash
# Run all tests
npm test

# Run a specific test
node tests/singleton-reinit.test.js
```

## Test Suite Overview

The test suite validates all critical functionality and bug fixes discovered during integration with the macOS setup script project.

### Test Files

1. **`singleton-reinit.test.js`** - Singleton reinitialization
2. **`global-level.test.js`** - Global log level configuration  
3. **`context-data.test.js`** - Context data display
4. **`verbosity-modes.test.js`** - Log level filtering
5. **`pino-wrapper.test.js`** - Pino argument transformation

## Bugs Validated By Tests

### 🐛 Bug #1: Singleton Options Ignored (Fixed)
**Test**: `singleton-reinit.test.js`

When the module was imported, it called `getInstanceSync()` with no options, creating a singleton. Subsequent calls with options were ignored.

**Fix**: Modified `getInstanceSync()` to reinitialize when new options are provided.

**Validation**:
- ✅ First init uses default options
- ✅ Reinit with new options updates config
- ✅ Component loggers reflect new levels

---

### 🐛 Bug #2: GlobalLevel Not Applied (Fixed)
**Test**: `global-level.test.js`

Two issues prevented globalLevel from working:
1. Component-specific levels in default config overrode globalLevel
2. Loggers weren't recreated on reinit, keeping old levels

**Fix**: 
- Removed component-specific level from default config
- Fixed logger recreation in `initSync()` to use `_createLoggerOriginal`

**Validation**:
- ✅ All components respect globalLevel
- ✅ Changing globalLevel updates all loggers
- ✅ Component overrides still work when specified

---

### 🐛 Bug #3: Context Data Not Displayed (Fixed)
**Test**: `context-data.test.js`

Pino expects `logger.info({context}, 'message')` but intuitive usage is `logger.info('message', {context})`. Context data wasn't being passed to the formatter.

**Fix**: Created `_wrapPinoLogger()` to transform both argument orders.

**Validation**:
- ✅ Message-first syntax works
- ✅ Context-first syntax works
- ✅ Context displayed in tree format
- ✅ Nested objects handled correctly
- ✅ All log levels support context

---

### 🐛 Bug #4: Verbosity Modes Not Filtering (Fixed)
**Test**: `verbosity-modes.test.js`

Log levels weren't properly filtering messages based on globalLevel setting.

**Fix**: Combination of fixes for singleton reinit and globalLevel application.

**Validation**:
- ✅ `trace`: Shows all logs
- ✅ `debug`: Shows debug+
- ✅ `info`: Shows info+ (default)
- ✅ `warn`: Shows warn+
- ✅ `error`: Shows error+

---

### 🐛 Bug #5: Pino Wrapper Not Transforming Args (Fixed)
**Test**: `pino-wrapper.test.js`

Pino's native API signature differs from intuitive usage patterns.

**Fix**: `_wrapPinoLogger()` method handles both argument orders.

**Validation**:
- ✅ Both syntax orders work
- ✅ Message-only works
- ✅ Context-only works
- ✅ Multiple properties passed
- ✅ Nested objects preserved

---

## Test Architecture

- **Zero Dependencies**: Uses Node.js built-in `assert` module
- **Fast Execution**: All tests complete in <10 seconds
- **CI-Friendly**: Clear exit codes and console output
- **Isolated**: Each test resets singleton for clean state

## Adding New Tests

See `tests/README.md` for detailed guide on adding new tests.

## CI/CD Integration

```yaml
# GitHub Actions example
- name: Run tests
  run: npm test
```

Tests automatically run as part of the `npm run check` command before publishing.



