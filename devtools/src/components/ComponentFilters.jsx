/**
 * Component Filters Component
 * Individual toggles for each logger component
 */

import { useState, useEffect } from 'preact/hooks';
import { Pane, Text, Heading, Switch, Badge } from 'evergreen-ui';

export function ComponentFilters({ components, loggerControls, onToggle }) {
    const [componentStates, setComponentStates] = useState({});

    // Initialize component states
    useEffect(() => {
        const states = {};
        components.forEach(name => {
            const level = loggerControls.getLevel?.(name);
            states[name] = level !== 'silent';
        });
        setComponentStates(states);
    }, [components, loggerControls]);

    const handleToggle = (componentName) => {
        const currentLevel = loggerControls.getLevel?.(componentName);
        const isCurrentlyOn = currentLevel !== 'silent';
        
        // Update local state immediately for responsive UI
        setComponentStates(prev => ({
            ...prev,
            [componentName]: !isCurrentlyOn
        }));

        // Call parent handler
        onToggle(componentName, currentLevel);
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
            <Pane display="flex" alignItems="center" marginBottom={12}>
                <Heading size={500} color="selected" marginRight={8}>
                    📦 Components
                </Heading>
                <Badge color="green" fontSize="10px">SWITCHES</Badge>
            </Pane>
            
            {components.map(componentName => {
                const isOn = componentStates[componentName] ?? true;
                
                return (
                    <Pane 
                        key={componentName} 
                        display="flex" 
                        alignItems="center" 
                        justifyContent="space-between" 
                        paddingY={16}
                        paddingX={20}
                        marginY={8}
                        background={isOn ? "linear-gradient(45deg, #ffff00, #00ff00)" : "linear-gradient(45deg, #ff0000, #ffaa00)"}
                        borderRadius={12}
                        border={isOn ? "4px solid #00ff00" : "4px solid #ff0000"}
                        boxShadow={isOn ? "0 4px 12px rgba(0,255,0,0.5)" : "0 4px 12px rgba(255,0,0,0.5)"}
                    >
                        <Text size={500} fontFamily="mono" color="black" fontWeight="bold">
                            🎯 {componentName.toUpperCase()}
                        </Text>
                        <Pane display="flex" alignItems="center" gap={16}>
                            <Switch
                                checked={isOn}
                                onChange={() => handleToggle(componentName)}
                                title={`Toggle ${componentName} logging`}
                                height={32}
                                width={60}
                            />
                            <Badge 
                                color={isOn ? 'green' : 'red'} 
                                fontSize="14px"
                                minWidth={50}
                                height={24}
                            >
                                {isOn ? '🚀 ACTIVE' : '💤 OFF'}
                            </Badge>
                        </Pane>
                    </Pane>
                );
            })}
        </Pane>
    );
}
