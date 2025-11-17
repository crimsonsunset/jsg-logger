/**
 * JSG Portable Logger System
 * Main entry point for the smart adaptive logging system
 */

import pino from 'pino';
import {configManager} from './config/config-manager.js';
import {COMPONENT_SCHEME} from './config/component-schemes.js';
import defaultConfig from './config/default-config.json' with {type: 'json'};
import {forceEnvironment, getEnvironment, isBrowser, isCLI} from './utils/environment-detector.js';
import {createBrowserFormatter} from './formatters/browser-formatter.js';
import {createCLIFormatter} from './formatters/cli-formatter.js';
import {createServerFormatter, getServerConfig} from './formatters/server-formatter.js';
import {LogStore} from './stores/log-store.js';
import {metaLog, metaWarn, metaError} from './utils/meta-logger.js';
import packageJson from './package.json' with {type: 'json'};

// Check default config for devtools at module load time
// This allows bundlers to tree-shake if disabled
const defaultDevtoolsEnabled = defaultConfig.devtools?.enabled ?? false;

// Conditional static import - bundlers can eliminate if condition is false
// If defaultDevtoolsEnabled is false, bundler removes this entire block
// Use lazy initialization to avoid top-level await (which would make module async)
let devtoolsModule = null;
let devtoolsModulePromise = null;
if (defaultDevtoolsEnabled) {
    metaLog('[JSG-LOGGER] DevTools module pre-loading started (default config enabled)');
    // Start loading immediately but don't await (non-blocking)
    // Bundlers can still analyze this static import for tree-shaking
    devtoolsModulePromise = import('@crimsonsunset/jsg-logger/devtools').then(module => {
        devtoolsModule = module;
        metaLog('[JSG-LOGGER] DevTools module pre-loaded successfully');
        return module;
    }).catch(error => {
        metaError('[JSG-LOGGER] DevTools module pre-load failed:', error);
        return null;
    });
} else {
    metaLog('[JSG-LOGGER] DevTools module NOT pre-loaded (default config disabled - will tree-shake)');
}

/**
 * Main Logger Class
 * Manages logger instances and provides the public API
 */
class JSGLogger {
    // Static singleton instance
    static _instance = null;
    static _enhancedLoggers = null;
    static _hasLoggedInitialization = false;
    static _initLock = false; // Lock to prevent concurrent initializations

    constructor() {
        this.loggers = {};
        this.logStore = new LogStore();
        this.environment = null; // Will be set after config loads
        this.initialized = false;
        this.components = {}; // Auto-discovery getters
        this.componentSubscribers = []; // Subscribers for component change events
    }

    /**
     * Get singleton instance with auto-initialization
     * @param {Object} options - Initialization options (only used on first call)
     * @returns {Promise<Object>} Enhanced logger exports with controls API
     */
    static async getInstance(options = {}) {
        const hasOptions = options && Object.keys(options).length > 0;

        if (!JSGLogger._instance) {
            // First time initialization
            JSGLogger._instance = new JSGLogger();
            JSGLogger._enhancedLoggers = await JSGLogger._instance.init(options);
            
            // Make runtime controls available globally in browser for debugging
            if (isBrowser() && typeof window !== 'undefined' && JSGLogger._enhancedLoggers?.controls) {
                window.JSG_Logger = JSGLogger._enhancedLoggers.controls;
                window.__JSG_Logger_Enhanced__ = JSGLogger._enhancedLoggers;
            }
        } else if (hasOptions) {
            // Instance exists but new options provided - reinitialize
            JSGLogger._enhancedLoggers = await JSGLogger._instance.init(options);
            
            // Make runtime controls available globally in browser for debugging
            // (same as getInstanceSync behavior)
            if (isBrowser() && typeof window !== 'undefined' && JSGLogger._enhancedLoggers?.controls) {
                window.JSG_Logger = JSGLogger._enhancedLoggers.controls;
                window.__JSG_Logger_Enhanced__ = JSGLogger._enhancedLoggers;
            }
        }

        return JSGLogger._enhancedLoggers;
    }

