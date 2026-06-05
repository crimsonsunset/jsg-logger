/**
 * Lazy devtools panel loader — isolated from index.js so the devtools Vite
 * build (which imports index.js) does not try to resolve panel-entry.js
 * before it exists.
 */

let devtoolsModule = null;
let devtoolsModulePromise = null;

/**
 * Load the devtools panel bundle on demand.
 * @returns {Promise<Object|null>}
 */
export async function loadDevtoolsModule() {
    if (devtoolsModule) {
        return devtoolsModule;
    }

    if (devtoolsModulePromise) {
        return devtoolsModulePromise;
    }

    if (process.env.NODE_ENV === 'production') {
        return null;
    }

    const entry = ['./devtools', 'dist', 'panel-entry.js'].join('/');

    devtoolsModulePromise = import(
        /* webpackIgnore: true */
        /* @vite-ignore */
        entry
    ).then((module) => {
        devtoolsModule = module;
        return module;
    }).catch((error) => {
        console.error('[JSG-LOGGER] DevTools module load failed:', error);
        devtoolsModulePromise = null;
        return null;
    });

    return devtoolsModulePromise;
}
