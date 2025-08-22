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
                    onClick={onClick}
                    width={48}
                    height={48}
                    borderRadius={24}
                    fontSize="20px"
                    boxShadow="0 4px 12px rgba(0,0,0,0.3)"
                    title="JSG Logger DevTools"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    style={{
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                    }}
                >
                    🎛️
                </Button>
                
                {logCount > 0 && (
                    <Badge
                        color="red"
                        position="absolute"
                        top={-6}
                        right={-6}
                        minWidth={16}
                        fontSize="10px"
                    >
                        {logCount > 999 ? '999+' : logCount.toString()}
                    </Badge>
                )}
            </Pane>
        </div>
    );
}
