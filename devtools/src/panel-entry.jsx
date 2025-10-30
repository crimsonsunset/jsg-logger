/**
 * JSG Logger DevTools Panel - Main Entry Point
 * Runtime-injected UI for log filtering and controls
 * 🎨 EVERGREEN UI VERSION - Built: ${new Date().toISOString()}
 */

import { render } from 'preact/compat';
import { ThemeProvider } from 'evergreen-ui';
import { DevToolsPanel } from './components/DevToolsPanel.jsx';
import { devToolsTheme } from './theme/devtools-theme.js';

console.log('🎛️ JSG Logger DevTools Panel - Evergreen UI Edition'); 
console.log('[JSG-DEVTOOLS] Loading from source with hot reload enabled', { 
    timestamp: new Date().toISOString(),
    version: 'v2.0',
    framework: 'Evergreen UI + Preact',
    loadedFrom: 'devtools/src/panel-entry.jsx'
});

let panelInstance = null;
let isInitialized = false;
let closeHandler = null;

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
    console.log('[JSG-DEVTOOLS] devToolsTheme:', devToolsTheme);
    console.log('[JSG-DEVTOOLS] theme.colors exists?', !!devToolsTheme?.colors);

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

        // Add styles for body content push
        if (!document.getElementById('jsg-devtools-body-styles')) {
            const bodyStyles = document.createElement('style');
            bodyStyles.id = 'jsg-devtools-body-styles';
            bodyStyles.textContent = `
                body.jsg-devtools-panel-open {
                    margin-left: 380px !important;
                    transition: margin-left 0.3s ease-out !important;
                }
                
                body.jsg-devtools-panel-closing {
                    margin-left: 0 !important;
                    transition: margin-left 0.3s ease-in !important;
                }
            `;
            document.head.appendChild(bodyStyles);
        }

        document.body.appendChild(panelContainer);

        // Render the panel with theme provider
        render(
            <ThemeProvider value={devToolsTheme}>
                <DevToolsPanel 
                    loggerControls={window.JSG_Logger}
                    onUnmount={(handler) => { closeHandler = handler; }}
                />
            </ThemeProvider>,
            panelContainer
        );

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
        // Trigger closing animation if handler is available
        if (closeHandler) {
            closeHandler();
            
            // Wait for animation to complete (300ms) before removing from DOM
            setTimeout(() => {
                if (panelInstance?.container && document.body.contains(panelInstance.container)) {
                    document.body.removeChild(panelInstance.container);
                }
                panelInstance = null;
                isInitialized = false;
                closeHandler = null;
                console.log('[JSG-DEVTOOLS] Panel destroyed with animation');
            }, 350); // Slightly longer than animation duration to ensure completion
        } else {
            // Fallback: immediate removal if no close handler
            document.body.removeChild(panelInstance.container);
            panelInstance = null;
            isInitialized = false;
            closeHandler = null;
            console.log('[JSG-DEVTOOLS] Panel destroyed');
        }
    }
}

/**
 * Toggle panel visibility (for external control)
 * Note: Panel is always visible when loaded. Use destroy() to remove.
 */
export function togglePanel() {
    // Panel is always visible when loaded
    // Use window.JSG_Logger.disableDevPanel() to remove panel
    console.log('[JSG-DEVTOOLS] Panel is always visible when loaded. Use disableDevPanel() to remove.');
}

// Global access for debugging
if (typeof window !== 'undefined') {
    window.JSG_DevTools = {
        initialize: initializePanel,
        destroy: destroyPanel,
        toggle: togglePanel
    };
}
