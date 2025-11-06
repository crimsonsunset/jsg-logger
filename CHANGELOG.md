# Changelog

All notable changes to the JSG Logger project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.7.3] - 2025-11-06 🎛️ **DevTools Logging Cleanup**

### Fixed
- **Meta-Logger Scope** - Clarified meta-logger is for bootstrap logs only
  - Removed `'logger'` mode option (now just `true`/`false`)
  - Updated JSDoc to emphasize "BOOTSTRAP ONLY" usage
  - Post-init errors now use actual logger if available, fallback to console
- **DevTools Component-Based Logging** - Fixed DevTools to use proper component logging
  - Added `devtools-ui` component to `COMPONENT_SCHEME` (🎛️ emoji, purple color)
  - DevTools controls API (`enableDevPanel`, `disableDevPanel`) now use `devtools-ui` component instead of `core`
  - All DevTools files now import logger directly instead of using window globals
  - Removed manual `[JSG-DEVTOOLS]` prefixes from all log messages (logger adds component name automatically)
  - DevTools logs now show as `🎛️ [DEVTOOLS]` instead of `🎯 [CORE] [JSG-LOGGER]`

### Changed
- **DevTools Logging Pattern** - Standardized DevTools logging approach
  - Pattern: `import logger from '../../index.js'; const devtoolsLogger = logger.getComponent('devtools-ui');`
  - No console fallbacks needed (`getComponent` always returns valid logger)
  - Clean component-based logging throughout DevTools lifecycle

### Technical Details
- **Files Modified**: `utils/meta-logger.js`, `index.js`, `config/config-manager.js`, `config/component-schemes.js`
- **DevTools Files**: `devtools/src/panel-entry.jsx`, `devtools/src/App.jsx`, `devtools/components/GlobalControls.js`, `devtools/components/DevToolsPanel.js`
- **Result**: Consistent, component-based logging with proper formatting and no manual prefixes

## [1.7.0] - 2025-01-XX 🎯 **Config-Driven Tree-Shaking & Enhanced Logging**

### Added
- **Config-Driven Tree-Shaking** - DevTools panel tree-shaking now based on default config at module load time
  - Tree-shaking determined by `defaultConfig.devtools.enabled` (default: `false`)
  - When disabled, devtools code completely tree-shaken (zero bundle impact)
  - When enabled via runtime config, loads dynamically on demand
  - Static import analysis allows bundlers to eliminate unused code paths
- **Comprehensive DevTools Logging** - Added detailed logging throughout DevTools lifecycle
  - Module load: logs default config tree-shaking status
  - Config loading: logs when devtools enabled/disabled via user config
  - DevTools activation: logs pre-load status, dynamic loading, and initialization steps
  - Config merge: logs devtools status changes between defaults and user config

### Changed
- **DevTools Import Strategy** - Simplified to relative path imports
  - Removed complex Function constructor + package export path logic
  - Uses simple relative path: `./devtools/dist/panel-entry.js`
  - Works in production builds, requires `server.fs.allow: ['..']` for npm link dev
- **Config Loading Logging** - Enhanced visibility into config loading process
  - Logs config source (file path vs inline object)
  - Logs devtools status before/after config merge
  - Logs initialization start with config source information

### Fixed
- **Tree-Shaking Detection** - Bundlers can now properly analyze and eliminate devtools code when disabled
- **DevTools Pre-loading** - Non-blocking pre-load when default config enables devtools
- **Runtime Config Override** - Dynamic loading works correctly when runtime config enables devtools but default disabled

### Technical Details
- **File**: `index.js`
  - Added conditional static import based on `defaultConfig.devtools.enabled`
  - Lazy initialization pattern to avoid top-level await
  - Enhanced `enableDevPanel()` with comprehensive logging
  - Pre-loads devtools module when default config enables it
  
- **File**: `config/config-manager.js`
  - Added logging for config loading (file vs inline)
  - Added devtools status logging before/after config merge
  - Enhanced visibility into config changes

### Migration Notes
No breaking changes. Existing code continues to work.

