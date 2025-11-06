/**
 * JSG Logger DevTools Panel - Main Entry Point
 * Runtime-injected UI for log filtering and controls
 */

import { render, h } from 'https://esm.sh/preact@10.19.3';
import { DevToolsPanel } from './components/DevToolsPanel.js';

let panelInstance = null;
let isInitialized = false;

// DevTools logger - uses the logger's devtools-ui component with fallback
const getDevToolsLogger = () => {
    const logger = window.JSG_Logger?.getComponent?.('devtools-ui');
    return logger || {
        info: console.log,
        warn: console.warn,
        error: console.error
    };
};

/**
 * Initialize the DevTools panel
 * Called by logger.controls.enableDevPanel()
 */
export function initializePanel() {
    // Check if panel already exists in DOM (works across module reloads)
    const existingPanel = document.getElementById('jsg-devtools-panel');
    if (existingPanel) {
        const devtoolsLogger = getDevToolsLogger();
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
    const devtoolsLogger = getDevToolsLogger();
    if (isInitialized) {
        devtoolsLogger.info('[JSG-DEVTOOLS] Panel already initialized');
        return panelInstance;
    }

    devtoolsLogger.info('[JSG-DEVTOOLS] Initializing DevTools panel');

    try {
        // Check if JSG Logger is available
        if (!window.JSG_Logger) {
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
        render(h(DevToolsPanel, { loggerControls: window.JSG_Logger }), panelContainer);

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
