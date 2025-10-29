import { describe, expect, beforeEach, afterEach } from 'vitest';
import { smokeTest } from '../test/helpers.js';
import { SaveDiscoveryService } from './save-discovery-service.js';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

describe('SaveDiscoveryService', () => {
  let testDir: string;
  let service: SaveDiscoveryService;

  beforeEach(async () => {
    // Create isolated test directory
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hodge-test-'));
    service = new SaveDiscoveryService(testDir);
  });

  afterEach(async () => {
    // Clean up
    await fs.remove(testDir);
  });

  smokeTest('should return empty array when no saves exist', async () => {
    const saves = await service.discoverSaves();
    expect(saves).toEqual([]);
  });

  smokeTest('should discover valid saved contexts', async () => {
    // Create a save directory with context.json
    const savesDir = path.join(testDir, '.hodge', 'saves');
    const saveDir = path.join(savesDir, 'test-save-1');
    await fs.ensureDir(saveDir);

    const contextData = {
      feature: 'HODGE-123',
      mode: 'build',
      timestamp: '2025-10-29T10:00:00.000Z',
      session: { keyAchievements: ['Completed implementation'] },
    };

    await fs.writeJson(path.join(saveDir, 'context.json'), contextData);

    const saves = await service.discoverSaves();

    expect(saves).toHaveLength(1);
    expect(saves[0].name).toBe('test-save-1');
    expect(saves[0].feature).toBe('HODGE-123');
    expect(saves[0].mode).toBe('build');
    expect(saves[0].timestamp).toBe('2025-10-29T10:00:00.000Z');
    expect(saves[0].summary).toBe('Completed implementation');
  });

  smokeTest('should sort saves by timestamp (newest first)', async () => {
    const savesDir = path.join(testDir, '.hodge', 'saves');

    // Create three saves with different timestamps
    const saves = [
      { name: 'old-save', timestamp: '2025-10-27T10:00:00.000Z' },
      { name: 'newest-save', timestamp: '2025-10-29T10:00:00.000Z' },
      { name: 'middle-save', timestamp: '2025-10-28T10:00:00.000Z' },
    ];

    for (const save of saves) {
      const saveDir = path.join(savesDir, save.name);
      await fs.ensureDir(saveDir);
      await fs.writeJson(path.join(saveDir, 'context.json'), {
        feature: save.name,
        mode: 'explore',
        timestamp: save.timestamp,
      });
    }

    const discovered = await service.discoverSaves();

    expect(discovered).toHaveLength(3);
    expect(discovered[0].name).toBe('newest-save');
    expect(discovered[1].name).toBe('middle-save');
    expect(discovered[2].name).toBe('old-save');
  });

  smokeTest('should handle missing or invalid context.json gracefully', async () => {
    const savesDir = path.join(testDir, '.hodge', 'saves');

    // Create valid save
    const validSaveDir = path.join(savesDir, 'valid-save');
    await fs.ensureDir(validSaveDir);
    await fs.writeJson(path.join(validSaveDir, 'context.json'), {
      feature: 'HODGE-456',
      mode: 'build',
      timestamp: '2025-10-29T10:00:00.000Z',
    });

    // Create invalid save (no context.json)
    const invalidSaveDir = path.join(savesDir, 'invalid-save');
    await fs.ensureDir(invalidSaveDir);

    // Create corrupted save (invalid JSON)
    const corruptedSaveDir = path.join(savesDir, 'corrupted-save');
    await fs.ensureDir(corruptedSaveDir);
    await fs.writeFile(path.join(corruptedSaveDir, 'context.json'), 'not valid json');

    const discovered = await service.discoverSaves();

    // Should only include valid save
    expect(discovered).toHaveLength(1);
    expect(discovered[0].name).toBe('valid-save');
  });

  smokeTest('should provide default values for missing fields', async () => {
    const savesDir = path.join(testDir, '.hodge', 'saves');
    const saveDir = path.join(savesDir, 'minimal-save');
    await fs.ensureDir(saveDir);

    // Create minimal context with missing optional fields
    await fs.writeJson(path.join(saveDir, 'context.json'), {
      timestamp: '2025-10-29T10:00:00.000Z',
    });

    const saves = await service.discoverSaves();

    expect(saves).toHaveLength(1);
    expect(saves[0].feature).toBe('unknown');
    expect(saves[0].mode).toBe('unknown');
    expect(saves[0].summary).toBe('');
  });

  smokeTest('should format recent timestamps correctly', () => {
    const now = new Date();

    // 2 hours ago
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
    expect(service.formatTimeAgo(twoHoursAgo)).toBe('2 hours ago');

    // 1 hour ago
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
    expect(service.formatTimeAgo(oneHourAgo)).toBe('1 hour ago');

    // 30 minutes ago
    const thirtyMinsAgo = new Date(now.getTime() - 30 * 60 * 1000).toISOString();
    expect(service.formatTimeAgo(thirtyMinsAgo)).toBe('30 minutes ago');
  });

  smokeTest('should format day timestamps correctly', () => {
    const now = new Date();

    // 3 days ago
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(service.formatTimeAgo(threeDaysAgo)).toBe('3 days ago');

    // 1 day ago
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    expect(service.formatTimeAgo(oneDayAgo)).toBe('1 day ago');
  });

  smokeTest('should handle invalid timestamps gracefully', () => {
    expect(service.formatTimeAgo('invalid-date')).toBe('recently');
    expect(service.formatTimeAgo('')).toBe('recently');
  });
});
