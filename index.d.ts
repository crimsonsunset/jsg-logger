/**
 * TypeScript definitions for @crimsonsunset/jsg-logger
 */

// ---------------------------------------------------------------------------
// Transport system
// ---------------------------------------------------------------------------

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

/**
 * Structured log entry passed to transports.
 * Built automatically by the logger — consumers never create these directly.
 */
export interface LogEntry {
  level: LogLevel;
  levelNum: number;
  message: string;
  component: string;
  data?: Record<string, unknown>;
  timestamp: number;
  /** true when levelNum >= 50 (error / fatal) */
  isError: boolean;
  /** Extracted Error instance from data (data itself, data.err, or data.error) */
  error?: Error;
}

/**
 * Thin interface that any external log service must implement.
 * The library calls `send()` for every log that passes the transport's level gate.
 *
 * @example
 * ```ts
 * class DatadogTransport implements LogTransport {
 *   level = 'warn' as const;
 *   send(entry: LogEntry) { datadogClient.log(entry.message, entry.data); }
 * }
 * ```
 */
export interface LogTransport {
  /** Minimum level this transport cares about. Logs below this are skipped. */
  level?: LogLevel;
  /** Called for each qualifying log entry. May return a Promise (fire-and-forget). */
  send(entry: LogEntry): void | Promise<void>;
}

// ---------------------------------------------------------------------------
// Logger core
// ---------------------------------------------------------------------------

export interface LoggerInstance {
  info: (message: string, data?: any) => void;
  debug: (message: string, data?: any) => void;
  warn: (message: string, data?: any) => void;
  error: (message: string, data?: any) => void;
  fatal: (message: string, data?: any) => void;
  trace: (message: string, data?: any) => void;
  [key: string]: any;
}

export interface LoggerComponents {
  /**
   * Component loggers - factory functions that ALWAYS return LoggerInstance
   * Components return no-op logger if not initialized or unavailable
   * Safe to call without null checks: components.reactComponents?.().info(...)
   */
  reactComponents?: () => LoggerInstance;
  astroComponents?: () => LoggerInstance;
  astroBuild?: () => LoggerInstance;
  astroIntegration?: () => LoggerInstance;
  contentProcessing?: () => LoggerInstance;
  textUtils?: () => LoggerInstance;
  dateUtils?: () => LoggerInstance;
  pages?: () => LoggerInstance;
  config?: () => LoggerInstance;
  seo?: () => LoggerInstance;
  performance?: () => LoggerInstance;
  devServer?: () => LoggerInstance;
  webComponents?: () => LoggerInstance;
  core?: () => LoggerInstance;
  api?: () => LoggerInstance;
  ui?: () => LoggerInstance;
  database?: () => LoggerInstance;
  test?: () => LoggerInstance;
  preact?: () => LoggerInstance;
  auth?: () => LoggerInstance;
  analytics?: () => LoggerInstance;
  websocket?: () => LoggerInstance;
  notification?: () => LoggerInstance;
  router?: () => LoggerInstance;
  cache?: () => LoggerInstance;
  /**
   * Dynamic component access - always returns a logger factory
   * The factory function always returns LoggerInstance (no-op if unavailable)
   */
  [key: string]: (() => LoggerInstance) | undefined;
}

export interface JSGLoggerConfig {
  configPath?: string;
  config?: Record<string, any>;
  devtools?: {
    enabled?: boolean;
  };
  /** External log service transports. Each receives qualifying LogEntry objects. */
  transports?: LogTransport[];
  [key: string]: any;
}

export interface LoggerControls {
  setLevel?: (component: string, level: string) => void;
  getLevel?: (component: string) => string | undefined;
  listComponents?: () => string[];
  enableDebugMode?: () => void;
  enableTraceMode?: () => void;
  addFileOverride?: (filePath: string, overrideConfig: Record<string, any>) => void;
  removeFileOverride?: (filePath: string) => void;
  listFileOverrides?: () => string[];
  setTimestampMode?: (mode: string) => void;
  getTimestampMode?: () => string;
  getTimestampModes?: () => string[];
  setDisplayOption?: (option: string, enabled: boolean) => void;
  getDisplayConfig?: () => Record<string, boolean>;
  toggleDisplayOption?: (option: string) => void;
  getStats?: () => any;
  subscribe?: (callback: Function) => void;
  clearLogs?: () => void;
  getConfigSummary?: () => any;
  setComponentLevel?: (component: string, level: string) => void;
  getComponentLevel?: (component: string) => string | undefined;
  getComponent?: (componentName: string) => any;
  enableDevPanel?: () => Promise<any>;
  disableDevPanel?: () => boolean;
  refresh?: () => void;
  reset?: () => void;
  [key: string]: any;
}

