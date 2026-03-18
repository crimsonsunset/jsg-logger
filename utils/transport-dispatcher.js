/**
 * Transport Dispatcher for JSG Logger
 * Builds log entries and dispatches them to registered transports.
 * Transports are consumer-provided objects implementing the LogTransport interface.
 */

import { metaError } from './meta-logger.js';

const LEVEL_NAMES = {
    10: 'trace',
    20: 'debug',
    30: 'info',
    40: 'warn',
    50: 'error',
    60: 'fatal',
};

const LEVEL_NUMS = {
    trace: 10,
    debug: 20,
    info: 30,
    warn: 40,
    error: 50,
    fatal: 60,
};

/**
 * Extract an Error instance from log data if one is present.
 * Checks the value itself, then common keys: `err`, `error`.
 * @param {*} data - The data argument passed to the log method
 * @returns {Error|undefined}
 */
function extractError(data) {
    if (data instanceof Error) return data;
    if (data && typeof data === 'object') {
        if (data.err instanceof Error) return data.err;
        if (data.error instanceof Error) return data.error;
    }
    return undefined;
}

/**
 * Build a structured LogEntry from raw log call arguments.
 * @param {string} level - Level name ('info', 'warn', 'error', etc.)
 * @param {number} levelNum - Numeric level (10–60)
 * @param {string} component - Component name
 * @param {string} message - Log message
 * @param {Record<string, unknown>} [data] - Optional context/data object
 * @returns {Object} LogEntry
 */
export function buildLogEntry(level, levelNum, component, message, data) {
    return {
        level,
        levelNum,
        message: message ?? '',
        component,
        data,
        timestamp: Date.now(),
        isError: levelNum >= 50,
        error: extractError(data),
    };
}

/**
 * Dispatch a LogEntry to all registered transports.
 * Each transport is called independently — a failing transport never
 * blocks or crashes the others (or the app).
 * @param {Object} entry - LogEntry object
 * @param {Array} transports - Array of LogTransport instances
 */
export function dispatchToTransports(entry, transports) {
    if (!transports || transports.length === 0) return;

    const entryLevelNum = entry.levelNum;

    for (const transport of transports) {
        try {
            const minLevel = transport.level ? (LEVEL_NUMS[transport.level] ?? 0) : 0;
            if (entryLevelNum < minLevel) continue;

            transport.send(entry);
        } catch (err) {
            metaError('[JSG-LOGGER] Transport dispatch error:', err);
        }
    }
}
