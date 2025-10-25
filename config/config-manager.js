/**
 * Configuration Manager for JSG Logger
 * Handles loading, merging, and validation of logger configurations
 * Implements smart level resolution and file override system
 */

import defaultConfig from './default-config.json' with { type: 'json' };
import {COMPONENT_SCHEME, LEVEL_SCHEME} from './component-schemes.js';

export class ConfigManager {
    constructor() {
        this.config = {...defaultConfig};
        this.loadedPaths = [];
        this.currentFile = null; // Track current file for overrides
    }

    /**
     * Load configuration from a file path or object
     * @param {string|Object} configSource - File path or config object
     * @returns {Promise<Object>} Merged configuration
     */
    async loadConfig(configSource) {
        try {
            let externalConfig = {};

            if (typeof configSource === 'string') {
                // Load from file path - handle all path formats
                externalConfig = await this._loadConfigFromPath(configSource);
            } else if (typeof configSource === 'object') {
                // Direct config object
                externalConfig = configSource;
            }

            // Normalize external config to match expected structure
            const normalizedConfig = this._normalizeConfigStructure(externalConfig);
            
            // Merge configurations - project configs override defaults
            this.config = this.mergeConfigs(this.config, normalizedConfig);

            return this.config;
        } catch (error) {
            console.error('ConfigManager: Error loading configuration:', error);
            return this.config; // Return default config on error
        }
    }

