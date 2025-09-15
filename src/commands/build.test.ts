import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BuildCommand } from './build';
import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

vi.mock('fs/promises');
vi.mock('fs');

describe('BuildCommand', () => {
  let command: BuildCommand;

  beforeEach(() => {
    command = new BuildCommand();
    vi.clearAllMocks();

    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('execute', () => {
    it('should create build directory structure', async () => {
      const feature = 'test-feature';

      // Mock exploration exists
      vi.mocked(existsSync).mockImplementation((path) => {
        if (path.toString().includes('explore')) return true;
        if (path.toString().includes('decision.md')) return true;
        return false;
      });

      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);
      vi.mocked(fs.readFile).mockResolvedValue('Standards content');
      vi.mocked(fs.readdir).mockResolvedValue([]);

      await command.execute(feature);

      expect(fs.mkdir).toHaveBeenCalledWith(path.join('.hodge', 'features', feature, 'build'), {
        recursive: true,
      });
    });

    it('should warn if no exploration exists', async () => {
      const feature = 'test-feature';
      vi.mocked(existsSync).mockReturnValue(false);

      await command.execute(feature);

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('No exploration found'));
      expect(fs.mkdir).not.toHaveBeenCalled();
    });

    it('should skip checks with skipChecks option', async () => {
      const feature = 'test-feature';
      vi.mocked(existsSync).mockReturnValue(false);
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);
      vi.mocked(fs.readdir).mockResolvedValue([]);

      await command.execute(feature, { skipChecks: true });

      expect(fs.mkdir).toHaveBeenCalled();
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it('should create context.json with build mode', async () => {
      const feature = 'test-feature';

      vi.mocked(existsSync).mockImplementation((path) => {
        if (path.toString().includes('explore')) return true;
        if (path.toString().includes('decision.md')) return true;
        return false;
      });

      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);
      vi.mocked(fs.readFile).mockResolvedValue('Standards content');
      vi.mocked(fs.readdir).mockResolvedValue([]);

      await command.execute(feature);

      const contextCall = vi
        .mocked(fs.writeFile)
        .mock.calls.find((call) => call[0].toString().includes('context.json'));

      expect(contextCall).toBeDefined();
      if (contextCall) {
        const context = JSON.parse(contextCall[1] as string);
        expect(context.mode).toBe('build');
        expect(context.feature).toBe(feature);
        expect(context.standards).toBe('recommended');
        expect(context.validation).toBe('suggested');
      }
    });

    it('should create build plan template', async () => {
      const feature = 'test-feature';

      vi.mocked(existsSync).mockImplementation((path) => {
        if (path.toString().includes('explore')) return true;
        if (path.toString().includes('decision.md')) return true;
        return false;
      });

      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);
      vi.mocked(fs.readFile).mockResolvedValue('Standards content');
      vi.mocked(fs.readdir).mockResolvedValue([]);

      await command.execute(feature);

      const planCall = vi
        .mocked(fs.writeFile)
        .mock.calls.find((call) => call[0].toString().includes('build-plan.md'));

      expect(planCall).toBeDefined();
      if (planCall) {
        const content = planCall[1] as string;
        expect(content).toContain(`# Build Plan: ${feature}`);
        expect(content).toContain('Implementation Checklist');
        expect(content).toContain('Files Modified');
        expect(content).toContain('Testing Notes');
      }
    });

    it('should load and display patterns if available', async () => {
      const feature = 'test-feature';

      vi.mocked(existsSync).mockImplementation((path) => {
        if (path.toString().includes('explore')) return true;
        if (path.toString().includes('decision.md')) return true;
        if (path.toString().includes('patterns')) return true;
        return false;
      });

      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);
      vi.mocked(fs.readFile).mockResolvedValue('Standards content');
      vi.mocked(fs.readdir).mockResolvedValue(['pattern1.md', 'pattern2.md'] as any);

      await command.execute(feature);

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Available patterns'));
    });

    it('should link PM issue if exists', async () => {
      const feature = 'HOD-123';
      const originalEnv = process.env.HODGE_PM_TOOL;
      process.env.HODGE_PM_TOOL = 'linear';

      vi.mocked(existsSync).mockImplementation((path) => {
        if (path.toString().includes('explore')) return true;
        if (path.toString().includes('decision.md')) return true;
        if (path.toString().includes('issue-id.txt')) return true;
        return false;
      });

      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);
      vi.mocked(fs.readFile).mockImplementation((path) => {
        if (path.toString().includes('issue-id.txt')) {
          return Promise.resolve('HOD-123');
        }
        return Promise.resolve('Standards content');
      });
      vi.mocked(fs.readdir).mockResolvedValue([]);

      await command.execute(feature);

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Linked to linear issue'));

      process.env.HODGE_PM_TOOL = originalEnv;
    });
  });
});
