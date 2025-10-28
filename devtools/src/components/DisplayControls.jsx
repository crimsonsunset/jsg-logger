/**
 * Display Controls Component
 * Controls for log display options with real-time preview
 */

import {useEffect, useState} from 'preact/hooks';
import {Button, Pane, Switch, Text} from 'evergreen-ui';

/**
 * Real-time preview of log formatting
 * Exported for use in PanelContainer header
 */
export function LogPreview({displayOptions, timestampMode}) {
    const previewStyle = {
        fontFamily: 'Monaco, Consolas, "Courier New", monospace',
        fontSize: '12px',
        lineHeight: '1.6',
        whiteSpace: 'pre-wrap',
        color: '#e2e8f0'
    };

    const timestampStyle = {color: '#a0aec0'};
    const emojiStyle = {marginRight: '6px'};
    const levelStyle = {color: '#f6ad55', fontWeight: '600'};
    const componentStyle = {color: '#4299e1', fontWeight: '600'};
    const messageStyle = {color: '#e2e8f0'};
    const contextKeyStyle = {color: '#9ae6b4'};
    const contextValueStyle = {color: '#cbd5e0'};

    // Generate timestamp based on mode
    const getTimestamp = () => {
        switch (timestampMode) {
            case 'absolute':
                return '22:15:30.1';
            case 'readable':
                return '10:15 PM';
            case 'relative':
                return '2s ago';
            case 'disable':
                return null;
            default:
                return '22:15:30.1';
        }
    };

    const timestamp = getTimestamp();

    return (
        <Pane
            background="#2d3748"
            padding={12}
            borderRadius={6}
            border="1px solid #4a5568"
        >
            <Pane style={previewStyle}>
                {/* Main log line */}
                <div>
                    {displayOptions.timestamp && timestamp && (
                        <span style={timestampStyle}>{timestamp} </span>
                    )}
                    {displayOptions.emoji && (
                        <span style={emojiStyle}>🌐</span>
                    )}
                    {displayOptions.level && (
                        <span style={levelStyle}>INFO </span>
                    )}
                    {displayOptions.component && (
                        <span style={componentStyle}>[API] </span>
                    )}
                    {displayOptions.message && (
                        <span style={messageStyle}>Request completed successfully</span>
                    )}
                </div>

                {/* JSON context data */}
                {displayOptions.jsonPayload && (
                    <>
                        <div>
                            <span style={contextKeyStyle}>   ├─ endpoint: </span>
                            <span style={contextValueStyle}>/api/users/profile</span>
                        </div>
                        <div>
                            <span style={contextKeyStyle}>   ├─ status: </span>
                            <span style={contextValueStyle}>200</span>
                        </div>
                        <div>
                            <span style={contextKeyStyle}>   ├─ duration: </span>
                            <span style={contextValueStyle}>145ms</span>
                        </div>
                        <div>
                            <span style={contextKeyStyle}>   └─ cached: </span>
                            <span style={contextValueStyle}>false</span>
                        </div>
                    </>
                )}

                {/* Stack trace (only shown if enabled) */}
                {displayOptions.stackTrace && (
                    <Pane marginTop={8} opacity={0.7}>
                        <div style={{color: '#fc8181'}}> at processRequest (api.js:42:15)</div>
                        <div style={{color: '#fc8181'}}> at handleRoute (router.js:128:8)</div>
                    </Pane>
                )}
            </Pane>
        </Pane>
    );
}

/**
 * Main Display Controls Component
 */
