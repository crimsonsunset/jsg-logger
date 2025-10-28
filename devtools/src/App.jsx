import {useEffect, useState} from 'preact/hooks';
import loggerConfig from '../logger-config.json';
import devtools from 'devtools-detect';
import {Alert} from 'evergreen-ui';
import {initializePanel} from './panel-entry.jsx';

export function App() {
    const [count, setCount] = useState(0);
    const [logger, setLogger] = useState(null);
    const [devToolsStatus, setDevToolsStatus] = useState('Not loaded');
    const [loggerStatus, setLoggerStatus] = useState('Loading...');
    const [isPanelLoaded, setIsPanelLoaded] = useState(false);
    const [isDevToolsOpen, setIsDevToolsOpen] = useState(devtools.isOpen);

    useEffect(() => {
        initializeLogger();
    }, []);

    useEffect(() => {
        const handleDevToolsChange = (event) => {
            setIsDevToolsOpen(event.detail.isOpen);
        };
        
        window.addEventListener('devtoolschange', handleDevToolsChange);
        
        return () => {
            window.removeEventListener('devtoolschange', handleDevToolsChange);
        };
    }, []);

    async function initializeLogger() {
        try {
            console.log('🔄 Initializing JSG Logger...');

            // Import JSG Logger from installed package
            const JSGLoggerModule = await import('@crimsonsunset/jsg-logger');
            console.log('📦 JSG Logger module loaded:', JSGLoggerModule);

            // Get logger instance using the imported config
            console.log('📄 Loading logger with imported config...');

            let loggerInstance;
            if (JSGLoggerModule.default.getInstance) {
                console.log('🎯 Using getInstance from default export');
                loggerInstance = await JSGLoggerModule.default.getInstance(loggerConfig);
            } else {
                console.log('🎯 Using direct default export');
                loggerInstance = JSGLoggerModule.default;
            }

            console.log('✅ Logger instance created:', loggerInstance);
            console.log('🔧 Logger controls available:', !!loggerInstance.controls);
            console.log('📋 Available methods:', Object.keys(loggerInstance.controls || {}));

            // Update global reference for DevTools panel
            if (typeof window !== 'undefined' && loggerInstance.controls) {
                window.JSG_Logger = loggerInstance.controls;
                console.log('🌍 Updated global window.JSG_Logger reference');
            }

            setLogger(loggerInstance);

            // Update status with more defensive programming
            const components = loggerInstance.controls?.listComponents?.() || [];
            setLoggerStatus(`✅ JSG Logger initialized with ${components.length} components`);

            // Auto-enable DevTools panel immediately after logger is ready
            // In standalone build, we directly import and initialize the panel
            console.log('🔍 Initializing DevTools panel (standalone build)...');
            try {
                const panel = initializePanel();
                console.log('📦 Panel result:', panel);
                if (panel) {
                    console.log('✅ Panel loaded successfully, setting state');
                    setDevToolsStatus('✅ DevTools panel enabled! Panel open by default');
                    setIsPanelLoaded(true);
                } else {
                    console.warn('⚠️ Panel returned null/undefined');
                    setDevToolsStatus('⚠️ DevTools returned null');
                }
            } catch (error) {
                console.error('❌ Auto-enable DevTools failed:', error);
                setDevToolsStatus('⚠️ DevTools auto-enable failed');
            }

            // Log successful initialization if preact component exists
            if (loggerInstance.preact) {
                loggerInstance.preact.info('🚀 Preact DevTools Test App initialized', {
                    components: components,
                    environment: 'browser-preact',
                    timestamp: new Date().toISOString()
                });
            } else {
                console.log('🚀 Preact DevTools Test App initialized (no preact logger)');
            }

        } catch (error) {
            console.error('❌ Failed to initialize logger:', error);
            console.error('Stack trace:', error.stack);
            setLoggerStatus(`❌ Failed to load JSG Logger: ${error.message}`);
        }
    }

    function enableDevTools() {
        if (!logger) {
            setDevToolsStatus('❌ Logger not initialized');
            return;
        }

        console.log('🎛️ Attempting to enable DevTools panel...');

        try {
            setDevToolsStatus('🔄 Loading DevTools panel...');

            // In standalone build, directly call initializePanel
            const panel = initializePanel();
            console.log('📦 DevTools panel result:', panel);

            if (panel) {
                setDevToolsStatus('✅ DevTools panel enabled! Look for floating 🎛️ button');
                if (logger.preact) {
                    logger.preact.info('🎛️ DevTools panel successfully loaded');
                }
            } else {
                setDevToolsStatus('❌ Failed to enable DevTools panel - no panel returned');
            }
        } catch (error) {
            console.error('❌ DevTools error:', error);
            console.error('Stack trace:', error.stack);
            setDevToolsStatus(`❌ DevTools error: ${error.message}`);
        }
    }

    function testBasicLogs() {
        if (!logger) return;

        console.log('🧪 Testing basic logs with available components:', Object.keys(logger));

        // Test core components
        if (logger.core) {
            logger.core.info('Core system initialized', {version: '1.0.0', env: 'development'});
        }
        if (logger.preact) {
            logger.preact.info('Component render cycle', {component: 'App', count, renderTime: '2.1ms'});
        }
        if (logger.api) {
            logger.api.debug('API request simulation', {endpoint: '/api/status', method: 'GET', status: 200});
        }
        if (logger.ui) {
            logger.ui.info('User interaction', {action: 'button_click', target: 'basic_logs'});
        }

        // Test additional app components
        if (logger.auth) {
            logger.auth.info('User session verified', {userId: 'test-user-123', sessionId: 'sess_abc789'});
        }
        if (logger.router) {
            logger.router.info('Route navigation', {from: '/', to: '/dashboard', method: 'pushState'});
        }
        if (logger.cache) {
            logger.cache.debug('Cache operation', {operation: 'get', key: 'user_preferences', hit: true});
        }
    }

    function testWithData() {
        if (!logger) return;

        console.log('📊 Testing complex data logging...');
        console.log('📋 Available logger components:', Object.keys(logger).filter(key =>
            typeof logger[key] === 'object' && logger[key]?.info
        ));

        // Simulate complex application state
        if (logger.database) {
            console.log('✅ Using database logger...');
            logger.database.info('Complex database operation', {
                query: 'SELECT users.*, profiles.* FROM users JOIN profiles ON users.id = profiles.user_id WHERE users.active = true',
                results: 847,
                executionTime: '12.3ms',
                cache: 'miss',
                indexes: ['users_active_idx', 'profiles_user_id_idx'],
                queryPlan: 'nested_loop_join'
            });
        } else {
            console.warn('❌ Database logger not available');
        }

        if (logger.analytics) {
            console.log('✅ Using analytics logger...');
            logger.analytics.info('User behavior tracking', {
                event: 'complex_data_test',
                userId: 'user_789',
                sessionId: 'session_xyz123',
                timestamp: Date.now(),
                properties: {
                    buttonClicked: 'with_data',
                    componentCount: count,
                    browserInfo: {
                        userAgent: navigator.userAgent.substring(0, 50) + '...',
                        viewport: {width: window.innerWidth, height: window.innerHeight},
                        colorDepth: screen.colorDepth
                    }
                }
            });
        } else {
            console.warn('❌ Analytics logger not available');
        }

        if (logger.performance) {
            console.log('✅ Using performance logger...');
            logger.performance.debug('Performance metrics snapshot', {
                timing: {
                    domContentLoaded: '245ms',
                    firstPaint: '320ms',
                    firstContentfulPaint: '340ms',
                    largestContentfulPaint: '450ms'
                },
                memory: {
                    used: '23.4MB',
                    total: '64MB',
                    limit: '4GB'
                },
                network: {
                    effectiveType: '4g',
                    downlink: 10.5,
                    rtt: 50
                }
            });
        } else {
            console.warn('❌ Performance logger not available');
        }

        if (logger.websocket) {
            console.log('✅ Using websocket logger...');
            logger.websocket.warn('Connection status update', {
                event: 'connection_unstable',
                attempts: 3,
                lastError: 'WebSocket connection timeout',
                reconnectIn: '5s',
                endpoint: 'wss://api.example.com/realtime'
            });
        } else {
            console.warn('❌ WebSocket logger not available');
        }

        if (logger.notification) {
            console.log('✅ Using notification logger...');
            logger.notification.info('User notification queued', {
                type: 'info',
                title: 'Data Analysis Complete',
                message: 'Your complex data test has finished processing',
                actions: ['View Results', 'Dismiss'],
                priority: 'normal',
                scheduledFor: new Date(Date.now() + 2000).toISOString()
            });
        } else {
            console.warn('❌ Notification logger not available');
        }

        console.log('✅ Complex data test completed with rich context');
    }

    function testErrorLog() {
        if (!logger) return;

        console.log('🚨 Testing error scenarios...');

        // Simulate different types of application errors
        if (logger.api) {
            logger.api.error('API request failed', {
                endpoint: '/api/users/profile',
                method: 'GET',
                status: 500,
                error: 'Internal Server Error',
                retryAttempt: 2,
                correlationId: 'req_abc123',
                userAgent: navigator.userAgent.substring(0, 30) + '...'
            });
        }

        if (logger.auth) {
            logger.auth.error('Authentication failure', {
                reason: 'invalid_token',
                tokenExpiry: new Date(Date.now() - 3600000).toISOString(),
                userId: 'user_456',
                attemptedAction: 'access_protected_resource',
                ipAddress: '192.168.1.100'
            });
        }

        if (logger.database) {
            logger.database.error('Database connection lost', {
                error: 'Connection timeout after 30s',
                host: 'db.example.com:5432',
                database: 'app_production',
                activeConnections: 5,
                maxConnections: 20,
                lastSuccessfulQuery: '2024-01-01T10:30:00Z'
            });
        }

        if (logger.validation) {
            logger.validation.error('Form validation failed', {
                field: 'email',
                value: 'invalid-email',
                rules: ['required', 'email', 'max:255'],
                failedRules: ['email'],
                formData: {email: 'invalid-email', name: 'Test User'}
            });
        }

        if (logger.preact) {
            const componentError = new Error('Component render failure');
            logger.preact.error('React component error boundary triggered', {
                error: componentError.message,
                stack: componentError.stack,
                component: 'DevToolsTestApp',
                props: {count, loggerLoaded: !!logger},
                state: {hasError: true},
                errorBoundary: 'AppErrorBoundary'
            });
        }

        console.log('🚨 Error scenario testing completed');
    }

    function enableDebugMode() {
        if (!logger) return;

        console.log('🐛 Enabling debug mode...');
        if (logger.controls?.enableDebugMode) {
            logger.controls.enableDebugMode();
            if (logger.preact) {
                logger.preact.debug('Debug mode enabled from Preact');
            }
        } else {
            console.warn('enableDebugMode not available on logger.controls');
        }
    }

    function resetLogger() {
        if (!logger) return;

        console.log('↻ Resetting logger...');
        if (logger.controls?.reset) {
            logger.controls.reset();
            if (logger.preact) {
                logger.preact.info('Logger reset from Preact app');
            }
        } else {
            console.warn('reset not available on logger.controls');
        }
    }

    return (
        <>
            {/* Fixed Top-Right DevTools Toggle */}
            <div class="fixed-toggle">
                <button
                    onClick={() => {
                        if (isPanelLoaded) {
                            // Panel is loaded - disable it
                            if (window.JSG_DevTools?.destroy) {
                                window.JSG_DevTools.destroy();
                                setIsPanelLoaded(false);
                                setDevToolsStatus('DevTools unloaded');
                            }
                        } else {
                            // Panel not loaded - enable it
                            enableDevTools();
                            setIsPanelLoaded(true);
                        }
                    }}
                    disabled={!logger}
                    class="success"
                    style={{
                        padding: '0.6em 1.2em',
                        fontSize: '0.9em',
                        minWidth: 'auto',
                        whiteSpace: 'nowrap'
                    }}
                >
                    {isPanelLoaded ? '✓ DevTools Loaded' : '✕ DevTools Unloaded'}
                </button>
            </div>

            <h1>JSG Logger DevTools Playground</h1>

            <div class={`status ${logger ? 'success' : 'error'}`} style={{marginTop: '1rem'}}>
                <strong>Logger:</strong> {loggerStatus}
            </div>

            {/* Compact Grid Layout for Test Buttons */}
            <div class="card">
                <h2>🧪 Test Logging</h2>
                <div class="test-button-grid">
                    <button onClick={testBasicLogs} disabled={!logger}>
                        📝 Basic Logs
                    </button>
                    <button onClick={testWithData} disabled={!logger}>
                        📊 With Data
                    </button>
                    <button onClick={testErrorLog} class="danger" disabled={!logger}>
                        🚨 Error Log
                    </button>
                    <button onClick={enableDebugMode} disabled={!logger}>
                        🐛 Debug All
                    </button>
                    <button onClick={resetLogger} disabled={!logger}>
                        ↻ Reset Logger
                    </button>
                    <button 
                        onClick={() => {
                            console.clear();
                            logger?.controls?.clearLogs?.();
                        }} 
                        disabled={!logger}
                        class="success"
                    >
                        🧹 Clear Console
                    </button>
                </div>
            </div>

            {!isDevToolsOpen && (
                <Alert
                    intent="danger"
                    title="Open browser DevTools console to see logger output"
                    marginBottom={16}
                />
            )}
        </>
    );
}
