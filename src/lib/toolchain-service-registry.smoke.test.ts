/**
 * Smoke tests for ToolchainService registry-based detection
 * Part of HODGE-341.2: Two-Layer Configuration Architecture
 *
 * OPTIMIZATION (HODGE-351):
 * - Shared ToolchainService instance for tests that scan the real Hodge project
 * - Moved slow temp-directory tests to .integration.test.ts
 * - Smoke tests now complete in <100ms total
 *
 * Note: Real tool detection behavior is validated in integration tests.
 * These smoke tests verify basic instantiation and project scanning works.
 */

import { describe, expect, beforeAll } from 'vitest';
import { ToolchainService } from './toolchain-service.js';
import { smokeTest } from '../test/helpers.js';
import os from 'os';

describe('ToolchainService - Registry-Based Detection (HODGE-341.2)', () => {
  // HODGE-351: Share service instance for tests that scan the real Hodge project
  // This reduces execution time from ~40s to ~5s by scanning once instead of multiple times
  let sharedService: ToolchainService;
  let detectedTools: Awaited<ReturnType<typeof sharedService.detectTools>>;

  beforeAll(async () => {
    sharedService = new ToolchainService();
    detectedTools = await sharedService.detectTools();
  });

  smokeTest('should instantiate without crashing', () => {
    const service = new ToolchainService();
    expect(service).toBeDefined();
  });

  smokeTest('should instantiate with custom path without crashing', () => {
    const service = new ToolchainService(os.tmpdir());
    expect(service).toBeDefined();
  });

  smokeTest('should detect tools using registry without crashing', () => {
    expect(Array.isArray(detectedTools)).toBe(true);
    // Should detect at least some tools in this project
    expect(detectedTools.length).toBeGreaterThan(0);
  });

  smokeTest('should detect TypeScript in this project', () => {
    const typescript = detectedTools.find((t) => t.name === 'typescript');
    expect(typescript).toBeDefined();
    expect(typescript?.detected).toBe(true);
    expect(typescript?.detectionMethod).toBeDefined();
  });

  smokeTest('should detect ESLint in this project', () => {
    const eslint = detectedTools.find((t) => t.name === 'eslint');
    expect(eslint).toBeDefined();
    expect(eslint?.detected).toBe(true);
  });

  smokeTest('should detect version information when available', () => {
    const typescript = detectedTools.find((t) => t.name === 'typescript');
    if (typescript) {
      // Version might be undefined if tool not executable, but should be string if present
      if (typescript.version) {
        expect(typeof typescript.version).toBe('string');
        expect(typescript.version).toMatch(/\d+\.\d+\.\d+/);
      }
    }
  });
});
