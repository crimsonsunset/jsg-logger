# JSG Logger

**100% Generic Multi-Environment Logger with Advanced Configuration**

A sophisticated, fully generic logging system that automatically detects its environment (browser, CLI, server) and provides optimal logging experience for any JavaScript project, with powerful file-level overrides and granular control.

> 🎮 **[Try the Interactive DevTools Playground →](https://logger.joesangiorgio.com/)**  
> Test all features in your browser with live examples and real-time controls!

## ✨ Features

- 🎯 **100% Generic** - Zero hardcoded assumptions, works with any project type
- 🚀 **Zero-Boilerplate Integration** - Eliminates 200+ lines of project setup code
- 🔧 **Auto-Discovery Components** - Both camelCase and kebab-case component access  
- ⚡ **Built-in Performance Logging** - Static utilities with auto-getInstance
- 🛡️ **Non-Destructive Error Handling** - Missing components log but don't break apps
- 🎨 **Custom Component Names** - Use ANY component name, auto-generated styling
- 🔧 **Force Environment Override** - Override auto-detection for CLI tools
- 🧠 **Enhanced Environment Detection** - Robust CLI detection with fallbacks
- 🎨 **Beautiful Visual Output** - Emoji, colors, and structured context display
- 📱 **Multi-Environment** - Browser console, terminal, and production JSON
- 🏪 **Log Store** - In-memory storage for debugging and popup interfaces
- ⚙️ **Runtime Controls** - Dynamic log level adjustment and configuration
- 📊 **Component Organization** - Separate loggers for different system components
- 🔧 **External Configuration** - JSON-based configuration system
- 📁 **File-Level Overrides** - Per-file and pattern-based control
- ⏰ **Timestamp Modes** - Absolute, readable, relative, or disabled
- 🎛️ **Display Toggles** - Control every aspect of log output
- 🔒 **Automatic Redaction** - Protect sensitive data in logs (passwords, API keys, tokens)
- 🎯 **Smart Level Resolution** - Hierarchical level determination

## 🚀 Quick Start

### **Custom Components & Force Environment for CLI Tools**

```javascript
import JSGLogger from '@crimsonsunset/jsg-logger';

// Force environment for CLI tools (fixes terminal detection)
const logger = JSGLogger.getInstanceSync({
  forceEnvironment: 'cli',  // Forces pretty terminal output
  globalLevel: 'info',
  components: {
    system: { emoji: '⚙️', level: 'info' },      // Custom component names!
    installer: { emoji: '📦', level: 'info' },   // No need to pre-define
    ssh: { emoji: '🔑', level: 'info' },         // Auto-generated styling
    nvm: { emoji: '🟢', level: 'info' }
  }
});

// Custom components work immediately
const sysLog = logger.getComponent('system');
sysLog.info('✓ macOS version compatible', { version: '14.2', build: '23C64' });
// Output: Pretty formatted terminal output with colors AND context data!
// 21:32:11.6 ⚙️ [SYSTEM] ✓ macOS version compatible
//    ├─ version: 14.2
//    └─ build: 23C64

const installLog = logger.getComponent('installer');
installLog.info('✓ Applications installed', { installed: 25, duration: '5m' });
// 21:32:11.8 📦 [INSTALLER] ✓ Applications installed
//    ├─ installed: 25
//    └─ duration: 5m
// No more JSON blobs in terminal!
```

### **Standard Usage**

```javascript
import JSGLogger from '@crimsonsunset/jsg-logger';

// Enhanced singleton with built-in configuration loading
const logger = await JSGLogger.getInstance({
  configPath: './logger-config.json'
});

// Use your project-specific components immediately
logger.api.info('Server started on port 3000');
logger.database.debug('Query executed', { query: 'SELECT * FROM users' });
logger.ui.info('Component mounted', { component: 'UserProfile' });

// Built-in static performance logging  
const startTime = performance.now();
// ... do work ...
JSGLogger.logPerformance('Page Generation', startTime, 'api');

// Custom components auto-created on demand
const dynamicLogger = logger.getComponent('new-feature');
dynamicLogger.info('Auto-created component!'); // Works immediately
```

### **Alternative Usage**

```javascript
import logger from '@crimsonsunset/jsg-logger';

// Use component-specific loggers with smart level resolution
const log = logger.api;
log.info('API handler initialized', {
  endpoint: 'https://api.example.com',
  isReady: true
});

// Runtime controls
logger.controls.enableDebugMode(); // Enable debug for all components
logger.controls.setLevel('websocket', 'trace'); // Set specific component level
logger.controls.addFileOverride('src/popup.js', { level: 'trace' }); // File-specific control
```

## 🎯 **Level Resolution Hierarchy**

The logger uses intelligent level resolution with the following priority:

1. **File Override** - `fileOverrides["src/popup.js"].level`
2. **Component Level** - `components["websocket"].level` 
3. **Global Level** - `globalLevel`

This allows surgical debugging - you can turn on trace logging for just one problematic file while keeping everything else quiet.

## ⚙️ **Advanced Configuration**

### **Force Environment Override**

Perfect for CLI tools that get mis-detected as "server" mode:

```javascript
// Inline config approach (recommended for CLI tools)
const logger = JSGLogger.getInstanceSync({
  forceEnvironment: 'cli',  // Options: 'browser', 'cli', 'server'
  globalLevel: 'info',
  components: {
    system: { emoji: '⚙️', level: 'info' }
  }
});
```

Or in `logger-config.json`:

```json
{
  "forceEnvironment": "cli",
  "projectName": "My CLI Tool",
  "globalLevel": "info",
  "components": {
    "system": { "emoji": "⚙️", "level": "info" }
  }
}
```

**When to use `forceEnvironment`:**
- CLI tools running in non-TTY contexts (CI, piped output, etc.)
- Override incorrect environment detection
- Testing different output formats
- Production deployments with specific requirements

### **Custom Component Names**

Use ANY component name - no need to pre-define in COMPONENT_SCHEME:

```javascript
const logger = JSGLogger.getInstanceSync({
  components: {
    'my-custom-component': { emoji: '🎯', level: 'debug' },
    'another-one': { emoji: '🚀', level: 'info' },
    'system-checker': { emoji: '⚙️', level: 'trace' }
  }
});

// All these work immediately - auto-created with sensible defaults
const log1 = logger.getComponent('my-custom-component');
const log2 = logger.getComponent('another-one');
const log3 = logger.getComponent('system-checker');

// Even undefined components work (auto-generated with 📦 emoji)
const log4 = logger.getComponent('undefined-component');
log4.info('This works!'); // Uses auto-generated styling
```

### **Full Configuration Example**

```json
{
  "forceEnvironment": "cli",
  "projectName": "My Advanced Project",
  "globalLevel": "info",
  "timestampMode": "absolute",
  "display": {
    "timestamp": true,
    "emoji": true,
    "component": true,
    "level": false,
    "message": true,
    "jsonPayload": true,
    "stackTrace": true
  },
  "components": {
    "api": { 
      "emoji": "🌐", 
      "color": "#4A90E2", 
      "name": "API",
      "level": "debug"
    },
    "database": { 
      "emoji": "💾", 
      "color": "#00C896", 
      "name": "Database",
      "level": "warn"
    }
  },
  "fileOverrides": {
    "src/auth/login.js": { 
      "level": "trace",
      "emoji": "🔐",
      "display": {
        "level": true,
        "jsonPayload": true
      }
    },
    "src/managers/*.js": { 
      "level": "warn",
      "display": {
        "jsonPayload": false
      }
    },
    "src/popup.js": {
      "level": "debug",
      "timestampMode": "relative",
      "display": {
        "jsonPayload": false
      }
    }
  },
  "devtools": {
    "enabled": false
  }
}
```

### **File Override Patterns**

File overrides support powerful pattern matching:

- **Exact files**: `"src/popup.js"`
- **Wildcards**: `"src/managers/*.js"` 
- **Patterns**: `"src/test-*.js"`
- **Directories**: `"src/sites/*.js"`

Each override can specify:
- `level` - Log level for this file/pattern
- `emoji` - Custom emoji override
- `timestampMode` - File-specific timestamp mode
- `display` - Individual display toggles

## ⏰ **Timestamp Modes**

Control how timestamps are displayed:

- **`absolute`** - `22:15:30.123` (default)
- **`readable`** - `10:15 PM`
- **`relative`** - `2s ago`, `5m ago`
- **`disable`** - No timestamp

```javascript
// Set globally
logger.controls.setTimestampMode('relative');

// Or per-file in config
"fileOverrides": {
  "src/popup.js": { "timestampMode": "relative" }
}
```

## 🎛️ **Display Controls**

Toggle individual parts of log output:

```javascript
// Available display options
const displayConfig = {
  timestamp: true,    // Show/hide timestamp
  emoji: true,        // Show/hide level emoji
  component: true,    // Show/hide [COMPONENT-NAME]
  level: false,       // Show/hide level name (DEBUG, INFO, etc.)
  message: true,      // Show/hide log message
  jsonPayload: true,  // Show/hide context data trees
  stackTrace: true    // Show/hide error stack traces
};

// Runtime control
logger.controls.setDisplayOption('jsonPayload', false);
logger.controls.toggleDisplayOption('level');
```

## 🔒 **Redaction (Sensitive Data Protection)**

Automatically redact sensitive keys in logged objects to prevent accidental exposure of passwords, API keys, tokens, and other sensitive data.

### **Basic Configuration**

```javascript
const logger = JSGLogger.getInstanceSync({
  redact: {
    paths: ['password', 'token', '*key', '*secret'],
    censor: '[REDACTED]'
  }
});

logger.api.info('User login', {
  username: 'john',
  password: 'secret123',      // → [REDACTED]
  apiKey: 'abc123xyz',        // → [REDACTED] (matches *key)
  googleApiKey: 'key123',     // → [REDACTED] (matches *key)
  email: 'john@example.com'  // → visible
});
```

### **Pattern Matching**

Redaction supports two pattern types:

- **Exact match**: `'password'`, `'token'` - matches keys exactly
- **Wildcard suffix**: `'*key'`, `'*secret'` - matches any key ending with the suffix (case-insensitive)

```javascript
// Wildcard patterns match:
'*key'     → apiKey, googleApiKey, secretKey, publicKey, API_KEY, api_key
'*secret'  → secret, secretKey, mySecret, SECRET
'*apiKey'  → apiKey, googleApiKey, customApiKey
'*api_key' → api_key, GOOGLE_API_KEY
```

### **Nested Objects & Arrays**

Redaction works recursively through nested objects and arrays:

```javascript
logger.info('Config loaded', {
  user: {
    name: 'John',
    password: 'secret',     // → [REDACTED]
    apiKey: 'key123'        // → [REDACTED]
  },
  services: [
    { name: 'API', token: 'abc' },  // → token: [REDACTED]
    { name: 'DB', token: 'xyz' }    // → token: [REDACTED]
  ]
});
```

### **Custom Censor Text**

```javascript
const logger = JSGLogger.getInstanceSync({
  redact: {
    paths: ['password'],
    censor: '***HIDDEN***'  // Custom replacement text
  }
});
```

### **File-Specific Redaction**

Override redaction per file or pattern:

```json
{
  "redact": {
    "paths": ["password", "*key"],
    "censor": "[REDACTED]"
  },
  "fileOverrides": {
    "src/auth/*.js": {
      "redact": {
        "paths": ["password", "token", "*key", "*secret"],
        "censor": "***"
      }
    }
  }
}
```

### **Default Configuration**

Default redaction patterns (if not configured):
- `password`
- `token`
- `*key` (matches any key ending in "key")
- `*secret` (matches any key ending in "secret")
- `*apiKey`
- `*api_key`

Default censor: `[REDACTED]`

### **Disable Redaction**

Set empty paths array to disable:

```javascript
const logger = JSGLogger.getInstanceSync({
  redact: {
    paths: [],  // No redaction
    censor: '[REDACTED]'
  }
});
```

**Note**: Redaction applies to all formatters (browser, CLI, and server) automatically.

## 🏗️ Architecture

```
logger/
├── index.js                    # Main entry point with smart initialization
├── config/
│   ├── config-manager.js       # Smart configuration system
│   ├── default-config.json     # Default configuration
│   └── component-schemes.js    # Component styling definitions
├── formatters/
│   ├── browser-formatter.js    # Advanced browser console output
│   ├── cli-formatter.js        # Terminal output with pino-colada
│   └── server-formatter.js     # Production JSON logging
├── stores/
│   └── log-store.js            # In-memory log storage with filtering
├── utils/
│   └── environment-detector.js # Environment detection
└── examples/
    └── advanced-config.json    # Full configuration example
```

## 🎯 **Usage Examples**

### **Per-Component Level Control**
```javascript
// Different components at different levels
logger.controls.setComponentLevel('websocket', 'warn');   // Quiet websocket
logger.controls.setComponentLevel('soundcloud', 'trace'); // Verbose SoundCloud
logger.controls.setComponentLevel('popup', 'debug');      // Debug popup
```

### **Surgical File Debugging**
```javascript
// Turn on trace logging for just one problematic file
logger.controls.addFileOverride('src/sites/soundcloud.js', {
  level: 'trace',
  display: { level: true, jsonPayload: true }
});

// Quiet all manager files
logger.controls.addFileOverride('src/managers/*.js', {
  level: 'warn',
  display: { jsonPayload: false }
});
```

### **Dynamic Display Control**
```javascript
// Hide JSON payloads but keep error stacks
logger.controls.setDisplayOption('jsonPayload', false);
logger.controls.setDisplayOption('stackTrace', true);

// Show level names for debugging
logger.controls.setDisplayOption('level', true);

// Use relative timestamps for popup
logger.controls.addFileOverride('src/popup.js', {
  timestampMode: 'relative'
});
```

### **Context Data**

Context data displays in CLI/terminal mode with tree formatting:

```javascript
logger.api.error('Request failed', {
  url: window.location.href,
  selectors: {
    title: '.track-title',
    artist: '.track-artist'
  },
  retryCount: 3,
  lastError: error.message,
  userAgent: navigator.userAgent
});

// CLI/Terminal output (v1.5.0+):
// 22:15:30.1 🚨 [API] Request failed
//    ├─ url: https://soundcloud.com/track/example
//    ├─ selectors: {"title":".track-title","artist":".track-artist"}
//    ├─ retryCount: 3
//    ├─ lastError: Element not found
//    └─ userAgent: Mozilla/5.0...

// Browser Console output:
// 22:15:30.123 🚨 [API] Request failed
//    ├─ url: https://soundcloud.com/track/example
//    ├─ selectors: {title: ".track-title", artist: ".track-artist"}
//    ├─ retryCount: 3
//    ├─ lastError: "Element not found"
//    ├─ userAgent: "Mozilla/5.0..."
```

## 🎛️ **Runtime Controls API**

### **Level Controls**
```javascript
logger.controls.setLevel(component, level)           // Set component level
logger.controls.getLevel(component)                  // Get effective level
logger.controls.setComponentLevel(component, level)  // Set in config
logger.controls.enableDebugMode()                    // All components → debug
logger.controls.enableTraceMode()                    // All components → trace
```

### **File Override Controls**
```javascript
logger.controls.addFileOverride(path, config)       // Add file override
logger.controls.removeFileOverride(path)             // Remove override
logger.controls.listFileOverrides()                  // List all overrides
```

### **Display Controls**
```javascript
logger.controls.setDisplayOption(option, enabled)   // Set display option
logger.controls.getDisplayConfig()                   // Get current config
logger.controls.toggleDisplayOption(option)          // Toggle option
```

### **Timestamp Controls**
```javascript
logger.controls.setTimestampMode(mode)               // Set timestamp mode
logger.controls.getTimestampMode()                   // Get current mode
logger.controls.getTimestampModes()                  // List available modes
```

### **DevTools Panel Controls**
```javascript
logger.controls.enableDevPanel()   // Enable DevTools panel (requires devtools.enabled: true)
logger.controls.disableDevPanel()   // Disable DevTools panel
```

## 📊 **Log Store & Statistics**

### **Advanced Log Filtering**
```javascript
// Get recent logs with file context
const recentLogs = logger.logStore.getRecent(20);
const websocketLogs = logger.logStore.getByComponent('websocket', 10);
const errorLogs = logger.logStore.getByLevel(50, 5); // Errors only

// Enhanced log entries include:
// - filePath: 'src/sites/soundcloud.js'
// - effectiveLevel: 'trace'
// - component: 'soundcloud'
// - displayConfig: { timestamp: true, ... }
```

### **Real-time Statistics**
```javascript
const stats = logger.controls.getStats();
// Returns:
// {
//   total: 156,
//   byLevel: { debug: 45, info: 89, warn: 15, error: 7 },
//   byComponent: { soundcloud: 67, websocket: 23, popup: 66 },
//   timeRange: { start: 1627846260000, end: 1627846320000 }
// }
```

## 🎨 **Output Examples**

### **🚀 BREAKTHROUGH: Perfect Browser Formatting**
```
// Direct browser logger with 100% style control:
12:00 AM 🎯 [JSG-CORE] ✨ JSG Application v1.0.0 - Logger Ready!
12:00 AM 🎵 [SOUNDCLOUD] MediaSession track change detected
   ├─ title: Alt-J - Breezeblocks (Gkat Remix)
   ├─ artist: Gkat
   ├─ hasArtwork: true
12:00 AM 🎯 [JSG-CORE] 🧪 Testing JSON context display
   ├─ testData: {nested: {...}, simple: 'test string', boolean: true}
   ├─ location: {href: 'https://soundcloud.com/discover', hostname: 'soundcloud.com'}
   ├─ timestamp: 2025-07-29T06:00:53.837Z
```

### **File Override in Action**
```
// src/sites/soundcloud.js with level: "trace" override:
12:00 AM 🎵 TRACE [SOUNDCLOUD] Detailed selector matching
   ├─ selector: ".playButton"
   ├─ found: true
   ├─ timing: 2.3ms

// src/managers/websocket-manager.js with level: "warn" (quiet):
(no debug/info logs shown)

// src/popup.js with timestampMode: "relative":
2s ago 🎛️ [POPUP] User clicked debug button
   ├─ component: "soundcloud"
```

### **Display Toggles in Action**
```javascript
// With display: { level: true, jsonPayload: false }:
12:00 AM 🚨 ERROR [SOUNDCLOUD] Track extraction failed

// With display: { timestamp: false, level: true, jsonPayload: true }:
🚨 ERROR [SOUNDCLOUD] Track extraction failed
   ├─ url: https://soundcloud.com/track/example
   ├─ retryCount: 3
```

## 📦 Installation

```bash
npm install @crimsonsunset/jsg-logger
```

**Latest**: v1.5.0 includes critical CLI tool fixes and custom component support!

## 🎯 Environment Detection

The logger automatically detects its environment and uses optimal implementations:

- **Browser**: **🚀 BREAKTHROUGH** - Custom direct logger (bypasses Pino) for 100% console styling control
- **CLI**: Uses pino-colada for beautiful terminal output  
- **Server**: Uses structured JSON for production logging

### **Enhanced CLI Detection**

The CLI detection checks multiple signals:
1. **TTY Check**: `process.stdout.isTTY` or `process.stderr.isTTY`
2. **Terminal Environment**: `process.env.TERM` or `process.env.COLORTERM`
3. **Non-CI Context**: Not running in CI/GitHub Actions

This fixes detection issues in various terminal contexts where `isTTY` may be undefined.

**Why Browser is Different:**
Our testing revealed that Pino's browser detection was interfering with custom formatters, especially in Chrome extensions. By creating a custom direct browser logger that bypasses Pino entirely, we achieved:
- Perfect emoji and color display
- Readable timestamp formatting (`12:00 AM`)
- Beautiful JSON tree expansion
- Seamless Chrome extension integration
- Zero compromises on functionality

## 🔌 **External Transport Integration**

Connect any external log service (PostHog, Datadog, Sentry, etc.) by implementing the `LogTransport` interface and registering it with the singleton.

### **Implementing a Transport**

```typescript
import type { LogEntry, LogTransport } from '@crimsonsunset/jsg-logger';

class MyServiceTransport implements LogTransport {
  level = 'warn' as const; // Only receive warn/error/fatal entries

  send(entry: LogEntry): void {
    if (!entry.isError || !entry.error) return;
    myService.captureException(entry.error, {
      component: entry.component,
      message: entry.message,
      ...entry.data,
    });
  }
}
```

### **Registering a Transport**

Use `JSGLogger.addTransport()` — safe to call at any point, including after module-level initialization:

```typescript
import JSGLogger from '@crimsonsunset/jsg-logger';

// Works in Next.js instrumentation.ts, app startup, etc.
JSGLogger.addTransport(new MyServiceTransport());
```

> **Why not `getInstanceSync(options)`?** The logger initializes itself at module evaluation time. Passing `transports` via `getInstanceSync()` after that point hits the reinit guard, which silently drops the options to protect already-registered transports. `addTransport()` bypasses this entirely.

### **`LogEntry` Shape**

```typescript
interface LogEntry {
  level: LogLevel;        // 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'
  levelNum: number;       // 10 | 20 | 30 | 40 | 50 | 60
  message: string;
  component: string;
  data?: Record<string, unknown>;
  timestamp: number;
  isError: boolean;       // true when levelNum >= 50
  error?: Error;          // Extracted from data, data.err, or data.error
}
```

The `error` field is auto-extracted: if you call `logger.error('msg', { error: new Error(...) })`, `entry.error` is set automatically.

### **Post-Init Config Updates**

To update config (not transports) after initialization, use `configure()`:

```typescript
logger.configure({ globalLevel: 'debug' });
// Merges config without touching registered transports
```

## 🚀 Advanced Features

### **Automatic File Detection**
The browser formatter automatically detects which file is logging by analyzing the call stack, enabling seamless file override functionality.

### **Smart Level Resolution**
The three-tier hierarchy (file → component → global) provides maximum flexibility with sensible defaults.

### **Pattern Matching**
File overrides support glob patterns with `*` and `?` wildcards for powerful bulk configuration.

### **Runtime Reconfiguration**
All settings can be changed at runtime without restarting, perfect for debugging complex issues.

## 🎯 **Migration from Basic Logger**

If you're upgrading from a basic logger:

```javascript
// Before: Simple global level
logger.level = 'debug';

// After: Granular control
logger.controls.setComponentLevel('websocket', 'warn');     // Quiet websocket
logger.controls.addFileOverride('src/popup.js', {           // Debug popup
  level: 'debug',
  timestampMode: 'relative'
});
```

## 🎛️ **DevTools Panel (Optional)**

JSG Logger includes an optional DevTools panel for visual debugging. The panel is **disabled by default** to keep bundle size minimal.

### **How Tree-Shaking Works**

Tree-shaking is based on the **default config** (`devtools.enabled: false` by default). This means:

- **Default behavior**: DevTools code is completely tree-shaken out, resulting in zero bundle impact
- **Consumer config override**: If you enable devtools in your runtime config (`{ devtools: { enabled: true } }`), it loads dynamically when needed
- **Best of both worlds**: Zero bundle by default, but runtime flexibility when needed

### **Enabling DevTools**

1. **Enable in config:**
```json
{
  "devtools": {
    "enabled": true
  }
}
```

Or enable at runtime:
```javascript
const logger = JSGLogger.getInstance({
  devtools: { enabled: true }
});
```

2. **Enable the panel:**
```javascript
// Enable DevTools panel (only works if devtools.enabled: true in config)
await logger.controls.enableDevPanel();
```

### **DevTools Features**

- 🎛️ Visual component filter controls
- 📊 Real-time log statistics
- 🔧 Runtime level adjustment
- ⚙️ Display option toggles
- 📈 Component-level monitoring

**Bundle Size:**
- When `devtools.enabled: false` (default): Zero bundle impact (tree-shaken)
- When enabled: ~81KB gzipped (includes Preact + Evergreen UI, self-contained)

**Note for npm link users:** When developing with `npm link`, ensure your Vite config includes:
```typescript
server: {
  fs: {
    allow: ['..']
  }
}
```
This allows Vite to serve files from the symlinked package directory.

## 🔧 **Browser Developer Tools**

In browser environments, runtime controls are available globally:

```javascript
// Available as window.JSG_Logger
JSG_Logger.enableDebugMode();
JSG_Logger.setDisplayOption('level', true);
JSG_Logger.addFileOverride('src/popup.js', { level: 'trace' });
JSG_Logger.getStats();
JSG_Logger.enableDevPanel(); // Enable DevTools panel (requires devtools.enabled: true)
```

## ⚠️ **Disclaimer**

This software is provided **"AS IS"** without warranty of any kind. Use at your own risk. The author is not responsible for any damages, data loss, or issues that may result from using this logger. See the LICENSE file for full legal terms.

---

**License**: ISC  

This logger system provides the foundation for sophisticated debugging and monitoring across complex multi-file applications with surgical precision and beautiful output.
