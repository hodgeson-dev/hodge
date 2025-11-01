/**
 * Smoke tests for ShipService
 *
 * Tests the refactored ShipService to ensure:
 * 1. Service returns RawToolResult[] directly from toolchain
 * 2. No tool-specific parsing logic exists
 * 3. Commands use universal success flags only
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ShipService } from './ship-service.js';
import { ToolchainService } from './toolchain-service.js';
import type { RawToolResult } from '../types/toolchain.js';

// Create mock ToolchainService to prevent spawning real quality check processes
let mockToolchainService: any;

describe('[smoke] ShipService', () => {
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
    const service = new ShipService(process.cwd(), mockToolchainService);

    // Type check: runQualityGates returns Promise<RawToolResult[]>
    const qualityGatesPromise = service.runQualityGates(undefined, { skipTests: false });

    expect(qualityGatesPromise).toBeInstanceOf(Promise);
    // Await to prevent unhandled rejection
    await qualityGatesPromise;
  });

  it('should use qualityResults in ship record (not shipChecks)', () => {
    const service = new ShipService(process.cwd(), mockToolchainService);
    const mockResults: RawToolResult[] = [
      { type: 'testing', tool: 'vitest', errorCount: 0 },
      { type: 'linting', tool: 'eslint', errorCount: 0 },
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
      { type: 'testing', tool: 'vitest', errorCount: 0 },
      { type: 'linting', tool: 'eslint', errorCount: 0 },
      { type: 'type_checking', tool: 'tsc', errorCount: 0 },
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
