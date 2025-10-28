# 🚀 Netlify Deployment - Quick Start

## ✅ Setup Complete

Your repo is now configured for Netlify deployment with a monorepo structure.

### What's Been Configured

1. **`netlify.toml`** (root) - Netlify build configuration
2. **`vite.config.netlify.js`** (devtools) - Standalone build config
3. **`.nvmrc`** (root) - Node version specification (v18)
4. **Build scripts** - Added to both root and devtools package.json

## 🎯 Deploy to Netlify

### Option 1: Connect GitHub (Recommended)

1. Go to [Netlify](https://app.netlify.com/)
2. Click "Add new site" → "Import an existing project"
3. Connect to GitHub and select `jsg-logger` repo
4. **Netlify will auto-detect settings from `netlify.toml`** ✨
5. Click "Deploy site"

That's it! Netlify handles everything automatically.

### Option 2: Manual Deploy via CLI

```bash
# Install Netlify CLI (one-time)
npm install -g netlify-cli

# Login to Netlify
netlify login

# Build and deploy
npm run build:devtools:netlify
netlify deploy --dir=devtools/dist --prod
```

## 📦 What Gets Deployed

- **Source:** `devtools/` subdirectory
- **Build output:** `devtools/dist/`
- **Type:** Preact SPA (Single Page Application)
- **Bundle size:** ~230KB uncompressed, ~66KB gzipped

## 🔍 Build Process (Automatic)

Netlify runs these commands:
```bash
cd devtools              # Enter base directory
npm install              # Install dependencies (including parent logger via file:..)
npm run build:netlify    # Build standalone app
# Publishes devtools/dist
```

## 🧪 Test Locally First

```bash
# Build and preview locally
npm run build:devtools:netlify
cd devtools && npm run preview
```

Opens at `http://localhost:4173` - this is exactly what will deploy to Netlify.

## ⚙️ Build Configurations

### Library Build (Default)
- **File:** `vite.config.js`
- **Use:** Runtime injection into main logger
- **Command:** `npm run build` or `npm run build:lib`
- **Output:** ES module with externals

### Standalone Build (Netlify)
- **File:** `vite.config.netlify.js`
- **Use:** Demo/test site deployment
- **Command:** `npm run build:netlify`
- **Output:** Complete SPA with bundled dependencies

## 🌐 Post-Deployment

After successful deploy, Netlify provides:
- **Live URL:** `https://your-site-name.netlify.app`
- **Deploy previews** for PRs (automatic)
- **Rollback capability** (instant)
- **Custom domain** support (optional)

## 📊 Expected Build Times

- **First deploy:** ~2-3 minutes (npm install + build)
- **Subsequent deploys:** ~1-2 minutes (cached dependencies)

## 🔧 Troubleshooting

### "Module not found" errors
- Netlify should install from `devtools/package.json` automatically
- Check that `base = "devtools"` is set in netlify.toml

### "Cannot resolve file:.." dependency
- This is normal and expected
- Netlify resolves `file:..` to the parent directory
- Both root and devtools dependencies will be installed

### Want to see build logs?
- Netlify UI shows full build output
- Look for the vite build step
- Check for warnings (yellow) vs errors (red)

## 📝 Next Steps

1. Deploy to Netlify
2. Get your live URL
3. Share the DevTools demo site! 🎉

---

**Note:** The main logger package (`@crimsonsunset/jsg-logger`) continues to publish to NPM separately. This Netlify deployment is specifically for the DevTools demo/test application.

