import { describe, expect, vi, beforeEach, afterEach } from 'vitest';
import { smokeTest } from '../test/helpers.js';
import { ShipService } from './ship-service.js';
import { existsSync } from 'fs';
import fs from 'fs/promises';
import { exec } from 'child_process';

// Mock modules
vi.mock('fs', async () => {
  const actual = await vi.importActual('fs');
  return {
    ...actual,
    existsSync: vi.fn(),
  };
});

vi.mock('fs/promises', () => ({
  default: {
    readFile: vi.fn(),
    writeFile: vi.fn(),
  },
}));

vi.mock('child_process', () => ({
  exec: vi.fn(),
}));

describe('ShipService - HODGE-322 Service Extraction', () => {
  let service: ShipService;

  beforeEach(() => {
    service = new ShipService();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  smokeTest('should instantiate without errors', () => {
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(ShipService);
  });

  // Quality Gates Tests
  smokeTest('should have runQualityGates method', () => {
    expect(service.runQualityGates).toBeDefined();
    expect(typeof service.runQualityGates).toBe('function');
  });

  // NOTE: runQualityGates behavioral tests moved to hodge-356.smoke.test.ts
  // These tests use the new RawToolResult[] API

  // Ship Record Tests
  smokeTest('should have generateShipRecord method', () => {
    expect(service.generateShipRecord).toBeDefined();
    expect(typeof service.generateShipRecord).toBe('function');
  });

  smokeTest('should generate ship record with all required fields', () => {
    const qualityResults = [
      { type: 'testing' as const, tool: 'vitest', success: true },
      { type: 'linting' as const, tool: 'eslint', success: true },
    ];

    const record = service.generateShipRecord({
      feature: 'test-feature',
      issueId: 'TEST-123',
      pmTool: 'linear',
      validationPassed: true,
      qualityResults,
      commitMessage: 'feat: test commit',
    });

    expect(record.feature).toBe('test-feature');
    expect(record.issueId).toBe('TEST-123');
    expect(record.pmTool).toBe('linear');
    expect(record.validationPassed).toBe(true);
    expect(record.qualityResults).toEqual(qualityResults);
    expect(record.commitMessage).toBe('feat: test commit');
    expect(record.timestamp).toBeDefined();
    expect(new Date(record.timestamp)).toBeInstanceOf(Date);
  });

  smokeTest('should handle null issueId and pmTool in ship record', () => {
    const qualityResults = [
      { type: 'testing' as const, tool: 'vitest', success: false },
      { type: 'linting' as const, tool: 'eslint', success: true },
    ];

    const record = service.generateShipRecord({
      feature: 'test-feature',
      issueId: null,
      pmTool: null,
      validationPassed: false,
      qualityResults,
      commitMessage: 'ship: quick fix',
    });

    expect(record.issueId).toBeNull();
    expect(record.pmTool).toBeNull();
    expect(record.validationPassed).toBe(false);
  });

  // Release Notes Tests
  smokeTest('should have generateReleaseNotes method', () => {
    expect(service.generateReleaseNotes).toBeDefined();
    expect(typeof service.generateReleaseNotes).toBe('function');
  });

  smokeTest('should generate release notes with PM issue', () => {
    const qualityResults = [
      { type: 'testing' as const, tool: 'vitest', success: true },
      { type: 'linting' as const, tool: 'eslint', success: true },
      { type: 'type_checking' as const, tool: 'tsc', success: true },
    ];

    const notes = service.generateReleaseNotes({
      feature: 'awesome-feature',
      issueId: 'PROJ-456',
      qualityResults,
    });

    expect(notes).toContain('awesome-feature');
    expect(notes).toContain('PROJ-456');
    expect(notes).toContain('✅ Passing');
  });

  smokeTest('should generate release notes without PM issue', () => {
    const qualityResults = [
      { type: 'testing' as const, tool: 'vitest', success: false },
      { type: 'linting' as const, tool: 'eslint', success: true },
    ];

    const notes = service.generateReleaseNotes({
      feature: 'simple-feature',
      issueId: null,
      qualityResults,
    });

    expect(notes).toContain('simple-feature');
    expect(notes).not.toContain('**PM Issue**');
  });

  // Metadata Backup/Restore Tests
  smokeTest('should have backupMetadata method', () => {
    expect(service.backupMetadata).toBeDefined();
    expect(typeof service.backupMetadata).toBe('function');
  });

  smokeTest('should have restoreMetadata method', () => {
    expect(service.restoreMetadata).toBeDefined();
    expect(typeof service.restoreMetadata).toBe('function');
  });

  smokeTest('should backup existing metadata files', async () => {
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(fs.readFile).mockResolvedValue('file content');

    const backup = await service.backupMetadata('test-feature');

    expect(backup.projectManagement).toBe('file content');
    expect(backup.session).toBe('file content');
    expect(backup.context).toBe('file content');
  });

  smokeTest('should handle missing metadata files in backup', async () => {
    vi.mocked(existsSync).mockReturnValue(false);

    const backup = await service.backupMetadata('test-feature');

    expect(backup.projectManagement).toBeUndefined();
    expect(backup.session).toBeUndefined();
    expect(backup.context).toBeUndefined();
  });

  smokeTest('should restore metadata from backup', async () => {
    const backup = {
      projectManagement: 'pm content',
      session: 'session content',
      context: 'context content',
    };

    await service.restoreMetadata('test-feature', backup);

    expect(fs.writeFile).toHaveBeenCalledTimes(3);
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('project_management.md'),
      'pm content'
    );
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('.session'),
      'session content'
    );
    expect(fs.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('context.json'),
      'context content'
    );
  });

  smokeTest('should handle empty backup in restore', async () => {
    const backup = {};

    await service.restoreMetadata('test-feature', backup);

    expect(fs.writeFile).not.toHaveBeenCalled();
  });
});
