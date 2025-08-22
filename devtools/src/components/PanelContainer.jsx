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
        width: '420px', // Wider to accommodate sliders
        height: '100vh',
        zIndex: '999998',
        pointerEvents: 'all',
        overflow: 'auto',
        animation: 'slideIn 0.3s ease-out'
    };

    // Add CSS animation keyframes and slider styles to document head
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

            /* Custom slider styling */
            input[type="range"] {
                -webkit-appearance: none;
                appearance: none;
            }
            
            input[type="range"]::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                height: 16px;
                width: 16px;
                border-radius: 50%;
                background: #ffffff;
                cursor: pointer;
                border: 2px solid #4299e1;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                transition: all 0.2s ease;
            }
            
            input[type="range"]::-webkit-slider-thumb:hover {
                background: #e2e8f0;
                transform: scale(1.1);
                box-shadow: 0 4px 8px rgba(0,0,0,0.3);
            }
            
            input[type="range"]::-moz-range-thumb {
                height: 16px;
                width: 16px;
                border-radius: 50%;
                background: #ffffff;
                cursor: pointer;
                border: 2px solid #4299e1;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                transition: all 0.2s ease;
            }
            
            input[type="range"]::-moz-range-thumb:hover {
                background: #e2e8f0;
                transform: scale(1.1);
                box-shadow: 0 4px 8px rgba(0,0,0,0.3);
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
