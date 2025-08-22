/**
 * Panel Container Component  
 * Collapsible sidebar with all devtools controls
 */

import { Pane, Heading, Button } from 'evergreen-ui';
import { ComponentFilters } from './ComponentFilters.jsx';
import { GlobalControls } from './GlobalControls.jsx';

export function PanelContainer({ 
    components, 
    loggerControls, 
    onComponentToggle, 
    onGlobalDebug, 
    onGlobalTrace, 
    onReset, 
    onClose 
}) {
    // Fixed positioning and animation styles that can't be handled by Evergreen
    const panelContainerStyle = {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '300px',
        height: '100vh',
        zIndex: '999998',
        pointerEvents: 'all',
        overflow: 'auto',
        animation: 'slideIn 0.3s ease-out'
    };

    // Add CSS animation keyframes to document head
    if (!document.getElementById('jsg-devtools-styles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'jsg-devtools-styles';
        styleSheet.textContent = `
            @keyframes slideIn {
                from { transform: translateX(-100%); }
                to { transform: translateX(0); }
            }
            
            @keyframes slideOut {
                from { transform: translateX(0); }
                to { transform: translateX(-100%); }
            }
        `;
        document.head.appendChild(styleSheet);
    }

    return (
        <Pane 
            style={panelContainerStyle}
            background="tint1"
            boxShadow="4px 0 12px rgba(0,0,0,0.5)"
            fontSize={14}
        >
            {/* Header */}
            <Pane
                padding="16px 20px"
                borderBottom="1px solid"
                borderColor="border.muted"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                position="sticky"
                top={0}
                background="tint1"
            >
                <Heading size={600} color="selected">
                    🎛️ Logger Controls
                </Heading>
                <Button
                    appearance="minimal"
                    onClick={onClose}
                    title="Close panel"
                    size="small"
                    padding={4}
                >
                    ×
                </Button>
            </Pane>
            
            {/* Content */}
            <Pane padding="0 20px 20px">
                <ComponentFilters
                    components={components}
                    loggerControls={loggerControls}
                    onToggle={onComponentToggle}
                />
                
                <GlobalControls
                    onDebugAll={onGlobalDebug}
                    onTraceAll={onGlobalTrace}
                    onReset={onReset}
                    loggerControls={loggerControls}
                />
            </Pane>
        </Pane>
    );
}
