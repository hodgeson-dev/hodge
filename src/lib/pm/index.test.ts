/**
 * Tests for PM Module Index
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPMAdapter, getPMAdapterFromEnv, transitionIssueForMode } from './index';
import { LinearAdapter } from './linear-adapter';

// Mock the LinearAdapter
vi.mock('./linear-adapter', () => ({
  LinearAdapter: vi.fn().mockImplementation(() => ({
    transitionIssue: vi.fn().mockResolvedValue(undefined),
  })),
}));

describe('PM Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear environment variables
    delete process.env.HODGE_PM_TOOL;
    delete process.env.LINEAR_API_KEY;
    delete process.env.LINEAR_TEAM_ID;
  });

  describe('createPMAdapter', () => {
    it('should create Linear adapter', () => {
      const adapter = createPMAdapter('linear', {
        tool: 'linear',
        apiKey: 'test-key',
        teamId: 'test-team',
      });

      expect(LinearAdapter).toHaveBeenCalled();
      expect(adapter).toBeDefined();
    });

    it('should throw error for unsupported PM tool', () => {
      expect(() => createPMAdapter('github', { tool: 'github' })).toThrow(
        'GitHub adapter not yet implemented'
      );
    });

    it('should throw error for unknown PM tool', () => {
      expect(() =>
        // @ts-expect-error Testing invalid PM tool
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        createPMAdapter('unknown' as PMTool, { tool: 'unknown' })
      ).toThrow('Unknown PM tool: unknown');
    });
  });

  describe('getPMAdapterFromEnv', () => {
    it('should return null when no PM tool configured', () => {
      const adapter = getPMAdapterFromEnv();
      expect(adapter).toBeNull();
    });

    it('should create Linear adapter from environment', () => {
      process.env.HODGE_PM_TOOL = 'linear';
      process.env.LINEAR_API_KEY = 'test-key';
      process.env.LINEAR_TEAM_ID = 'test-team';

      const adapter = getPMAdapterFromEnv();
      expect(LinearAdapter).toHaveBeenCalled();
      expect(adapter).toBeDefined();
    });

    it('should return null when Linear lacks required env vars', () => {
      process.env.HODGE_PM_TOOL = 'linear';
      // Missing API key and team ID

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const adapter = getPMAdapterFromEnv();

      expect(adapter).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Linear requires'));
    });

    it('should handle adapter creation errors', () => {
      process.env.HODGE_PM_TOOL = 'linear';
      process.env.LINEAR_API_KEY = 'test-key';
      process.env.LINEAR_TEAM_ID = 'test-team';

      // Make LinearAdapter throw
      vi.mocked(LinearAdapter).mockImplementationOnce(() => {
        throw new Error('Creation failed');
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const adapter = getPMAdapterFromEnv();

      expect(adapter).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to create PM adapter')
      );
    });
  });

  describe('transitionIssueForMode', () => {
    it('should return false when no adapter available', async () => {
      const result = await transitionIssueForMode('issue-1', 'explore', 'build');
      expect(result).toBe(false);
    });

    it('should transition issue successfully', async () => {
      process.env.HODGE_PM_TOOL = 'linear';
      process.env.LINEAR_API_KEY = 'test-key';
      process.env.LINEAR_TEAM_ID = 'test-team';

      const mockTransition = vi.fn().mockResolvedValue(undefined);
      vi.mocked(LinearAdapter).mockImplementationOnce(
        () =>
          ({
            transitionIssue: mockTransition,
            fetchStates: vi.fn(),
            getIssue: vi.fn(),
            updateIssueState: vi.fn(),
            searchIssues: vi.fn(),
            createIssue: vi.fn(),
          }) as unknown as LinearAdapter
      );

      const result = await transitionIssueForMode('issue-1', 'explore', 'build');

      expect(result).toBe(true);
      expect(mockTransition).toHaveBeenCalledWith('issue-1', 'explore', 'build');
    });

    it('should handle transition errors', async () => {
      process.env.HODGE_PM_TOOL = 'linear';
      process.env.LINEAR_API_KEY = 'test-key';
      process.env.LINEAR_TEAM_ID = 'test-team';

      const mockTransition = vi.fn().mockRejectedValue(new Error('Transition failed'));
      vi.mocked(LinearAdapter).mockImplementationOnce(
        () =>
          ({
            transitionIssue: mockTransition,
            fetchStates: vi.fn(),
            getIssue: vi.fn(),
            updateIssueState: vi.fn(),
            searchIssues: vi.fn(),
            createIssue: vi.fn(),
          }) as unknown as LinearAdapter
      );

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = await transitionIssueForMode('issue-1', 'explore', 'build');

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to transition issue')
      );
    });
  });
});
