/**
 * Component and Level Schemes for JSG Logger
 * Defines visual styling and organization for all logger components
 */

export const COMPONENT_SCHEME = {
  'core': { emoji: '🎯', color: '#4A90E2', name: 'JSG-CORE' },
  'api': { emoji: '🔌', color: '#FF5500', name: 'API' },
  'ui': { emoji: '🎨', color: '#FF6B6B', name: 'UI' },
  'database': { emoji: '💾', color: '#00C896', name: 'DATABASE' },
  'test': { emoji: '🧪', color: '#FFEAA7', name: 'TEST' },
  'preact': { emoji: '⚛️', color: '#673ab8', name: 'PREACT' },
  'auth': { emoji: '🔐', color: '#E67E22', name: 'AUTH' },
  'analytics': { emoji: '📊', color: '#9B59B6', name: 'ANALYTICS' },
  'performance': { emoji: '⚡', color: '#F39C12', name: 'PERFORMANCE' },
  'websocket': { emoji: '🔗', color: '#1ABC9C', name: 'WEBSOCKET' },
  'notification': { emoji: '🔔', color: '#E74C3C', name: 'NOTIFICATION' },
  'router': { emoji: '🛣️', color: '#3498DB', name: 'ROUTER' },
  'cache': { emoji: '💨', color: '#95A5A6', name: 'CACHE' }
};

export const LEVEL_SCHEME = {
  10: { emoji: '🔍', color: '#6C7B7F', name: 'TRACE' },
  20: { emoji: '🐛', color: '#74B9FF', name: 'DEBUG' },
  30: { emoji: '✨', color: '#00B894', name: 'INFO' },
  40: { emoji: '⚠️', color: '#FDCB6E', name: 'WARN' },
  50: { emoji: '🚨', color: '#E17055', name: 'ERROR' },
  60: { emoji: '💀', color: '#D63031', name: 'FATAL' }
};