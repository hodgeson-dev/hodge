/**
 * Smoke tests for ReviewEngineService
 * HODGE-344.3: Contract verification with mocked dependencies
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { smokeTest } from '../test/helpers.js';
import { ReviewEngineService } from './review-engine-service.js';
import { ReviewManifestGenerator } from './review-manifest-generator.js';
import { ToolchainService } from './toolchain-service.js';
import { CriticalFileSelector } from './critical-file-selector.js';
import { ToolRegistryLoader } from './tool-registry-loader.js';
import type { ReviewOptions } from '../types/review-engine.js';

// Mock dependencies
vi.mock('./git-utils.js', () => ({
  getFileChangeStats: vi
    .fn()
    .mockResolvedValue([{ path: 'test.ts', linesAdded: 10, linesDeleted: 5, linesChanged: 15 }]),
}));

describe('ReviewEngineService - Smoke Tests', () => {
  let service: ReviewEngineService;
  let mockManifestGenerator: any;
  let mockToolchainService: any;
  let mockCriticalFileSelector: any;
  let mockToolRegistryLoader: any;

  beforeEach(() => {
    // Create minimal mocks
    mockManifestGenerator = {
      generateManifest: vi.fn().mockReturnValue({
        version: '1.0',
        feature: 'test',
        generated_at: new Date().toISOString(),
        recommended_tier: 'tier-1',
        change_analysis: { total_files: 1, total_lines: 15, breakdown: {} },
        changed_files: [],
        context: {},
        scope: { type: 'file', target: 'test.ts', fileCount: 1 },
      }),
    };

    mockToolchainService = {
      runQualityChecks: vi.fn().mockResolvedValue([
        {
          type: 'linting',
          tool: 'eslint',
          success: true,
          stdout: 'No issues found',
          stderr: '',
        },
      ]),
    };

    mockCriticalFileSelector = {
      selectCriticalFiles: vi.fn().mockReturnValue({
        topFiles: [],
        allFiles: [],
        inferredCriticalPaths: [],
        configuredCriticalPaths: [],
        algorithm: 'v1',
      }),
    };

    mockToolRegistryLoader = {
      load: vi.fn().mockResolvedValue({
        tools: {
          eslint: { fix_command: 'eslint --fix' },
          tsc: {},
        },
      }),
    };

    service = new ReviewEngineService(
      mockManifestGenerator,
      mockToolchainService,
      mockCriticalFileSelector,
      mockToolRegistryLoader
    );
  });

  smokeTest('ReviewEngineService should be instantiable', () => {
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(ReviewEngineService);
  });

  smokeTest('should have analyzeFiles method', () => {
    expect(service.analyzeFiles).toBeDefined();
    expect(typeof service.analyzeFiles).toBe('function');
  });

  smokeTest('analyzeFiles should accept correct parameters', async () => {
    const fileList = ['test.ts'];
    const options: ReviewOptions = {
      scope: { type: 'file', target: 'test.ts' },
      enableCriticalSelection: false,
    };

    await expect(service.analyzeFiles(fileList, options)).resolves.toBeDefined();
  });

  smokeTest('should return ReviewFindings structure', async () => {
    const fileList = ['test.ts'];
    const options: ReviewOptions = {
      scope: { type: 'file', target: 'test.ts' },
      enableCriticalSelection: false,
    };

    const findings = await service.analyzeFiles(fileList, options);

    expect(findings).toHaveProperty('toolResults');
    expect(findings).toHaveProperty('manifest');
    expect(findings).toHaveProperty('metadata');
    expect(Array.isArray(findings.toolResults)).toBe(true);
  });

  smokeTest('should enrich tool results with autoFixable flag', async () => {
    const fileList = ['test.ts'];
    const options: ReviewOptions = {
      scope: { type: 'file', target: 'test.ts' },
      enableCriticalSelection: false,
    };

    const findings = await service.analyzeFiles(fileList, options);

    expect(findings.toolResults[0]).toHaveProperty('autoFixable');
    expect(typeof findings.toolResults[0].autoFixable).toBe('boolean');
  });

  smokeTest('should call critical file selector when enabled', async () => {
    const fileList = ['test.ts'];
    const options: ReviewOptions = {
      scope: { type: 'file', target: 'test.ts' },
      enableCriticalSelection: true,
    };

    await service.analyzeFiles(fileList, options);

    expect(mockCriticalFileSelector.selectCriticalFiles).toHaveBeenCalled();
  });

  smokeTest('should NOT call critical file selector when disabled', async () => {
    const fileList = ['test.ts'];
    const options: ReviewOptions = {
      scope: { type: 'file', target: 'test.ts' },
      enableCriticalSelection: false,
    };

    const findings = await service.analyzeFiles(fileList, options);

    expect(mockCriticalFileSelector.selectCriticalFiles).not.toHaveBeenCalled();
    expect(findings.criticalFiles).toBeUndefined();
  });

  smokeTest('should include scope metadata in findings', async () => {
    // Update mock to return directory scope
    mockManifestGenerator.generateManifest.mockReturnValue({
      version: '1.0',
      feature: 'test',
      generated_at: new Date().toISOString(),
      recommended_tier: 'tier-1',
      change_analysis: { total_files: 1, total_lines: 15, breakdown: {} },
      changed_files: [],
      context: {},
      scope: { type: 'directory', target: 'src/lib/', fileCount: 1 },
    });

    const fileList = ['test.ts'];
    const options: ReviewOptions = {
      scope: { type: 'directory', target: 'src/lib/' },
      enableCriticalSelection: false,
    };

    const findings = await service.analyzeFiles(fileList, options);

    expect(findings.metadata).toHaveProperty('scope');
    expect(findings.metadata.scope.type).toBe('directory');
    expect(findings.metadata.scope.target).toBe('src/lib/');
  });

  smokeTest('should handle empty file list', async () => {
    const fileList: string[] = [];
    const options: ReviewOptions = {
      scope: { type: 'file', target: 'none' },
      enableCriticalSelection: false,
    };

    await expect(service.analyzeFiles(fileList, options)).resolves.toBeDefined();
  });

  smokeTest('autoFixable should be true for tools with fix_command', async () => {
    mockToolchainService.runQualityChecks.mockResolvedValue([
      {
        type: 'linting',
        tool: 'eslint',
        success: false,
        stdout: 'Found issues',
      },
    ]);

    const fileList = ['test.ts'];
    const options: ReviewOptions = {
      scope: { type: 'file', target: 'test.ts' },
      enableCriticalSelection: false,
    };

    const findings = await service.analyzeFiles(fileList, options);

    expect(findings.toolResults[0].tool).toBe('eslint');
    expect(findings.toolResults[0].autoFixable).toBe(true);
  });

  smokeTest('autoFixable should be false for tools without fix_command', async () => {
    mockToolchainService.runQualityChecks.mockResolvedValue([
      {
        type: 'type_checking',
        tool: 'tsc',
        success: false,
        stdout: 'Type errors found',
      },
    ]);

    const fileList = ['test.ts'];
    const options: ReviewOptions = {
      scope: { type: 'file', target: 'test.ts' },
      enableCriticalSelection: false,
    };

    const findings = await service.analyzeFiles(fileList, options);

    expect(findings.toolResults[0].tool).toBe('tsc');
    expect(findings.toolResults[0].autoFixable).toBe(false);
  });
});
