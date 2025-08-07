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
