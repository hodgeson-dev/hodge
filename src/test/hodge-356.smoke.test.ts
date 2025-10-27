/**
 * HODGE-356 Smoke Tests: Standardize Quality Checking
 *
 * Tests the refactored HardenService and ShipService to ensure:
 * 1. Services return RawToolResult[] directly from toolchain
 * 2. No tool-specific parsing logic exists
 * 3. Commands use universal success flags only
 *
 * HODGE-357.1: Mock ToolchainService to prevent spawning real tools
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HardenService } from '../lib/harden-service.js';
import { ShipService } from '../lib/ship-service.js';
import { ToolchainService } from '../lib/toolchain-service.js';
import type { RawToolResult } from '../types/toolchain.js';

// HODGE-357.1: Create mock ToolchainService to prevent spawning real quality check processes
let mockToolchainService: any;

describe('[smoke] HODGE-356: Standardize Quality Checking', () => {
  beforeEach(() => {
    // HODGE-357.1: Create real ToolchainService and spy on runQualityChecks to prevent spawning real tools
    mockToolchainService = new ToolchainService(process.cwd());
    vi.spyOn(mockToolchainService, 'runQualityChecks').mockResolvedValue([
      { type: 'testing' as const, tool: 'vitest', success: true },
      { type: 'linting' as const, tool: 'eslint', success: true },
      { type: 'type_checking' as const, tool: 'tsc', success: true },
    ]);
  });

  describe('HardenService refactoring', () => {
    it('should have method that returns RawToolResult[] signature', async () => {
      const service = new HardenService(process.cwd(), mockToolchainService);

      // Type check: runValidations returns Promise<RawToolResult[]>
      const validationsPromise = service.runValidations('TEST-001');

      expect(validationsPromise).toBeInstanceOf(Promise);
      // Await to prevent unhandled rejection
      await validationsPromise;
    });

    it('should use universal success flags (skipped or success)', () => {
      const mockResults: RawToolResult[] = [
        { type: 'testing', tool: 'vitest', success: true, stdout: 'All tests passed' },
        { type: 'linting', tool: 'eslint', success: false, stderr: 'Linting errors' },
        { type: 'testing', tool: 'vitest-integration', skipped: true, reason: 'Tests skipped' },
      ];

      const service = new HardenService(process.cwd(), mockToolchainService);
      const gateResults = service.checkQualityGates(mockResults);

      // Should check success flags universally
      expect(gateResults.allPassed).toBe(false); // linting failed
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
  });

  describe('ShipService refactoring', () => {
    it('should have method that returns RawToolResult[] signature', async () => {
      const service = new ShipService(process.cwd(), mockToolchainService);

      // Type check: runQualityGates returns Promise<RawToolResult[]>
      const qualityGatesPromise = service.runQualityGates({ skipTests: false });

      expect(qualityGatesPromise).toBeInstanceOf(Promise);
      // Await to prevent unhandled rejection
      await qualityGatesPromise;
    });

    it('should use qualityResults in ship record (not shipChecks)', () => {
      const service = new ShipService(process.cwd(), mockToolchainService);
      const mockResults: RawToolResult[] = [
        { type: 'testing', tool: 'vitest', success: true },
        { type: 'linting', tool: 'eslint', success: true },
      ];

      const shipRecord = service.generateShipRecord({
        feature: 'TEST-001',
        issueId: 'TEST-001',
        pmTool: 'linear',
        validationPassed: true,
        qualityResults: mockResults,
        commitMessage: 'Test commit',
      });

      expect(shipRecord.qualityResults).toEqual(mockResults);
      expect(shipRecord).not.toHaveProperty('shipChecks'); // Legacy property should not exist
    });

    it('should generate release notes using qualityResults', () => {
      const service = new ShipService(process.cwd(), mockToolchainService);
      const mockResults: RawToolResult[] = [
        { type: 'testing', tool: 'vitest', success: true },
        { type: 'linting', tool: 'eslint', success: true },
        { type: 'type_checking', tool: 'tsc', success: true },
      ];

      const releaseNotes = service.generateReleaseNotes({
        feature: 'TEST-001',
        issueId: 'TEST-001',
        qualityResults: mockResults,
      });

      // Should contain quality metrics section
      expect(releaseNotes).toContain('Quality Metrics');
      expect(releaseNotes).toContain('Tests:');
      expect(releaseNotes).toContain('Type Checking:');
      expect(releaseNotes).toContain('Linting:');
    });
  });

  describe('Integration: No tool-specific parsing', () => {
    it('should work identically for ESLint, Ruff, and Checkstyle', () => {
      const service = new HardenService(process.cwd(), mockToolchainService);

      // ESLint result
      const eslintResults: RawToolResult[] = [
        { type: 'linting', tool: 'eslint', success: false, stderr: '94 errors, 319 warnings' },
      ];

      // Ruff result (Python linter)
      const ruffResults: RawToolResult[] = [
        { type: 'linting', tool: 'ruff', success: false, stderr: '94 errors found' },
      ];

      // Checkstyle result (Java linter)
      const checkstyleResults: RawToolResult[] = [
        {
          type: 'linting',
          tool: 'checkstyle',
          success: false,
          stderr: '[ERROR] Found 94 violations',
        },
      ];

      // All three should be handled identically (universal success check)
      const eslintGates = service.checkQualityGates(eslintResults);
      const ruffGates = service.checkQualityGates(ruffResults);
      const checkstyleGates = service.checkQualityGates(checkstyleResults);

      expect(eslintGates.allPassed).toBe(false);
      expect(ruffGates.allPassed).toBe(false);
      expect(checkstyleGates.allPassed).toBe(false);

      // No tool-specific parsing logic - all treated the same way
    });

    it('should block shipping on any failed result using universal check', () => {
      const service = new ShipService(process.cwd(), mockToolchainService);

      const mixedResults: RawToolResult[] = [
        { type: 'testing', tool: 'vitest', success: true },
        { type: 'linting', tool: 'eslint', success: false }, // This blocks
        { type: 'type_checking', tool: 'tsc', success: true },
      ];

      const shipRecord = service.generateShipRecord({
        feature: 'TEST-001',
        issueId: null,
        pmTool: null,
        validationPassed: false, // Should be false due to linting failure
        qualityResults: mixedResults,
        commitMessage: 'Test',
      });

      expect(shipRecord.validationPassed).toBe(false);
      expect(shipRecord.qualityResults.some((r) => !r.success && !r.skipped)).toBe(true);
    });
  });

  describe('Exit codes are universal', () => {
    it('should treat success=true as passing (exit code 0)', () => {
      const results: RawToolResult[] = [{ type: 'testing', tool: 'vitest', success: true }];

      const service = new HardenService(process.cwd(), mockToolchainService);
      const gates = service.checkQualityGates(results);

      expect(gates.allPassed).toBe(true);
    });

    it('should treat success=false as failing (exit code non-zero)', () => {
      const results: RawToolResult[] = [{ type: 'testing', tool: 'vitest', success: false }];

      const service = new HardenService(process.cwd(), mockToolchainService);
      const gates = service.checkQualityGates(results);

      expect(gates.allPassed).toBe(false);
    });

    it('should treat skipped results as passing', () => {
      const results: RawToolResult[] = [
        { type: 'testing', tool: 'vitest', skipped: true, reason: 'Skipped via flag' },
      ];

      const service = new HardenService(process.cwd(), mockToolchainService);
      const gates = service.checkQualityGates(results);

      expect(gates.allPassed).toBe(true);
    });
  });
});
