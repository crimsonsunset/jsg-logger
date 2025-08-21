/**
 * Component Filters Component
 * Individual toggles for each logger component
 */

import { useState, useEffect } from 'https://esm.sh/preact@10.19.3/hooks';
import { h } from 'https://esm.sh/preact@10.19.3';

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

    const sectionStyle = {
        marginBottom: '24px'
    };

    const sectionTitleStyle = {
        fontSize: '14px',
        fontWeight: '600',
        color: '#CCCCCC',
        marginBottom: '12px',
        borderBottom: '1px solid #333',
        paddingBottom: '8px'
    };

    const componentItemStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 0',
        borderBottom: '1px solid #2A2A2A'
    };

    const componentNameStyle = {
        fontSize: '13px',
        color: '#E0E0E0',
        fontFamily: 'monospace'
    };

    const toggleStyle = (isOn) => ({
        width: '40px',
        height: '20px',
        borderRadius: '10px',
        backgroundColor: isOn ? '#4A90E2' : '#444',
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background-color 0.2s ease'
    });

    const toggleKnobStyle = (isOn) => ({
        position: 'absolute',
        top: '2px',
        left: isOn ? '22px' : '2px',
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        backgroundColor: 'white',
        transition: 'left 0.2s ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
    });

    const statusTextStyle = (isOn) => ({
        fontSize: '11px',
        color: isOn ? '#4A90E2' : '#888',
        marginLeft: '8px',
        minWidth: '30px'
    });

    if (components.length === 0) {
        return h('div', { style: sectionStyle }, [
            h('h3', { style: sectionTitleStyle }, '📦 Components'),
            h('div', { style: { color: '#888', fontStyle: 'italic' } }, 
                'No components detected'
            )
        ]);
    }

    return h('div', { style: sectionStyle }, [
        h('h3', { style: sectionTitleStyle }, '📦 Components'),
        ...components.map(componentName => {
            const isOn = componentStates[componentName] ?? true;
            
            return h('div', { key: componentName, style: componentItemStyle }, [
                h('span', { style: componentNameStyle }, componentName),
                h('div', { style: { display: 'flex', alignItems: 'center' } }, [
                    h('button', {
                        style: toggleStyle(isOn),
                        onClick: () => handleToggle(componentName),
                        title: `Toggle ${componentName} logging`
                    }, [
                        h('div', { style: toggleKnobStyle(isOn) })
                    ]),
                    h('span', { style: statusTextStyle(isOn) }, 
                        isOn ? 'ON' : 'OFF'
                    )
                ])
            ]);
        })
    ]);
}
