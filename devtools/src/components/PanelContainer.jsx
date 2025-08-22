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
    onLevelChange, 
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
        width: '380px', // Slightly narrower since we're using segmented controls
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
            background="#1f2329"
            boxShadow="2px 0 8px rgba(0,0,0,0.3)"
            fontSize={14}
            borderRight="1px solid #313640"
        >
            {/* Header */}
            <Pane
                paddingX={16}
                paddingY={12}
                borderBottom="1px solid #313640"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                position="sticky"
                top={0}
                background="#252a31"
            >
                <Heading size={500} color="#ffffff" fontWeight="600">
                    🎛️ Logger Controls
                </Heading>
                <Button
                    appearance="minimal"
                    onClick={onClose}
                    title="Close DevTools panel"
                    size="small"
                    color="#8b949e"
                >
                    ×
                </Button>
            </Pane>
            
            {/* Content */}
            <Pane paddingX={20} paddingBottom={20}>
                <ComponentFilters
                    components={components}
                    loggerControls={loggerControls}
                    onLevelChange={onLevelChange}
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
