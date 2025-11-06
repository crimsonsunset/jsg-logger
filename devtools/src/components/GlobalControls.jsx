/**
 * Global Controls Component
 * System-wide controls and actions
 */

import {Button, Pane, Text} from 'evergreen-ui';
import { JSGLogger } from '../../../index.js';

/**
 * Get devtools-ui logger component
 */
const getDevToolsLogger = () => {
    const instance = JSGLogger.getInstanceSync();
    return instance?.getComponent?.('devtools-ui') || {
        info: console.log.bind(console, '[JSG-DEVTOOLS]'),
        warn: console.warn.bind(console, '[JSG-DEVTOOLS]'),
        error: console.error.bind(console, '[JSG-DEVTOOLS]')
    };
};

export function GlobalControls({onDebugAll, onTraceAll, onReset, loggerControls}) {
    const stats = loggerControls.getStats?.() || {total: 0, byLevel: {}, byComponent: {}};
    const configSummary = loggerControls.getConfigSummary?.() || {};

    return (
        <Pane marginBottom={16}>
            {/* Primary Action Buttons */}
            <Pane display="flex" gap={8} marginBottom={16} flexWrap="wrap">
                <Button
                    appearance="primary"
                    intent="success"
                    size="medium"
                    flex="1"
                    minWidth={100}
                    onClick={onDebugAll}
                    title="Enable debug level for all components"
                >
                    🐛 Debug All
                </Button>

                <Button
                    appearance="primary"
                    intent="warning"
                    size="medium"
                    flex="1"
                    minWidth={100}
                    onClick={onTraceAll}
                    title="Enable trace level for all components"
                >
                    🔍 Trace All
                </Button>
            </Pane>

            {/* Secondary Action Buttons */}
            <Pane display="flex" gap={8} marginBottom={16} flexWrap="wrap">
                <Button
                    intent="danger"
                    size="small"
                    flex="1"
                    minWidth={80}
                    onClick={onReset}
                    title="Reset all settings to defaults"
                >
                    Reset All
                </Button>

                <Button
                    appearance="default"
                    size="small"
                    flex="1"
                    minWidth={80}
                    onClick={() => {
                        const summary = loggerControls.getConfigSummary?.();
                        const devtoolsLogger = getDevToolsLogger();
                        devtoolsLogger.info('Current Config:', summary);
                        alert('Config exported to console');
                    }}
                    title="Export current configuration to console"
                >
                    Export Config
                </Button>
            </Pane>

            {/* Stats Panel */}
            <Pane background="#2d3748" paddingX={12} paddingY={8} borderRadius={6} marginTop={12}
                  border="1px solid #4a5568">
                <Pane display="flex" justifyContent="space-between" alignItems="center" paddingY={2}>
                    <Text size={300} color="#a0aec0">📊 Total Logs:</Text>
                    <Text size={300} color="#ffffff" fontWeight="600">{stats.total.toString()}</Text>
                </Pane>

                {stats.byLevel && Object.keys(stats.byLevel).length > 0 && (
                    <Pane display="flex" justifyContent="space-between" alignItems="center" paddingY={2}>
                        <Text size={300} color="#a0aec0">📈 By Level:</Text>
                        <Text size={300} color="#e2e8f0" fontFamily="mono">
                            {Object.entries(stats.byLevel)
                                .map(([level, count]) => `${level}:${count}`)
                                .join(' ')}
                        </Text>
                    </Pane>
                )}

                {configSummary.environment && (
                    <Pane display="flex" justifyContent="space-between" alignItems="center" paddingY={2}>
                        <Text size={300} color="#a0aec0">🌍 Environment:</Text>
                        <Text size={300} color="#ffffff" fontWeight="600">{configSummary.environment}</Text>
                    </Pane>
                )}

                {configSummary.fileOverrides && (
                    <Pane display="flex" justifyContent="space-between" alignItems="center" paddingY={2}>
                        <Text size={300} color="#a0aec0">📁 File Overrides:</Text>
                        <Text size={300} color="#ffffff"
                              fontWeight="600">{configSummary.fileOverrides.toString()}</Text>
                    </Pane>
                )}
            </Pane>
        </Pane>
    );
}
