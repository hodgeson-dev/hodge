/**
 * Smoke Tests for Team Mode Detection Service
 * Tests the core detection logic for team vs solo mode
 */

import { describe, expect, beforeEach, afterEach } from 'vitest';
import { TeamModeService } from './team-mode-service.js';
import { TempDirectoryFixture } from '../test/temp-directory-fixture.js';
import { smokeTest } from '../test/helpers.js';
import fs from 'fs-extra';
import path from 'path';

describe('TeamModeService - Smoke Tests', () => {
  let fixture: TempDirectoryFixture;
  let service: TeamModeService;
  let testDir: string;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(async () => {
    // Save environment BEFORE clearing PM vars (to restore after test)
    originalEnv = { ...process.env };

    // Clear all PM-related environment variables to ensure clean state
    delete process.env.LINEAR_API_KEY;
    delete process.env.LINEAR_TEAM_ID;
    delete process.env.GITHUB_TOKEN;
    delete process.env.JIRA_HOST;
    delete process.env.JIRA_EMAIL;
    delete process.env.JIRA_API_TOKEN;
    delete process.env.TRELLO_API_KEY;
    delete process.env.TRELLO_TOKEN;
    delete process.env.ASANA_TOKEN;

    fixture = new TempDirectoryFixture();
    testDir = await fixture.setup();
    service = new TeamModeService(testDir);
  });

  afterEach(async () => {
    // Clear PM-related environment variables explicitly
    delete process.env.LINEAR_API_KEY;
    delete process.env.LINEAR_TEAM_ID;
    delete process.env.GITHUB_TOKEN;
    delete process.env.JIRA_HOST;
    delete process.env.JIRA_EMAIL;
    delete process.env.JIRA_API_TOKEN;
    delete process.env.TRELLO_API_KEY;
    delete process.env.TRELLO_TOKEN;
    delete process.env.ASANA_TOKEN;

    // Restore original environment for other vars
    process.env = { ...originalEnv };

    await fixture.cleanup();
  });

  smokeTest('should detect solo mode when no PM configuration exists', async () => {
    const result = await service.detectTeamMode();

    expect(result.teamMode).toBe(false);
    expect(result.queueMode).toBe(false);
    expect(result.reason).toContain('No PM configuration');
  });

  smokeTest('should detect solo mode when pm.enabled is false', async () => {
    // Create hodge.json with pm.enabled: false
    await fs.writeJSON(path.join(testDir, 'hodge.json'), {
      pm: {
        enabled: false,
        tool: 'linear',
      },
    });

    // Set valid credentials (should be ignored)
    process.env.LINEAR_API_KEY = 'lin_api_test';
    process.env.LINEAR_TEAM_ID = 'team-123';

    const result = await service.detectTeamMode();

    expect(result.teamMode).toBe(false);
    expect(result.queueMode).toBe(false);
    expect(result.reason).toContain('disabled via configuration');
  });

  smokeTest(
    'should detect team mode when pm.enabled is true with valid Linear credentials',
    async () => {
      // Create hodge.json with pm.enabled: true
      await fs.writeJSON(path.join(testDir, 'hodge.json'), {
        pm: {
          enabled: true,
          tool: 'linear',
          teamId: 'team-123',
        },
      });

      // Set valid credentials
      process.env.LINEAR_API_KEY = 'lin_api_test';
      process.env.LINEAR_TEAM_ID = 'team-123';

      const result = await service.detectTeamMode();

      expect(result.teamMode).toBe(true);
      expect(result.queueMode).toBe(false);
      expect(result.provider).toBe('linear');
      expect(result.reason).toContain('PM integration active');
    }
  );

  smokeTest(
    'should detect team mode when pm.enabled is true with valid GitHub credentials',
    async () => {
      // Create hodge.json with pm.enabled: true
      await fs.writeJSON(path.join(testDir, 'hodge.json'), {
        pm: {
          enabled: true,
          tool: 'github',
        },
      });

      // Set valid credentials
      process.env.GITHUB_TOKEN = 'ghp_test';

      const result = await service.detectTeamMode();

      expect(result.teamMode).toBe(true);
      expect(result.queueMode).toBe(false);
      expect(result.provider).toBe('github');
    }
  );

  smokeTest(
    'should enable queue mode when pm.enabled is true but credentials are missing',
    async () => {
      // Create hodge.json with pm.enabled: true
      await fs.writeJSON(path.join(testDir, 'hodge.json'), {
        pm: {
          enabled: true,
          tool: 'linear',
          queueOfflineRequests: true,
        },
      });

      // Don't set credentials

      const result = await service.detectTeamMode();

      expect(result.teamMode).toBe(false); // Effectively solo mode
      expect(result.queueMode).toBe(true); // But queuing enabled
      expect(result.provider).toBe('linear');
      expect(result.reason).toContain('Missing credentials');
    }
  );

  smokeTest('should respect queueOfflineRequests: false', async () => {
    // Create hodge.json with queueOfflineRequests: false
    await fs.writeJSON(path.join(testDir, 'hodge.json'), {
      pm: {
        enabled: true,
        tool: 'linear',
        queueOfflineRequests: false,
      },
    });

    // Don't set credentials

    const result = await service.detectTeamMode();

    expect(result.teamMode).toBe(false);
    expect(result.queueMode).toBe(false); // Queueing disabled
  });

  smokeTest('should use pm.tool to select provider when multiple credentials present', async () => {
    // Create hodge.json selecting linear
    await fs.writeJSON(path.join(testDir, 'hodge.json'), {
      pm: {
        enabled: true,
        tool: 'linear',
        teamId: 'team-123',
      },
    });

    // Set both Linear and GitHub credentials
    process.env.LINEAR_API_KEY = 'lin_api_test';
    process.env.LINEAR_TEAM_ID = 'team-123';
    process.env.GITHUB_TOKEN = 'ghp_test';

    const result = await service.detectTeamMode();

    expect(result.provider).toBe('linear'); // Should use configured tool
  });

  smokeTest('should validate Linear requires teamId in config', async () => {
    const config = {
      enabled: true,
      tool: 'linear' as const,
    };

    const validation = service.validateProviderConfig('linear', config);

    expect(validation.valid).toBe(false);
    expect(validation.missing).toContain('teamId');
  });

  smokeTest('should validate GitHub does not require additional config', async () => {
    const config = {
      enabled: true,
      tool: 'github' as const,
    };

    const validation = service.validateProviderConfig('github', config);

    expect(validation.valid).toBe(true);
    expect(validation.missing).toHaveLength(0);
  });

  smokeTest('checkCredentials should return true when Linear credentials present', async () => {
    process.env.LINEAR_API_KEY = 'lin_api_test';
    process.env.LINEAR_TEAM_ID = 'team-123';

    const hasCredentials = service.checkCredentials('linear');

    expect(hasCredentials).toBe(true);
  });

  smokeTest('checkCredentials should return false when Linear credentials missing', async () => {
    // Don't set credentials

    const hasCredentials = service.checkCredentials('linear');

    expect(hasCredentials).toBe(false);
  });

  smokeTest('checkCredentials should return true when GitHub credentials present', async () => {
    process.env.GITHUB_TOKEN = 'ghp_test';

    const hasCredentials = service.checkCredentials('github');

    expect(hasCredentials).toBe(true);
  });

  smokeTest(
    'checkCredentials should return true for local provider (no credentials needed)',
    async () => {
      const hasCredentials = service.checkCredentials('local');

      expect(hasCredentials).toBe(true);
    }
  );

  smokeTest('should handle malformed hodge.json gracefully', async () => {
    // Write invalid JSON
    await fs.writeFile(path.join(testDir, 'hodge.json'), 'invalid json{', 'utf8');

    const result = await service.detectTeamMode();

    expect(result.teamMode).toBe(false);
    expect(result.reason).toContain('No PM configuration');
  });

  smokeTest('should default to solo mode when pm section is missing', async () => {
    // Create hodge.json without pm section
    await fs.writeJSON(path.join(testDir, 'hodge.json'), {
      version: '1.0.0',
      features: {
        autoSave: true,
      },
    });

    const result = await service.detectTeamMode();

    expect(result.teamMode).toBe(false);
    expect(result.queueMode).toBe(false);
  });
});