    /**
     * Get singleton instance synchronously (for environments without async support)
     * Checks window.JSG_Logger first to ensure singleton works across separate bundles
     * @param {Object} options - Initialization options (only used on first call)
     * @returns {Object} Enhanced logger exports with controls API
     */
    static getInstanceSync(options = {}) {
        const hasOptions = options && Object.keys(options).length > 0;
        
        // If options are provided, we need to reinitialize even if global instance exists
        // This ensures config changes (like devtools.enabled) are applied
        if (hasOptions) {
            // Reinitialize with new options - this will update the global references
            if (!JSGLogger._instance) {
                JSGLogger._instance = new JSGLogger();
            }
            JSGLogger._enhancedLoggers = JSGLogger._instance.initSync(options);
            
            // Update global references after reinitialization
            if (isBrowser() && typeof window !== 'undefined' && JSGLogger._enhancedLoggers?.controls) {
                window.JSG_Logger = JSGLogger._enhancedLoggers.controls;
                window.__JSG_Logger_Enhanced__ = JSGLogger._enhancedLoggers;
            }
            
            return JSGLogger._enhancedLoggers;
        }
        
        // No options provided - check window.JSG_Logger first to ensure singleton works across bundles
        // This is critical when devtools bundle loads separately from main app
        if (isBrowser() && typeof window !== 'undefined' && window.JSG_Logger) {
            // If enhanced loggers reference exists, use it (preferred)
            if (window.__JSG_Logger_Enhanced__) {
                return window.__JSG_Logger_Enhanced__;
            }
            // Fallback: reconstruct enhanced loggers from controls object
            // This handles cases where __JSG_Logger_Enhanced__ wasn't set
            const globalControls = window.JSG_Logger;
            return {
                ...globalControls,
                controls: globalControls,
                getComponent: globalControls.getComponent,
                getInstanceSync: JSGLogger.getInstanceSync.bind(JSGLogger),
                getInstance: JSGLogger.getInstance.bind(JSGLogger),
                logPerformance: JSGLogger.logPerformance.bind(JSGLogger),
                JSGLogger: JSGLogger
            };
        }

        // No options and no global instance - first time initialization
        if (!JSGLogger._instance) {
            JSGLogger._instance = new JSGLogger();
            JSGLogger._enhancedLoggers = JSGLogger._instance.initSync(options);
            
            // Make runtime controls available globally in browser for debugging
            if (isBrowser() && typeof window !== 'undefined' && JSGLogger._enhancedLoggers?.controls) {
                window.JSG_Logger = JSGLogger._enhancedLoggers.controls;
                window.__JSG_Logger_Enhanced__ = JSGLogger._enhancedLoggers;
            }
        }

        return JSGLogger._enhancedLoggers;
    }

    /**
     * Initialize the logger system
     * @param {Object} options - Initialization options
     * @returns {Promise<Object>} Logger instance with all components
     */
    async init(options = {}) {
        try {
            // Track if this is a reinitialization (already initialized)
            const isReinit = this.initialized;
            
            // CRITICAL: Use global window flag to coordinate across bundled instances
            const globalInitFlag = typeof window !== 'undefined' 
                ? (window.__JSG_LOGGER_INITIALIZED__ = window.__JSG_LOGGER_INITIALIZED__ || false)
                : false;
            
            // Check both static flag and global flag
            const shouldLogInit = !JSGLogger._hasLoggedInitialization && !globalInitFlag && !isReinit;
            
            metaLog('[JSG-LOGGER] Initializing logger...', options.configPath ? `configPath: ${options.configPath}` : options.config ? 'inline config provided' : 'using defaults');
            
            // Load configuration FIRST (before environment detection)
            if (options.configPath || options.config) {
                await configManager.loadConfig(options.configPath || options.config);
            } else if (options) {
                // Support inline config passed as options
                await configManager.loadConfig(options);
            }

            // Apply forceEnvironment if specified in config
            if (configManager.config.forceEnvironment) {
                forceEnvironment(configManager.config.forceEnvironment);
            }

            // NOW determine environment (after config is loaded and forceEnvironment is applied)
            this.environment = getEnvironment();

            // Create loggers for all available components
            const components = configManager.getAvailableComponents();

            components.forEach(componentName => {
                this.loggers[componentName] = this.createLogger(componentName);
            });

            // Create legacy compatibility aliases
            // Removed: camelCase aliases no longer added to this.loggers
            // Use logger.components.camelCase() or logger.getComponent('kebab-case') instead
            // this.createAliases();

            // Add utility methods
            this.addUtilityMethods();

            // Create auto-discovery getters (eager)
            this._createAutoDiscoveryGetters();

            this.initialized = true;

            // Log initialization success (only on first initialization)
            // Double-check both flags here in case another call set it while we were initializing
            const finalCheck = shouldLogInit && 
                               !JSGLogger._hasLoggedInitialization && 
                               !(typeof window !== 'undefined' && window.__JSG_LOGGER_INITIALIZED__) &&
                               this.loggers.core;
            
            if (finalCheck) {
                this.loggers.core.info('JSG Logger initialized', {
                    version: packageJson.version,
                    environment: this.environment,
                    components: components.length,
                    projectName: configManager.getProjectName(),
                    configPaths: configManager.loadedPaths,
                    fileOverrides: Object.keys(configManager.config.fileOverrides || {}).length
                });
                // Set both static flag and global flag immediately after logging
                JSGLogger._hasLoggedInitialization = true;
                if (typeof window !== 'undefined') {
                    window.__JSG_LOGGER_INITIALIZED__ = true;
                }
            }

            return this.getLoggerExports();
        } catch (error) {
            // Try to use actual logger if partially initialized, otherwise fallback to console
            if (this.loggers?.core) {
                this.loggers.core.error('JSG Logger initialization failed:', error);
            } else {
                console.error('JSG Logger initialization failed:', error);
            }
            // Return minimal fallback logger
            return this.createFallbackLogger();
        }
    }