**For consumers:**
- DevTools code tree-shaken by default (zero bundle impact)
- Enable via runtime config: `{ devtools: { enabled: true } }`
- DevTools loads dynamically when `enableDevPanel()` called
- No special Vite config needed for production builds
- npm link users: add `server.fs.allow: ['..']` to Vite config for dev

## [1.7.1] - 2025-11-05 🎯 **TypeScript Support & Zero-Optional-Chaining API**

### Added
- **TypeScript Definitions** - Full TypeScript support with `index.d.ts`
  - Complete type definitions for all logger interfaces
  - `LoggerInstance`, `LoggerComponents`, `LoggerInstanceType` interfaces
  - Proper exports configuration in `package.json` with `types` field
- **Safe Component Getters** - Component getters initialized in constructor
  - `_initializeSafeComponentGetters()` ensures components accessible before initialization
  - Common components (reactComponents, astroComponents, etc.) always available
  - Returns no-op logger factories if logger not initialized yet

### Changed
- **getComponent Always Available** - `getComponent` is now non-optional in TypeScript types
  - Removed `?` optional marker from `getComponent` in `LoggerInstanceType`
  - Always returns a logger instance (no-op if not initialized)
  - Consumers can call `loggerInstance.getComponent('componentName')` without optional chaining
- **Fallback Logger Enhancement** - `createFallbackLogger()` now includes `getComponent`
  - Ensures `getComponent` exists even when initialization fails
  - Returns no-op logger factory for safe fallback behavior
- **Enhanced getComponent Safety** - Improved error handling and edge cases
  - Returns no-op logger if instance not initialized
  - Returns no-op logger if logger creation fails
  - Prevents crashes when logger unavailable

### Fixed
- **Optional Chaining Burden** - Eliminated need for `?.` optional chaining in consumer code
  - Consumers can now use `loggerInstance.getComponent('componentName').debug(...)` directly
  - No more `loggerInstance?.getComponent?.('componentName')?.debug(...)` chains
  - TypeScript types guarantee `getComponent` always exists

### Technical Details
- **File**: `index.d.ts` (NEW)
  - Complete TypeScript definitions for the logger package
  - Non-optional `getComponent` method signature
  - Proper interface documentation
  
- **File**: `index.js`
  - Added `_initializeSafeComponentGetters()` method called in constructor
  - Enhanced `getComponent()` to always return logger (no-op fallback)
  - Added `_createNoOpLogger()` private method for safe fallbacks
  - Updated `createFallbackLogger()` to include `getComponent`
  - Modified `_createAutoDiscoveryGetters()` to preserve safe getters

- **File**: `package.json`
  - Added `"types": "./index.d.ts"` field
  - Added `index.d.ts` to `files` array
  - Updated `exports` to include proper TypeScript types export

### Migration Notes
No breaking changes. Existing code continues to work, but optional chaining is now optional (pun intended).

**For consumers:**
- Can now use `loggerInstance.getComponent('componentName')` without `?.`
- TypeScript users get full type safety and autocomplete
- No-op logger returned if logger not initialized (safe to call)
- Recommended: Use `getInstanceSync()` for synchronous access instead of `getInstance()` when possible

## [1.7.0] - 2025-01-XX 🎯 **Config-Driven Tree-Shaking & Enhanced Logging**

### Added
- **Config-Driven Tree-Shaking** - DevTools panel tree-shaking now based on default config at module load time
  - Tree-shaking determined by `defaultConfig.devtools.enabled` (default: `false`)
  - When disabled, devtools code completely tree-shaken (zero bundle impact)
  - When enabled via runtime config, loads dynamically on demand
  - Static import analysis allows bundlers to eliminate unused code paths
- **Comprehensive DevTools Logging** - Added detailed logging throughout DevTools lifecycle
  - Module load: logs default config tree-shaking status
  - Config loading: logs when devtools enabled/disabled via user config
  - DevTools activation: logs pre-load status, dynamic loading, and initialization steps
  - Config merge: logs devtools status changes between defaults and user config

