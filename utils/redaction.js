/**
 * Redaction utility functions for sensitive data protection
 * Used by browser, CLI, and server formatters
 */

/**
 * Check if a key should be redacted based on patterns
 * @param {string} key - Key to check
 * @param {string[]} paths - Array of patterns (exact match or wildcard like *key)
 * @returns {boolean} Whether key should be redacted
 */
export function shouldRedactKey(key, paths) {
  return paths.some(pattern => {
    if (pattern.startsWith('*')) {
      const suffix = pattern.slice(1).toLowerCase();
      return key.toLowerCase().endsWith(suffix);
    }
    return key.toLowerCase() === pattern.toLowerCase();
  });
}

/**
 * Redact sensitive values from an object based on key patterns
 * @param {*} value - Value to redact (object, array, or primitive)
 * @param {Object} redactConfig - Redaction configuration with paths and censor
 * @returns {*} Redacted value
 */
export function redactValue(value, redactConfig) {
  if (!redactConfig || !redactConfig.paths || redactConfig.paths.length === 0) {
    return value;
  }

  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const redacted = {};
    for (const [key, val] of Object.entries(value)) {
      if (shouldRedactKey(key, redactConfig.paths)) {
        redacted[key] = redactConfig.censor || '[REDACTED]';
      } else {
        redacted[key] = redactValue(val, redactConfig);
      }
    }
    return redacted;
  }

  if (Array.isArray(value)) {
    return value.map(item => redactValue(item, redactConfig));
  }

  return value;
}

