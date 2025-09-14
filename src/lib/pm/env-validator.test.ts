/**
 * Tests for PM environment validator
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { validatePMEnvironment, printValidationResults, isPMAvailable } from './env-validator';

describe('PM Environment Validator', () => {
  // Store original env
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset env for each test
    process.env = { ...originalEnv };
    delete process.env.HODGE_PM_TOOL;
    delete process.env.LINEAR_API_KEY;
    delete process.env.LINEAR_TEAM_ID;
    delete process.env.GITHUB_TOKEN;
  });

  describe('validatePMEnvironment', () => {
    it('should fail when no PM tool configured', () => {
      const config = validatePMEnvironment();

      expect(config.isValid).toBe(false);
      expect(config.errors).toContain('HODGE_PM_TOOL environment variable is not set');
    });

    it('should validate Linear configuration', () => {
      process.env.HODGE_PM_TOOL = 'linear';
      process.env.LINEAR_API_KEY = 'lin_api_1234567890abcdefghij';
      process.env.LINEAR_TEAM_ID = 'team-123';

      const config = validatePMEnvironment();

      expect(config.isValid).toBe(true);
      expect(config.tool).toBe('linear');
      expect(config.errors).toHaveLength(0);
    });

    it('should fail for Linear without API key', () => {
      process.env.HODGE_PM_TOOL = 'linear';
      process.env.LINEAR_TEAM_ID = 'team-123';

      const config = validatePMEnvironment();

      expect(config.isValid).toBe(false);
      expect(config.errors).toContain('LINEAR_API_KEY environment variable is required for Linear');
    });

    it('should fail for Linear with invalid API key', () => {
      process.env.HODGE_PM_TOOL = 'linear';
      process.env.LINEAR_API_KEY = 'too-short';
      process.env.LINEAR_TEAM_ID = 'team-123';

      const config = validatePMEnvironment();

      expect(config.isValid).toBe(false);
      expect(config.errors).toContain('LINEAR_API_KEY appears to be invalid (too short)');
    });

    it('should fail for Linear without team ID', () => {
      process.env.HODGE_PM_TOOL = 'linear';
      process.env.LINEAR_API_KEY = 'lin_api_1234567890abcdefghij';

      const config = validatePMEnvironment();

      expect(config.isValid).toBe(false);
      expect(config.errors).toContain('LINEAR_TEAM_ID environment variable is required for Linear');
    });

    it('should validate GitHub configuration', () => {
      process.env.HODGE_PM_TOOL = 'github';
      process.env.GITHUB_TOKEN = 'ghp_1234567890abcdefghij';

      const config = validatePMEnvironment();

      expect(config.isValid).toBe(true);
      expect(config.tool).toBe('github');
    });

    it('should fail for GitHub without token', () => {
      process.env.HODGE_PM_TOOL = 'github';

      const config = validatePMEnvironment();

      expect(config.isValid).toBe(false);
      expect(config.errors).toContain('GITHUB_TOKEN environment variable is required for GitHub');
    });

    it('should fail for Jira (not implemented)', () => {
      process.env.HODGE_PM_TOOL = 'jira';

      const config = validatePMEnvironment();

      expect(config.isValid).toBe(false);
      expect(config.errors).toContain('Jira integration is not yet implemented');
    });

    it('should fail for unknown PM tool', () => {
      process.env.HODGE_PM_TOOL = 'unknown';

      const config = validatePMEnvironment();

      expect(config.isValid).toBe(false);
      expect(config.errors).toContain('Unknown PM tool: unknown');
    });
  });

  describe('printValidationResults', () => {
    it('should print success message for valid config', () => {
      const stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);

      const config = {
        tool: 'linear' as const,
        teamId: 'team-123',
        isValid: true,
        errors: [],
      };

      printValidationResults(config);

      expect(stdoutSpy).toHaveBeenCalledWith(
        expect.stringContaining('✅ PM tool environment is properly configured')
      );
      expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining('Tool: linear'));
    });

    it('should print error messages for invalid config', () => {
      const stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);

      const config = {
        tool: 'linear' as const,
        isValid: false,
        errors: ['Error 1', 'Error 2'],
      };

      printValidationResults(config);

      expect(stdoutSpy).toHaveBeenCalledWith(
        expect.stringContaining('❌ PM tool environment validation failed')
      );
      expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining('Error 1'));
      expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining('Error 2'));
    });
  });

  describe('isPMAvailable', () => {
    it('should return true when PM is configured', () => {
      process.env.HODGE_PM_TOOL = 'linear';
      process.env.LINEAR_API_KEY = 'lin_api_1234567890abcdefghij';
      process.env.LINEAR_TEAM_ID = 'team-123';

      expect(isPMAvailable()).toBe(true);
    });

    it('should return false when PM is not configured', () => {
      expect(isPMAvailable()).toBe(false);
    });
  });

  // Restore original env
  afterEach(() => {
    process.env = originalEnv;
  });
});
