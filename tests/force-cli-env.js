/**
 * Preload hook for the test runner — forces CLI formatter output so tests
 * that capture console.log work in CI (GITHUB_ACTIONS disables isCLI detection).
 */
import { forceEnvironment } from '../utils/environment-detector.js';

forceEnvironment('cli');
