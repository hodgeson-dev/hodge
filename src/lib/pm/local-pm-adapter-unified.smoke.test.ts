/**
 * Smoke tests for unified LocalPMAdapter architecture
 */

import { describe, it, expect } from 'vitest';
import { LocalPMAdapter } from './local-pm-adapter.js';
import { BasePMAdapter } from './base-adapter.js';
import { smokeTest } from '../../test/helpers.js';
import { withTestWorkspace } from '../../test/runners.js';
import path from 'path';
import { promises as fs } from 'fs';

describe('LocalPMAdapter Unified Architecture Smoke Tests', () => {
  smokeTest('should extend BasePMAdapter', async () => {
    await withTestWorkspace('local-adapter-extends', async (workspace) => {
      const adapter = new LocalPMAdapter(workspace.getPath());
      expect(adapter).toBeInstanceOf(BasePMAdapter);
    });
  });

  smokeTest('should implement all abstract methods', async () => {
    await withTestWorkspace('local-adapter-methods', async (workspace) => {
      const adapter = new LocalPMAdapter(workspace.getPath());

      // Check all abstract methods exist
      expect(adapter.fetchStates).toBeDefined();
      expect(adapter.getIssue).toBeDefined();
      expect(adapter.updateIssueState).toBeDefined();
      expect(adapter.searchIssues).toBeDefined();
      expect(adapter.createIssue).toBeDefined();
    });
  });

  smokeTest('should preserve special init method', async () => {
    await withTestWorkspace('local-adapter-init', async (workspace) => {
      const adapter = new LocalPMAdapter(workspace.getPath());

      // Init should still work
      await expect(adapter.init()).resolves.not.toThrow();

      // Should create project_management.md
      const pmPath = path.join(workspace.getPath(), '.hodge', 'project_management.md');
      const exists = await fs
        .access(pmPath)
        .then(() => true)
        .catch(() => false);
      expect(exists).toBe(true);
    });
  });

  smokeTest('should preserve updateFeatureStatus method', async () => {
    await withTestWorkspace('local-adapter-update', async (workspace) => {
      const adapter = new LocalPMAdapter(workspace.getPath());
      await adapter.init();

      // Special method should still work
      await expect(adapter.updateFeatureStatus('TEST-001', 'building')).resolves.not.toThrow();
    });
  });

  smokeTest('should preserve addFeature method', async () => {
    await withTestWorkspace('local-adapter-add', async (workspace) => {
      const adapter = new LocalPMAdapter(workspace.getPath());
      await adapter.init();

      // Special method should still work
      await expect(adapter.addFeature('TEST-002', 'Test feature')).resolves.not.toThrow();
    });
  });

  smokeTest('should fetch Hodge workflow states', async () => {
    await withTestWorkspace('local-adapter-states', async (workspace) => {
      const adapter = new LocalPMAdapter(workspace.getPath());
      const states = await adapter.fetchStates();

      expect(states).toHaveLength(4);
      expect(states.map((s) => s.id)).toEqual(['exploring', 'building', 'hardening', 'shipped']);
      expect(states[0].type).toBe('unstarted');
      expect(states[3].type).toBe('completed');
    });
  });

  smokeTest('should map feature to issue through getIssue', async () => {
    await withTestWorkspace('local-adapter-get-issue', async (workspace) => {
      const adapter = new LocalPMAdapter(workspace.getPath());
      await adapter.init();
      await adapter.addFeature('TEST-003', 'Test feature description');

      const issue = await adapter.getIssue('TEST-003');
      expect(issue.id).toBe('TEST-003');
      expect(issue.title).toContain('Test feature');
      expect(issue.state.id).toBe('exploring');
      expect(issue.url).toContain('project_management.md');
    });
  });

  smokeTest('should update feature through updateIssueState', async () => {
    await withTestWorkspace('local-adapter-update-state', async (workspace) => {
      const adapter = new LocalPMAdapter(workspace.getPath());
      await adapter.init();
      await adapter.addFeature('TEST-004', 'Test feature');

      // Use unified interface
      await adapter.updateIssueState('TEST-004', 'building');

      // Verify it worked
      const pmPath = path.join(workspace.getPath(), '.hodge', 'project_management.md');
      const content = await fs.readFile(pmPath, 'utf-8');
      expect(content).toContain('TEST-004');
    });
  });

  smokeTest('should search features through searchIssues', async () => {
    await withTestWorkspace('local-adapter-search', async (workspace) => {
      const adapter = new LocalPMAdapter(workspace.getPath());
      await adapter.init();
      await adapter.addFeature('TEST-005', 'Authentication feature');
      await adapter.addFeature('TEST-006', 'Authorization feature');

      const results = await adapter.searchIssues('Auth');
      expect(results).toHaveLength(2);
      expect(results[0].id).toMatch(/TEST-00[56]/);
      expect(results[1].id).toMatch(/TEST-00[56]/);
    });
  });

  smokeTest('should create feature through createIssue', async () => {
    await withTestWorkspace('local-adapter-create', async (workspace) => {
      const adapter = new LocalPMAdapter(workspace.getPath());
      await adapter.init();

      // Use unified interface
      const issue = await adapter.createIssue('TEST-007', 'New feature via issue interface');
      expect(issue.id).toBe('TEST-007');
      expect(issue.title).toContain('New feature');

      // Verify it was actually created
      const pmPath = path.join(workspace.getPath(), '.hodge', 'project_management.md');
      const content = await fs.readFile(pmPath, 'utf-8');
      expect(content).toContain('TEST-007');
    });
  });

  smokeTest('should be compatible with BasePMAdapter interface', async () => {
    await withTestWorkspace('local-adapter-compat', async (workspace) => {
      // Can use LocalPMAdapter as a BasePMAdapter
      const adapter: BasePMAdapter = new LocalPMAdapter(workspace.getPath());

      // All base methods should work
      const states = await adapter.fetchStates();
      expect(states).toBeDefined();

      await adapter.createIssue('TEST-008', 'Test');
      const issue = await adapter.getIssue('TEST-008');
      expect(issue).toBeDefined();

      await adapter.updateIssueState('TEST-008', 'shipped');
      const updated = await adapter.getIssue('TEST-008');
      expect(updated.state.type).toBe('completed');
    });
  });

  smokeTest('should handle file operations with serialization', async () => {
    await withTestWorkspace('local-adapter-concurrent', async (workspace) => {
      const adapter = new LocalPMAdapter(workspace.getPath());
      await adapter.init();

      // Concurrent operations should be serialized
      const operations = [
        adapter.addFeature('TEST-009', 'Feature 1'),
        adapter.addFeature('TEST-010', 'Feature 2'),
        adapter.updateFeatureStatus('TEST-009', 'building'),
        adapter.updateFeatureStatus('TEST-010', 'hardening'),
      ];

      await expect(Promise.all(operations)).resolves.not.toThrow();

      // All operations should have completed
      const pmPath = path.join(workspace.getPath(), '.hodge', 'project_management.md');
      const content = await fs.readFile(pmPath, 'utf-8');
      expect(content).toContain('TEST-009');
      expect(content).toContain('TEST-010');
    });
  });
});