    /**
     * Load configuration from a file path with environment detection
     * @param {string} configPath - File path to load
     * @returns {Promise<Object>} Configuration object
     * @private
     */
    async _loadConfigFromPath(configPath) {
        try {
            // Normalize path - add ./ prefix if missing for relative paths
            const normalizedPath = this._normalizePath(configPath);
            
            // Try different loading strategies based on environment
            let config = null;
            
            // Strategy 1: Browser environment with fetch
            if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
                config = await this._loadConfigBrowser(normalizedPath);
            }
            
            // Strategy 2: Node.js environment with dynamic import
            if (!config && typeof process !== 'undefined') {
                config = await this._loadConfigNode(normalizedPath);
            }
            
            // Strategy 3: Fallback browser import (for bundlers like Vite)
            if (!config && typeof window !== 'undefined') {
                config = await this._loadConfigBrowserImport(normalizedPath);
            }
            
            if (config) {
                this.loadedPaths.push(configPath);
                console.log(`[JSG-LOGGER] Successfully loaded config from: ${configPath}`);
                return config;
            } else {
                console.warn(`[JSG-LOGGER] Could not load config from: ${configPath} - using defaults`);
                return {};
            }
        } catch (error) {
            console.warn(`[JSG-LOGGER] Failed to load config from ${configPath}:`, error.message);
            return {};
        }
    }

    /**
     * Normalize file path for consistent handling
     * @param {string} path - Original path
     * @returns {string} Normalized path
     * @private
     */
    _normalizePath(path) {
        // Add ./ prefix for relative paths that don't have it
        if (!path.startsWith('./') && !path.startsWith('../') && !path.startsWith('/')) {
            return `./${path}`;
        }
        return path;
    }

    /**
     * Load config in browser environment using fetch
     * @param {string} path - File path
     * @returns {Promise<Object|null>} Configuration object or null
     * @private
     */
    async _loadConfigBrowser(path) {
        try {
            const response = await fetch(path);
            if (response.ok) {
                return await response.json();
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Load config in Node.js environment
     * @param {string} path - File path  
     * @returns {Promise<Object|null>} Configuration object or null
     * @private
     */
    async _loadConfigNode(path) {
        // Only use Node.js APIs when actually in Node.js environment
        if (typeof process === 'undefined' || !process.versions || !process.versions.node) {
            return null;
        }
        
        try {
            // Try dynamic import first (works with ES modules)
            const module = await import(path, { assert: { type: 'json' } });
            return module.default || module;
        } catch (error) {
            try {
                // Fallback to fs.readFile for broader compatibility
                const fs = await import('fs/promises');
                const fileContent = await fs.readFile(path, 'utf-8');
                return JSON.parse(fileContent);
            } catch (fsError) {
                return null;
            }
        }
    }

    /**
     * Load config in browser using dynamic import (for bundlers)
     * @param {string} path - File path
     * @returns {Promise<Object|null>} Configuration object or null  
     * @private
     */
    async _loadConfigBrowserImport(path) {
        try {
            // Some bundlers can handle dynamic imports of JSON files
            const module = await import(path);
            return module.default || module;
        } catch (error) {
            return null;
        }
    }

    /**
     * Normalize config structure to handle different field naming conventions
     * @param {Object} config - Raw configuration object
     * @returns {Object} Normalized configuration
     * @private
     */
    _normalizeConfigStructure(config) {
        const normalized = {...config};
        
        // Handle displayOptions -> display mapping
        if (config.displayOptions && !config.display) {
            normalized.display = this._mapDisplayOptions(config.displayOptions);
            delete normalized.displayOptions;
        }
        
        // Handle environment-specific configurations 
        if (config.environments) {
            // For now, just log that environment configs exist
            // TODO: Implement environment-based config selection
            console.log(`[JSG-LOGGER] Found environment configs for: ${Object.keys(config.environments).join(', ')}`);
        }
        
        // Normalize component configurations
        if (config.components) {
            normalized.components = this._normalizeComponents(config.components);
        }
        
        return normalized;
    }
    
    /**
     * Map displayOptions to display format
     * @param {Object} displayOptions - Original display options
     * @returns {Object} Normalized display configuration
     * @private
     */
    _mapDisplayOptions(displayOptions) {
        return {
            timestamp: displayOptions.showTimestamp ?? true,
            emoji: true, // Always enabled for JSG Logger
            component: displayOptions.showComponent ?? true,
            level: displayOptions.showLevel ?? false,
            message: true, // Always enabled
            jsonPayload: true, // Default enabled
            stackTrace: true, // Default enabled
            environment: displayOptions.showEnvironment ?? false
        };
    }
    
    /**
     * Normalize component configurations
     * @param {Object} components - Raw component config
     * @returns {Object} Normalized component config
     * @private
     */
    _normalizeComponents(components) {
        const normalized = {};
        
        for (const [name, config] of Object.entries(components)) {
            normalized[name] = {
                emoji: config.emoji || this._getDefaultEmoji(name),
                color: config.color || this._getDefaultColor(name),
                name: config.name || this._formatComponentName(name),
                level: config.level || 'info',
                enabled: config.enabled ?? true,
                description: config.description // Preserve description for documentation
            };
        }
        
        return normalized;
    }
    
    /**
     * Get default emoji for component
     * @param {string} componentName - Component name
     * @returns {string} Default emoji
     * @private
     */
    _getDefaultEmoji(componentName) {
        const emojiMap = {
            'astro-build': '🚀',
            'astro-integration': '⚙️', 
            'content-processing': '📝',
            'text-utils': '📄',
            'date-utils': '📅',
            'react-components': '⚛️',
            'astro-components': '🌟',
            'pages': '📄',
            'config': '⚙️',
            'seo': '🔍',
            'performance': '⚡',
            'dev-server': '🛠️'
        };
        
        return emojiMap[componentName] || '🎯';
    }
    
    /**
     * Get default color for component
     * @param {string} componentName - Component name
     * @returns {string} Default color
     * @private
     */
    _getDefaultColor(componentName) {
        const colorMap = {
            'astro-build': '#FF5D01',
            'astro-integration': '#4A90E2',
            'content-processing': '#00C896',
            'text-utils': '#9B59B6',
            'date-utils': '#3498DB',
            'react-components': '#61DAFB',
            'astro-components': '#FF5D01',
            'pages': '#2ECC71',
            'config': '#95A5A6',
            'seo': '#E74C3C',
            'performance': '#F39C12',
            'dev-server': '#8E44AD'
        };
        
        return colorMap[componentName] || '#4A90E2';
    }
    
    /**
     * Format component name for display
     * @param {string} componentName - Raw component name
     * @returns {string} Formatted display name
     * @private
     */
    _formatComponentName(componentName) {
        // If already uppercase, return as-is
        if (componentName === componentName.toUpperCase()) {
            return componentName;
        }
        
        // Convert to uppercase and preserve separators for readability
        return componentName
            .replace(/([a-z])([A-Z])/g, '$1-$2')  // camelCase → kebab-case
            .replace(/_/g, '-')  // snake_case → kebab-case
            .toUpperCase();
    }

    /**
     * Set current file context for override resolution
     * @param {string} filePath - Current file path being logged from
     */
    setCurrentFile(filePath) {
        this.currentFile = filePath;
    }

    /**
     * Deep merge two configuration objects
     * @private
     */
    mergeConfigs(base, override) {
        const merged = {...base};

        for (const key in override) {
            if (override.hasOwnProperty(key)) {
                // Special case: 'components' should be replaced, not merged
                // This allows users to define their own components without getting defaults
                if (key === 'components' && typeof override[key] === 'object') {
                    merged[key] = override[key];
                } else if (typeof override[key] === 'object' && !Array.isArray(override[key])) {
                    merged[key] = this.mergeConfigs(merged[key] || {}, override[key]);
                } else {
                    merged[key] = override[key];
                }
            }
        }

        return merged;
    }

    /**
     * Get effective log level using hierarchy: file override > component level > global level
     * @param {string} componentName - Component identifier
     * @param {string} filePath - Optional file path for override checking
     * @returns {string} Effective log level
     */
    getEffectiveLevel(componentName, filePath = null) {
        const checkFile = filePath || this.currentFile;

        // 1. Check file overrides first (highest priority)
        if (checkFile && this.config.fileOverrides) {
            const fileOverride = this.getFileOverride(checkFile);
            if (fileOverride && fileOverride.level) {
                return fileOverride.level;
            }
        }

        // 2. Check component-specific level
        if (this.config.components && this.config.components[componentName] && this.config.components[componentName].level) {
            return this.config.components[componentName].level;
        }

        // 3. Fall back to global level
        return this.config.globalLevel || 'info';
    }

    /**
     * Get file override configuration for a given file path
     * @param {string} filePath - File path to check
     * @returns {Object|null} File override config or null
     */
    getFileOverride(filePath) {
        if (!this.config.fileOverrides || !filePath) {
            return null;
        }

        // Normalize file path (remove leading ./ and ../)
        const normalizedPath = filePath.replace(/^\.\.?\//g, '');

        // Check exact matches first
        if (this.config.fileOverrides[normalizedPath]) {
            return this.config.fileOverrides[normalizedPath];
        }

        // Check pattern matches
        for (const pattern in this.config.fileOverrides) {
            if (this.matchFilePattern(normalizedPath, pattern)) {
                return this.config.fileOverrides[pattern];
            }
        }

        return null;
    }

    /**
     * Match file path against a pattern (supports wildcards)
     * @param {string} filePath - File path to test
     * @param {string} pattern - Pattern to match against
     * @returns {boolean} Whether the file matches the pattern
     * @private
     */
    matchFilePattern(filePath, pattern) {
        // Convert glob pattern to regex
        const regexPattern = pattern
                .replace(/\./g, '\\.')  // Escape dots
                .replace(/\*/g, '.*')   // Convert * to .*
                .replace(/\?/g, '.')    // Convert ? to .
            + '$';                  // End of string

        const regex = new RegExp(regexPattern);
        return regex.test(filePath);
    }

    /**
     * Get component configuration with file override support
     * @param {string} componentName - Component identifier
     * @param {string} filePath - Optional file path for override checking
     * @returns {Object} Component configuration
     */
    getComponentConfig(componentName, filePath = null) {
        // Priority 1: Config components
        let baseComponent = this.config.components?.[componentName];
        
        // Priority 2: COMPONENT_SCHEME defaults
        if (!baseComponent) {
            baseComponent = COMPONENT_SCHEME[componentName];
        }
        
        // Priority 3: Auto-generate for custom components
        if (!baseComponent) {
            baseComponent = {
                emoji: '📦',
                color: '#999999',
                name: this._formatComponentName(componentName),
                level: this.config.globalLevel || 'info'
            };
        }

        // Check for file-specific overrides
        const checkFile = filePath || this.currentFile;
        if (checkFile) {
            const fileOverride = this.getFileOverride(checkFile);
            if (fileOverride) {
                return {
                    ...baseComponent,
                    ...fileOverride,
                    level: this.getEffectiveLevel(componentName, checkFile)
                };
            }
        }

        return {
            ...baseComponent,
            level: this.getEffectiveLevel(componentName, checkFile)
        };
    }

    /**
     * Get level configuration
     * @param {number} level - Log level number
     * @returns {Object} Level configuration
     */
    getLevelConfig(level) {
        // Check if level exists in loaded config
        if (this.config.levels && this.config.levels[level]) {
            return this.config.levels[level];
        }

        // Fallback to default schemes
        return LEVEL_SCHEME[level] || LEVEL_SCHEME[30];
    }

    /**
     * Get global log level
     * @returns {string} Global log level
     */
    getGlobalLevel() {
        return this.config.globalLevel || 'info';
    }

    /**
     * Get timestamp mode
     * @returns {string} Timestamp mode ('absolute', 'readable', 'relative', 'disable')
     */
    getTimestampMode() {
        return this.config.timestampMode || 'absolute';
    }

    /**
     * Get display configuration with file override support
     * @param {string} filePath - Optional file path for override checking
     * @returns {Object} Display configuration
     */
    getDisplayConfig(filePath = null) {
        const baseDisplay = this.config.display || {
            timestamp: true,
            emoji: true,
            component: true,
            level: false,
            message: true,
            jsonPayload: true,
            stackTrace: true
        };

        // Check for file-specific display overrides
        const checkFile = filePath || this.currentFile;
        if (checkFile) {
            const fileOverride = this.getFileOverride(checkFile);
            if (fileOverride && fileOverride.display) {
                return {
                    ...baseDisplay,
                    ...fileOverride.display
                };
            }
        }

        return baseDisplay;
    }

    /**
     * Get project name
     * @returns {string} Project name
     */
    getProjectName() {
        return this.config.projectName || 'JSG Logger';
    }

    /**
     * Check if auto-registration is enabled
     * @returns {boolean} Auto-registration flag
     */
    isAutoRegisterEnabled() {
        return this.config.autoRegister !== false;
    }

    /**
     * Get formatting configuration
     * @returns {Object} Format configuration
     */
    getFormatConfig() {
        return this.config.format || {
            style: 'brackets',
            componentCase: 'upper',
            timestamp: 'HH:mm:ss.SSS'
        };
    }

    /**
     * Get all available components
     * @returns {Array} Array of component names
     */
    getAvailableComponents() {
        const configComponents = Object.keys(this.config.components || {});
        
        // If user has defined components, only return those
        if (configComponents.length > 0) {
            return configComponents;
        }
        
        // Fallback to COMPONENT_SCHEME if no components configured (backward compatibility)
        return Object.keys(COMPONENT_SCHEME);
    }

    /**
     * Add or update a component configuration
     * @param {string} componentName - Component identifier
     * @param {Object} componentConfig - Component configuration
     */
    addComponent(componentName, componentConfig) {
        if (!this.config.components) {
            this.config.components = {};
        }

        this.config.components[componentName] = {
            ...this.getComponentConfig(componentName),
            ...componentConfig
        };
    }

    /**
     * Add or update a file override
     * @param {string} filePath - File path or pattern
     * @param {Object} overrideConfig - Override configuration
     */
    addFileOverride(filePath, overrideConfig) {
        if (!this.config.fileOverrides) {
            this.config.fileOverrides = {};
        }

        this.config.fileOverrides[filePath] = overrideConfig;
    }

    /**
     * Format timestamp based on mode
     * @param {number} timestamp - Unix timestamp
     * @param {string} mode - Timestamp mode
     * @returns {string} Formatted timestamp
     */
    formatTimestamp(timestamp, mode = null) {
        const timestampMode = mode || this.getTimestampMode();
        const date = new Date(timestamp);

        switch (timestampMode) {
            case 'readable':
                return date.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                });

            case 'relative':
                const now = Date.now();
                const diff = now - timestamp;

                if (diff < 1000) return 'now';
                if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
                if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
                return `${Math.floor(diff / 3600000)}h ago`;

            case 'disable':
                return '';

            case 'absolute':
            default:
                return date.toLocaleTimeString('en-US', {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    fractionalSecondDigits: 3
                });
        }
    }

    /**
     * Get configuration summary for debugging
     * @returns {Object} Configuration summary
     */
    getSummary() {
        return {
            projectName: this.getProjectName(),
            globalLevel: this.getGlobalLevel(),
            timestampMode: this.getTimestampMode(),
            loadedPaths: this.loadedPaths,
            componentCount: this.getAvailableComponents().length,
            fileOverrideCount: Object.keys(this.config.fileOverrides || {}).length,
            autoRegister: this.isAutoRegisterEnabled(),
            format: this.getFormatConfig(),
            display: this.getDisplayConfig(),
            currentFile: this.currentFile
        };
    }
}

// Create singleton instance
export const configManager = new ConfigManager();
