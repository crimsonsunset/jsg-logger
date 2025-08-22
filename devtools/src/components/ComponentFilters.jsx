/**
 * Component Filters Component
 * Individual toggles for each logger component
 */

import { useState, useEffect } from 'preact/hooks';
import { Pane, Text, Heading, Switch } from 'evergreen-ui';

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
            <Heading size={500} marginBottom={12} color="muted" borderBottom="1px solid" borderColor="border.muted" paddingBottom={8}>
                📦 Components
            </Heading>
            {components.map(componentName => {
                const isOn = componentStates[componentName] ?? true;
                
                return (
                    <Pane key={componentName} display="flex" alignItems="center" justifyContent="space-between" paddingY={8} borderBottom="1px solid" borderColor="border.muted">
                        <Text size={300} fontFamily="mono" color="default">
                            {componentName}
                        </Text>
                        <Pane display="flex" alignItems="center" gap={8}>
                            <Switch
                                checked={isOn}
                                onChange={() => handleToggle(componentName)}
                                title={`Toggle ${componentName} logging`}
                            />
                            <Text size={300} color={isOn ? 'selected' : 'muted'} minWidth={28}>
                                {isOn ? 'ON' : 'OFF'}
                            </Text>
                        </Pane>
                    </Pane>
                );
            })}
        </Pane>
    );
}
