/**
 * CLI/Terminal Formatter for JSG Logger
 * Uses pino-colada for beautiful terminal output with fallbacks
 */

import { COMPONENT_SCHEME, LEVEL_SCHEME } from '../config/component-schemes.js';
import pinoColada from 'pino-colada';
// Note: pino-pretty imported conditionally to avoid browser bundle issues

/**
 * Create CLI formatter using pino-colada or pino-pretty
 * @returns {Object} Stream-like object for Pino
 */
export const createCLIFormatter = () => {
  try {
    // Try pino-colada first (best formatting)
    const colada = pinoColada();
    colada.pipe(process.stdout);
    return colada;
  } catch (error) {
    // Ultimate fallback - basic formatted output (works in all environments)
    return {
      write: (chunk) => {
        try {
          const log = JSON.parse(chunk);
          
          // Get component info
          const component = COMPONENT_SCHEME[log.name] || COMPONENT_SCHEME['core'];
          const componentName = component.name.toUpperCase().replace(/([a-z])([A-Z])/g, '$1-$2');
          
          // Get level info  
          const level = LEVEL_SCHEME[log.level] || LEVEL_SCHEME[30];
          
          // Format timestamp like pino-pretty
          const timestamp = new Date(log.time).toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit',
            fractionalSecondDigits: 1
          });
          
          // Format message like pino-pretty messageFormat
          const message = `${level.emoji} [${componentName}] ${log.msg || ''}`;
          
          // Output with timestamp prefix
          console.log(`${timestamp} ${message}`);
          
        } catch (error) {
          // Raw fallback
          console.log(chunk);
        }
      }
    };
  }
};