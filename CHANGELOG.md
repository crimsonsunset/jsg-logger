# Changelog

All notable changes to the JSG Logger project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- None

### Changed  
- None

### Fixed
- None

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
