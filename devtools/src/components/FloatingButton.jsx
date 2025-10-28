/**
 * Floating Button Component
 * Minimal, unobtrusive trigger for the DevTools panel
 */

import { Button, Badge, Pane } from 'evergreen-ui';
import { useState } from 'preact/hooks';

export function FloatingButton({ onClick, isActive, logCount = 0 }) {
    // Position state (session-only, resets on reload)
    const [position, setPosition] = useState('middle-left');

    // Position mapping
    const positionStyles = {
        'top-left': { top: '20px', left: '20px', transform: 'none' },
        'top-right': { top: '20px', right: '20px', left: 'auto', transform: 'none' },
        'bottom-left': { bottom: '20px', top: 'auto', left: '20px', transform: 'none' },
        'bottom-right': { bottom: '20px', top: 'auto', right: '20px', left: 'auto', transform: 'none' },
        'middle-left': { top: '50%', left: '20px', transform: 'translateY(-50%)' }
    };

    // Corner button configurations
    const cornerButtons = [
        { position: 'top-left', top: -6, left: -6, emoji: '↖️', title: 'Move to top-left' },
        { position: 'top-right', top: -6, right: -6, emoji: '↗️', title: 'Move to top-right' },
        { position: 'bottom-left', bottom: -6, left: -6, emoji: '↙️', title: 'Move to bottom-left' },
        { position: 'bottom-right', bottom: -6, right: -6, emoji: '↘️', title: 'Move to bottom-right' }
    ];

    const floatingContainerStyle = {
        position: 'fixed',
        zIndex: '999999',
        pointerEvents: 'all',
        ...positionStyles[position]
    };

    return (
        <div style={floatingContainerStyle}>
            <Pane position="relative">
                {/* Corner position buttons */}
                {cornerButtons.map((btn) => (
                    <span
                        key={btn.position}
                        onClick={(e) => {
                            e.stopPropagation();
                            setPosition(btn.position);
                        }}
                        title={btn.title}
                        style={{
                            position: 'absolute',
                            top: btn.top,
                            left: btn.left,
                            bottom: btn.bottom,
                            right: btn.right,
                            fontSize: '16px',
                            cursor: 'pointer',
                            zIndex: 1,
                            userSelect: 'none',
                            opacity: 0.7,
                            transition: 'opacity 0.2s, transform 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.opacity = '1';
                            e.target.style.transform = 'scale(1.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.opacity = '0.7';
                            e.target.style.transform = 'scale(1)';
                        }}
                    >
                        {btn.emoji}
                    </span>
                ))}

                {/* Main button */}
                <Button
                    appearance={isActive ? 'primary' : 'default'}
                    intent={isActive ? 'success' : 'none'}
                    onClick={onClick}
                    width={48}
                    height={48}
                    borderRadius={24}
                    fontSize="18px"
                    boxShadow="0 4px 8px rgba(0,0,0,0.3)"
                    title="JSG Logger DevTools Panel"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    background={isActive ? "#2d3748" : "#1a202c"}
                    style={{
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        border: isActive ? '2px solid #4299e1' : '2px solid #4a5568'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.1)';
                        e.target.style.boxShadow = '0 6px 12px rgba(0,0,0,0.4)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                        e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
                    }}
                >
                </Button>
                
                {/* Badge in center */}
                <Badge
                    color="red"
                    position="absolute"
                    top="50%"
                    left="50%"
                    style={{ transform: 'translate(-50%, -50%)' }}
                    minWidth={20}
                    height={20}
                    fontSize="11px"
                    fontWeight="600"
                    pointerEvents="none"
                >
                    {logCount > 99 ? '99+' : logCount.toString()}
                </Badge>
            </Pane>
        </div>
    );
}
