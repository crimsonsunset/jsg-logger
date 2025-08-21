/**
 * Floating Button Component
 * Minimal, unobtrusive trigger for the DevTools panel
 */

import { h } from 'https://esm.sh/preact@10.19.3';

export function FloatingButton({ onClick, isActive, logCount = 0 }) {
    const buttonStyle = {
        position: 'fixed',
        top: '50%',
        left: '20px',
        transform: 'translateY(-50%)',
        width: '48px',
        height: '48px',
        borderRadius: '24px',
        backgroundColor: isActive ? '#4A90E2' : '#2C3E50',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        zIndex: '999999',
        pointerEvents: 'all',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        color: 'white',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        outline: 'none'
    };

    const hoverStyle = {
        ...buttonStyle,
        transform: 'translateY(-50%) scale(1.1)',
        backgroundColor: isActive ? '#5BA0F2' : '#34495E'
    };

    const badgeStyle = {
        position: 'absolute',
        top: '-6px',
        right: '-6px',
        backgroundColor: '#E74C3C',
        color: 'white',
        borderRadius: '10px',
        fontSize: '10px',
        fontWeight: 'bold',
        padding: '2px 6px',
        minWidth: '16px',
        textAlign: 'center',
        display: logCount > 0 ? 'block' : 'none'
    };

    return h('button', {
        style: buttonStyle,
        onClick: onClick,
        onMouseEnter: (e) => Object.assign(e.target.style, hoverStyle),
        onMouseLeave: (e) => Object.assign(e.target.style, buttonStyle),
        title: "JSG Logger DevTools"
    }, [
        '🎛️',
        logCount > 0 && h('span', { style: badgeStyle }, 
            logCount > 999 ? '999+' : logCount.toString()
        )
    ].filter(Boolean));
}
