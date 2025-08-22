/**
 * Component Filters Component
 * Individual level sliders for each logger component
 */

import { useState, useEffect } from 'preact/hooks';
import { Pane, Text, Heading, Badge } from 'evergreen-ui';

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
        <Pane marginBottom={24}>
            <Pane display="flex" alignItems="center" marginBottom={16}>
                <Heading size={400} color="#ffffff" marginRight={8}>
                    🎛️ Log Levels
                </Heading>
            </Pane>
            
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
                        border="1px solid #4a5568"
                        transition="all 0.2s"
                    >
                        {/* Component Name and Current Level */}
                        <Pane display="flex" alignItems="center" justifyContent="space-between" marginBottom={12}>
                            <Text size={400} color="#e2e8f0" fontWeight="600">
                                {componentName}
                            </Text>
                            <Pane display="flex" alignItems="center" gap={8}>
                                <Text fontSize="14px" color={levelConfig.color}>
                                    {levelConfig.emoji}
                                </Text>
                                <Badge 
                                    color={currentLevel === 0 ? 'neutral' : 'blue'} 
                                    fontSize="11px"
                                    fontWeight="600"
                                    backgroundColor={levelConfig.color}
                                    color="white"
                                >
                                    {levelConfig.name}
                                </Badge>
                            </Pane>
                        </Pane>

                        {/* Level Slider */}
                        <Pane marginBottom={8}>
                            <input
                                type="range"
                                min={0}
                                max={5}
                                step={1}
                                value={currentLevel}
                                onChange={(e) => handleLevelChange(componentName, parseInt(e.target.value))}
                                style={{
                                    width: '100%',
                                    height: '6px',
                                    borderRadius: '3px',
                                    background: `linear-gradient(to right, 
                                        ${LOG_LEVELS[0].color} 0%, 
                                        ${LOG_LEVELS[1].color} 20%, 
                                        ${LOG_LEVELS[2].color} 40%, 
                                        ${LOG_LEVELS[3].color} 60%, 
                                        ${LOG_LEVELS[4].color} 80%, 
                                        ${LOG_LEVELS[5].color} 100%)`,
                                    outline: 'none',
                                    appearance: 'none',
                                    cursor: 'pointer'
                                }}
                            />
                        </Pane>

                        {/* Level Labels */}
                        <Pane display="flex" justifyContent="space-between" paddingX={2}>
                            {LOG_LEVELS.map((level, index) => (
                                <Text 
                                    key={level.value}
                                    fontSize="10px" 
                                    color={currentLevel === index ? level.color : '#718096'}
                                    fontWeight={currentLevel === index ? '600' : '400'}
                                    cursor="pointer"
                                    onClick={() => handleLevelChange(componentName, level.value)}
                                    title={`Set to ${level.name}`}
                                >
                                    {level.emoji}
                                </Text>
                            ))}
                        </Pane>
                    </Pane>
                );
            })}
        </Pane>
    );
}
