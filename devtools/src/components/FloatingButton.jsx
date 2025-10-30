/**
 * Floating Button Component
 * Grid widget with drag handle, positioning controls, and toggle button
 */

import { Pane, Text } from 'evergreen-ui';
import { useState } from 'preact/hooks';
import Draggable from 'react-draggable';

export function FloatingButton({ onClick, isActive, logCount = 0 }) {
    // Position presets for snap-to-corner functionality
    const widgetWidth = 112; // 28px * 3 buttons + 6px * 2 gaps + 8px * 2 padding
    const widgetHeight = 185; // approximate height
    
    const positionPresets = {
        'top-left': { x: 20, y: 20 },
        'top-center': { x: window.innerWidth / 2 - widgetWidth / 2, y: 20 },
        'top-right': { x: window.innerWidth - widgetWidth - 20, y: 20 },
        'middle-left': { x: 20, y: window.innerHeight / 2 - widgetHeight / 2 },
        'middle-right': { x: window.innerWidth - widgetWidth - 20, y: window.innerHeight / 2 - widgetHeight / 2 },
        'bottom-left': { x: 20, y: window.innerHeight - widgetHeight - 20 },
        'bottom-center': { x: window.innerWidth / 2 - widgetWidth / 2, y: window.innerHeight - widgetHeight - 20 },
        'bottom-right': { x: window.innerWidth - widgetWidth - 20, y: window.innerHeight - widgetHeight - 20 }
    };

    // Button configuration for the 3x3 grid
    const buttonConfig = [
        // Top row
        { id: 'top-left', emoji: '↖', title: 'Top Left' },
        { id: 'top-center', emoji: '↑', title: 'Top Center' },
        { id: 'top-right', emoji: '↗', title: 'Top Right' },
        // Middle row
        { id: 'middle-left', emoji: '←', title: 'Middle Left' },
        { id: 'toggle', emoji: '🔧', title: 'Toggle DevTools Panel', isToggle: true },
        { id: 'middle-right', emoji: '→', title: 'Middle Right' },
        // Bottom row
        { id: 'bottom-left', emoji: '↙', title: 'Bottom Left' },
        { id: 'bottom-center', emoji: '↓', title: 'Bottom Center' },
        { id: 'bottom-right', emoji: '↘', title: 'Bottom Right' }
    ];

    // Draggable position state
    const [position, setPosition] = useState(positionPresets['bottom-right']);

    // Handle snap to preset position
    const snapToPosition = (presetName) => {
        setPosition(positionPresets[presetName]);
    };

    // Handle drag stop
    const handleDragStop = (e, data) => {
        setPosition({ x: data.x, y: data.y });
    };

    // Render individual button based on config
    const renderButton = (config) => {
        const baseStyle = {
            cursor: 'pointer',
            fontSize: '24px',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'opacity 0.2s, transform 0.1s',
            pointerEvents: 'auto',
            userSelect: 'none',
            fontVariantEmoji: 'text',
            textRendering: 'optimizeLegibility',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            color: 'white',
            fontWeight: 'bold'
        };

        if (config.isToggle) {
            return (
                <div
                    key={config.id}
                    onClick={onClick}
                    title={config.title}
                    role="button"
                    tabIndex={0}
                    style={{
                        ...baseStyle,
                        opacity: isActive ? 1 : 0.7
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '1';
                        e.currentTarget.style.transform = 'scale(1.2)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = isActive ? '1' : '0.7';
                        e.currentTarget.style.transform = 'scale(1)';
                    }}
                >
                    {config.emoji}
                </div>
            );
        }

        return (
            <div
                key={config.id}
                onClick={() => snapToPosition(config.id)}
                title={config.title}
                role="button"
                tabIndex={0}
                style={{
                    ...baseStyle,
                    opacity: 0.6
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.transform = 'scale(1.2)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '0.6';
                    e.currentTarget.style.transform = 'scale(1)';
                }}
            >
                {config.emoji}
            </div>
        );
    };

    return (
        <Draggable
            position={position}
            onStop={handleDragStop}
            handle=".drag-handle"
        >
            <Pane
                position="fixed"
                width="fit-content"
                background="#1a202c"
                borderRadius={8}
                boxShadow="0 4px 12px rgba(0,0,0,0.4)"
                border="1px solid #4a5568"
                zIndex={999999}
                style={{ cursor: 'default', pointerEvents: 'auto' }}
            >
                {/* Drag Handle */}
                <Pane
                    className="drag-handle"
                    cursor="grab"
                    padding={6}
                    textAlign="center"
                    borderBottom="1px solid #4a5568"
                    background="#0d1f28"
                    borderTopLeftRadius={8}
                    borderTopRightRadius={8}
                    userSelect="none"
                    style={{
                        transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#1a3d4d';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#0d1f28';
                    }}
                >
                    <Text size={300} color="#718096" fontWeight={600}>⋮⋮ drag ⋮⋮</Text>
                </Pane>

                {/* 3x3 Grid - Config-driven */}
                <Pane
                    display="grid"
                    gridTemplateColumns="28px 28px 28px"
                    gridTemplateRows="28px 28px 28px"
                    gap={6}
                    padding={8}
                    background="#0d1f28"
                    style={{ pointerEvents: 'auto' }}
                >
                    {buttonConfig.map(renderButton)}
                </Pane>

                {/* Log Count Footer */}
                <Pane
                    padding={6}
                    textAlign="center"
                    borderTop="1px solid #4a5568"
                    background={logCount > 0 ? '#2d3748' : '#0d1f28'}
                    borderBottomLeftRadius={8}
                    borderBottomRightRadius={8}
                >
                    <Text 
                        size={300} 
                        color={logCount > 0 ? '#48bb78' : '#a0aec0'}
                        fontWeight={logCount > 0 ? 600 : 400}
                    >
                        # of logs: {logCount}
                    </Text>
                </Pane>
            </Pane>
        </Draggable>
    );
}
