# Contributing to JSG Logger

## 🎯 Current Status

**This is a personal utility project that has been extracted and published for reuse.** 

Contributions are welcome, but please note:
- This project emerged from a specific use case but is now a generic multi-environment logger
- The core functionality is stable and feature-complete for most use cases
- Major architectural changes should be discussed in an issue first

## 📋 How to Contribute

### Issues
- **Bug Reports**: Clearly describe the issue with environment details and reproduction steps
- **Feature Requests**: Explain the use case and why it would benefit the broader community
- **Questions**: Feel free to ask about usage or implementation details

### Pull Requests
- **Small Fixes**: Documentation, typos, minor bugs - submit directly
- **New Features**: Open an issue first to discuss the approach
- **Breaking Changes**: Require significant discussion and justification

## 🛠️ Development Setup

```bash
# Clone the repository
git clone https://github.com/crimsonsunset/jsg-logger.git
cd jsg-logger

# Install dependencies
npm install

# Test your changes
npm run check
```

## 📝 Code Style

- **ES Modules**: Use import/export syntax
- **JSDoc**: Document all functions
- **Descriptive Names**: Clear variable and function names
- **Early Returns**: Prefer early returns for readability

## 🔄 Release Process

Maintainer-only process:
```bash
npm run release          # Patch version (1.0.x)
npm run release:minor    # Minor version (1.x.0)
npm run release:major    # Major version (x.0.0)
```

## ⚠️ Legal

By contributing, you agree that your contributions will be licensed under the ISC License.

All contributions are provided "AS IS" without warranty, consistent with the project license.