### Changed
- **DevTools Import Strategy** - Simplified to relative path imports
  - Removed complex Function constructor + package export path logic
  - Uses simple relative path: `./devtools/dist/panel-entry.js`
  - Works in production builds, requires `server.fs.allow: ['..']` for npm link dev
- **Config Loading Logging** - Enhanced visibility into config loading process
  - Logs config source (file path vs inline object)
  - Logs devtools status before/after config merge
  - Logs initialization start with config source information

### Fixed
- **Tree-Shaking Detection** - Bundlers can now properly analyze and eliminate devtools code when disabled
- **DevTools Pre-loading** - Non-blocking pre-load when default config enables devtools
- **Runtime Config Override** - Dynamic loading works correctly when runtime config enables devtools but default disabled

### Technical Details
- **File**: `index.js`
  - Added conditional static import based on `defaultConfig.devtools.enabled`
  - Lazy initialization pattern to avoid top-level await
  - Enhanced `enableDevPanel()` with comprehensive logging
  - Pre-loads devtools module when default config enables it
  
- **File**: `config/config-manager.js`
  - Added logging for config loading (file vs inline)
  - Added devtools status logging before/after config merge
  - Enhanced visibility into config changes

### Migration Notes
No breaking changes. Existing code continues to work.

**For consumers:**
- DevTools code tree-shaken by default (zero bundle impact)
- Enable via runtime config: `{ devtools: { enabled: true } }`
- DevTools loads dynamically when `enableDevPanel()` called
- No special Vite config needed for production builds
- npm link users: add `server.fs.allow: ['..']` to Vite config for dev

## [Unreleased]

## [1.5.2] - 2025-10-25 🐛 **PATCH: CLI Formatter Custom Component Display**

### Technical Changes
- `formatters/cli-formatter.js` - Use `configManager.getComponentConfig()` instead of static `COMPONENT_SCHEME`
- `formatters/browser-formatter.js` - Remove redundant name transformation
- `tests/custom-components.test.js` - Added Test 6 for formatter output validation

## [1.5.1] - 2025-10-25 🔧 **PATCH: Component Initialization Optimization**

### Fixed
- **Component initialization pollution** - `getAvailableComponents()` no longer initializes all 13 default COMPONENT_SCHEME components when user defines custom components (3 defined → 3 initialized instead of 16)
- **Component name formatting** - Changed from PascalCase (`MyComponent`) to uppercase with separators (`MY-COMPONENT`)

### Technical Changes
- `config/config-manager.js` - Return only user components when defined, fallback to COMPONENT_SCHEME if empty; components replaced instead of merged; enhanced `_formatComponentName()`
- `index.js` - Clean reinitialization: reset config, clear loggers, normalize inline config
- `tests/custom-components.test.js` - New comprehensive test suite (5 tests)

## [1.5.0] - 2025-10-25 🎯 **CRITICAL FIX: CLI Tool Support**

### 🚨 **Critical Fixes**
These fixes resolve major blockers for CLI tool usage reported in production.

#### **Fixed: CLI Formatter Context Data Display** (Critical)
- **Replaced pino-colada** with custom formatter that displays context data
- Context objects now render as indented tree format in terminal
- Example output:
  ```
  21:32:11.6 ✨ [SYSTEM] ✓ macOS version compatible
     ├─ version: 14.2
     ├─ build: 23C64
     └─ command: sw_vers
  ```
- **Problem solved**: Context data was being silently ignored by pino-colada
- **Impact**: Terminal applications now show full diagnostic information, not just messages

#### **Fixed: Environment Detection for CLI Tools** (Critical)
- **Enhanced `isCLI()` detection** - Now checks multiple signals:
  - `process.stdout.isTTY` OR `process.stderr.isTTY` (not just stdout)
  - `process.env.TERM` or `process.env.COLORTERM` environment variables
  - Not running in CI/GitHub Actions context
