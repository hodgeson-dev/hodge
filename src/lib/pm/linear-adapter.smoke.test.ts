/**
 * Smoke tests for Linear adapter
 */
/* eslint-disable @typescript-eslint/unbound-method */

import { describe, expect } from 'vitest';
import { LinearAdapter } from './linear-adapter.js';
import { smokeTest } from '../../test/helpers.js';

describe('Linear Adapter Smoke Tests', () => {
  smokeTest('should fail gracefully without API key', async () => {
    expect(() => {
      // eslint-disable-next-line sonarjs/constructor-for-side-effects -- Testing constructor throws
      new LinearAdapter({
        config: {
          tool: 'linear',
        },
      });
    }).toThrow('Linear API key is required');
  });

  smokeTest('should fail gracefully without team ID', async () => {
    expect(() => {
      // eslint-disable-next-line sonarjs/constructor-for-side-effects -- Testing constructor throws
      new LinearAdapter({
        config: {
          tool: 'linear',
          apiKey: 'lin_api_testkey123456789',
        },
      });
    }).toThrow('Linear team ID is required');
  });

  smokeTest('should create adapter with valid config', async () => {
    const adapter = new LinearAdapter({
      config: {
        tool: 'linear',
        apiKey: 'lin_api_testkey123456789012345',
        teamId: 'test-team-id',
      },
    });
    expect(adapter).toBeDefined();
  });

  smokeTest('should have required methods', async () => {
    const adapter = new LinearAdapter({
      config: {
        tool: 'linear',
        apiKey: 'lin_api_testkey123456789012345',
        teamId: 'test-team-id',
      },
    });

    expect(adapter.fetchStates).toBeDefined();
    expect(adapter.getIssue).toBeDefined();
    expect(adapter.updateIssueState).toBeDefined();
    expect(adapter.searchIssues).toBeDefined();
    expect(adapter.createIssue).toBeDefined();
    expect(adapter.findIssueByFeature).toBeDefined();
    expect(adapter.addComment).toBeDefined();
  });

  smokeTest('should validate API key format', async () => {
    expect(() => {
      // eslint-disable-next-line sonarjs/constructor-for-side-effects -- Testing constructor throws
      new LinearAdapter({
        config: {
          tool: 'linear',
          apiKey: 'short',
          teamId: 'test-team-id',
        },
      });
    }).toThrow('Invalid Linear API key format');
  });

  smokeTest('should have addComment method for functional parity', async () => {
    const adapter = new LinearAdapter({
      config: {
        tool: 'linear',
        apiKey: 'lin_api_testkey123456789012345',
        teamId: 'test-team-id',
      },
    });

    // Verify the method exists and has correct signature
    expect(typeof adapter.addComment).toBe('function');
    expect(adapter.addComment.length).toBe(2); // Should take 2 parameters
  });
});
