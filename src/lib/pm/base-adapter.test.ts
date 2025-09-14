/**
 * Tests for Base PM Adapter
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BasePMAdapter } from './base-adapter';
import { PMAdapterOptions, PMIssue, PMState, HodgeMode } from './types';
import * as fs from 'fs';
import path from 'path';

// Mock fs module
vi.mock('fs');
vi.mock('path');

// Create a concrete implementation for testing
class TestAdapter extends BasePMAdapter {
  fetchStates(): Promise<PMState[]> {
    return Promise.resolve([
      { id: '1', name: 'Backlog', type: 'unstarted' },
      { id: '2', name: 'In Progress', type: 'started' },
      { id: '3', name: 'Done', type: 'completed' },
    ]);
  }

  getIssue(issueId: string): Promise<PMIssue> {
    return Promise.resolve({
      id: issueId,
      title: 'Test Issue',
      state: { id: '1', name: 'Backlog', type: 'unstarted' },
    });
  }

  updateIssueState(_issueId: string, _stateId: string): Promise<void> {
    // Mock implementation
    return Promise.resolve();
  }

  searchIssues(): Promise<PMIssue[]> {
    return Promise.resolve([]);
  }

  createIssue(title: string): Promise<PMIssue> {
    return Promise.resolve({
      id: 'new-1',
      title,
      state: { id: '1', name: 'Backlog', type: 'unstarted' },
    });
  }
}

describe('BasePMAdapter', () => {
  let adapter: TestAdapter;
  const mockOptions: PMAdapterOptions = {
    config: {
      tool: 'custom',
      apiKey: 'test-key',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(path).join.mockImplementation(() => '.hodge/pm-overrides.json');
    vi.mocked(fs.existsSync).mockReturnValue(false);
    adapter = new TestAdapter(mockOptions);
  });

  describe('constructor', () => {
    it('should initialize with provided options', () => {
      expect(adapter).toBeDefined();
    });

    it('should load overrides if file exists', () => {
      const mockOverrides = {
        transitions: { 'explore->build': 'state-2' },
      };

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockOverrides));

      const newAdapter = new TestAdapter(mockOptions);
      expect(newAdapter).toBeDefined();
    });

    it('should handle invalid overrides file gracefully', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockImplementation(() => {
        throw new Error('File read error');
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const newAdapter = new TestAdapter(mockOptions);

      expect(newAdapter).toBeDefined();
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('getStates', () => {
    it('should fetch and cache states', async () => {
      const states = await adapter.getStates();
      expect(states).toHaveLength(3);
      expect(states[0].name).toBe('Backlog');
    });

    it('should use cached states within timeout', async () => {
      const fetchSpy = vi.spyOn(adapter, 'fetchStates');

      await adapter.getStates();
      await adapter.getStates();

      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('transitionIssue', () => {
    it('should validate issue ID', async () => {
      await expect(adapter.transitionIssue('', 'explore', 'build')).rejects.toThrow(
        'Invalid issue ID'
      );
    });

    it('should validate mode transitions', async () => {
      await expect(
        adapter.transitionIssue('issue-1', 'invalid' as HodgeMode, 'build')
      ).rejects.toThrow('Invalid mode transition');
    });

    it('should use override if available', async () => {
      const mockOverrides = {
        transitions: { 'explore->build': 'state-2' },
      };

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockOverrides));

      const newAdapter = new TestAdapter(mockOptions);
      const updateSpy = vi.spyOn(newAdapter, 'updateIssueState');

      await newAdapter.transitionIssue('issue-1', 'explore', 'build');
      expect(updateSpy).toHaveBeenCalledWith('issue-1', 'state-2');
    });

    it('should use conventions when no override', async () => {
      const updateSpy = vi.spyOn(adapter, 'updateIssueState');

      await adapter.transitionIssue('issue-1', 'explore', 'build');
      expect(updateSpy).toHaveBeenCalledWith('issue-1', '2');
    });

    it('should throw error when no matching state found', async () => {
      // Override fetchStates to return no started states
      vi.spyOn(adapter, 'fetchStates').mockResolvedValue([
        { id: '1', name: 'Custom', type: 'unknown' },
      ]);

      await expect(adapter.transitionIssue('issue-1', 'explore', 'build')).rejects.toThrow(
        'No state found'
      );
    });
  });

  describe('detectModeFromIssue', () => {
    it('should validate issue ID', async () => {
      await expect(adapter.detectModeFromIssue('')).rejects.toThrow('Invalid issue ID');
    });

    it('should detect explore mode for unstarted', async () => {
      const mode = await adapter.detectModeFromIssue('issue-1');
      expect(mode).toBe('explore');
    });

    it('should detect build mode for started', async () => {
      vi.spyOn(adapter, 'getIssue').mockResolvedValue({
        id: 'issue-1',
        title: 'Test',
        state: { id: '2', name: 'In Progress', type: 'started' },
      });

      const mode = await adapter.detectModeFromIssue('issue-1');
      expect(mode).toBe('build');
    });

    it('should detect harden mode for review states', async () => {
      vi.spyOn(adapter, 'getIssue').mockResolvedValue({
        id: 'issue-1',
        title: 'Test',
        state: { id: '3', name: 'In Review', type: 'started' },
      });

      const mode = await adapter.detectModeFromIssue('issue-1');
      expect(mode).toBe('harden');
    });

    it('should detect ship mode for completed', async () => {
      vi.spyOn(adapter, 'getIssue').mockResolvedValue({
        id: 'issue-1',
        title: 'Test',
        state: { id: '4', name: 'Done', type: 'completed' },
      });

      const mode = await adapter.detectModeFromIssue('issue-1');
      expect(mode).toBe('ship');
    });
  });

  describe('generateOverrideTemplate', () => {
    it('should generate valid override template', () => {
      const template = adapter.generateOverrideTemplate();

      expect(template).toHaveProperty('transitions');
      expect(template).toHaveProperty('customPatterns');
      expect(template).toHaveProperty('issueUrlPattern');
      expect(template.transitions).toHaveProperty('explore->build');
    });
  });
});
