/**
 * Browser-only logger for DevTools testing
 * Simplified version without Node.js dependencies
 */

// Mock config manager for browser testing
const mockConfigManager = {
    config: {
        projectName: "DevTools Test",
        globalLevel: "info",
        components: {
            core: { emoji: "🎯", color: "#4A90E2", level: "info" },
            api: { emoji: "🔌", color: "#FF5500", level: "debug" },
            ui: { emoji: "🎨", color: "#FF6B6B", level: "info" },
            database: { emoji: "💾", color: "#00C896", level: "warn" },
            test: { emoji: "🧪", color: "#FFEAA7", level: "debug" }
        },
        fileOverrides: {},
        devtools: {
            enabled: true  // Enable devtools for testing
        },
        display: {
            timestamp: true,
            emoji: true,
            component: true,
            level: false,
            message: true,
            jsonPayload: true,
            stackTrace: true
        }
    },
    
    getComponentConfig(name) {
        return this.config.components[name] || { emoji: "📋", color: "#888", level: "info" };
    },
    
    getEffectiveLevel(name) {
        return this.getComponentConfig(name).level || this.config.globalLevel;
    },
    
    getAvailableComponents() {
        return Object.keys(this.config.components);
    },
    
    getProjectName() {
        return this.config.projectName;
    },
    
    getSummary() {
        return {
            environment: 'browser',
            components: Object.keys(this.config.components).length,
            fileOverrides: Object.keys(this.config.fileOverrides).length
        };
    },
    
    addFileOverride(path, config) {
        this.config.fileOverrides[path] = config;
    }
};

// Mock log store
class MockLogStore {
    constructor() {
        this.logs = [];
    }
    
    add(logEntry) {
        this.logs.push(logEntry);
        if (this.logs.length > 1000) {
            this.logs.shift();
        }
    }
    
    getStats() {
        const byLevel = {};
        const byComponent = {};
        
        this.logs.forEach(log => {
            const level = log.level || 'info';
            const component = log.name || 'unknown';
            
            byLevel[level] = (byLevel[level] || 0) + 1;
            byComponent[component] = (byComponent[component] || 0) + 1;
        });
        
        return {
            total: this.logs.length,
            byLevel,
            byComponent
        };
    }
    
    getRecent(count = 50) {
        return this.logs.slice(-count);
    }
    
    clear() {
        this.logs = [];
    }
}

// Browser logger implementation
class BrowserLogger {
    constructor(componentName, logStore) {
        this.componentName = componentName;
        this.logStore = logStore;
        this.level = mockConfigManager.getEffectiveLevel(componentName);
        this._componentEmoji = mockConfigManager.getComponentConfig(componentName).emoji;
        this._componentName = componentName;
        this._effectiveLevel = this.level;
        
        // Level mapping
        this.levelMap = { 
            trace: 10, debug: 20, info: 30, warn: 40, error: 50, fatal: 60 
        };
    }
    
    shouldLog(level) {
        const logLevel = this.levelMap[level];
        const minLevel = this.levelMap[this.level] || 30;
        return logLevel >= minLevel;
    }
    
    formatLog(level, message, data) {
        const timestamp = new Date().toLocaleTimeString();
        const emoji = this._componentEmoji;
        const component = `[${this.componentName.toUpperCase()}]`;
        
        let output = `${timestamp} ${emoji} ${component} ${message}`;
        
        if (data && typeof data === 'object') {
            console.groupCollapsed(output);
            Object.entries(data).forEach(([key, value]) => {
                console.log(`  ├─ ${key}:`, value);
            });
            console.groupEnd();
        } else if (data) {
            output += ` ${data}`;
            console.log(output);
        } else {
            console.log(output);
        }
        
        // Store in log store
        this.logStore.add({
            timestamp: Date.now(),
            level,
            name: this.componentName,
            message,
            data
        });
    }
    
    trace(message, data) {
        if (this.shouldLog('trace')) {
            this.formatLog('trace', message, data);
        }
    }
    
    debug(message, data) {
        if (this.shouldLog('debug')) {
            this.formatLog('debug', message, data);
        }
    }
    
    info(message, data) {
        if (this.shouldLog('info')) {
            this.formatLog('info', message, data);
        }
    }
    
    warn(message, data) {
        if (this.shouldLog('warn')) {
            this.formatLog('warn', message, data);
        }
    }
    
    error(message, data) {
        if (this.shouldLog('error')) {
            this.formatLog('error', message, data);
        }
    }
    
    fatal(message, data) {
        if (this.shouldLog('fatal')) {
            this.formatLog('fatal', message, data);
        }
    }
}

// Main browser logger system
class BrowserLoggerSystem {
    constructor() {
        this.logStore = new MockLogStore();
        this.loggers = {};
        this.components = {};
        
        // Initialize loggers for all components
        mockConfigManager.getAvailableComponents().forEach(name => {
            this.loggers[name] = new BrowserLogger(name, this.logStore);
            this.components[name] = () => this.getComponent(name);
            
            // Add camelCase alias
            const camelName = name.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
            if (camelName !== name) {
                this.loggers[camelName] = this.loggers[name];
                this.components[camelName] = () => this.getComponent(name);
            }
        });
    }
    
    getComponent(componentName) {
        if (!this.loggers[componentName]) {
            console.warn(`[JSG-LOGGER] Component '${componentName}' not found`);
            return this.createErrorLogger(componentName);
        }
        return this.loggers[componentName];
    }
    
