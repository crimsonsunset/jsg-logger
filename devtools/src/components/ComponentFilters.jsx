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
            <Pane display="flex" alignItems="center" marginBottom={16}>
                <Heading size={400} color="#ffffff" marginRight={8}>
                    📦 Components
                </Heading>
            </Pane>
            
            {components.map(componentName => {
                const isOn = componentStates[componentName] ?? true;
                
                return (
                    <Pane 
                        key={componentName} 
                        display="flex" 
                        alignItems="center" 
                        justifyContent="space-between" 
                        paddingY={12}
                        paddingX={16}
                        marginY={4}
                        background={isOn ? "#2d3748" : "#1a1e23"}
                        borderRadius={6}
                        border={isOn ? "1px solid #4299e1" : "1px solid #2d3748"}
                        transition="all 0.2s"
                    >
                        <Text size={400} color="#e2e8f0" fontWeight="500">
                            {componentName}
                        </Text>
                        <Pane display="flex" alignItems="center" gap={12}>
                            <Switch
                                checked={isOn}
                                onChange={() => handleToggle(componentName)}
                                title={`Toggle ${componentName} logging`}
                                height={20}
                                width={36}
                            />
                            <Badge 
                                color={isOn ? 'green' : 'neutral'} 
                                fontSize="11px"
                            >
                                {isOn ? 'ON' : 'OFF'}
                            </Badge>
                        </Pane>
                    </Pane>
                );
            })}
        </Pane>
    );
}
