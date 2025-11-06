/**
 * JSG Logger DevTools Panel - Main Entry Point
 * Runtime-injected UI for log filtering and controls
 * 🎨 EVERGREEN UI VERSION - Built: ${new Date().toISOString()}
 */

import { render } from 'preact/compat';
import { ThemeProvider } from 'evergreen-ui';
import { DevToolsPanel } from './components/DevToolsPanel.jsx';
import { devToolsTheme } from './theme/devtools-theme.js';
import logger from '../../index.js';

const devtoolsLogger = logger.getComponent('devtools-ui');

devtoolsLogger.info('JSG Logger DevTools Panel - Evergreen UI Edition');
devtoolsLogger.info('Loading from source with hot reload enabled', { 
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
    // Check if panel already exists in DOM (works across module reloads)
    const existingPanel = document.getElementById('jsg-devtools-panel');
    if (existingPanel) {
        devtoolsLogger.info('Panel already exists in DOM, returning existing instance');
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
        devtoolsLogger.info('Panel already initialized');
        return panelInstance;
    }

    devtoolsLogger.info('Initializing DevTools panel');
    devtoolsLogger.info('devToolsTheme:', devToolsTheme);
    devtoolsLogger.info('theme.colors exists?', !!devToolsTheme?.colors);

    try {
        // Check if JSG Logger is available
        if (!window.JSG_Logger) {
            devtoolsLogger.warn('JSG Logger not found on window. Make sure logger is initialized.');
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
        devtoolsLogger.info('Panel initialized successfully');
        
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
        devtoolsLogger.error('Failed to initialize panel:', error);
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
                // Clear panelInstance from window
                if (typeof window !== 'undefined' && window.JSG_DevTools) {
                    window.JSG_DevTools.panelInstance = null;
                }
                // Dispatch custom event for external listeners
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('jsg-devtools-destroyed'));
                }
                devtoolsLogger.info('Panel destroyed with animation');
            }, 350); // Slightly longer than animation duration to ensure completion
        } else {
            // Fallback: immediate removal if no close handler
            document.body.removeChild(panelInstance.container);
            panelInstance = null;
            isInitialized = false;
            closeHandler = null;
            // Clear panelInstance from window
            if (typeof window !== 'undefined' && window.JSG_DevTools) {
                window.JSG_DevTools.panelInstance = null;
            }
            // Dispatch custom event for external listeners
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('jsg-devtools-destroyed'));
            }
            devtoolsLogger.info('Panel destroyed');
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
    devtoolsLogger.info('Panel is always visible when loaded. Use disableDevPanel() to remove.');
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
