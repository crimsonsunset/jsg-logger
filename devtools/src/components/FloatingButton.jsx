/**
 * Floating Button Component
 * Minimal, unobtrusive trigger for the DevTools panel
 */

import { Button, Badge, Pane } from 'evergreen-ui';

export function FloatingButton({ onClick, isActive, logCount = 0 }) {
    // Fixed positioning styles that can't be handled by Evergreen
    const floatingContainerStyle = {
        position: 'fixed',
        top: '50%',
        left: '20px',
        transform: 'translateY(-50%)',
        zIndex: '999999',
        pointerEvents: 'all'
    };

    return (
        <div style={floatingContainerStyle}>
            <Pane position="relative">
                <Button
                    appearance="primary"
                    intent="warning"
                    onClick={onClick}
                    width={80}
                    height={80}
                    borderRadius={40}
                    fontSize="32px"
                    boxShadow="0 12px 24px rgba(255,0,255,0.8)"
                    title="EVERGREEN UI DEVTOOLS - RAINBOW EDITION!"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    background={isActive ? "linear-gradient(45deg, #ff0000, #ff8800, #ffff00, #00ff00, #0088ff, #0000ff, #8800ff)" : "orange"}
                    style={{
                        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                        border: '4px solid #ff00ff',
                        animation: 'rainbow 2s infinite'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.3) rotate(360deg)';
                        e.target.style.boxShadow = '0 16px 32px rgba(255,0,255,1)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1) rotate(0deg)';
                        e.target.style.boxShadow = '0 12px 24px rgba(255,0,255,0.8)';
                    }}
                >
                    {isActive ? '🌈⚡' : '🎛️✨'}
                </Button>
                
                {logCount > 0 && (
                    <Badge
                        color="orange"
                        position="absolute"
                        top={-8}
                        right={-8}
                        minWidth={20}
                        height={20}
                        fontSize="11px"
                        fontWeight="bold"
                    >
                        {logCount > 999 ? '999+' : logCount.toString()}
                    </Badge>
                )}
                
                {/* Show Evergreen indicator */}
                <Badge
                    color="blue"
                    position="absolute"
                    bottom={-10}
                    left="50%"
                    style={{ transform: 'translateX(-50%)' }}
                    fontSize="8px"
                >
                    EVERGREEN
                </Badge>
            </Pane>
        </div>
    );
}
