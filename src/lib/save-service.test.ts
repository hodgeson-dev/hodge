import { describe, expect } from 'vitest';
import { smokeTest } from '../test/helpers.js';
import { SaveService } from './save-service.js';

describe('SaveService - HODGE-321 Service Extraction', () => {
  smokeTest('should instantiate without errors', () => {
    const service = new SaveService();
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(SaveService);
  });

  smokeTest('should have generateSaveName method', () => {
    const service = new SaveService();
    expect(service.generateSaveName).toBeDefined();
    expect(typeof service.generateSaveName).toBe('function');
  });

  smokeTest('should have validateSaveName method', () => {
    const service = new SaveService();
    expect(service.validateSaveName).toBeDefined();
    expect(typeof service.validateSaveName).toBe('function');
  });

  smokeTest('should have getSaveTypeDescription method', () => {
    const service = new SaveService();
    expect(service.getSaveTypeDescription).toBeDefined();
    expect(typeof service.getSaveTypeDescription).toBe('function');
  });

  smokeTest('should generate save name with provided feature', async () => {
    const service = new SaveService();
    const timestamp = '2025-10-03T12-00-00';

    const saveName = await service.generateSaveName({
      feature: 'test-feature',
      timestamp,
    });

    expect(saveName).toBe('test-feature-2025-10-03T12-00-00');
  });

  smokeTest('should validate correct save names', () => {
    const service = new SaveService();

    expect(service.validateSaveName('my-save')).toBe(true);
    expect(service.validateSaveName('feature-123')).toBe(true);
    expect(service.validateSaveName('test_save_2025')).toBe(true);
  });

  smokeTest('should reject invalid save names', () => {
    const service = new SaveService();

    expect(service.validateSaveName('')).toBe(false);
    expect(service.validateSaveName('   ')).toBe(false);
    expect(service.validateSaveName('invalid/name')).toBe(false);
    expect(service.validateSaveName('invalid\\name')).toBe(false);
    expect(service.validateSaveName('invalid:name')).toBe(false);
  });

  smokeTest('should return correct save type descriptions', () => {
    const service = new SaveService();

    expect(service.getSaveTypeDescription({ minimal: true })).toBe('Minimal (manifest only)');
    expect(service.getSaveTypeDescription({ type: 'incremental' })).toBe(
      'Incremental (changes only)'
    );
    expect(service.getSaveTypeDescription({ type: 'auto' })).toBe('Auto-save');
    expect(service.getSaveTypeDescription({ type: 'full' })).toBe('Full save');
    expect(service.getSaveTypeDescription({})).toBe('Full save');
  });
});
