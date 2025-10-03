import { describe, expect } from 'vitest';
import { smokeTest } from '../test/helpers.js';
import { ShipService } from './ship-service.js';

describe('ShipService - HODGE-321 Service Extraction', () => {
  smokeTest('should instantiate without errors', () => {
    const service = new ShipService();
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(ShipService);
  });

  smokeTest('should have validateCommitMessage method', () => {
    const service = new ShipService();
    expect(service.validateCommitMessage).toBeDefined();
    expect(typeof service.validateCommitMessage).toBe('function');
  });

  smokeTest('should have isProtectedBranch method', () => {
    const service = new ShipService();
    expect(service.isProtectedBranch).toBeDefined();
    expect(typeof service.isProtectedBranch).toBe('function');
  });

  smokeTest('should have shouldSkipPush method', () => {
    const service = new ShipService();
    expect(service.shouldSkipPush).toBeDefined();
    expect(typeof service.shouldSkipPush).toBe('function');
  });

  smokeTest('should have generateCommitMetadata method', () => {
    const service = new ShipService();
    expect(service.generateCommitMetadata).toBeDefined();
    expect(typeof service.generateCommitMetadata).toBe('function');
  });

  smokeTest('should validate correct commit messages', () => {
    const service = new ShipService();

    expect(service.validateCommitMessage('feat: add new feature')).toBe(true);
    expect(service.validateCommitMessage('fix: resolve bug')).toBe(true);
    expect(service.validateCommitMessage('Multi-line\nmessage\nhere')).toBe(true);
  });

  smokeTest('should reject invalid commit messages', () => {
    const service = new ShipService();

    expect(service.validateCommitMessage('')).toBe(false);
    expect(service.validateCommitMessage('   ')).toBe(false);
    expect(service.validateCommitMessage('x'.repeat(6000))).toBe(false);
  });

  smokeTest('should detect protected branches', () => {
    const service = new ShipService();

    expect(service.isProtectedBranch('main')).toBe(true);
    expect(service.isProtectedBranch('master')).toBe(true);
    expect(service.isProtectedBranch('production')).toBe(true);
    expect(service.isProtectedBranch('prod')).toBe(true);
    expect(service.isProtectedBranch('MAIN')).toBe(true); // case insensitive
  });

  smokeTest('should not detect feature branches as protected', () => {
    const service = new ShipService();

    expect(service.isProtectedBranch('feature-123')).toBe(false);
    expect(service.isProtectedBranch('develop')).toBe(false);
    expect(service.isProtectedBranch('staging')).toBe(false);
  });

  smokeTest('should skip push when noPush flag is set', () => {
    const service = new ShipService();

    const result = service.shouldSkipPush('feature-branch', { noPush: true });

    expect(result.skip).toBe(true);
    expect(result.reason).toContain('--no-push');
  });

  smokeTest('should skip push on protected branch without force', () => {
    const service = new ShipService();

    const result = service.shouldSkipPush('main', {});

    expect(result.skip).toBe(true);
    expect(result.reason).toContain('Protected branch');
  });

  smokeTest('should allow push on protected branch with forcePush', () => {
    const service = new ShipService();

    const result = service.shouldSkipPush('main', { forcePush: true });

    expect(result.skip).toBe(false);
  });

  smokeTest('should allow push on feature branches', () => {
    const service = new ShipService();

    const result = service.shouldSkipPush('feature-123', {});

    expect(result.skip).toBe(false);
  });

  smokeTest('should generate commit metadata correctly', () => {
    const service = new ShipService();

    const metadata = service.generateCommitMetadata('test-feature', 'feat: test commit');

    expect(metadata.feature).toBe('test-feature');
    expect(metadata.message).toBe('feat: test commit');
    expect(metadata.valid).toBe(true);
    expect(metadata.timestamp).toBeDefined();
    expect(new Date(metadata.timestamp)).toBeInstanceOf(Date);
  });

  smokeTest('should mark invalid commit in metadata', () => {
    const service = new ShipService();

    const metadata = service.generateCommitMetadata('test-feature', '');

    expect(metadata.valid).toBe(false);
  });
});