- **Problem solved**: CLI tools were being detected as "server" mode → outputting JSON instead of pretty terminal formatting
- **Impact**: Terminal applications now properly display colored, formatted output instead of raw JSON blobs

#### **Added: Force Environment Override** (Critical)
- **New config option**: `forceEnvironment: 'cli' | 'browser' | 'server'`
- Allows explicit environment override when auto-detection fails
- Works in both inline config and `logger-config.json`
- **Use case**: Essential for CLI tools in non-TTY contexts (piped output, automation scripts, etc.)

#### **Added: Custom Component Name Support** (High Priority)
- **Auto-create loggers for ANY component name** - No longer restricted to `COMPONENT_SCHEME` 
- Components not in config get auto-generated with sensible defaults:
  - Default emoji: 📦
  - Default color: #999999
  - Uppercase display name
  - Global level inheritance
- **Problem solved**: Custom components like 'system', 'installer', 'nvm' now work without pre-definition
- **Impact**: True zero-configuration for component names

### ✨ **API Enhancements**

#### **Updated: `getComponent()` Method**
- Now auto-creates loggers for undefined components instead of returning error loggers
- Adds new components to auto-discovery getters dynamically
- Seamless experience for custom component names

#### **Updated: `getComponentConfig()` Method**
- Added 3-tier priority system:
  1. Config components (project-defined)
  2. COMPONENT_SCHEME defaults (built-in)
  3. Auto-generated (for custom components)
- Always returns valid config, never null/undefined

#### **Updated: `init()` and `initSync()` Methods**
- Now load config BEFORE environment detection
- Apply `forceEnvironment` config before determining environment
- `initSync()` properly handles inline config objects

### 📚 **Documentation**
- **Updated README** - New v1.5.0 Quick Start section highlighting CLI tool fixes
- **Added Force Environment docs** - When and how to override environment detection
- **Added Custom Components docs** - Examples of using arbitrary component names
- **Updated Environment Detection section** - Document enhanced CLI detection logic

### 🎯 **Real-World Impact**
**Before v1.5.0 (Broken for CLI tools):**
```javascript
const logger = JSGLogger.getInstanceSync({ components: { system: {...} } });
logger.getComponent('system').info('✓ macOS compatible', { version: '14.2', build: '23C64' });
// Output: {"level":30,"time":...,"msg":"✓ macOS compatible"}  ❌ JSON blob
// Component 'system' not found error ❌
// Context data not visible ❌
```

**After v1.5.0 (All Fixed!):**
```javascript
const logger = JSGLogger.getInstanceSync({ 
  forceEnvironment: 'cli',
  components: { system: { emoji: '⚙️' } }
});
logger.getComponent('system').info('✓ macOS compatible', { version: '14.2', build: '23C64' });
// Output: 
// 21:32:11.6 ⚙️ [SYSTEM] ✓ macOS compatible  ✅ Pretty formatted
//    ├─ version: 14.2                        ✅ Context data visible
//    └─ build: 23C64                         ✅ Tree formatting
// Custom component works ✅
```

