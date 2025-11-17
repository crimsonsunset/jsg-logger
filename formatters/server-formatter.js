/**
 * Server/Production Formatter for JSG Logger
 * Structured JSON output for production logging and log aggregation
 */

import {configManager} from '../config/config-manager.js';

/**
 * Create server formatter (structured JSON)
 * @returns {null} No custom formatter - uses Pino's default JSON output
 */
export const createServerFormatter = () => {
  // Server environments use default Pino JSON output
  // This provides structured logs suitable for log aggregation systems
  return null;
};

/**
 * Server-specific configuration
 * @returns {Object} Pino configuration for server environments
 */
export const getServerConfig = () => {
  const redactConfig = configManager.getRedactConfig();
  
  return {
    level: 'info', // More conservative logging in production
    formatters: {
      // Ensure consistent timestamp format
      time: () => `,"time":"${new Date().toISOString()}"`,
      
      // Add environment context
      bindings: (bindings) => {
        return {
          pid: bindings.pid,
          hostname: bindings.hostname,
          environment: 'server'
        };
      }
    },
    // Redact sensitive information in production (configurable)
    redact: {
      paths: redactConfig.paths.length > 0 ? redactConfig.paths : ['password', 'token', 'key', 'secret'],
      censor: redactConfig.censor || '[REDACTED]'
    }
  };
};