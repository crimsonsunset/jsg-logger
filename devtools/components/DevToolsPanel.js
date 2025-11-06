/**
 * Main DevTools Panel Component
 * Floating button + collapsible sidebar interface
 */

import { useState, useEffect } from 'https://esm.sh/preact@10.19.3/hooks';
import { h } from 'https://esm.sh/preact@10.19.3';
import { FloatingButton } from './FloatingButton.js';
import { PanelContainer } from './PanelContainer.js';
import logger from '../../index.js';

const devtoolsLogger = logger.getComponent('devtools-ui');

export function DevToolsPanel({ loggerControls }) {
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [components, setComponents] = useState([]);
    const [loggerStats, setLoggerStats] = useState({ total: 0 });

    // Initialize component list and stats
    useEffect(() => {
        if (loggerControls) {
            // Get available components
            const componentList = loggerControls.listComponents?.() || [];
            setComponents(componentList);

            // Get initial stats
            const stats = loggerControls.getStats?.() || { total: 0 };
            setLoggerStats(stats);

            // Set up periodic stats updates
            const statsInterval = setInterval(() => {
                const updatedStats = loggerControls.getStats?.() || { total: 0 };
                setLoggerStats(updatedStats);
            }, 2000);

            return () => clearInterval(statsInterval);
        }
    }, [loggerControls]);

    const handleTogglePanel = () => {
        setIsPanelOpen(!isPanelOpen);
    };

    const handleComponentToggle = (componentName, currentLevel) => {
        // Toggle between 'info' and 'silent' for on/off behavior
        const newLevel = currentLevel === 'silent' ? 'info' : 'silent';
        loggerControls.setLevel?.(componentName, newLevel);
        
        devtoolsLogger.info(`Toggled ${componentName}: ${currentLevel} → ${newLevel}`);
    };

    const handleGlobalDebug = () => {
        loggerControls.enableDebugMode?.();
        devtoolsLogger.info('Enabled debug mode for all components');
    };

    const handleGlobalTrace = () => {
        loggerControls.enableTraceMode?.();
        devtoolsLogger.info('Enabled trace mode for all components');
    };

    const handleReset = () => {
        loggerControls.reset?.();
        devtoolsLogger.info('Reset all settings to defaults');
    };

    return h('div', null, [
        h(FloatingButton, { 
            onClick: handleTogglePanel,
            isActive: isPanelOpen,
            logCount: loggerStats.total
        }),
        
        isPanelOpen && h(PanelContainer, { 
            components: components,
            loggerControls: loggerControls,
            onComponentToggle: handleComponentToggle,
            onGlobalDebug: handleGlobalDebug,
            onGlobalTrace: handleGlobalTrace,
            onReset: handleReset,
            onClose: () => setIsPanelOpen(false)
        })
    ].filter(Boolean));
}
