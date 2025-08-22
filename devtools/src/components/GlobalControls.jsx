/**
 * Global Controls Component
 * System-wide controls and actions
 */

import { Pane, Button, Text, Heading, Badge, Alert } from 'evergreen-ui';

export function GlobalControls({ onDebugAll, onTraceAll, onReset, loggerControls }) {
    const stats = loggerControls.getStats?.() || { total: 0, byLevel: {}, byComponent: {} };
    const configSummary = loggerControls.getConfigSummary?.() || {};

    return (
        <Pane marginBottom={24}>
            {/* Show Evergreen UI Alert to prove it's working */}
            <Alert
                intent="success"
                title="✨ Evergreen UI Active!"
                marginBottom={16}
                background="green.50"
            >
                Professional design system now powering this DevTools panel
            </Alert>
            
            <Pane display="flex" alignItems="center" marginBottom={12}>
                <Heading size={600} color="selected" marginRight={12}>
                    🌐 Global Controls
                </Heading>
                <Badge color="blue" marginRight={8}>EVERGREEN</Badge>
                <Badge color="purple">v2.0</Badge>
            </Pane>
            
            {/* Primary Action Buttons - Make them obviously bigger and colorful */}
            <Pane display="flex" gap={12} marginBottom={16} flexWrap="wrap">
                <Button
                    appearance="primary"
                    intent="success"
                    size="large"
                    flex="1"
                    minWidth={100}
                    height={48}
                    onClick={onDebugAll}
                    title="Enable debug level for all components"
                    borderRadius={8}
                >
                    🐛 Debug All
                </Button>
                
                <Button
                    appearance="primary"
                    intent="warning"
                    size="large"
                    flex="1"
                    minWidth={100}
                    height={48}
                    onClick={onTraceAll}
                    title="Enable trace level for all components"
                    borderRadius={8}
                >
                    🔍 Trace All
                </Button>
            </Pane>

            {/* Secondary Action Buttons */}
            <Pane display="flex" gap={8} marginBottom={12} flexWrap="wrap">
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
                    appearance="minimal"
                    size="small"
                    flex="1"
                    minWidth={80}
                    onClick={() => {
                        const summary = loggerControls.getConfigSummary?.();
                        console.log('[JSG-DEVTOOLS] Current Config:', summary);
                        alert('Config exported to console');
                    }}
                    title="Export current configuration to console"
                >
                    Export Config
                </Button>
            </Pane>

            {/* Stats Panel */}
            <Pane background="tint2" padding={12} borderRadius={6} marginTop={12}>
                <Pane display="flex" justifyContent="space-between" alignItems="center" paddingY={4}>
                    <Text size={300} color="muted">📊 Total Logs:</Text>
                    <Text size={300} fontWeight="bold">{stats.total.toString()}</Text>
                </Pane>
                
                {stats.byLevel && Object.keys(stats.byLevel).length > 0 && (
                    <Pane display="flex" justifyContent="space-between" alignItems="center" paddingY={4}>
                        <Text size={300} color="muted">📈 By Level:</Text>
                        <Text size={300} fontFamily="mono">
                            {Object.entries(stats.byLevel)
                                .map(([level, count]) => `${level}:${count}`)
                                .join(' ')}
                        </Text>
                    </Pane>
                )}

                {configSummary.environment && (
                    <Pane display="flex" justifyContent="space-between" alignItems="center" paddingY={4}>
                        <Text size={300} color="muted">🌍 Environment:</Text>
                        <Text size={300} fontWeight="bold">{configSummary.environment}</Text>
                    </Pane>
                )}

                {configSummary.fileOverrides && (
                    <Pane display="flex" justifyContent="space-between" alignItems="center" paddingY={4}>
                        <Text size={300} color="muted">📁 File Overrides:</Text>
                        <Text size={300} fontWeight="bold">{configSummary.fileOverrides.toString()}</Text>
                    </Pane>
                )}
            </Pane>
        </Pane>
    );
}
