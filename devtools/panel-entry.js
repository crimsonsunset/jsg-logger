/**
 * JSG Logger DevTools Panel - Main Entry Point
 * Runtime-injected UI for log filtering and controls
 */

import { render, h } from 'https://esm.sh/preact@10.19.3';
import { DevToolsPanel } from './components/DevToolsPanel.js';

let panelInstance = null;
let isInitialized = false;

/**
 * Get devtools-ui logger component
 * Uses singleton instance without triggering new initialization
 * Note: This file is the built version, so we can't import JSGLogger class directly
 * We rely on window.JSG_Logger which should be set by the main app
 */
const getDevToolsLogger = () => {
    // Try window.JSG_Logger first (set by main app)
    const windowLogger = typeof window !== 'undefined' ? window.JSG_Logger : null;
    if (windowLogger?.getComponent) {
        return windowLogger.getComponent('devtools-ui');
    }
    
    // Fallback: Create minimal logger
    return {
        info: console.log.bind(console, '[JSG-DEVTOOLS]'),
        warn: console.warn.bind(console, '[JSG-DEVTOOLS]'),
        error: console.error.bind(console, '[JSG-DEVTOOLS]')
    };
};

/**
 * Initialize the DevTools panel
 * Called by logger.controls.enableDevPanel()
 */
export function initializePanel() {
    const devtoolsLogger = getDevToolsLogger();
    
    // Check if panel already exists in DOM (works across module reloads)
    const existingPanel = document.getElementById('jsg-devtools-panel');
    if (existingPanel) {
        devtoolsLogger.info('[JSG-DEVTOOLS] Panel already exists in DOM, returning existing instance');
        // Return existing instance if available, or create wrapper
        return window.JSG_DevTools?.panelInstance || {
            container: existingPanel,
            destroy: () => {
                if (window.JSG_DevTools?.destroy) {
                    window.JSG_DevTools.destroy();
                }
            }
        };
    }
    
    // Module-scoped check (for same module instance)
    if (isInitialized) {
        devtoolsLogger.info('[JSG-DEVTOOLS] Panel already initialized');
        return panelInstance;
    }

    devtoolsLogger.info('[JSG-DEVTOOLS] Initializing DevTools panel');

    try {
        // Get logger controls from window (set by main app)
        const controls = typeof window !== 'undefined' ? window.JSG_Logger : null;
        
        if (!controls) {
            devtoolsLogger.warn('[JSG-DEVTOOLS] JSG Logger not found on window. Make sure logger is initialized.');
            return null;
        }

        // Create panel container
        const panelContainer = document.createElement('div');
        panelContainer.id = 'jsg-devtools-panel';
        panelContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            z-index: 999999;
            pointer-events: none;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;

        document.body.appendChild(panelContainer);

        // Render the panel
        render(h(DevToolsPanel, { loggerControls: controls }), panelContainer);

        panelInstance = {
            container: panelContainer,
            destroy: () => destroyPanel()
        };

        isInitialized = true;
        devtoolsLogger.info('[JSG-DEVTOOLS] Panel initialized successfully');
        
        // Store on window for cross-module access
        if (typeof window !== 'undefined') {
            window.JSG_DevTools = {
                initialize: initializePanel,
                destroy: destroyPanel,
                toggle: togglePanel,
                panelInstance: panelInstance
            };
        }
        
        return panelInstance;
    } catch (error) {
        const devtoolsLogger = getDevToolsLogger();
        devtoolsLogger.error('[JSG-DEVTOOLS] Failed to initialize panel:', error);
        return null;
    }
}

/**
 * Destroy the panel and cleanup
 */
function destroyPanel() {
    if (panelInstance?.container) {
        document.body.removeChild(panelInstance.container);
        panelInstance = null;
        isInitialized = false;
        // Clear panelInstance from window
        if (typeof window !== 'undefined' && window.JSG_DevTools) {
            window.JSG_DevTools.panelInstance = null;
        }
        const devtoolsLogger = getDevToolsLogger();
        devtoolsLogger.info('[JSG-DEVTOOLS] Panel destroyed');
    }
}

/**
 * Toggle panel visibility (for external control)
 */
export function togglePanel() {
    if (isInitialized && panelInstance) {
        const container = panelInstance.container;
        const currentDisplay = container.style.display;
        container.style.display = currentDisplay === 'none' ? 'block' : 'none';
    }
}

// Global access for debugging (will be updated when panel is initialized)
if (typeof window !== 'undefined' && !window.JSG_DevTools) {
    window.JSG_DevTools = {
        initialize: initializePanel,
        destroy: destroyPanel,
        toggle: togglePanel,
        panelInstance: null
    };
}
