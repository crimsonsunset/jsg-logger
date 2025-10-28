/**
 * Component Filters Component
 * Individual level sliders for each logger component
 */

import { useState, useEffect } from 'preact/compat';
import { Pane, Text, Heading, Badge, Button } from 'evergreen-ui';

// Log level mapping for slider values
const LOG_LEVELS = [
    { value: 0, name: 'SILENT', emoji: '🔇', color: '#718096' },
    { value: 1, name: 'ERROR', emoji: '🚨', color: '#E53E3E' },
    { value: 2, name: 'WARN', emoji: '⚠️', color: '#DD6B20' },
    { value: 3, name: 'INFO', emoji: '✨', color: '#3182CE' },
    { value: 4, name: 'DEBUG', emoji: '🐛', color: '#805AD5' },
    { value: 5, name: 'TRACE', emoji: '🔍', color: '#38A169' }
];

const levelNameToValue = {
    'silent': 0, 'error': 1, 'warn': 2, 'info': 3, 'debug': 4, 'trace': 5
};

const levelValueToName = {
    0: 'silent', 1: 'error', 2: 'warn', 3: 'info', 4: 'debug', 5: 'trace'
};

export function ComponentFilters({ components, loggerControls, onLevelChange }) {
    const [componentLevels, setComponentLevels] = useState({});

    // Initialize component levels
    useEffect(() => {
        const levels = {};
        components.forEach(name => {
            const level = loggerControls.getLevel?.(name) || 'info';
            levels[name] = levelNameToValue[level] ?? 3; // Default to INFO
        });
        setComponentLevels(levels);
    }, [components, loggerControls]);

    const handleLevelChange = (componentName, sliderValue) => {
        const newLevel = levelValueToName[sliderValue];
        
        // Update local state immediately for responsive UI
        setComponentLevels(prev => ({
            ...prev,
            [componentName]: sliderValue
        }));

        // Call parent handler with new level
        onLevelChange?.(componentName, newLevel);
    };

    if (components.length === 0) {
        return (
            <Pane marginBottom={24}>
                <Heading size={500} marginBottom={12} color="muted" borderBottom="1px solid" borderColor="border.muted" paddingBottom={8}>
                    📦 Components
                </Heading>
                <Text color="muted" fontStyle="italic">
                    No components detected
                </Text>
            </Pane>
        );
    }

    return (
        <Pane marginBottom={16}>
            {components.map(componentName => {
                const currentLevel = componentLevels[componentName] ?? 3;
                const levelConfig = LOG_LEVELS[currentLevel];
                
                return (
                    <Pane 
                        key={componentName} 
                        paddingY={16}
                        paddingX={16}
                        marginY={8}
                        background="#2d3748"
                        borderRadius={8}
                        border="1px solid #3a4553"
                        transition="all 0.2s"
                    >
                        {/* Component Name and Current Level */}
                        <Pane 
                            display="flex" 
                            alignItems="center" 
                            justifyContent="space-between" 
                            marginBottom={12} 
                            border="none"
                            borderWidth={0}
                            outline="none"
                            boxShadow="none"
                        >
                            <Text size={400} color="#e2e8f0" fontWeight="600">
                                {componentName}
                            </Text>
                            <Pane 
                                display="flex" 
                                alignItems="center" 
                                gap={8}
                                border="none"
                                borderWidth={0}
                                outline="none"
                                boxShadow="none"
                            >
                                <Text fontSize="14px" color={levelConfig.color}>
                                    {levelConfig.emoji}
                                </Text>
                                <Pane
                                    paddingX={8}
                                    paddingY={4}
                                    backgroundColor={levelConfig.color}
                                    borderRadius={12}
                                    border="none"
                                    borderWidth={0}
                                    outline="none"
                                    boxShadow="none"
                                >
                                    <Text 
                                        fontSize="11px"
                                        fontWeight="600"
                                        color="white"
                                    >
                                        {levelConfig.name}
                                    </Text>
                                </Pane>
                            </Pane>
                        </Pane>

                        {/* Level Control using Button Array (Custom Segmented Control) */}
                        <Pane display="flex" marginBottom={12} borderRadius={6} overflow="hidden">
                            {LOG_LEVELS.map((level, index) => (
                                <Button
                                    key={level.value}
                                    appearance="minimal"
                                    size="small"
                                    height={32}
                                    flex={1}
                                    borderRadius={0}
                                    border="none"
                                    background={currentLevel === index ? level.color : "transparent"}
                                    color={currentLevel === index ? "white" : level.color}
                                    onClick={() => handleLevelChange(componentName, level.value)}
                                    title={`Set to ${level.name}`}
                                    style={{
                                        transition: 'all 0.2s ease',
                                        fontWeight: currentLevel === index ? '600' : '400'
                                    }}
                                >
                                    {level.emoji}
                                </Button>
                            ))}
                        </Pane>

                        {/* Level Names Row */}
                        <Pane display="flex" justifyContent="space-between" paddingX={4}>
                            {LOG_LEVELS.map((level, index) => (
                                <Text 
                                    key={level.value}
                                    fontSize="9px" 
                                    color={currentLevel === index ? level.color : '#718096'}
                                    fontWeight={currentLevel === index ? '600' : '400'}
                                    textAlign="center"
                                    width={`${100/6}%`}
                                >
                                    {level.name}
                                </Text>
                            ))}
                        </Pane>
                    </Pane>
                );
            })}
        </Pane>
    );
}
