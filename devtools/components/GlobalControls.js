/**
 * Global Controls Component
 * System-wide controls and actions
 */

import { h } from 'https://esm.sh/preact@10.19.3';
import logger from '../../index.js';

const devtoolsLogger = logger.getComponent('devtools-ui');

export function GlobalControls({ onDebugAll, onTraceAll, onReset, loggerControls }) {
    const sectionStyle = {
        marginBottom: '24px'
    };

    const sectionTitleStyle = {
        fontSize: '14px',
        fontWeight: '600',
        color: '#CCCCCC',
        marginBottom: '12px',
        borderBottom: '1px solid #333',
        paddingBottom: '8px'
    };

    const buttonRowStyle = {
        display: 'flex',
        gap: '8px',
        marginBottom: '12px',
        flexWrap: 'wrap'
    };

    const buttonStyle = {
        flex: '1',
        minWidth: '80px',
        padding: '8px 12px',
        borderRadius: '6px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: '500',
        transition: 'all 0.2s ease',
        textAlign: 'center'
    };

    const primaryButtonStyle = {
        ...buttonStyle,
        backgroundColor: '#4A90E2',
        color: 'white'
    };

    const secondaryButtonStyle = {
        ...buttonStyle,
        backgroundColor: '#555',
        color: 'white'
    };

    const dangerButtonStyle = {
        ...buttonStyle,
        backgroundColor: '#E74C3C',
        color: 'white'
    };

    const statsStyle = {
        backgroundColor: '#2A2A2A',
        padding: '12px',
        borderRadius: '6px',
        marginTop: '12px'
    };

    const statsItemStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '4px 0',
        fontSize: '12px',
        color: '#CCCCCC'
    };

    const handleButtonHover = (e, hoverColor) => {
        e.target.style.backgroundColor = hoverColor;
    };

    const handleButtonLeave = (e, originalColor) => {
        e.target.style.backgroundColor = originalColor;
    };

    const stats = loggerControls.getStats?.() || { total: 0, byLevel: {}, byComponent: {} };
    const configSummary = loggerControls.getConfigSummary?.() || {};

    return h('div', { style: sectionStyle }, [
        h('h3', { style: sectionTitleStyle }, '🌐 Global Controls'),
        
        h('div', { style: buttonRowStyle }, [
            h('button', {
                style: primaryButtonStyle,
                onClick: onDebugAll,
                onMouseEnter: (e) => handleButtonHover(e, '#5BA0F2'),
                onMouseLeave: (e) => handleButtonLeave(e, '#4A90E2'),
                title: "Enable debug level for all components"
            }, 'Debug All'),
            
            h('button', {
                style: primaryButtonStyle,
                onClick: onTraceAll,
                onMouseEnter: (e) => handleButtonHover(e, '#5BA0F2'),
                onMouseLeave: (e) => handleButtonLeave(e, '#4A90E2'),
                title: "Enable trace level for all components"
            }, 'Trace All')
        ]),

        h('div', { style: buttonRowStyle }, [
            h('button', {
                style: dangerButtonStyle,
                onClick: onReset,
                onMouseEnter: (e) => handleButtonHover(e, '#F85C5C'),
                onMouseLeave: (e) => handleButtonLeave(e, '#E74C3C'),
                title: "Reset all settings to defaults"
            }, 'Reset All'),
            
            h('button', {
                style: secondaryButtonStyle,
                onClick: () => {
                    const summary = loggerControls.getConfigSummary?.();
                    devtoolsLogger.info('Current Config:', summary);
                    alert('Config exported to console');
                },
                onMouseEnter: (e) => handleButtonHover(e, '#666'),
                onMouseLeave: (e) => handleButtonLeave(e, '#555'),
                title: "Export current configuration to console"
            }, 'Export Config')
        ]),

        h('div', { style: statsStyle }, [
            h('div', { style: statsItemStyle }, [
                h('span', null, '📊 Total Logs:'),
                h('strong', null, stats.total.toString())
            ]),
            
            stats.byLevel && Object.keys(stats.byLevel).length > 0 && h('div', { style: statsItemStyle }, [
                h('span', null, '📈 By Level:'),
                h('span', { style: { fontSize: '11px', fontFamily: 'monospace' } },
                    Object.entries(stats.byLevel)
                        .map(([level, count]) => `${level}:${count}`)
                        .join(' ')
                )
            ]),

            configSummary.environment && h('div', { style: statsItemStyle }, [
                h('span', null, '🌍 Environment:'),
                h('strong', null, configSummary.environment)
            ]),

            configSummary.fileOverrides && h('div', { style: statsItemStyle }, [
                h('span', null, '📁 File Overrides:'),
                h('strong', null, configSummary.fileOverrides.toString())
            ])
        ].filter(Boolean))
    ]);
}
