/**
 * JSG Logger - Browser-Compatible Version
 * Simplified version for browser/DevTools testing without Node.js dependencies
 */

// Mock browser-compatible config
const mockConfig = {
    projectName: "JSG Logger Browser",
    globalLevel: "info",
    environment: "browser",
    components: {
        core: { emoji: "🎯", color: "#4A90E2", level: "info" },
        api: { emoji: "🔌", color: "#FF5500", level: "debug" },
        ui: { emoji: "🎨", color: "#FF6B6B", level: "info" },
        database: { emoji: "💾", color: "#00C896", level: "warn" },
        test: { emoji: "🧪", color: "#FFEAA7", level: "debug" }
    }
};

/**
 * Simple Browser Logger
 */
class JSGBrowserLogger {
    constructor(config = mockConfig) {
        this.config = config;
        this.configManager = {
            config: config
        };
        
        // Global logger reference
        window.JSG_Logger = this;
    }
    
    /**
     * Logger controls for DevTools
     */
    get controls() {
        return {
            listComponents: () => Object.keys(this.config.components),
            
            refresh: () => {
                console.log('🔄 Logger refreshed');
            },
            
            getStats: () => ({
                total: 42,
                byLevel: { info: 20, debug: 15, warn: 5, error: 2 },
                byComponent: { core: 10, api: 12, ui: 8, database: 7, test: 5 }
            }),
            
            enableDevPanel: async () => {
                console.log('🎛️ Enabling DevTools panel...');
                
                // Import the DevTools panel
                try {
                    const isDev = window.location.hostname === 'localhost';
                    let module;
                    
                    if (isDev) {
                        console.log('🔥 DEV MODE: Attempting to load DevTools from SOURCE for hot reload');
                        try {
                            console.log('🔍 Importing:', './devtools/src/panel-entry.jsx');
                            module = await import('./devtools/src/panel-entry.jsx');
                            console.log('✅ Source import successful:', module);
                        } catch (sourceError) {
                            console.error('❌ Source import failed, falling back to bundle:', sourceError);
                            const cacheBuster = Date.now();
                            module = await import(`./devtools/dist/panel-entry.js?v=${cacheBuster}`);
                        }
                    } else {
                        console.log('📦 PROD MODE: Loading DevTools from built bundle');
                        const cacheBuster = Date.now();
                        module = await import(`./devtools/dist/panel-entry.js?v=${cacheBuster}`);
                    }
                    
                    if (module && module.initializePanel) {
                        const panel = module.initializePanel();
                        console.log('✅ DevTools panel initialized:', panel);
                        return panel;
                    } else {
                        console.error('❌ No initializePanel function found in module:', module);
                        return null;
                    }
                } catch (error) {
                    console.error('❌ Failed to load DevTools panel:', error);
                    return null;
                }
            }
        };
    }
    
    /**
     * Simple logging methods
     */
    info(message, data) {
        console.log(`ℹ️ ${message}`, data || '');
    }
    
    debug(message, data) {
        console.log(`🐛 ${message}`, data || '');
    }
    
    warn(message, data) {
        console.warn(`⚠️ ${message}`, data || '');
    }
    
    error(message, data) {
        console.error(`❌ ${message}`, data || '');
    }
}

// Create and export logger instance
const logger = new JSGBrowserLogger(mockConfig);

// Export both default and named
export default logger;
export { logger as JSGLogger };
