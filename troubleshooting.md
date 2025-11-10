# JSG Logger Troubleshooting Guide

## DevTools Panel Import Resolution Issues

### Problem: DevTools Panel Fails to Load in Vite-Based Projects

**Symptoms:**
- `JSG_Logger.enableDevPanel()` fails with 404 errors or module resolution errors
- Console shows: `Failed to load resource: the server responded with a status of 404 (Not Found)`
- Vite dev server shows: `Could not resolve import("./devtools/dist/panel-entry.js")`
- DevTools panel doesn't appear when called

**Affected Versions:**
- Logger versions prior to v1.7.6 (when using relative path imports)
- Projects using Vite as their build tool
- Projects with Vite dependency optimization enabled

---

## Root Cause

The logger was using **relative path imports** (`./devtools/dist/panel-entry.js`) to load the DevTools panel module. This approach has several issues:

1. **Vite Module Resolution**: Vite's dependency optimizer analyzes dynamic imports during dev server startup, even when they're not executed. Relative paths from within `node_modules` can be problematic because:
   - Vite may cache pre-bundled versions incorrectly
   - Path resolution can fail depending on how Vite processes the module
   - The relative path context may not match Vite's expectations

2. **Package Export Paths**: Modern Node.js and bundlers prefer using package export paths (defined in `package.json`) rather than relative paths because:
   - They're explicit and unambiguous
   - Bundlers can properly resolve them through the package's export map
   - They work consistently across different build tools and environments

3. **Caching Issues**: When Vite pre-bundles dependencies, it may cache an incorrect resolution of the relative path, leading to persistent errors even after code updates.

---

## Solution

**Changed**: Use package export path instead of relative path

**Before (Problematic):**
```javascript
// In index.js - pre-load path
devtoolsModulePromise = import('./devtools/dist/panel-entry.js').then(module => {
    // ...
});

// In index.js - dynamic load path  
devtoolsModule = await import('./devtools/dist/panel-entry.js');
```

**After (Fixed):**
```javascript
// In index.js - pre-load path
devtoolsModulePromise = import('@crimsonsunset/jsg-logger/devtools').then(module => {
    // ...
});

// In index.js - dynamic load path
devtoolsModule = await import('@crimsonsunset/jsg-logger/devtools');
```

**Package.json Export Configuration:**
```json
{
  "exports": {
    "./devtools": "./devtools/dist/panel-entry.js"
  }
}
```

---

## Why This Works

1. **Explicit Resolution**: The package export path (`@crimsonsunset/jsg-logger/devtools`) is explicitly defined in `package.json`, making it unambiguous for bundlers.

2. **Vite Compatibility**: Vite properly resolves package export paths through its module resolution system, avoiding the caching and path resolution issues that affect relative paths.

3. **Consistent Behavior**: Package export paths work consistently across:
   - Vite dev server
   - Vite production builds
   - Other bundlers (Webpack, Rollup, etc.)
   - Node.js ESM environments

4. **No Caching Issues**: Since the path is resolved through the package's export map, Vite doesn't need to guess or cache relative path resolutions.

---

## Related Configuration

### Vite Projects

**No special configuration needed** - The package export path works out of the box with Vite.

**If using npm link for development:**
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    fs: {
      allow: ['..'] // Allow accessing parent directories for npm link
    }
  }
});
```

### Excluding from Optimization (Not Recommended)

Previously, some projects tried excluding the logger from Vite's dependency optimization:

```typescript
// vite.config.ts - NOT NEEDED with package export path
optimizeDeps: {
  exclude: ['@crimsonsunset/jsg-logger']
}
```

**This is no longer necessary** - The package export path resolves correctly even with optimization enabled.

---

## Verification

To verify the fix is working:

1. **Check Console Logs**: When `enableDevPanel()` is called, you should see:
   ```
   [DEVTOOLS] Loading DevTools module dynamically (runtime config override)...
   [DEVTOOLS] Initializing DevTools panel...
   [DEVTOOLS] DevTools panel initialized successfully
   ```

2. **Visual Confirmation**: The DevTools panel UI should appear in the browser.

3. **No Errors**: Console should show no 404 or module resolution errors.

---

## Version History

- **v1.7.6+**: Fixed to use package export path (`@crimsonsunset/jsg-logger/devtools`)
- **v1.7.0 - v1.7.5**: Used relative path (`./devtools/dist/panel-entry.js`) - may have issues in some Vite setups
- **v1.5.x**: Had dev mode detection logic that attempted to load from non-existent source paths

---

## Additional Notes

- The DevTools panel is a **separate bundle** built independently and included in the published package
- The panel is **tree-shaken** when `devtools.enabled: false` in default config (zero bundle impact)
- When enabled via runtime config, it loads **dynamically on demand** via the package export path
- All DevTools dependencies (Preact, Evergreen UI) are **bundled** in the panel entry file (no peer dependencies needed at runtime)

---

## Related Issues

If you're still experiencing issues after updating to v1.7.6+:

1. **Clear Vite Cache**: `rm -rf node_modules/.vite`
2. **Reinstall Logger**: `npm install @crimsonsunset/jsg-logger@latest`
3. **Restart Dev Server**: Stop and restart your Vite dev server
4. **Check Package Version**: Verify you're using v1.7.6 or later: `npm list @crimsonsunset/jsg-logger`

If issues persist, check:
- Vite version compatibility
- Node.js version (should be 18+)
- Package manager cache (try clearing npm/pnpm/yarn cache)