export function DisplayControls({loggerControls, onStateChange}) {
    const [timestampMode, setTimestampMode] = useState('absolute');
    const [displayOptions, setDisplayOptions] = useState({
        timestamp: true,
        emoji: true,
        component: true,
        level: false,
        message: true,
        jsonPayload: true,
        stackTrace: true
    });

    // Load initial configuration from logger
    useEffect(() => {
        if (loggerControls) {
            try {
                const config = loggerControls.getDisplayConfig?.();
                if (config) {
                    setDisplayOptions(prev => ({
                        ...prev,
                        ...config
                    }));
                }

                const currentTimestampMode = loggerControls.getTimestampMode?.();
                if (currentTimestampMode) {
                    setTimestampMode(currentTimestampMode);
                }
            } catch (error) {
                console.warn('[DisplayControls] Failed to load config:', error);
            }
        }
    }, [loggerControls]);

    // Notify parent of state changes for preview rendering
    useEffect(() => {
        if (onStateChange) {
            onStateChange({displayOptions, timestampMode});
        }
    }, [displayOptions, timestampMode, onStateChange]);

    /**
     * Handle timestamp mode change
     */
    const handleTimestampModeChange = (mode) => {
        setTimestampMode(mode);

        // Update display option for timestamp visibility
        const isVisible = mode !== 'disable';
        setDisplayOptions(prev => ({...prev, timestamp: isVisible}));

        // Apply to logger
        try {
            loggerControls.setTimestampMode?.(mode);
            console.log(`[JSG-DEVTOOLS] Timestamp mode changed to: ${mode}`);
        } catch (error) {
            console.warn('[DisplayControls] Failed to set timestamp mode:', error);
        }
    };

    /**
     * Handle individual toggle
     */
    const handleToggle = (option) => {
        const newValue = !displayOptions[option];
        setDisplayOptions(prev => ({
            ...prev,
            [option]: newValue
        }));

        // Apply to logger
        try {
            loggerControls.setDisplayOption?.(option, newValue);
            console.log(`[JSG-DEVTOOLS] Display option '${option}' set to: ${newValue}`);
        } catch (error) {
            console.warn(`[DisplayControls] Failed to set ${option}:`, error);
        }
    };

    /**
     * Enable all display options
     */
    const handleAllOn = () => {
        const allOn = {
            timestamp: true,
            emoji: true,
            component: true,
            level: true,
            message: true,
            jsonPayload: true,
            stackTrace: true
        };
        setDisplayOptions(allOn);
        setTimestampMode('absolute');

        // Apply to logger
        try {
            Object.entries(allOn).forEach(([key, value]) => {
                loggerControls.setDisplayOption?.(key, value);
            });
            loggerControls.setTimestampMode?.('absolute');
            console.log('[JSG-DEVTOOLS] All display options enabled');
        } catch (error) {
            console.warn('[DisplayControls] Failed to enable all options:', error);
        }
    };

    /**
     * Disable all display options (except message)
     */
    const handleAllOff = () => {
        const allOff = {
            timestamp: false,
            emoji: false,
            component: false,
            level: false,
            message: true, // Keep message always on
            jsonPayload: false,
            stackTrace: false
        };
        setDisplayOptions(allOff);
        setTimestampMode('disable');

        // Apply to logger
        try {
            Object.entries(allOff).forEach(([key, value]) => {
                loggerControls.setDisplayOption?.(key, value);
            });
            loggerControls.setTimestampMode?.('disable');
            console.log('[JSG-DEVTOOLS] All display options disabled (message kept on)');
        } catch (error) {
            console.warn('[DisplayControls] Failed to disable all options:', error);
        }
    };

    /**
     * Reset to defaults
     */
    const handleReset = () => {
        const defaults = {
            timestamp: true,
            emoji: true,
            component: true,
            level: false,
            message: true,
            jsonPayload: true,
            stackTrace: true
        };
        setDisplayOptions(defaults);
        setTimestampMode('absolute');

        // Apply to logger
        try {
            Object.entries(defaults).forEach(([key, value]) => {
                loggerControls.setDisplayOption?.(key, value);
            });
            loggerControls.setTimestampMode?.('absolute');
            console.log('[JSG-DEVTOOLS] Display options reset to defaults');
        } catch (error) {
            console.warn('[DisplayControls] Failed to reset options:', error);
        }
    };

    const timestampOptions = [
        {label: 'Absolute', value: 'absolute'},
        {label: 'Readable', value: 'readable'},
        {label: 'Relative', value: 'relative'},
        {label: 'Off', value: 'disable'}
    ];

    return (
        <Pane paddingX={20} paddingY={16}>
            {/* Timestamp Mode Selector */}
            <Pane marginBottom={12}>
                <Pane display="flex" gap={4}>
                    {timestampOptions.map(option => (
                        <Button
                            key={option.value}
                            size="small"
                            appearance={timestampMode === option.value ? 'primary' : 'default'}
                            onClick={() => handleTimestampModeChange(option.value)}
                            flex="1"
                        >
                            {option.label}
                        </Button>
                    ))}
                </Pane>
            </Pane>

            {/* Toggle Switches Grid */}
            <Pane
                display="grid"
                gridTemplateColumns="1fr 1fr"
                gap={12}
                marginBottom={12}
            >
                {/* Emoji Toggle */}
                <Pane display="flex" alignItems="center" justifyContent="space-between">
                    <Text size={300} color="#e2e8f0">
                        😀 Emoji
                    </Text>
                    <Switch
                        checked={displayOptions.emoji}
                        onChange={() => handleToggle('emoji')}
                        height={20}
                    />
                </Pane>

                {/* Component Toggle */}
                <Pane display="flex" alignItems="center" justifyContent="space-between">
                    <Text size={300} color="#e2e8f0">
                        📦 Component
                    </Text>
                    <Switch
                        checked={displayOptions.component}
                        onChange={() => handleToggle('component')}
                        height={20}
                    />
                </Pane>

                {/* Level Toggle */}
                <Pane display="flex" alignItems="center" justifyContent="space-between">
                    <Text size={300} color="#e2e8f0">
                        📊 Level Name
                    </Text>
                    <Switch
                        checked={displayOptions.level}
                        onChange={() => handleToggle('level')}
                        height={20}
                    />
                </Pane>

                {/* Message Toggle (disabled - always on) */}
                <Pane display="flex" alignItems="center" justifyContent="space-between" opacity={0.5}>
                    <Text size={300} color="#e2e8f0">
                        💬 Message
                    </Text>
                    <Switch
                        checked={displayOptions.message}
                        disabled={true}
                        height={20}
                    />
                </Pane>

                {/* JSON Payload Toggle */}
                <Pane display="flex" alignItems="center" justifyContent="space-between">
                    <Text size={300} color="#e2e8f0">
                        📋 JSON Data
                    </Text>
                    <Switch
                        checked={displayOptions.jsonPayload}
                        onChange={() => handleToggle('jsonPayload')}
                        height={20}
                    />
                </Pane>

                {/* Stack Trace Toggle */}
                <Pane display="flex" alignItems="center" justifyContent="space-between">
                    <Text size={300} color="#e2e8f0">
                        📚 Stack Trace
                    </Text>
                    <Switch
                        checked={displayOptions.stackTrace}
                        onChange={() => handleToggle('stackTrace')}
                        height={20}
                    />
                </Pane>
            </Pane>

            {/* Bulk Control Buttons */}
            <Pane display="flex" gap={8} flexWrap="wrap">
                <Button
                    size="small"
                    appearance="primary"
                    intent="success"
                    onClick={handleAllOn}
                    flex="1"
                    minWidth={80}
                >
                    ✅ All On
                </Button>
                <Button
                    size="small"
                    appearance="default"
                    onClick={handleAllOff}
                    flex="1"
                    minWidth={80}
                >
                    ❌ All Off
                </Button>
                <Button
                    size="small"
                    appearance="default"
                    onClick={handleReset}
                    flex="1"
                    minWidth={80}
                >
                    ↻ Reset
                </Button>
            </Pane>
        </Pane>
    );
}

