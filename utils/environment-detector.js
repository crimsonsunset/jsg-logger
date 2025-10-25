/**
 * Environment Detection Utilities
 * Smart detection of browser, CLI, and server environments
 */

// Store forced environment override
let forcedEnvironment = null;

/**
 * Force environment detection to a specific value
 * @param {'browser'|'cli'|'server'|null} env - Environment to force, or null to reset
 */
export const forceEnvironment = (env) => {
  if (env !== null && !['browser', 'cli', 'server'].includes(env)) {
    console.warn(`[JSG-LOGGER] Invalid environment "${env}". Must be 'browser', 'cli', 'server', or null.`);
    return;
  }
  forcedEnvironment = env;
};

/**
 * Check if running in browser environment
 * @returns {boolean}
 */
export const isBrowser = () => {
  if (forcedEnvironment) return forcedEnvironment === 'browser';
  return typeof window !== 'undefined' && typeof document !== 'undefined';
};

/**
 * Check if running in CLI/terminal environment
 * Enhanced detection for various terminal contexts
 * @returns {boolean}
 */
export const isCLI = () => {
  if (forcedEnvironment) return forcedEnvironment === 'cli';
  
  if (typeof process === 'undefined') return false;
  
  // Check multiple signals for TTY/terminal environment
  const hasTTY = process.stdout?.isTTY || process.stderr?.isTTY;
  const hasTermEnv = process.env.TERM || process.env.COLORTERM;
  const notCI = !process.env.CI && !process.env.GITHUB_ACTIONS;
  
  // Consider it CLI if:
  // 1. Has TTY (traditional check)
  // 2. Has TERM/COLORTERM environment variables (terminal detected)
  // 3. Not running in CI/automation environment
  return hasTTY || (hasTermEnv && notCI);
};

/**
 * Check if running in server/production environment
 * @returns {boolean}
 */
export const isServer = () => {
  if (forcedEnvironment) return forcedEnvironment === 'server';
  return !isBrowser() && !isCLI();
};

/**
 * Get current environment type
 * @returns {'browser'|'cli'|'server'}
 */
export const getEnvironment = () => {
  if (forcedEnvironment) return forcedEnvironment;
  if (isBrowser()) return 'browser';
  if (isCLI()) return 'cli';
  return 'server';
};