export interface LoggerConfig {
  environment?: string;
  components?: Record<string, any>;
  summary?: any;
}

export interface LoggerInstanceType {
  /**
   * Direct access to component loggers
   */
  [componentName: string]: LoggerInstance | any;

  /**
   * Auto-discovery convenience getters (factory functions)
   */
  components?: LoggerComponents;

  /**
   * Get a specific component logger - always returns a logger instance
   * Returns no-op logger if component unavailable or logger not initialized
   * Always available - never undefined
   */
  getComponent: (componentName: string) => LoggerInstance;

  /**
   * Create a logger for a specific component
   */
  createLogger?: (componentName: string) => LoggerInstance;

  /**
   * Configuration and debugging info
   */
  config?: LoggerConfig;

  /**
   * Configuration manager instance
   */
  configManager?: any;

  /**
   * Log store instance
   */
  logStore?: any;

  /**
   * Enhanced runtime controls
   */
  controls?: LoggerControls;

  /**
   * Get singleton instance (async)
   */
  getInstance?: (config?: JSGLoggerConfig) => Promise<LoggerInstanceType> | LoggerInstanceType;

  /**
   * Get singleton instance (sync)
   */
  getInstanceSync?: (config?: JSGLoggerConfig) => LoggerInstanceType;

  /**
   * Add a transport to the running singleton without reinitializing. Idempotent.
   * @param transport - LogTransport instance to register
   */
  addTransport?: (transport: LogTransport) => void;

  /**
   * Static performance logging utility
   */
  logPerformance?: (label: string, startTime: number, component?: string) => Promise<number>;
}

export interface JSGLogger {
  /**
   * Get singleton instance with auto-initialization
   * @param config - Initialization options (only used on first call)
   * @returns Enhanced logger exports with controls API
   * 
   * Note: Returns Promise if initialization is needed, sync value if already initialized.
   * Use `await` to handle both cases safely.
   * 
   * @example
   * ```ts
   * const logger = await JSGLogger.getInstance({ configPath: 'logger-config.json' });
   * logger.components?.reactComponents?.().info('Hello');
   * ```
   */
  getInstance(config?: JSGLoggerConfig): Promise<LoggerInstanceType> | LoggerInstanceType;

  /**
   * Get singleton instance synchronously (for environments without async support)
   * @param config - Initialization options (only used on first call)
   * @returns Enhanced logger exports with controls API
   */
  getInstanceSync(config?: JSGLoggerConfig): LoggerInstanceType;

  /**
   * Update config on an already-initialized singleton without reinitializing.
   * Merges the provided partial config into the running instance, preserving all
   * registered transports. Use this instead of getInstanceSync(config) when the
   * singleton may already be initialized by module-level auto-init.
   *
   * Emits a "JSG Logger configured" log showing the applied projectName and
   * component count, so the final config is visible in the console even though
   * the one-time init log already fired with defaults at module evaluation time.
   *
   * If the singleton has not yet been initialized, behaves like getInstanceSync(config).
   *
   * @param partialConfig - Partial config to merge into the running instance
   * @returns The enhanced logger exports with controls API
   *
   * @example
   * ```ts
   * // instrumentation-client.ts — run before anything else uses the logger
   * JSGLogger.configure({ projectName: 'My App', display: { timestamp: true } });
   * ```
   */
  configure(partialConfig?: Partial<JSGLoggerConfig>): LoggerInstanceType;

  /**
   * Add a transport to the running singleton without reinitializing.
   * Safe to call even after the singleton was initialized by module-level code or a
   * third-party library — bypasses the reinit guard entirely. Idempotent.
   *
   * @param transport - LogTransport instance to register
   *
   * @example
   * ```ts
   * // instrumentation.ts — runs after module-level init, still registers transport cleanly
   * JSGLogger.addTransport(new PostHogServerTransport(posthogServer, { level: 'warn' }));
   * ```
   */
  addTransport(transport: LogTransport): void;

  /**
   * Static performance logging utility
   * @param label - Performance label
   * @param startTime - Start time from performance.now()
   * @param component - Optional component name (defaults to 'performance')
   * @returns Duration in milliseconds
   */
  logPerformance(label: string, startTime: number, component?: string): Promise<number>;
}

declare const JSGLogger: JSGLogger;
export default JSGLogger;
export { JSGLogger };

