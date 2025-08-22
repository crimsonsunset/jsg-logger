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
            {/* Show MASSIVE Evergreen UI Alert to prove it's working */}
            <Alert
                intent="warning"
                title="🌈⚡ RAINBOW EVERGREEN UI DEVTOOLS v2.0 ACTIVATED! ⚡🌈"
                marginBottom={20}
                background="linear-gradient(45deg, #ff0000, #ff8800, #ffff00, #00ff00, #0088ff, #0000ff, #8800ff)"
                padding={24}
                borderRadius={12}
                border="4px solid #ff00ff"
                boxShadow="0 8px 16px rgba(255,0,255,0.8)"
            >
                🚀 ULTIMATE PROFESSIONAL DESIGN SYSTEM IS NOW POWERING THIS DEVTOOLS! 🚀
                <br />
                ✨ If you can see this rainbow madness, EVERGREEN UI IS WORKING! ✨
            </Alert>
            
            <Pane display="flex" alignItems="center" marginBottom={12}>
                <Heading size={600} color="selected" marginRight={12}>
                    🌐 Global Controls
                </Heading>
                <Badge color="blue" marginRight={8}>EVERGREEN</Badge>
                <Badge color="purple">v2.0</Badge>
            </Pane>
            
            {/* MEGA RAINBOW ACTION BUTTONS */}
            <Pane display="flex" gap={16} marginBottom={20} flexWrap="wrap">
                <Button
                    appearance="primary"
                    intent="success"
                    size="large"
                    flex="1"
                    minWidth={140}
                    height={64}
                    onClick={onDebugAll}
                    title="Enable debug level for all components"
                    borderRadius={16}
                    background="linear-gradient(45deg, #00ff00, #ffff00)"
                    border="3px solid #00ff00"
                    boxShadow="0 6px 12px rgba(0,255,0,0.6)"
                    fontSize="18px"
                    fontWeight="bold"
                >
                    🐛🚀 MEGA DEBUG
                </Button>
                
                <Button
                    appearance="primary"
                    intent="warning"
                    size="large"
                    flex="1"
                    minWidth={140}
                    height={64}
                    onClick={onTraceAll}
                    title="Enable trace level for all components"
                    borderRadius={16}
                    background="linear-gradient(45deg, #ff8800, #ffff00)"
                    border="3px solid #ff8800"
                    boxShadow="0 6px 12px rgba(255,136,0,0.6)"
                    fontSize="18px"
                    fontWeight="bold"
                >
                    🔍⚡ MEGA TRACE
                </Button>
            </Pane>

            {/* Secondary Action Buttons - Make them obviously styled */}
            <Pane display="flex" gap={10} marginBottom={16} flexWrap="wrap">
                <Button
                    intent="danger"
                    size="medium"
                    flex="1"
                    minWidth={90}
                    height={40}
                    onClick={onReset}
                    title="Reset all settings to defaults"
                    borderRadius={6}
                >
                    ⚠️ Reset All
                </Button>
                
                <Button
                    appearance="default"
                    intent="none"
                    size="medium"
                    flex="1"
                    minWidth={90}
                    height={40}
                    onClick={() => {
                        const summary = loggerControls.getConfigSummary?.();
                        console.log('[JSG-DEVTOOLS] Current Config:', summary);
                        alert('Config exported to console');
                    }}
                    title="Export current configuration to console"
                    borderRadius={6}
                >
                    📤 Export
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
