/**
 * JSG Logger DevTools Panel - Main Entry Point
 * Runtime-injected UI for log filtering and controls
 */

import { render, h } from 'https://esm.sh/preact@10.19.3';
import { DevToolsPanel } from './components/DevToolsPanel.js';

let panelInstance = null;
let isInitialized = false;

/**
 * Initialize the DevTools panel
 * Called by logger.controls.enableDevPanel()
 */
export function initializePanel() {
    if (isInitialized) {
        console.log('[JSG-DEVTOOLS] Panel already initialized');
        return panelInstance;
    }

    console.log('[JSG-DEVTOOLS] Initializing DevTools panel');

    try {
        // Check if JSG Logger is available
        if (!window.JSG_Logger) {
            console.warn('[JSG-DEVTOOLS] JSG Logger not found on window. Make sure logger is initialized.');
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
        console.log('[JSG-DEVTOOLS] Panel initialized successfully');
        
        return panelInstance;
    } catch (error) {
        console.error('[JSG-DEVTOOLS] Failed to initialize panel:', error);
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
        console.log('[JSG-DEVTOOLS] Panel destroyed');
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

// Global access for debugging
if (typeof window !== 'undefined') {
    window.JSG_DevTools = {
        initialize: initializePanel,
        destroy: destroyPanel,
        toggle: togglePanel
    };
}