### 🔧 **Technical Changes**
- **File**: `formatters/cli-formatter.js` ⭐ NEW FIX
  - Removed pino-colada dependency (wasn't showing context data)
  - Implemented custom formatter with context tree rendering
  - Context data now displays with tree formatting (├─ and └─)
  - Filters out pino internal fields (level, time, msg, pid, hostname, name, v, environment)
  
- **File**: `utils/environment-detector.js`
  - Added `forceEnvironment()` function for manual override
  - Enhanced `isCLI()` with multi-signal detection
  - All detection functions now respect forced environment
  
- **File**: `config/config-manager.js`
  - `getComponentConfig()` now has 3-tier fallback with auto-generation
  
- **File**: `index.js`
  - Import `forceEnvironment` from environment detector
  - Config loading moved BEFORE environment detection
  - `getComponent()` auto-creates loggers instead of error loggers
  - Added dynamic auto-discovery getter registration

- **File**: `package.json`
  - Removed pino-colada from dependencies (no longer required)

### 📋 **Migration Guide**
**No breaking changes** - This is a backward-compatible enhancement.

**Recommended for CLI tools:**
```javascript
// Add this to your config for reliable terminal output
const logger = JSGLogger.getInstanceSync({
  forceEnvironment: 'cli',  // ← Add this line
  // ... rest of your config
});
```

## [1.2.0] - 2025-08-21 🎯 **MAJOR: Fully Generic Logger**

### 🚀 **BREAKING CHANGES**
- **Minimal default config**: Only 'core' component included by default
- **Projects must define components**: Custom components now required in logger-config.json
- **Legacy component removal**: All 10 hardcoded legacy components removed
- **Core component rename**: 'cacp' → 'core' throughout functional code

### ✨ **Added**
- **100% Generic Design**: Zero legacy/project-specific references
- **Dynamic Alias Generation**: Auto-generate camelCase from kebab-case component names
- **Smart Component Creation**: Missing components auto-created with sensible defaults
- **Enhanced Config Normalization**: Better handling of various config formats
- **Generic Examples**: Updated advanced-config.json with modern component examples

### 🔧 **Changed**  
- **Default Configuration**: Minimal config with only 'core' component
- **Component Schemes**: Cleaned to minimal generic set
- **Class Names**: CACPLogger → JSGLogger throughout (completed in 1.1.4-1.1.7)
- **Browser Global**: window.CACP_Logger → window.JSG_Logger
- **Fallback Logic**: Uses 'core' component instead of hardcoded 'cacp'

### 🗑️ **Removed**
- **Legacy Components**: soundcloud, youtube, site-detector, websocket, popup, background, priority-manager, settings, test
- **Hardcoded Aliases**: Replaced siteDetector/priorityManager with dynamic generation
- **Project-Specific Logic**: All hardcoded references to specific use cases

### 📚 **Documentation**
- **Updated Roadmap**: Phase 9 complete, Phase 10 DX enhancements planned
- **Migration Guide**: Clear upgrade path for existing projects
- **Generic Examples**: Modern component examples for common project types

### 🎯 **Migration Notes**
Existing projects need to update their logger-config.json to define components:

```json
{
  "components": {
    "core": { "emoji": "🎯", "level": "info" },
    "api": { "emoji": "🌐", "level": "debug" },
    "ui": { "emoji": "🎨", "level": "info" }
  }
}
```

The logger will auto-create missing components, but explicit definition is recommended.

## [1.0.8] - 2025-08-06

### Changed
- **Package Name** - Changed from `@crimsonsunset/smart-logger` to `@crimsonsunset/jsg-logger`
- **Project Branding** - Updated all documentation and references from "Smart Logger" to "JSG Logger"
- **Package Description** - Updated to reflect JSG Logger branding

## [1.0.6] - 2025-08-06

### Added
- **Publishing Scripts** - Automated npm publishing with `npm run release`
- **Documentation Structure** - Added LICENSE, CHANGELOG, CONTRIBUTING, and docs/ folder

### Changed
- Package scripts for easier version management and publishing

### Fixed
- Internal import paths for config and formatter modules

## [1.0.0] - 1.0.6 - 2025-08-06

### Added
- **Multi-Environment Logger** - Smart detection of browser, CLI, and server environments
- **Direct Browser Logger** - 100% console control bypassing Pino for perfect formatting
- **Component Organization** - Separate loggers for different system components  
- **File-Level Overrides** - Granular control with glob pattern support
- **Runtime Controls** - Complete API for dynamic configuration changes
- **Beautiful Formatting** - Emojis, colors, and structured context display
- **Log Store** - In-memory storage for debugging and popup interfaces
- **Timestamp Modes** - Absolute, readable, relative, or disabled options
- **External Configuration** - JSON-based configuration system
- **Smart Level Resolution** - Hierarchical level determination (file > component > global)

### Technical Details
- **Environment Detection** - Automatic browser/CLI/server environment recognition
- **ISC License** - "AS IS" disclaimer for liability protection
- **NPM Package** - Published as `@crimsonsunset/jsg-logger`