    /**
     * Initialize synchronously with default configuration
     * @param {Object} options - Initialization options
     * @returns {Object} Logger instance with all components
     */
    initSync(options = {}) {
        try {
            // Track if this is a reinitialization (already initialized)
            const isReinit = this.initialized;
            
            // CRITICAL: Use global window flag to coordinate across bundled instances
            // This handles cases where jsg-stylizer bundles its own copy of the logger
            const globalInitFlag = typeof window !== 'undefined' 
                ? (window.__JSG_LOGGER_INITIALIZED__ = window.__JSG_LOGGER_INITIALIZED__ || false)
                : false;
            
            // CRITICAL: Use lock + flag to prevent race conditions
            // If another call is already initializing, wait for it to complete
            // This ensures only the first call logs, even if multiple calls happen simultaneously
            if (!isReinit && JSGLogger._initLock) {
                // Another initialization is in progress, skip this one
                // Return existing instance if available, otherwise wait briefly
                if (JSGLogger._enhancedLoggers) {
                    return JSGLogger._enhancedLoggers;
                }
            }
            
            // Set lock if this is first initialization
            if (!isReinit && !JSGLogger._hasLoggedInitialization && !globalInitFlag) {
                JSGLogger._initLock = true;
            }
            
            // Check both static flag and global flag
            const shouldLogInit = !JSGLogger._hasLoggedInitialization && !globalInitFlag && !isReinit;
            
            // Load inline config if provided (sync loading for objects)
            if (options && Object.keys(options).length > 0) {
                // Reset to default config for clean reinitialization
                // This ensures each reinit starts from a known state
                configManager.config = {...defaultConfig};

                // Normalize the inline config first
                const normalizedOptions = configManager._normalizeConfigStructure(options);
                // Merge inline config with default config
                configManager.config = configManager.mergeConfigs(configManager.config, normalizedOptions);
            }

            // Apply forceEnvironment if specified in config
            if (configManager.config.forceEnvironment) {
                forceEnvironment(configManager.config.forceEnvironment);
            }

            // NOW determine environment (after config is loaded and forceEnvironment is applied)
            this.environment = getEnvironment();

            // Clear existing loggers for clean reinitialization
            this.loggers = {};
            this.components = {};

            // Create loggers for all available components using default config
            const components = configManager.getAvailableComponents();

            components.forEach(componentName => {
                // Use original createLogger to bypass utility method caching
                const createFn = this._createLoggerOriginal || this.createLogger.bind(this);
                this.loggers[componentName] = createFn(componentName);
            });

            // Create legacy compatibility aliases
            // Removed: camelCase aliases no longer added to this.loggers
            // Use logger.components.camelCase() or logger.getComponent('kebab-case') instead
            // this.createAliases();

            // Add utility methods
            this.addUtilityMethods();

            // Create auto-discovery getters (eager)
            this._createAutoDiscoveryGetters();
            
            // Notify component subscribers after reinitialization (if components changed)
            // This ensures panel sees components created during reinit, not just via getComponent()
            if (this.componentSubscribers.length > 0) {
                const currentComponents = Object.keys(this.loggers);
                this.componentSubscribers.forEach(callback => {
                    try {
                        callback(currentComponents);
                    } catch (error) {
                        metaError('Component subscriber error:', error);
                    }
                });
            }

            this.initialized = true;

            // Log initialization success (only on first initialization, not on reinit)
            // This prevents duplicate logs when multiple libraries call getInstanceSync
            // Double-check both flags here in case another call set it while we were initializing
            const finalCheck = shouldLogInit && 
                               !JSGLogger._hasLoggedInitialization && 
                               !(typeof window !== 'undefined' && window.__JSG_LOGGER_INITIALIZED__) &&
                               this.loggers.core;
            
            if (finalCheck) {
                this.loggers.core.info('JSG Logger initialized (sync)', {
                    version: packageJson.version,
                    environment: this.environment,
                    components: components.length,
                    projectName: configManager.getProjectName(),
                    fileOverrides: Object.keys(configManager.config.fileOverrides || {}).length,
                    timestampMode: configManager.getTimestampMode()
                });
                // Set both static flag and global flag immediately after logging
                JSGLogger._hasLoggedInitialization = true;
                if (typeof window !== 'undefined') {
                    window.__JSG_LOGGER_INITIALIZED__ = true;
                }
            }
            
            // Release lock after initialization completes
            if (JSGLogger._initLock) {
                JSGLogger._initLock = false;
            }

            return this.getLoggerExports();
        } catch (error) {
            // Try to use actual logger if partially initialized, otherwise fallback to console
            if (this.loggers?.core) {
                this.loggers.core.error('JSG Logger sync initialization failed:', error);
            } else {
                console.error('JSG Logger sync initialization failed:', error);
            }
            // Return minimal fallback logger
            return this.createFallbackLogger();
        }
    }

