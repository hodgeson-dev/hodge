/**
 * Smoke tests for GitHub adapter
 */

import { describe, it, expect } from 'vitest';
import { GitHubAdapter } from './github-adapter.js';
import { smokeTest } from '../../test/helpers.js';

describe('GitHub Adapter Smoke Tests', () => {
  smokeTest('should fail gracefully without token', async () => {
    expect(() => {
      new GitHubAdapter({
        config: {
          tool: 'github',
        },
      });
    }).toThrow('GitHub token is required');
  });

  smokeTest('should create adapter with valid token', async () => {
    // Mock token for smoke test
    const adapter = new GitHubAdapter({
      config: {
        tool: 'github',
        apiKey: 'ghp_testtoken123456789',
      },
    });
    expect(adapter).toBeDefined();
  });

  smokeTest('should have required methods', async () => {
    const adapter = new GitHubAdapter({
      config: {
        tool: 'github',
        apiKey: 'ghp_testtoken123456789',
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

  smokeTest('should return simulated states', async () => {
    const adapter = new GitHubAdapter({
      config: {
        tool: 'github',
        apiKey: 'ghp_testtoken123456789',
      },
    });

    const states = await adapter.fetchStates();
    expect(states).toHaveLength(2);
    expect(states[0]).toHaveProperty('id', 'open');
    expect(states[1]).toHaveProperty('id', 'closed');
  });
});
