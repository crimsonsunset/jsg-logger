# Changelog

All notable changes to the JSG Logger project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Conditional DevTools Bundling** - DevTools panel now optional via config, with tree-shaking support
  - Added `devtools.enabled` config flag (default: `false`)
  - When disabled, devtools code is tree-shaken out (zero bundle impact)
  - When enabled, DevTools panel is self-contained with all dependencies bundled
  - Function constructor used for dynamic imports to bypass Vite static analysis
  - Package export path (`@crimsonsunset/jsg-logger/devtools`) for proper module resolution

### Changed
- **DevTools Dependencies** - Preact and Evergreen UI are now bundled into the DevTools dist file (self-contained)
  - No peer dependencies required - works out of the box
  - Bundle size: ~409KB uncompressed, ~81KB gzipped
  - Eliminates module resolution issues when consuming from node_modules
- **DevTools Import** - Uses Function constructor + package export path instead of relative paths to prevent Vite static analysis failures

### Fixed
- **Vite Build Failures** - Fixed dynamic import issues that caused Vite dev server startup failures
- **DevTools Module Resolution** - Fixed 404 errors when loading DevTools panel from node_modules by using package export path
- **DevTools Dependencies** - Bundled all dependencies to eliminate peer dependency resolution issues
- **DevTools Bundle Size** - Zero impact when disabled (default), only loads when explicitly enabled

## [1.5.2] - 2025-10-25 🐛 **PATCH: CLI Formatter Custom Component Display**

### Fixed
- **CLI formatter custom component names** - Formatter was using hardcoded `COMPONENT_SCHEME` instead of `configManager`, causing custom component names to display as `[JSG-CORE]` instead of user-defined names like `[SETUP]`
- **Browser formatter** - Removed redundant component name transformation

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
