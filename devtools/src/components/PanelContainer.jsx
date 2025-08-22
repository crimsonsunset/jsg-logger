/**
 * Panel Container Component  
 * Collapsible sidebar with all devtools controls
 */

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
    const panelStyle = {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '300px',
        height: '100vh',
        backgroundColor: '#1E1E1E',
        color: '#FFFFFF',
        boxShadow: '4px 0 12px rgba(0,0,0,0.5)',
        zIndex: '999998',
        pointerEvents: 'all',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '14px',
        overflow: 'auto',
        animation: 'slideIn 0.3s ease-out'
    };

    const headerStyle = {
        padding: '16px 20px',
        borderBottom: '1px solid #333',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: '0',
        backgroundColor: '#1E1E1E'
    };

    const titleStyle = {
        margin: '0',
        fontSize: '16px',
        fontWeight: '600',
        color: '#4A90E2'
    };

    const closeButtonStyle = {
        background: 'none',
        border: 'none',
        color: '#888',
        cursor: 'pointer',
        fontSize: '20px',
        padding: '4px',
        borderRadius: '4px'
    };

    const contentStyle = {
        padding: '0 20px 20px'
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
        <div style={panelStyle}>
            <div style={headerStyle}>
                <h2 style={titleStyle}>🎛️ Logger Controls</h2>
                <button
                    style={closeButtonStyle}
                    onClick={onClose}
                    title="Close panel"
                    onMouseEnter={(e) => e.target.style.color = '#FFF'}
                    onMouseLeave={(e) => e.target.style.color = '#888'}
                >
                    ×
                </button>
            </div>
            
            <div style={contentStyle}>
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
            </div>
        </div>
    );
}
