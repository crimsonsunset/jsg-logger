# DevTools Deployment Guide

## Overview

The JSG Logger DevTools has two build configurations:

1. **Library Build** (`vite.config.js`) - For runtime injection into the main logger
2. **Standalone Build** (`vite.config.netlify.js`) - For Netlify deployment as demo/test site

## Local Development

```bash
# From devtools directory
npm install
npm run dev

# Or from root directory
npm run dev:devtools
```

The dev server runs on `http://localhost:5556`

## Building

### Library Build (Runtime Injection)
```bash
npm run build:lib
# or
npm run build
```

This creates the runtime-injectable panel for the main logger package.

### Standalone Build (Netlify)
```bash
npm run build:netlify
```

This creates a standalone SPA with all dependencies bundled.

## Netlify Deployment

### Automatic Deployment
1. Connect your GitHub repo to Netlify
2. Netlify will automatically detect `netlify.toml` at root
3. Configuration is already set up - no manual config needed

### Manual Deployment
```bash
# From root directory
npm run build:devtools:netlify

# Deploy the devtools/dist folder to Netlify
netlify deploy --dir=devtools/dist --prod
```

## Build Differences

### Library Build (`vite.config.js`)
- Output: ES module for dynamic import
- Externals: preact, evergreen-ui (loaded as peerDependencies at runtime)
- Use case: Runtime injection via `logger.controls.enableDevPanel()`
- Bundle size: ~15KB (excludes externals)
- **Requires:** `devtools.enabled: true` in config + peer dependencies installed

### Enabling DevTools in Your Project

1. **Add to config:**
```json
{
  "devtools": {
    "enabled": true
  }
}
```

2. **Install peer dependencies:**
```bash
npm install preact evergreen-ui
```

3. **Enable panel:**
```javascript
await logger.controls.enableDevPanel();
```

**Note:** When `devtools.enabled: false` (default), devtools code is tree-shaken and dependencies are not required.

### Standalone Build (`vite.config.netlify.js`)
- Output: Complete SPA with index.html
- Bundled: All dependencies included
- Use case: Standalone demo/test application
- Bundle size: ~150-200KB (includes everything)
- Code splitting: Vendor chunks for better caching

## Environment Variables

No environment variables required for basic deployment.

## Troubleshooting

### Build fails with "Cannot find module"
- Run `npm install` in the devtools directory
- Ensure parent directory dependencies are installed (`cd .. && npm install`)

### "file:.." dependency issues
- The devtools package depends on the parent logger via `file:..`
- This works in both local dev and Netlify build
- Netlify installs from the base directory (devtools) automatically

### Preview locally before deploy
```bash
npm run build:netlify
npm run preview
```

This runs the production build locally at `http://localhost:4173`

## CI/CD Notes

Netlify automatically:
- Installs dependencies from `devtools/package.json`
- Resolves the `file:..` dependency to parent logger
- Runs `npm run build:netlify`
- Deploys `devtools/dist` folder
- Sets up SPA routing via redirect rules in `netlify.toml`

