import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import { IDManager } from './id-manager.js';
import * as os from 'os';

/**
 * Test suite for IDManager class
 * Tests dual ID system functionality, persistence, and error handling
 */
describe('IDManager', () => {
  let idManager: IDManager;
  let testDir: string;

  describe('performance', () => {
    it('should complete operations within 500ms', async () => {
      const tempDir = path.join(os.tmpdir(), 'hodge-perf-test-' + Date.now());
      await fs.mkdir(tempDir, { recursive: true });
      const perfManager = new IDManager(tempDir);
      const start = Date.now();

      // Create multiple features
      for (let i = 0; i < 10; i++) {
        await perfManager.createFeature(`feature-${i}`, `HOD-${i}`);
      }

      // Resolve IDs
      for (let i = 0; i < 10; i++) {
        await perfManager.resolveID(`HODGE-00${i + 1}`);
        await perfManager.resolveID(`HOD-${i}`);
      }

      // Get all mappings
      await perfManager.getAllMappings();

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(500); // Must complete within 500ms

      // Cleanup
      await fs.rm(tempDir, { recursive: true, force: true });
    });
  });

  beforeEach(async () => {
    // Create a temporary directory for testing
    testDir = path.join(os.tmpdir(), 'hodge-test-' + Date.now());
    await fs.mkdir(testDir, { recursive: true });
    idManager = new IDManager(testDir);
  });

  afterEach(async () => {
    // Clean up test directory
    await fs.rm(testDir, { recursive: true, force: true });
  });

  describe('createFeature', () => {
    it('should validate external ID input', async () => {
      await expect(idManager.createFeature('test', '')).rejects.toThrow(
        'External ID cannot be empty'
      );
    });
    it('should create a feature with sequential local ID', async () => {
      const feature1 = await idManager.createFeature('test-feature-1');
      expect(feature1.localID).toBe('HODGE-001');
      expect(feature1.externalID).toBeUndefined();
      expect(feature1.pmTool).toBeUndefined();
      expect(feature1.created).toBeInstanceOf(Date);

      const feature2 = await idManager.createFeature('test-feature-2');
      expect(feature2.localID).toBe('HODGE-002');
    });

    it('should create a feature with external ID and detect PM tool', async () => {
      const feature = await idManager.createFeature('test-feature', 'HOD-123');
      expect(feature.localID).toBe('HODGE-001');
      expect(feature.externalID).toBe('HOD-123');
      expect(feature.pmTool).toBe('linear');
    });

    it('should persist mappings to file', async () => {
      await idManager.createFeature('test-feature', 'JIRA-456');

      const mappingsFile = path.join(testDir, 'id-mappings.json');
      const data = await fs.readFile(mappingsFile, 'utf-8');
      const mappings = JSON.parse(data);

      expect(mappings['HODGE-001']).toBeDefined();
      expect(mappings['HODGE-001'].externalID).toBe('JIRA-456');
    });
  });

  describe('resolveID', () => {
    it('should validate ID input', async () => {
      await expect(idManager.resolveID('')).rejects.toThrow('ID must be a non-empty string');

      await expect(idManager.resolveID(null as any)).rejects.toThrow(
        'ID must be a non-empty string'
      );
    });
    beforeEach(async () => {
      await idManager.createFeature('feature-1', 'HOD-123');
      await idManager.createFeature('feature-2', 'JIRA-456');
    });

    it('should resolve local ID to feature', async () => {
      const feature = await idManager.resolveID('HODGE-001');
      expect(feature).toBeDefined();
      expect(feature?.localID).toBe('HODGE-001');
      expect(feature?.externalID).toBe('HOD-123');
    });

    it('should resolve external ID to feature', async () => {
      const feature = await idManager.resolveID('JIRA-456');
      expect(feature).toBeDefined();
      expect(feature?.localID).toBe('HODGE-002');
      expect(feature?.externalID).toBe('JIRA-456');
    });

    it('should return null for unknown ID', async () => {
      const feature = await idManager.resolveID('UNKNOWN-999');
      expect(feature).toBeNull();
    });
  });

  describe('linkExternalID', () => {
    it('should validate input parameters', async () => {
      await expect(idManager.linkExternalID('', 'HOD-123')).rejects.toThrow(
        'Local ID must be a non-empty string'
      );

      await expect(idManager.linkExternalID('HODGE-001', '')).rejects.toThrow(
        'External ID must be a non-empty string'
      );

      await expect(idManager.linkExternalID('INVALID-001', 'HOD-123')).rejects.toThrow(
        'Local ID must be in HODGE-xxx format'
      );
    });
    it('should link external ID to existing local ID', async () => {
      await idManager.createFeature('feature-1');

      const updated = await idManager.linkExternalID('HODGE-001', 'HOD-789');
      expect(updated.externalID).toBe('HOD-789');
      expect(updated.pmTool).toBe('linear');
      expect(updated.lastSynced).toBeInstanceOf(Date);

      // Verify persistence
      const resolved = await idManager.resolveID('HOD-789');
      expect(resolved?.localID).toBe('HODGE-001');
    });

    it('should throw error for non-existent local ID', async () => {
      await expect(idManager.linkExternalID('HODGE-999', 'HOD-789')).rejects.toThrow(
        'Feature HODGE-999 not found'
      );
    });
  });

  describe('PM tool detection', () => {
    const testCases = [
      { id: 'HOD-123', tool: 'linear' },
      { id: 'ENG-456', tool: 'linear' },
      { id: 'PROJ-1234', tool: 'jira' },
      { id: '#123', tool: 'github' },
      { id: '!456', tool: 'gitlab' },
      { id: '12345', tool: 'azure' },
      { id: 'unknown_format', tool: 'unknown' },
    ];

    testCases.forEach(({ id, tool }) => {
      it(`should detect ${tool} for ID ${id}`, async () => {
        const feature = await idManager.createFeature('test', id);
        expect(feature.pmTool).toBe(tool);
      });
    });
  });

  describe('getAllMappings', () => {
    it('should return all feature mappings', async () => {
      await idManager.createFeature('feature-1', 'HOD-111');
      await idManager.createFeature('feature-2', 'HOD-222');
      await idManager.createFeature('feature-3');

      const mappings = await idManager.getAllMappings();
      expect(Object.keys(mappings)).toHaveLength(3);
      expect(mappings['HODGE-001'].externalID).toBe('HOD-111');
      expect(mappings['HODGE-002'].externalID).toBe('HOD-222');
      expect(mappings['HODGE-003'].externalID).toBeUndefined();
    });
  });

  describe('migrateIDs', () => {
    it('should validate migration parameters', async () => {
      await expect(idManager.migrateIDs('', 'jira', new Map())).rejects.toThrow(
        'Both fromTool and toTool must be specified'
      );

      await expect(idManager.migrateIDs('linear', 'jira', new Map())).rejects.toThrow(
        'ID map cannot be empty'
      );
    });
    it('should migrate IDs from one PM tool to another', async () => {
      // Create features with Linear IDs
      await idManager.createFeature('feature-1', 'HOD-111');
      await idManager.createFeature('feature-2', 'HOD-222');

      // Create migration map
      const migrationMap = new Map([
        ['HOD-111', 'JIRA-111'],
        ['HOD-222', 'JIRA-222'],
      ]);

      // Perform migration
      await idManager.migrateIDs('linear', 'jira', migrationMap);

      // Verify migration
      const feature1 = await idManager.resolveID('JIRA-111');
      expect(feature1?.localID).toBe('HODGE-001');
      expect(feature1?.pmTool).toBe('jira');

      const feature2 = await idManager.resolveID('JIRA-222');
      expect(feature2?.localID).toBe('HODGE-002');
      expect(feature2?.pmTool).toBe('jira');

      // Old IDs should no longer resolve
      const oldFeature1 = await idManager.resolveID('HOD-111');
      expect(oldFeature1).toBeNull();
    });
  });

  describe('counter persistence', () => {
    it('should persist counter across instances', async () => {
      // Create first instance and generate IDs
      const manager1 = new IDManager(testDir);
      await manager1.createFeature('feature-1');
      await manager1.createFeature('feature-2');

      // Create new instance and continue counting
      const manager2 = new IDManager(testDir);
      const feature3 = await manager2.createFeature('feature-3');
      expect(feature3.localID).toBe('HODGE-003');
    });

    it('should handle file system errors gracefully', async () => {
      // Create manager with invalid path
      const invalidManager = new IDManager('/invalid/path/that/does/not/exist');

      // Should fail with proper error message
      await expect(invalidManager.createFeature('test')).rejects.toThrow('Failed to save counter');
    });

    it('should use zero-padded format', async () => {
      // Generate enough IDs to test padding
      for (let i = 1; i <= 15; i++) {
        const feature = await idManager.createFeature(`feature-${i}`);
        if (i < 10) {
          expect(feature.localID).toMatch(/^HODGE-00\d$/);
        } else {
          expect(feature.localID).toMatch(/^HODGE-0\d\d$/);
        }
      }
    });
  });

  describe('security', () => {
    it('should sanitize file paths', async () => {
      // Try to create manager with path traversal
      const maliciousManager = new IDManager('../../../etc/passwd');

      // Should fail safely when trying to save
      await expect(maliciousManager.createFeature('test')).rejects.toThrow();
    });

    it('should handle corrupted JSON gracefully', async () => {
      // Create corrupted mappings file
      const corruptedMappings = path.join(testDir, 'id-mappings.json');
      await fs.writeFile(corruptedMappings, '{"HODGE-001": {malformed json', 'utf-8');

      // Should handle gracefully
      await expect(idManager.getAllMappings()).rejects.toThrow();
    });
  });
});
