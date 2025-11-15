# Session Plan: Console.log Replacement with JSG Logger

**Date**: November 6, 2025  
**Objective**: Replace all `console.log` statements with JSG Logger calls where appropriate, while maintaining console.log for early initialization logs

## Overview

This session focused on replacing `console.log` statements throughout the JSG Logger codebase and its DevTools UI with proper logger calls, implementing a configurable meta-logging system for the logger's own internal logs.

## Implementation Strategy

### 1. Meta-Logging System for Logger Internals

**Goal**: Control how the logger logs about itself (initialization, config loading, etc.)

**Approach**:
- Add `metaLogging` config option with three modes:
  - `true` (default): Use `console.log` directly
  - `false`: Silent (no meta-logging)
  - `'logger'`: Use logger's `core` component after initialization
- Create `utils/meta-logger.js` utility module
- Replace internal logger `console.log` with `metaLog`, `metaWarn`, `metaError`

### 2. DevTools UI Logging

**Goal**: DevTools panel should use the logger instead of console

**Approach**:
- Add `'devtools-ui'` component to logger config
- Create `getDevToolsLogger()` helper in each DevTools file
- Replace all `console.log/warn/error` with `devtoolsLogger.info/warn/error`
- Provide graceful console fallback if logger not available

### 3. Keep Console.log Where Necessary

**Criteria for keeping console.log**:
- Logs that fire before logger initialization
- Critical error conditions where logger might not be available
- Temporary debug logs during development

## Files Modified

### Core Logger Files

#### 1. `config/default-config.json`
**Change**: Added `metaLogging` configuration option
```json
{
  "metaLogging": true,
  // ... rest of config
}
```

#### 2. `utils/meta-logger.js` (NEW FILE)
**Purpose**: Utility functions for meta-logging about the logger itself

**Exports**:
- `metaLog()` - Info-level meta-logging
- `metaWarn()` - Warning-level meta-logging
- `metaError()` - Error-level meta-logging

**Logic**:
- Checks `configManager.config.metaLogging` setting
- If `true` or undefined → use `console.log`
- If `false` → silent
- If `'logger'` → use logger's `core` component with console fallback

#### 3. `index.js`
**Changes**:
- Imported `metaLog` from `./utils/meta-logger.js`
- Replaced 17 `console.log/warn/error` calls with `metaLog/metaWarn/metaError`
- Added `getProjectName()` method to `controls` object (line ~760)
  ```javascript
  getProjectName: () => this.config.projectName || 'JSG Logger'
  ```
- Kept appropriate `console.log` for early initialization before config loading

**Console.log locations replaced**:
- DevTools initialization logging
- Component registration logging
- Level resolution logging
- Configuration status logging
- Error conditions (using `this.getComponent('core').error()`)

#### 4. `config/config-manager.js`
**Changes**:
- Imported `metaLog` from `../utils/meta-logger.js`
- Replaced 7 `console.log` calls with `metaLog`

**Console.log locations replaced**:
- Config file loading status
- DevTools activation status
- Config merge operations
- Component override logging

### DevTools UI Files

#### 5. `devtools/panel-entry.js` (dist version)
**Changes**:
- Added `getDevToolsLogger()` helper function
  ```javascript
  const getDevToolsLogger = () => {
      const logger = window.JSG_Logger?.getComponent?.('devtools-ui');
      return logger || {
          info: console.log,
          warn: console.warn,
          error: console.error
      };
  };
  ```
- Replaced 7 `console` calls with `devtoolsLogger.info/warn/error`

**Console.log locations replaced**:
- DevTools panel initialization
- Panel mount/unmount events
- Connection status logging
- Error conditions

#### 6. `devtools/src/panel-entry.jsx` (Evergreen UI version)
**Changes**:
- Added `getDevToolsLogger()` helper function
- Replaced 13 `console` calls with `devtoolsLogger.info/warn/error`

**Console.log locations replaced**:
- Panel lifecycle events
- Logger connection status
- Component registration
- Error handling

#### 7. `devtools/src/App.jsx`
**Changes**:
- Added `getDevToolsLogger()` helper function
- Replaced 41 `console` calls with `devtoolsLogger.info/warn/error`

**Console.log locations replaced**:
- Component lifecycle logging
- State changes
- Filter operations
- Log aggregation
- Performance metrics
- Error conditions
- Connection status

#### 8. `devtools/components/GlobalControls.js`
**Changes**:
- Added `getDevToolsLogger()` helper function
- Replaced 1 `console.log` with `devtoolsLogger.info()`

**Console.log locations replaced**:
- Control toggle events

#### 9. `devtools/components/DevToolsPanel.js`
**Changes**:
- Added `getDevToolsLogger()` helper function
- Replaced 4 `console.log` calls with `devtoolsLogger.info()`

**Console.log locations replaced**:
- Panel initialization
- Component registration
- Filter changes
- Connection events

### Site Integration Files

#### 10. `jsg-tech-check-site/src/layouts/Base.astro`
**Changes**:
- Added `'devtools-ui'` component to logger configuration
  ```typescript
  "devtools-ui": { 
    description: "JSG Logger DevTools UI", 
    level: "info", 
    enabled: true 
  }
  ```

## Implementation Details

### Meta-Logger Architecture

The `meta-logger.js` utility provides three functions that:
1. Check the `metaLogging` config setting
2. Attempt to use the logger's `core` component if config is `'logger'`
3. Gracefully fall back to `console.log` if logger not available
4. Stay silent if config is `false`

This allows control over how much the logger "talks about itself" without affecting application logging.

### DevTools Logger Architecture

Each DevTools file implements `getDevToolsLogger()` helper that:
1. Attempts to get the `'devtools-ui'` component from the logger
2. Falls back to console methods if logger not available
3. Returns an object with consistent `info/warn/error` interface

This ensures DevTools UI can always log, even if the logger instance isn't available yet.

### Console.log Retention Strategy

We kept `console.log` in specific cases:
1. **Early initialization**: Before config is loaded
2. **Critical errors**: Where logger might be in failed state
3. **Meta-logging with config**: Now handled by meta-logger.js utility

## Verification Steps

After applying all changes:

1. **Check meta-logging**:
   - Set `metaLogging: true` → should see console logs
   - Set `metaLogging: false` → should be silent
   - Set `metaLogging: 'logger'` → should use logger's core component

2. **Check DevTools logging**:
   - Open DevTools panel
   - Verify logs appear in main console using `[DEVTOOLS-UI]` component
   - Check graceful fallback if logger not available

3. **Verify no missing components**:
   - Should see no "Component 'devtools-ui' not found" warnings

## Summary of Changes

- **Total files modified**: 10
- **New files created**: 1 (`utils/meta-logger.js`)
- **Console.log statements replaced**: 90+
- **New logger components**: 1 (`devtools-ui`)
- **New config options**: 1 (`metaLogging`)
- **New control methods**: 1 (`getProjectName`)

## Benefits

1. **Consistency**: Logger now uses itself for internal logging
2. **Control**: Meta-logging can be configured per environment
3. **Debugging**: DevTools UI logs are now captured and can be filtered
4. **Graceful degradation**: Fallbacks ensure logging always works
5. **Professional**: Single source of truth for all logging output













