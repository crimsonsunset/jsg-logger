/**
 * Panel Container Component
 * Collapsible sidebar with all devtools controls
 */

import {useState} from 'preact/hooks';
import {Button, Heading, Pane, Switch} from 'evergreen-ui';
import {ComponentFilters} from './ComponentFilters.jsx';
import {GlobalControls} from './GlobalControls.jsx';
import {DisplayControls, LogPreview} from './DisplayControls.jsx';

export function PanelContainer({
                                   components,
                                   loggerControls,
                                   onLevelChange,
                                   onGlobalDebug,
                                   onGlobalTrace,
                                   onReset,
                                   onClose,
                                   isClosing
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
        animation: isClosing ? 'slideOut 0.3s ease-in' : 'slideIn 0.3s ease-out'
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

    // State for live preview in header
    const [previewState, setPreviewState] = useState({
        displayOptions: {
            timestamp: true,
            emoji: true,
            component: true,
            level: false,
            message: true,
            jsonPayload: true,
            stackTrace: true
        },
        timestampMode: 'absolute'
    });

    // State for showing/hiding preview and controls
    const [showPreviewControls, setShowPreviewControls] = useState(true);

    // Header height for sticky positioning (updated to include preview)
    const headerHeight = 150; // Increased for preview section

    return (
        <Pane
            style={panelContainerStyle}
            background="#0d1f28"
            boxShadow="2px 0 8px rgba(0,0,0,0.3)"
            fontSize={14}
            borderRight="1px solid #22577a"
        >
            {/* Sticky Header with Preview and Controls */}
            <Pane
                position="sticky"
                top={0}
                background="#1a3d4d"
                zIndex={999999}
                borderBottom="1px solid #22577a"
            >
                {/* Title Bar */}
                <Pane
                    paddingX={16}
                    paddingY={12}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Heading size={500} color="#ffffff" fontWeight="600">
                        🔧 Logger Controls
                    </Heading>
                    <Pane display="flex" gap={12} alignItems="center">
                        <Switch
                            checked={showPreviewControls}
                            onChange={(e) => setShowPreviewControls(e.target.checked)}
                            height={20}
                        />
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
                </Pane>

                {/* Live Preview in Sticky Header (conditionally shown) */}
                {showPreviewControls && (
                    <>
                        <Pane paddingX={16} paddingBottom={12}>
                            <LogPreview
                                displayOptions={previewState.displayOptions}
                                timestampMode={previewState.timestampMode}
                            />
                        </Pane>

                        {/* Display Controls in Sticky Header */}
                        <DisplayControls
                            loggerControls={loggerControls}
                            onStateChange={setPreviewState}
                        />
                    </>
                )}
            </Pane>

            {/* Scrolling Content */}
            <Pane paddingBottom={20}>
                {/* Component Filters */}
                <Pane paddingX={20}>
                    <ComponentFilters
                        components={components}
                        loggerControls={loggerControls}
                        onLevelChange={onLevelChange}
                    />

                    {/* Global Controls */}
                    <GlobalControls
                        onDebugAll={onGlobalDebug}
                        onTraceAll={onGlobalTrace}
                        onReset={onReset}
                        loggerControls={loggerControls}
                    />
                </Pane>
            </Pane>
        </Pane>
    );
}