    /**
     * Create a logger for a specific component
     * @param {string} componentName - Component identifier
     * @returns {Object} Pino logger instance
     */
    createLogger(componentName) {
        const component = configManager.getComponentConfig(componentName);

        let stream;
        let config = {
            name: componentName,
            level: configManager.getEffectiveLevel(componentName) // Use smart level resolution
        };

        if (isBrowser()) {
            // Browser environment - bypass Pino, use direct console formatting
            return this.createDirectBrowserLogger(componentName);
        } else if (isCLI()) {
            // CLI environment - use pino-colada or pino-pretty
            stream = createCLIFormatter();
        } else {
            // Server/production environment - structured JSON
            stream = createServerFormatter();
            config = {...config, ...getServerConfig()};
        }

        const logger = stream ? pino(config, stream) : pino(config);

        // Add component emoji to logger for easy identification
        logger._componentEmoji = component.emoji;
        logger._componentName = component.name;
        logger._effectiveLevel = configManager.getEffectiveLevel(componentName);

        // Wrap pino logger to support (message, context) syntax
        const wrappedLogger = this._wrapPinoLogger(logger);

        return wrappedLogger;
    }

    /**
     * Wrap Pino logger to support (message, context) syntax
     * Transforms calls from logger.info('msg', {ctx}) to pino's logger.info({ctx}, 'msg')
     * @param {Object} pinoLogger - Original pino logger instance
     * @returns {Object} Wrapped logger with enhanced syntax
     * @private
     */
    _wrapPinoLogger(pinoLogger) {
        const levels = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];
        const wrapped = {};

