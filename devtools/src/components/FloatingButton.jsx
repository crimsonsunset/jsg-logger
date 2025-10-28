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

    const floatingContainerStyle = {
        position: 'fixed',
        zIndex: '999999',
        pointerEvents: 'all',
        ...positionStyles[position]
    };

    return (
        <div style={floatingContainerStyle}>
            <Pane position="relative">
                {/* Top-left corner button */}
                <Button
                    appearance="minimal"
                    width={14}
                    height={14}
                    minWidth={14}
                    minHeight={14}
                    position="absolute"
                    top={-4}
                    left={-4}
                    borderRadius="50%"
                    padding={0}
                    background="#4299e1"
                    border="1px solid #2d3748"
                    onClick={(e) => {
                        e.stopPropagation();
                        setPosition('top-left');
                    }}
                    title="Move to top-left"
                    style={{ cursor: 'pointer', zIndex: 1 }}
                />

                {/* Top-right corner button */}
                <Button
                    appearance="minimal"
                    width={14}
                    height={14}
                    minWidth={14}
                    minHeight={14}
                    position="absolute"
                    top={-4}
                    right={-4}
                    borderRadius="50%"
                    padding={0}
                    background="#4299e1"
                    border="1px solid #2d3748"
                    onClick={(e) => {
                        e.stopPropagation();
                        setPosition('top-right');
                    }}
                    title="Move to top-right"
                    style={{ cursor: 'pointer', zIndex: 1 }}
                />

                {/* Bottom-left corner button */}
                <Button
                    appearance="minimal"
                    width={14}
                    height={14}
                    minWidth={14}
                    minHeight={14}
                    position="absolute"
                    bottom={-4}
                    left={-4}
                    borderRadius="50%"
                    padding={0}
                    background="#4299e1"
                    border="1px solid #2d3748"
                    onClick={(e) => {
                        e.stopPropagation();
                        setPosition('bottom-left');
                    }}
                    title="Move to bottom-left"
                    style={{ cursor: 'pointer', zIndex: 1 }}
                />

                {/* Bottom-right corner button */}
                <Button
                    appearance="minimal"
                    width={14}
                    height={14}
                    minWidth={14}
                    minHeight={14}
                    position="absolute"
                    bottom={-4}
                    right={-4}
                    borderRadius="50%"
                    padding={0}
                    background="#4299e1"
                    border="1px solid #2d3748"
                    onClick={(e) => {
                        e.stopPropagation();
                        setPosition('bottom-right');
                    }}
                    title="Move to bottom-right"
                    style={{ cursor: 'pointer', zIndex: 1 }}
                />

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
