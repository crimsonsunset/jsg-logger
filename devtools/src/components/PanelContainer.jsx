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
            background="purple"
            boxShadow="4px 0 20px rgba(255,0,255,0.8)"
            fontSize={16}
            border="4px solid #ff00ff"
        >
            {/* Header */}
            <Pane
                paddingX={20}
                paddingY={24}
                borderBottom="4px solid #ff00ff"
                borderColor="border.muted"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                position="sticky"
                top={0}
                background="yellow"
            >
                <Heading size={700} color="red" fontWeight="bold">
                    ⚡ TESTING HOT RELOAD - DID THIS CHANGE? ⚡
                </Heading>
                <Button
                    appearance="primary"
                    intent="danger"
                    onClick={onClose}
                    title="Close panel"
                    size="large"
                    padding={8}
                    background="red"
                >
                    ❌ CLOSE
                </Button>
            </Pane>
            
            {/* Content */}
            <Pane paddingX={20} paddingBottom={20}>
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