        levels.forEach(level => {
            wrapped[level] = (first, ...args) => {
                // Handle different argument patterns
                if (typeof first === 'string') {
                    // Pattern: logger.info('message', {context})
                    const message = first;
                    if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null) {
                        // Has context object
                        pinoLogger[level](args[0], message);
                    } else {
                        // Just message
                        pinoLogger[level](message);
                    }
                } else if (typeof first === 'object' && first !== null) {
                    // Pattern: logger.info({context}, 'message') - already pino format
                    pinoLogger[level](first, ...args);
                } else {
                    // Fallback: just pass through
                    pinoLogger[level](first, ...args);
                }
            };
        });

        // Copy over all other properties from original logger
        Object.keys(pinoLogger).forEach(key => {
            if (!wrapped[key]) {
                wrapped[key] = pinoLogger[key];
            }
        });

        return wrapped;
    }

    /**
     * Create component aliases (for camelCase/kebab-case compatibility)
     * @private
     */
    createAliases() {
        // Auto-generate camelCase aliases for kebab-case component names
        Object.keys(this.loggers).forEach(componentName => {
            if (componentName.includes('-')) {
                const camelCase = componentName.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
                this.loggers[camelCase] = this.loggers[componentName];
            }
        });
    }

    /**
     * Add utility methods to the logger exports
     * @private
     */
    addUtilityMethods() {
        // Store reference to original createLogger before overriding
        const originalCreateLogger = this.createLogger.bind(this);

        // Create logger on demand (reuses existing loggers)
        this.createLogger = (componentName) => {
            if (!this.loggers[componentName]) {
                this.loggers[componentName] = originalCreateLogger(componentName);
            }
            return this.loggers[componentName];
        };

        // Store the original for internal use
        this._createLoggerOriginal = originalCreateLogger;
    }

    /**
     * Get the object to export with all loggers and utilities
     * @returns {Object} Complete logger exports
     */
    getLoggerExports() {
        return {
            // All component loggers
            ...this.loggers,

            // Auto-discovery convenience getters (kebab-case and camelCase)
            components: this.components,

            // Component getter with error handling
            getComponent: (componentName) => this.getComponent(componentName),

            // Utility methods
            createLogger: (componentName) => {
                if (!this.loggers[componentName]) {
                    this.loggers[componentName] = this.createLogger(componentName);
                }
                return this.loggers[componentName];
            },

            // Configuration and debugging
            config: {
                environment: this.environment,
                components: COMPONENT_SCHEME,
                summary: configManager.getSummary()
            },

            // Expose config manager for runtime configuration
            configManager: configManager,

            // Log store for popup/debugging
            logStore: this.logStore,

            // Enhanced runtime controls with all new features
            controls: {
                // Level controls
                setLevel: (component, level) => {
                    if (this.loggers[component]) {
                        this.loggers[component].level = level;
                        this.loggers[component]._effectiveLevel = level;
                    }
                },
                getLevel: (component) => {
                    return this.loggers[component]?._effectiveLevel;
                },

                // Component controls
                listComponents: () => Object.keys(this.loggers),
                subscribeToComponents: (callback) => {
                    this.componentSubscribers.push(callback);
                    // Immediately call callback with current component list (don't wait for changes)
                    // This ensures panel sees components created during reinitialization
                    const currentComponents = Object.keys(this.loggers);
                    try {
                        callback(currentComponents);
                    } catch (error) {
                        this.loggers.core?.error('Component subscriber error (initial call):', error);
                    }
                    // Return unsubscribe function
                    return () => {
                        const index = this.componentSubscribers.indexOf(callback);
                        if (index > -1) {
                            this.componentSubscribers.splice(index, 1);
                        }
                    };
                },
                enableDebugMode: () => {
                    Object.keys(this.loggers).forEach(component => {
                        if (this.loggers[component]) {
                            this.loggers[component].level = 'debug';
                            this.loggers[component]._effectiveLevel = 'debug';
                        }
                    });
                },
                enableTraceMode: () => {
                    Object.keys(this.loggers).forEach(component => {
                        if (this.loggers[component]) {
                            this.loggers[component].level = 'trace';
                            this.loggers[component]._effectiveLevel = 'trace';
                        }
                    });
                },

                // File override controls
                addFileOverride: (filePath, overrideConfig) => {
                    configManager.addFileOverride(filePath, overrideConfig);
                    // Refresh affected loggers
                    this.refreshLoggers();
                },
                removeFileOverride: (filePath) => {
                    if (configManager.config.fileOverrides) {
                        delete configManager.config.fileOverrides[filePath];
                        this.refreshLoggers();
                    }
                },
                listFileOverrides: () => {
                    return Object.keys(configManager.config.fileOverrides || {});
                },

                // Timestamp controls
                setTimestampMode: (mode) => {
                    configManager.config.timestampMode = mode;
                },
                getTimestampMode: () => {
                    return configManager.getTimestampMode();
                },
                getTimestampModes: () => {
                    return ['absolute', 'readable', 'relative', 'disable'];
                },

                // Display controls
                setDisplayOption: (option, enabled) => {
                    if (!configManager.config.display) {
                        configManager.config.display = {};
                    }
                    configManager.config.display[option] = enabled;
                },
                getDisplayConfig: () => {
                    return configManager.getDisplayConfig();
                },
                toggleDisplayOption: (option) => {
                    const current = configManager.getDisplayConfig();
                    this.controls.setDisplayOption(option, !current[option]);
                },

                // Statistics and debugging
                getStats: () => this.logStore.getStats(),
                subscribe: (callback) => this.logStore.subscribe(callback),
                clearLogs: () => this.logStore.clear(),
                getConfigSummary: () => configManager.getSummary(),

                // Advanced configuration
                setComponentLevel: (component, level) => {
                    if (!configManager.config.components[component]) {
                        configManager.config.components[component] = {};
                    }
                    configManager.config.components[component].level = level;
                    this.refreshLoggers();
                },
                getComponentLevel: (component) => {
                    return configManager.config.components?.[component]?.level;
                },

                // Component logger access
                getComponent: (componentName) => this.getComponent(componentName),

                // DevTools panel controls
                enableDevPanel: async () => {
                    const devtoolsLogger = this.getComponent('devtools-ui');
                    
                    // Early config check - uses consumer's runtime config
                    const runtimeDevtoolsEnabled = configManager.config.devtools?.enabled ?? false;
                    
                    devtoolsLogger.info('enableDevPanel() called', {
                        runtimeConfig: runtimeDevtoolsEnabled ? 'ENABLED' : 'DISABLED'
                    });
                    
                    if (!runtimeDevtoolsEnabled) {
                        devtoolsLogger.warn('DevTools disabled via config. Set devtools.enabled: true to enable.');
                        return null;
                    }

                    if (typeof window === 'undefined') {
                        devtoolsLogger.warn('DevTools panel only available in browser environments');
                        return null;
                    }

                    try {
                        // Use pre-loaded module (from default config) or load dynamically (consumer's runtime config override)
                        if (!devtoolsModule) {
                            // Check if we have a promise for pre-loading
                            if (devtoolsModulePromise) {
                                devtoolsLogger.info('Waiting for pre-loaded DevTools module...');
                                // Wait for pre-load to complete
                                devtoolsModule = await devtoolsModulePromise;
                            } else {
                                // Runtime config override: consumer enabled devtools but default was disabled
                                // Load on demand via dynamic import
                                devtoolsLogger.info('Loading DevTools module dynamically (runtime config override)...');
                                devtoolsModule = await import('@crimsonsunset/jsg-logger/devtools');
                            }
                        } else {
                            devtoolsLogger.info('Using pre-loaded DevTools module');
                        }
                        
                        if (!devtoolsModule || !devtoolsModule.initializePanel) {
                            throw new Error('DevTools panel module missing initializePanel export');
                        }
                        
                        devtoolsLogger.info('Initializing DevTools panel...');
                        const panel = devtoolsModule.initializePanel();
                        devtoolsLogger.info('DevTools panel initialized successfully');
                        return panel;
                    } catch (error) {
                        devtoolsLogger.error('Failed to load DevTools panel', { error: error.message, stack: error.stack });
                        devtoolsLogger.error('If using npm link, ensure Vite config has: server.fs.allow: [\'..\']');
                        return null;
                    }
                },

                disableDevPanel: () => {
                    const devtoolsLogger = this.getComponent('devtools-ui');
                    
                    if (typeof window !== 'undefined' && window.JSG_DevTools?.destroy) {
                        window.JSG_DevTools.destroy();
                        devtoolsLogger.info('DevTools panel disabled and destroyed');
                        return true;
                    }
                    devtoolsLogger.warn('DevTools panel not loaded or already destroyed');
                    return false;
                },

                // Project info
                getProjectName: () => configManager.config.projectName || 'JSG Logger',

                // System controls
                refresh: () => this.refreshLoggers(),
                reset: () => {
                    configManager.config = {...defaultConfig};
                    this.refreshLoggers();
                }
            }
        };
    }

    /**
     * Create a direct browser logger that bypasses Pino for full control
     * @param {string} componentName - Component identifier
     * @returns {Object} Logger-like object with standard methods
     * @private
     */
    createDirectBrowserLogger(componentName) {
        const formatter = createBrowserFormatter(componentName, this.logStore);
        const levels = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];
        const levelMap = {trace: 10, debug: 20, info: 30, warn: 40, error: 50, fatal: 60};

        const logger = {};

        levels.forEach(level => {
            logger[level] = (first, ...args) => {
                const logLevel = levelMap[level];

                // Check if level should be logged
                const effectiveLevel = configManager.getEffectiveLevel(componentName);
                const minLevel = levelMap[effectiveLevel] || 30;
                if (logLevel < minLevel) return;

                // Create log data object
                let logData = {
                    level: logLevel,
                    time: Date.now(),
                    name: componentName,
                    v: 1
                };

                // Handle different argument patterns
                if (typeof first === 'string') {
                    logData.msg = first;
                    // Add additional args as context
                    if (args.length === 1 && typeof args[0] === 'object') {
                        Object.assign(logData, args[0]);
                    } else if (args.length > 0) {
                        logData.args = args;
                    }
                } else if (typeof first === 'object') {
                    Object.assign(logData, first);
                    if (args.length > 0 && typeof args[0] === 'string') {
                        logData.msg = args[0];
                    }
                }

                // Use our beautiful formatter
                formatter.write(JSON.stringify(logData));
            };
        });

        // Add Pino-compatible properties
        logger._componentEmoji = configManager.getComponentConfig(componentName).emoji;
        logger._componentName = componentName;
        logger._effectiveLevel = configManager.getEffectiveLevel(componentName);
        logger.level = configManager.getEffectiveLevel(componentName);

        return logger;
    }

    /**
     * Refresh all loggers with updated configuration
     * @private
     */
    refreshLoggers() {
        Object.keys(this.loggers).forEach(componentName => {
            this.loggers[componentName] = this.createLogger(componentName);
        });
    }

    /**
     * Create fallback logger for error scenarios
     * @private
     */
    createFallbackLogger() {
        const fallback = {
            info: console.log,
            debug: console.log,
            trace: console.log,
            warn: console.warn,
            error: console.error,
            fatal: console.error
        };

        return {
            core: fallback,
            createLogger: () => fallback,
            config: {environment: 'fallback'},
            logStore: {getRecent: () => [], clear: () => {}},
            controls: {
                setLevel: () => {},
                getLevel: () => 'info',
                listComponents: () => [],
                enableDebugMode: () => {},
                getStats: () => ({total: 0})
            }
        };
    }

    /**
     * Create auto-discovery getters for easy component access
     * Supports both kebab-case (original) and camelCase naming
     * @private
     */
    _createAutoDiscoveryGetters() {
        this.components = {};

        Object.keys(this.loggers).forEach(name => {
            // Original kebab-case name
            this.components[name] = () => this.getComponent(name);

            // camelCase convenience getter
            const camelName = name.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
            if (camelName !== name) {
                this.components[camelName] = () => this.getComponent(name);
            }
        });
    }

    /**
     * Get a specific component logger with auto-creation for custom components
     * @param {string} componentName - Component name to retrieve
     * @returns {Object} Logger instance (auto-created if needed)
     */
    getComponent(componentName) {
        // If logger doesn't exist, auto-create it for custom components
        if (!this.loggers[componentName]) {
            // Check if this is a configured component or custom component
            const hasConfig = configManager.config.components?.[componentName];
            const hasScheme = COMPONENT_SCHEME[componentName];

            if (!hasConfig && !hasScheme) {
                // Custom component - log info and auto-create
                if (this.loggers.core) {
                    this.loggers.core.debug(`Auto-creating custom component logger: ${componentName}`);
                }
            }

            // Create the logger (getComponentConfig will auto-generate config for custom components)
            this.loggers[componentName] = this.createLogger(componentName);

            // Also add to auto-discovery getters
            this.components[componentName] = () => this.getComponent(componentName);
            const camelName = componentName.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
            if (camelName !== componentName) {
                this.components[camelName] = () => this.getComponent(componentName);
            }

            // Notify component subscribers of the change (emit on every add, not deduplicated)
            // TODO: Add component removal notification support (future enhancement)
            const currentComponents = Object.keys(this.loggers);
            if (this.componentSubscribers.length > 0) {
                if (this.loggers.core) {
                    this.loggers.core.debug(`Notifying ${this.componentSubscribers.length} subscribers of component change`, { 
                        component: componentName, 
                        totalComponents: currentComponents.length,
                        components: currentComponents 
                    });
                }
            }
            this.componentSubscribers.forEach(callback => {
                try {
                    callback(currentComponents);
                } catch (error) {
                    this.loggers.core?.error('Component subscriber error:', error);
                }
            });
        }

        return this.loggers[componentName];
    }

    /**
     * Create error-context logger that doesn't break the app
     * @param {string} componentName - Name of the missing component
     * @returns {Object} Logger with error context in all messages
     * @private
     */
    _createErrorLogger(componentName) {
        const prefix = `[${componentName.toUpperCase()}]`;
        const errorMsg = '⚠️ Component not configured -';

        return {
            trace: (msg, ...args) => console.log(`${prefix} ${errorMsg}`, msg, ...args),
            debug: (msg, ...args) => console.log(`${prefix} ${errorMsg}`, msg, ...args),
            info: (msg, ...args) => console.info(`${prefix} ${errorMsg}`, msg, ...args),
            warn: (msg, ...args) => console.warn(`${prefix} ${errorMsg}`, msg, ...args),
            error: (msg, ...args) => console.error(`${prefix} ${errorMsg}`, msg, ...args),
            fatal: (msg, ...args) => console.error(`${prefix} ${errorMsg}`, msg, ...args)
        };
    }

    /**
     * Static utility for performance logging with auto-getInstance
     * @param {string} operation - Description of the operation being measured
     * @param {number} startTime - Start time from performance.now()
     * @param {string} component - Component name for logging (defaults to 'performance')
     * @returns {number} Duration in milliseconds
     */
    static async logPerformance(operation, startTime, component = 'performance') {
        try {
            const instance = await JSGLogger.getInstance();
            const logger = instance.getComponent(component);
            const duration = performance.now() - startTime;

            if (duration > 1000) {
                logger.warn(`${operation} took ${duration.toFixed(2)}ms (slow)`);
            } else if (duration > 100) {
                logger.info(`${operation} took ${duration.toFixed(2)}ms`);
            } else {
                logger.debug(`${operation} took ${duration.toFixed(2)}ms (fast)`);
            }

            return duration;
        } catch (error) {
            // Fallback to console if logger fails
            const duration = performance.now() - startTime;
            console.log(`[${component.toUpperCase()}] ${operation} took ${duration.toFixed(2)}ms`);
            return duration;
        }
    }

    /**
     * Get singleton controls without triggering initialization
     * Checks window.JSG_Logger first to ensure singleton works across separate bundles
     * Returns the controls object from the current singleton instance if it exists
     * @returns {Object|null} Controls object or null if singleton not initialized
     */
    static getControls() {
        // Check window.JSG_Logger first to ensure singleton works across bundles
        // This is critical when devtools bundle loads separately from main app
        if (isBrowser() && typeof window !== 'undefined' && window.JSG_Logger) {
            return window.JSG_Logger;
        }
        
        // Fall back to local instance if global doesn't exist
        return JSGLogger._enhancedLoggers?.controls || null;
    }
}

// Initialize synchronously with default config for immediate use
// (Chrome extensions and other environments that don't support top-level await)
const enhancedLoggers = JSGLogger.getInstanceSync();

// Make runtime controls available globally in browser for debugging
// Also store enhanced loggers reference so getInstanceSync() can access it across bundles
if (isBrowser() && typeof window !== 'undefined') {
    window.JSG_Logger = enhancedLoggers.controls;
    window.__JSG_Logger_Enhanced__ = enhancedLoggers;
}

// Add static methods to the enhanced loggers for convenience
enhancedLoggers.getInstance = JSGLogger.getInstance;
enhancedLoggers.getInstanceSync = JSGLogger.getInstanceSync;
enhancedLoggers.logPerformance = JSGLogger.logPerformance;
enhancedLoggers.JSGLogger = JSGLogger;

// Export both the initialized loggers and the class for advanced usage
export default enhancedLoggers;
export {JSGLogger};
