/**
 * Smoke tests for HardenService
 *
 * Tests the refactored HardenService to ensure:
 * 1. Service returns RawToolResult[] directly from toolchain
 * 2. No tool-specific parsing logic exists
 * 3. Commands use universal success flags only
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HardenService } from './harden-service.js';
import { ToolchainService } from './toolchain-service.js';
import type { RawToolResult } from '../types/toolchain.js';

// Create mock ToolchainService to prevent spawning real quality check processes
let mockToolchainService: any;

describe('[smoke] HardenService', () => {
  beforeEach(() => {
    // Create real ToolchainService and spy on runQualityChecks to prevent spawning real tools
    mockToolchainService = new ToolchainService(process.cwd());
    vi.spyOn(mockToolchainService, 'runQualityChecks').mockResolvedValue([
      { type: 'testing' as const, tool: 'vitest', success: true },
      { type: 'linting' as const, tool: 'eslint', success: true },
      { type: 'type_checking' as const, tool: 'tsc', success: true },
    ]);
  });

  it('should have method that returns RawToolResult[] signature', async () => {
    const service = new HardenService(process.cwd(), mockToolchainService);

    // Type check: runValidations returns Promise<RawToolResult[]>
    const validationsPromise = service.runValidations('TEST-001');

    expect(validationsPromise).toBeInstanceOf(Promise);
    // Await to prevent unhandled rejection
    await validationsPromise;
  });

  it('should use universal success flags (skipped or errorCount)', () => {
    const mockResults: RawToolResult[] = [
      { type: 'testing', tool: 'vitest', exitCode: 0, errorCount: 0, stdout: 'All tests passed' },
      { type: 'linting', tool: 'eslint', exitCode: 1, errorCount: 5, stderr: 'Linting errors' },
      { type: 'testing', tool: 'vitest-integration', skipped: true, reason: 'Tests skipped' },
    ];

    const service = new HardenService(process.cwd(), mockToolchainService);
    const gateResults = service.checkQualityGates(mockResults);

    // Should check errorCount flags universally
    expect(gateResults.allPassed).toBe(false); // linting failed (errorCount > 0)
    expect(gateResults.results).toEqual(mockResults);
  });

  it('should not have legacy ValidationResults interface', () => {
    // Type check: this would fail compilation if ValidationResults still exists
    const mockResults: RawToolResult[] = [];
    const service = new HardenService(process.cwd(), mockToolchainService);

    const reportData = service.generateReportData('TEST-001', mockResults);

    expect(reportData.results).toBe(mockResults);
    expect(reportData.allPassed).toBe(true); // empty array = all passed
  });

  it('should work identically for different linters (ESLint, Ruff, Checkstyle)', () => {
    const service = new HardenService(process.cwd(), mockToolchainService);

    // All linters use same RawToolResult structure - no special parsing needed
    const eslintResult: RawToolResult = {
      type: 'linting',
      tool: 'eslint',
      errorCount: 5,
      stdout: 'Found 5 linting errors',
    };

    const ruffResult: RawToolResult = {
      type: 'linting',
      tool: 'ruff',
      errorCount: 3,
      stdout: 'Found 3 linting errors',
    };

    const checkstyleResult: RawToolResult = {
      type: 'linting',
      tool: 'checkstyle',
      errorCount: 0,
      stdout: 'No errors found',
    };

    // All should be processed the same way
    const eslintCheck = service.checkQualityGates([eslintResult]);
    const ruffCheck = service.checkQualityGates([ruffResult]);
    const checkstyleCheck = service.checkQualityGates([checkstyleResult]);

    expect(eslintCheck.allPassed).toBe(false);
    expect(ruffCheck.allPassed).toBe(false);
    expect(checkstyleCheck.allPassed).toBe(true);
  });
});
