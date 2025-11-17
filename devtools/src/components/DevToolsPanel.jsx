/**
 * Main DevTools Panel Component
 * Floating button + collapsible sidebar interface
 */

import {useEffect, useState} from 'preact/compat';
import {FloatingButton} from './FloatingButton.jsx';
import {PanelContainer} from './PanelContainer.jsx';
import { JSGLogger } from '../../../index.js';

/**
 * Get devtools-ui logger component
 * Uses singleton instance without triggering new initialization
 */
const getDevToolsLogger = () => {
    // Use getInstanceSync() which now handles window.JSG_Logger internally
    const instance = JSGLogger.getInstanceSync();
    return instance?.getComponent?.('devtools-ui') || {
        info: console.log.bind(console, '[JSG-DEVTOOLS]'),
        warn: console.warn.bind(console, '[JSG-DEVTOOLS]'),
        error: console.error.bind(console, '[JSG-DEVTOOLS]')
    };
};

export function DevToolsPanel({loggerControls, onUnmount}) {
    const [isPanelOpen, setIsPanelOpen] = useState(true);
    const [isClosing, setIsClosing] = useState(false);
    const [components, setComponents] = useState([]);
    const [loggerStats, setLoggerStats] = useState({total: 0});

    // Initialize component list and stats
    useEffect(() => {
        if (loggerControls) {
            // Get available components
            const componentList = loggerControls.listComponents?.() || [];
            const devtoolsLogger = getDevToolsLogger();
            devtoolsLogger.info('📋 Initial component list read', { componentCount: componentList.length, components: componentList });
            setComponents(componentList);

            // Get initial stats
            const stats = loggerControls.getStats?.() || {total: 0};
            setLoggerStats(stats);

            // Subscribe to real-time log updates via LogStore
            const unsubscribe = loggerControls.subscribe?.((logEntry, allLogs) => {
                // Update stats immediately when logs change
                const updatedStats = loggerControls.getStats?.() || {total: 0};
                setLoggerStats(updatedStats);
            });

            // Subscribe to component changes (if available)
            const unsubscribeComponents = loggerControls.subscribeToComponents?.((newComponents) => {
                const devtoolsLogger = getDevToolsLogger();
                devtoolsLogger.info('✅ Component list updated via subscription', { componentCount: newComponents.length, components: newComponents });
                setComponents(newComponents);
            });

            // Fallback timeout (only if no event system)
            let timeoutId;
            if (!loggerControls.subscribeToComponents) {
                const devtoolsLogger = getDevToolsLogger();
                devtoolsLogger.warn('⚠️ subscribeToComponents not available, using timeout fallback');
                timeoutId = setTimeout(() => {
                    const updated = loggerControls.listComponents?.() || [];
                    setComponents(updated);
                }, 100); // Single timeout, not polling
            } else {
                const devtoolsLogger = getDevToolsLogger();
                devtoolsLogger.info('✅ Component subscription active - real-time updates enabled');
            }

            return () => {
                if (unsubscribe) unsubscribe();
                if (unsubscribeComponents) unsubscribeComponents();
                if (timeoutId) clearTimeout(timeoutId);
            };
        }
    }, [loggerControls]);

    // Manage body class for content push
    useEffect(() => {
        if (isPanelOpen && !isClosing) {
            document.body.classList.add('jsg-devtools-panel-open');
            document.body.classList.remove('jsg-devtools-panel-closing');
        } else if (isClosing) {
            document.body.classList.remove('jsg-devtools-panel-open');
            document.body.classList.add('jsg-devtools-panel-closing');
        } else {
            document.body.classList.remove('jsg-devtools-panel-open');
            document.body.classList.remove('jsg-devtools-panel-closing');
        }

        // Cleanup on unmount
        return () => {
            document.body.classList.remove('jsg-devtools-panel-open');
            document.body.classList.remove('jsg-devtools-panel-closing');
        };
    }, [isPanelOpen, isClosing]);

    const handleClose = () => {
        // Trigger closing animation
        setIsClosing(true);

        // Wait for animation to complete before actually closing
        setTimeout(() => {
            setIsPanelOpen(false);
            setIsClosing(false);
        }, 300); // Match the slideOut animation duration
    };

    const handleTogglePanel = () => {
        if (!isPanelOpen) {
            // Opening panel - just set state, useEffect will handle body class
            setIsPanelOpen(true);
        } else {
            // Use handleClose for proper animation
            handleClose();
        }
    };

    const handleLevelChange = (componentName, newLevel) => {
        // Set the specific log level for the component
        loggerControls.setLevel?.(componentName, newLevel);

        const devtoolsLogger = getDevToolsLogger();
        devtoolsLogger.info(`Changed ${componentName} level to: ${newLevel.toUpperCase()}`);
    };

    const handleGlobalDebug = () => {
        loggerControls.enableDebugMode?.();
        const devtoolsLogger = getDevToolsLogger();
        devtoolsLogger.info('Enabled debug mode for all components');
    };

    const handleGlobalTrace = () => {
        loggerControls.enableTraceMode?.();
        const devtoolsLogger = getDevToolsLogger();
        devtoolsLogger.info('Enabled trace mode for all components');
    };

    const handleReset = () => {
        loggerControls.reset?.();
        const devtoolsLogger = getDevToolsLogger();
        devtoolsLogger.info('Reset all settings to defaults');
    };

    const handleUnload = () => {
        loggerControls.disableDevPanel?.();
    };

    // Expose close handler to parent for unmount
    useEffect(() => {
        if (onUnmount) {
            onUnmount(handleClose);
        }
    }, [onUnmount]);

    return (
        <div>
            <FloatingButton
                onClick={handleTogglePanel}
                isActive={isPanelOpen}
                logCount={loggerStats.total}
                onClose={handleUnload}
            />

            {isPanelOpen && (
                <PanelContainer
                    components={components}
                    loggerControls={loggerControls}
                    onLevelChange={handleLevelChange}
                    onGlobalDebug={handleGlobalDebug}
                    onGlobalTrace={handleGlobalTrace}
                    onReset={handleReset}
                    onClose={handleClose}
                    isClosing={isClosing}
                />
            )}
        </div>
    );
}
