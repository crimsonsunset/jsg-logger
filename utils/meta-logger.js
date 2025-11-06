/**
 * Meta-Logger Utilities
 * Handles logging about the logger itself BEFORE initialization (bootstrap logs only)
 * Respects metaLogging config setting: true (show console logs), false (silent)
 * 
 * IMPORTANT: Use meta-logger ONLY for pre-initialization logs. Once logger is initialized,
 * use the actual logger with proper components for all logging.
 */

import { configManager } from '../config/config-manager.js';

/**
 * Meta log function - logs about the logger itself (BOOTSTRAP ONLY)
 * @param {string} message - Log message
 * @param {...any} args - Additional arguments
 */
export const metaLog = (message, ...args) => {
    try {
        const metaLoggingConfig = configManager?.config?.metaLogging;
        
        // If config not loaded yet or explicitly true, use console.log
        if (metaLoggingConfig === undefined || metaLoggingConfig === true) {
            console.log(message, ...args);
            return;
        }
        
        // If explicitly false, stay silent
        if (metaLoggingConfig === false) {
            return;
        }
    } catch (error) {
        // If anything fails, fall back to console.log
        console.log(message, ...args);
    }
};

/**
 * Meta warn function - warnings about the logger itself (BOOTSTRAP ONLY)
 * @param {string} message - Warning message
 * @param {...any} args - Additional arguments
 */
export const metaWarn = (message, ...args) => {
    try {
        const metaLoggingConfig = configManager?.config?.metaLogging;
        
        if (metaLoggingConfig === undefined || metaLoggingConfig === true) {
            console.warn(message, ...args);
            return;
        }
        
        if (metaLoggingConfig === false) {
            return;
        }
    } catch (error) {
        console.warn(message, ...args);
    }
};

/**
 * Meta error function - errors about the logger itself (BOOTSTRAP ONLY)
 * @param {string} message - Error message
 * @param {...any} args - Additional arguments
 */
export const metaError = (message, ...args) => {
    try {
        const metaLoggingConfig = configManager?.config?.metaLogging;
        
        if (metaLoggingConfig === undefined || metaLoggingConfig === true) {
            console.error(message, ...args);
            return;
        }
        
        if (metaLoggingConfig === false) {
            return;
        }
    } catch (error) {
        console.error(message, ...args);
    }
};

