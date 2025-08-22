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
                    {isActive ? '🟢' : '🎛️'}
                </Button>
                
                {logCount > 0 && (
                    <Badge
                        color="red"
                        position="absolute"
                        top={-4}
                        right={-4}
                        minWidth={16}
                        height={16}
                        fontSize="10px"
                        fontWeight="600"
                    >
                        {logCount > 99 ? '99+' : logCount.toString()}
                    </Badge>
                )}
            </Pane>
        </div>
    );
}
