/**
 * CLI/Terminal Formatter for JSG Logger
 * Custom formatter with context data display
 */

import { LEVEL_SCHEME } from '../config/component-schemes.js';
import { configManager } from '../config/config-manager.js';
import { redactValue } from '../utils/redaction.js';

/**
 * Format a value for display in context tree
 * @param {*} value - Value to format
 * @returns {string} Formatted value
 */
const formatValue = (value) => {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value === 'object') {
    // For objects/arrays, show compact JSON
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
};


/**
 * Create CLI formatter with context data support
 * @returns {Object} Stream-like object for Pino
 */
export const createCLIFormatter = () => {
  return {
    write: (chunk) => {
      try {
        const log = JSON.parse(chunk);
        
        // Get component info from configManager (supports custom components)
        const component = configManager.getComponentConfig(log.name);
        const componentName = component.name;
        
        // Get level info  
        const level = LEVEL_SCHEME[log.level] || LEVEL_SCHEME[30];
        
        // Format timestamp
        const timestamp = new Date(log.time).toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit', 
          minute: '2-digit',
          second: '2-digit',
          fractionalSecondDigits: 1
        });
        
        // Format main message
        const message = `${level.emoji} [${componentName}] ${log.msg || ''}`;
        console.log(`${timestamp} ${message}`);
        
        // Display context data (exclude pino internal fields)
        const internalFields = ['level', 'time', 'msg', 'pid', 'hostname', 'name', 'v', 'environment'];
        const contextKeys = Object.keys(log).filter(key => !internalFields.includes(key));
        
        if (contextKeys.length > 0) {
          // Get redact config and apply redaction
          const redactConfig = configManager.getRedactConfig();
          const redactedLog = redactValue(log, redactConfig);
          
          contextKeys.forEach((key, index) => {
            const isLast = index === contextKeys.length - 1;
            const prefix = isLast ? '   └─' : '   ├─';
            const value = formatValue(redactedLog[key]);
            console.log(`${prefix} ${key}: ${value}`);
          });
        }
        
      } catch (error) {
        // Raw fallback for malformed JSON
        console.log(chunk);
      }
    }
  };
};