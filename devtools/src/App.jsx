import { useState, useEffect } from 'preact/hooks';
import preactLogo from './assets/preact.svg';
import viteLogo from '/vite.svg';

export function App() {
  const [count, setCount] = useState(0);
  const [logger, setLogger] = useState(null);
  const [devToolsStatus, setDevToolsStatus] = useState('Not loaded');
  const [loggerStatus, setLoggerStatus] = useState('Loading...');

  useEffect(() => {
    initializeLogger();
  }, []);

  async function initializeLogger() {
    try {
      console.log('🔄 Initializing JSG Logger...');
      
      // Import JSG Logger from parent directory
      const JSGLoggerModule = await import('../../index.js');
      console.log('📦 JSG Logger module loaded:', JSGLoggerModule);
      
      // Create test configuration
      const testConfig = {
        projectName: "DevTools Test App",
        globalLevel: "info",
        components: {
          core: { emoji: "🎯", color: "#4A90E2", level: "info" },
          api: { emoji: "🔌", color: "#FF5500", level: "debug" },
          ui: { emoji: "🎨", color: "#FF6B6B", level: "info" },
          database: { emoji: "💾", color: "#00C896", level: "warn" },
          test: { emoji: "🧪", color: "#FFEAA7", level: "debug" },
          preact: { emoji: "⚛️", color: "#673ab8", level: "debug" }
        }
      };

      // Get logger instance using the default export's getInstance method
      let loggerInstance;
      if (JSGLoggerModule.default.getInstance) {
        console.log('🎯 Using getInstance from default export');
        loggerInstance = await JSGLoggerModule.default.getInstance({ config: testConfig });
      } else {
        console.log('🎯 Using direct default export');
        loggerInstance = JSGLoggerModule.default;
      }
      
      console.log('✅ Logger instance created:', loggerInstance);
      console.log('🔧 Logger controls available:', !!loggerInstance.controls);
      console.log('📋 Available methods:', Object.keys(loggerInstance.controls || {}));
      
      setLogger(loggerInstance);

      // Update status with more defensive programming
      const components = loggerInstance.controls?.listComponents?.() || [];
      setLoggerStatus(`✅ JSG Logger initialized with ${components.length} components`);
      
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

  async function enableDevTools() {
    if (!logger) {
      setDevToolsStatus('❌ Logger not initialized');
      return;
    }

    console.log('🎛️ Attempting to enable DevTools panel...');
    console.log('🔧 Logger controls:', logger.controls);
    console.log('📋 enableDevPanel method:', typeof logger.controls?.enableDevPanel);

    try {
      setDevToolsStatus('🔄 Loading DevTools panel...');
      
      if (!logger.controls?.enableDevPanel) {
        throw new Error('enableDevPanel method not available on logger.controls');
      }
      
      const panel = await logger.controls.enableDevPanel();
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
    
    // Test available components safely
    if (logger.preact) {
      logger.preact.info('Basic Preact component test', { count, timestamp: Date.now() });
    }
    if (logger.core) {
      logger.core.info('Core logger test from Preact app');
    }
    if (logger.api) {
      logger.api.debug('API simulation from Preact', { endpoint: '/test', method: 'GET' });
    }
    if (logger.ui) {
      logger.ui.info('UI update', { component: 'App', action: 'testBasicLogs' });
    }
  }

  function testWithData() {
    if (!logger) return;

    const testData = {
      user: { id: 123, name: 'Preact User' },
      app: { name: 'DevTools Test', version: '1.0.0' },
      state: { count, loggerLoaded: !!logger },
      performance: { renderTime: '2.3ms', memoryUsage: '15.2MB' }
    };

    if (logger.preact) {
      logger.preact.info('Complex data test from Preact', testData);
    }
    if (logger.database) {
      logger.database.debug('Simulated query', { 
        query: 'SELECT * FROM test_data', 
        results: 42,
        executionTime: '8ms' 
      });
    }
  }

  function testErrorLog() {
    if (!logger) return;

    const error = new Error('Test error from Preact app');
    if (logger.preact) {
      logger.preact.error('Preact error test', { 
        error: error.message,
        stack: error.stack,
        component: 'App',
        props: { count }
      });
    }
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
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} class="logo" alt="Vite logo" />
        </a>
        <a href="https://preactjs.com" target="_blank">
          <img src={preactLogo} class="logo preact" alt="Preact logo" />
        </a>
      </div>
      
      <h1>🎛️ JSG Logger DevTools Test</h1>

      <div class="card">
        <h2>📦 Logger Status</h2>
        <div class={`status ${logger ? 'success' : 'error'}`}>
          {loggerStatus}
        </div>
      </div>

      <div class="card">
        <h2>🎯 DevTools Panel</h2>
        <div class={`status ${devToolsStatus.includes('✅') ? 'success' : ''}`}>
          {devToolsStatus}
        </div>
        <button onClick={enableDevTools} disabled={!logger}>
          🎛️ Enable DevTools Panel
        </button>
      </div>

      <div class="card">
        <h2>🧪 Test Logging</h2>
        <button onClick={testBasicLogs} disabled={!logger}>
          📝 Basic Logs
        </button>
        <button onClick={testWithData} disabled={!logger}>
          📊 With Data
        </button>
        <button onClick={testErrorLog} class="danger" disabled={!logger}>
          🚨 Error Log
        </button>
      </div>

      <div class="card">
        <h2>⚙️ Logger Controls</h2>
        <button onClick={enableDebugMode} disabled={!logger}>
          🐛 Debug All
        </button>
        <button onClick={resetLogger} disabled={!logger}>
          ↻ Reset Logger
        </button>
        <button onClick={() => console.clear()} class="success">
          🧹 Clear Console
        </button>
      </div>

      <div class="card">
        <h2>📊 Preact Counter</h2>
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>

      <p class="read-the-docs">
        Open browser DevTools console to see logger output
      </p>
    </>
  );
}