    createErrorLogger(componentName) {
        const prefix = `[${componentName.toUpperCase()}]`;
        const errorMsg = '⚠️ Component not configured -';
        
        return {
            trace: (msg, data) => console.log(`${prefix} ${errorMsg}`, msg, data),
            debug: (msg, data) => console.log(`${prefix} ${errorMsg}`, msg, data),
            info: (msg, data) => console.info(`${prefix} ${errorMsg}`, msg, data),
            warn: (msg, data) => console.warn(`${prefix} ${errorMsg}`, msg, data),
            error: (msg, data) => console.error(`${prefix} ${errorMsg}`, msg, data),
            fatal: (msg, data) => console.error(`${prefix} ${errorMsg}`, msg, data)
        };
    }
    
    refreshLoggers() {
        // Update logger levels
        Object.keys(this.loggers).forEach(name => {
            if (this.loggers[name] instanceof BrowserLogger) {
                this.loggers[name].level = mockConfigManager.getEffectiveLevel(name);
                this.loggers[name]._effectiveLevel = this.loggers[name].level;
            }
        });
    }
}

// Create the logger system
const loggerSystem = new BrowserLoggerSystem();

// Export logger similar to the real JSG Logger
const browserLogger = {
    // Individual component loggers
    ...loggerSystem.loggers,
    
    // Component getters
    components: loggerSystem.components,
    getComponent: (name) => loggerSystem.getComponent(name),
    
    // Log store
    logStore: loggerSystem.logStore,
    
    // Config manager
    configManager: mockConfigManager,
    
    // Environment info
    config: {
        environment: 'browser'
    },
    
    // Controls
    controls: {
        // Level controls
        setLevel: (component, level) => {
            if (loggerSystem.loggers[component]) {
                loggerSystem.loggers[component].level = level;
                loggerSystem.loggers[component]._effectiveLevel = level;
            }
        },
        
        getLevel: (component) => {
            return loggerSystem.loggers[component]?._effectiveLevel;
        },
        
        listComponents: () => Object.keys(loggerSystem.loggers),
        
        enableDebugMode: () => {
            Object.keys(loggerSystem.loggers).forEach(component => {
                if (loggerSystem.loggers[component] instanceof BrowserLogger) {
                    loggerSystem.loggers[component].level = 'debug';
                    loggerSystem.loggers[component]._effectiveLevel = 'debug';
                }
            });
        },
        
        enableTraceMode: () => {
            Object.keys(loggerSystem.loggers).forEach(component => {
                if (loggerSystem.loggers[component] instanceof BrowserLogger) {
                    loggerSystem.loggers[component].level = 'trace';
                    loggerSystem.loggers[component]._effectiveLevel = 'trace';
                }
            });
        },
        
        // File overrides (simplified)
        addFileOverride: (path, config) => {
            mockConfigManager.addFileOverride(path, config);
            loggerSystem.refreshLoggers();
        },
        
        removeFileOverride: (path) => {
            delete mockConfigManager.config.fileOverrides[path];
            loggerSystem.refreshLoggers();
        },
        
        listFileOverrides: () => Object.keys(mockConfigManager.config.fileOverrides),
        
        // Stats and config
        getStats: () => loggerSystem.logStore.getStats(),
        getConfigSummary: () => mockConfigManager.getSummary(),
        
        // DevTools panel
        enableDevPanel: async () => {
            // Early config check - creates tree-shakeable dead code path
            if (!mockConfigManager.config.devtools?.enabled) {
                console.warn('[JSG-LOGGER] DevTools disabled via config. Set devtools.enabled: true to enable.');
                return null;
            }

            if (typeof window === 'undefined') {
                console.warn('[JSG-LOGGER] DevTools panel only available in browser environments');
                return null;
            }

            try {
                // Use Function constructor to bypass Vite static analysis
                const devtoolsPath = './devtools/dist/panel-entry.js';
                const dynamicImport = new Function('path', 'return import(path)');
                const module = await dynamicImport(devtoolsPath);
                return module.initializePanel();
            } catch (error) {
                console.error('[JSG-LOGGER] Failed to load DevTools panel:', error);
                return null;
            }
        },
        
        // System controls
        refresh: () => loggerSystem.refreshLoggers(),
        
        reset: () => {
            // Reset levels to defaults
            mockConfigManager.config.components = {
                core: { emoji: "🎯", color: "#4A90E2", level: "info" },
                api: { emoji: "🔌", color: "#FF5500", level: "debug" },
                ui: { emoji: "🎨", color: "#FF6B6B", level: "info" },
                database: { emoji: "💾", color: "#00C896", level: "warn" },
                test: { emoji: "🧪", color: "#FFEAA7", level: "debug" }
            };
            loggerSystem.refreshLoggers();
        }
    }
};

// Make controls available globally for debugging
if (typeof window !== 'undefined') {
    window.JSG_Logger = browserLogger.controls;
}

// Static methods
browserLogger.getInstance = async () => browserLogger;
browserLogger.getInstanceSync = () => browserLogger;
browserLogger.logPerformance = async (operation, startTime, component = 'performance') => {
    const logger = browserLogger.getComponent(component);
    const duration = performance.now() - startTime;
    
    if (duration > 1000) {
        logger.warn(`${operation} took ${duration.toFixed(2)}ms (slow)`);
    } else if (duration > 100) {
        logger.info(`${operation} took ${duration.toFixed(2)}ms`);
    } else {
        logger.debug(`${operation} took ${duration.toFixed(2)}ms (fast)`);
    }
    
    return duration;
};

export default browserLogger;
