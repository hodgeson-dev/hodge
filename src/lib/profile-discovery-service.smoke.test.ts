/**
 * Smoke tests for ProfileDiscoveryService
 */

import { describe, expect } from 'vitest';
import { ProfileDiscoveryService } from './profile-discovery-service.js';
import { smokeTest } from '../test/helpers.js';

describe('ProfileDiscoveryService', () => {
  smokeTest('should not crash when discovering profiles', async () => {
    const service = new ProfileDiscoveryService();
    await expect(service.discoverProfiles()).resolves.not.toThrow();
  });

  smokeTest('should return a registry with profiles array', async () => {
    const service = new ProfileDiscoveryService();
    const registry = await service.discoverProfiles();

    expect(registry).toHaveProperty('profiles');
    expect(registry).toHaveProperty('detectableProfiles');
    expect(Array.isArray(registry.profiles)).toBe(true);
    expect(Array.isArray(registry.detectableProfiles)).toBe(true);
  });

  smokeTest('should find at least one profile with detection rules', async () => {
    const service = new ProfileDiscoveryService();
    const registry = await service.discoverProfiles();

    // We have some profiles with detection rules (react, vitest)
    expect(registry.detectableProfiles.length).toBeGreaterThan(0);
  });
});
