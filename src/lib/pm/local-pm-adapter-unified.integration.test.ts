/**
 * Integration tests for unified LocalPMAdapter architecture
 * Tests the full integration of LocalPMAdapter with BasePMAdapter interface
 */

import { describe, expect } from 'vitest';
import { LocalPMAdapter } from './local-pm-adapter.js';
import { BasePMAdapter } from './base-adapter.js';
import { integrationTest } from '../../test/helpers.js';
import { withTestWorkspace } from '../../test/runners.js';
import path from 'path';
import { promises as fs } from 'fs';

describe('LocalPMAdapter Unified Architecture Integration Tests', () => {
  integrationTest('should work as a drop-in replacement for BasePMAdapter', async () => {
    await withTestWorkspace('local-adapter-base-integration', async (workspace) => {
      // Use LocalPMAdapter through BasePMAdapter interface
      const adapter: BasePMAdapter = new LocalPMAdapter(workspace.getPath());

      // Initialize
      if ('init' in adapter && typeof adapter.init === 'function') {
        await adapter.init();
      }

      // Test the full workflow through abstract interface
      const states = await adapter.fetchStates();
      expect(states).toHaveLength(4);
      expect(states[0].id).toBe('exploring');

      // Create issue
      const issue = await adapter.createIssue('UNIFIED-001', 'Test unified interface');
      expect(issue.id).toBe('UNIFIED-001');
      expect(issue.state.id).toBe('exploring');

      // Get issue
      const fetched = await adapter.getIssue('UNIFIED-001');
      expect(fetched.id).toBe('UNIFIED-001');
      expect(fetched.title).toContain('Test unified interface');

      // Update state through workflow
      await adapter.updateIssueState('UNIFIED-001', 'building');
      const building = await adapter.getIssue('UNIFIED-001');
      expect(building.state.id).toBe('building');

      await adapter.updateIssueState('UNIFIED-001', 'hardening');
      const hardening = await adapter.getIssue('UNIFIED-001');
      expect(hardening.state.id).toBe('hardening');

      await adapter.updateIssueState('UNIFIED-001', 'shipped');
      const shipped = await adapter.getIssue('UNIFIED-001');
      expect(shipped.state.id).toBe('shipped');
      expect(shipped.state.type).toBe('completed');

      // Verify file persistence
      const pmPath = path.join(workspace.getPath(), '.hodge', 'project_management.md');
      const content = await fs.readFile(pmPath, 'utf-8');
      expect(content).toContain('UNIFIED-001');
      expect(content).toContain('## Completed Features');
    });
  });

  integrationTest('should maintain backward compatibility with special methods', async () => {
    await withTestWorkspace('local-adapter-backward-compat', async (workspace) => {
      const adapter = new LocalPMAdapter(workspace.getPath());
      await adapter.init();

      // Test special methods still work
      await adapter.addFeature('COMPAT-001', 'Backward compatibility test', 'PM-123');
      await adapter.updateFeatureStatus('COMPAT-001', 'building');

      // Verify through unified interface
      const issue = await adapter.getIssue('COMPAT-001');
      expect(issue.id).toBe('COMPAT-001');
      expect(issue.state.id).toBe('building');
      expect(issue.description).toContain('PM-123');

      // Test phase progress update
      await adapter.updatePhaseProgress();

      const pmPath = path.join(workspace.getPath(), '.hodge', 'project_management.md');
      const content = await fs.readFile(pmPath, 'utf-8');
      expect(content).toContain('COMPAT-001');
    });
  });

  integrationTest('should handle search through unified interface', async () => {
    await withTestWorkspace('local-adapter-search-integration', async (workspace) => {
      const adapter: BasePMAdapter = new LocalPMAdapter(workspace.getPath());

      // Create multiple issues
      await adapter.createIssue('SEARCH-001', 'Authentication module');
      await adapter.createIssue('SEARCH-002', 'Authorization system');
      await adapter.createIssue('SEARCH-003', 'User management');
      await adapter.createIssue('SEARCH-004', 'Auth token refresh');

      // Search through unified interface
      const authResults = await adapter.searchIssues('Auth');
      expect(authResults.length).toBeGreaterThanOrEqual(3);

      const authIds = authResults.map((r) => r.id);
      expect(authIds).toContain('SEARCH-001');
      expect(authIds).toContain('SEARCH-002');
      expect(authIds).toContain('SEARCH-004');

      const userResults = await adapter.searchIssues('User');
      expect(userResults).toHaveLength(1);
      expect(userResults[0].id).toBe('SEARCH-003');
    });
  });

  integrationTest('should properly serialize concurrent operations', async () => {
    await withTestWorkspace('local-adapter-concurrency', async (workspace) => {
      const adapter = new LocalPMAdapter(workspace.getPath());
      await adapter.init();

      // Launch multiple concurrent operations
      const operations = [];
      for (let i = 1; i <= 10; i++) {
        operations.push(
          adapter.addFeature(`CONCURRENT-${i.toString().padStart(3, '0')}`, `Feature ${i}`)
        );
      }

      // All should complete without errors
      await expect(Promise.all(operations)).resolves.not.toThrow();

      // Verify all were written correctly
      const pmPath = path.join(workspace.getPath(), '.hodge', 'project_management.md');
      const content = await fs.readFile(pmPath, 'utf-8');

      for (let i = 1; i <= 10; i++) {
        expect(content).toContain(`CONCURRENT-${i.toString().padStart(3, '0')}`);
      }

      // Now update them concurrently
      const updates = [];
      for (let i = 1; i <= 10; i++) {
        const status = i % 2 === 0 ? 'building' : 'hardening';
        updates.push(
          adapter.updateIssueState(`CONCURRENT-${i.toString().padStart(3, '0')}`, status)
        );
      }

      await expect(Promise.all(updates)).resolves.not.toThrow();

      // Verify updates
      for (let i = 1; i <= 10; i++) {
        const issue = await adapter.getIssue(`CONCURRENT-${i.toString().padStart(3, '0')}`);
        const expectedStatus = i % 2 === 0 ? 'building' : 'hardening';
        expect(issue.state.id).toBe(expectedStatus);
      }
    });
  });

  integrationTest('should handle state transitions correctly', async () => {
    await withTestWorkspace('local-adapter-transitions', async (workspace) => {
      const adapter: BasePMAdapter = new LocalPMAdapter(workspace.getPath());

      // Create and transition through all states
      const issue = await adapter.createIssue('TRANSITION-001', 'State transition test');
      expect(issue.state.id).toBe('exploring');
      expect(issue.state.type).toBe('unstarted');

      // exploring -> building
      await adapter.updateIssueState('TRANSITION-001', 'building');
      let current = await adapter.getIssue('TRANSITION-001');
      expect(current.state.id).toBe('building');
      expect(current.state.type).toBe('started');

      // building -> hardening
      await adapter.updateIssueState('TRANSITION-001', 'hardening');
      current = await adapter.getIssue('TRANSITION-001');
      expect(current.state.id).toBe('hardening');
      expect(current.state.type).toBe('started');

      // hardening -> shipped
      await adapter.updateIssueState('TRANSITION-001', 'shipped');
      current = await adapter.getIssue('TRANSITION-001');
      expect(current.state.id).toBe('shipped');
      expect(current.state.type).toBe('completed');

      // Verify feature moved to completed section
      const pmPath = path.join(workspace.getPath(), '.hodge', 'project_management.md');
      const content = await fs.readFile(pmPath, 'utf-8');

      const completedIndex = content.indexOf('## Completed Features');
      const featureIndex = content.indexOf('TRANSITION-001');

      expect(completedIndex).toBeGreaterThan(0);
      expect(featureIndex).toBeGreaterThan(completedIndex);
    });
  });

  integrationTest('should provide proper issue URLs', async () => {
    await withTestWorkspace('local-adapter-urls', async (workspace) => {
      const adapter: BasePMAdapter = new LocalPMAdapter(workspace.getPath());

      const issue = await adapter.createIssue('URL-001', 'URL test feature');
      expect(issue.url).toBeDefined();
      expect(issue.url).toContain('project_management.md');
      expect(issue.url).toContain('#URL-001');

      // URL should work after state changes
      await adapter.updateIssueState('URL-001', 'shipped');
      const shipped = await adapter.getIssue('URL-001');
      expect(shipped.url).toBeDefined();
      expect(shipped.url).toContain('project_management.md');
    });
  });

  integrationTest('should handle missing features gracefully', async () => {
    await withTestWorkspace('local-adapter-missing', async (workspace) => {
      const adapter: BasePMAdapter = new LocalPMAdapter(workspace.getPath());

      // Getting non-existent issue should throw or return null
      await expect(adapter.getIssue('NONEXISTENT-001')).rejects.toThrow();

      // Updating non-existent issue should not crash
      await expect(adapter.updateIssueState('NONEXISTENT-002', 'building')).resolves.not.toThrow();

      // Search for non-existent should return empty
      const results = await adapter.searchIssues('DEFINITELYNOTFOUND12345');
      expect(results).toEqual([]);
    });
  });
});
