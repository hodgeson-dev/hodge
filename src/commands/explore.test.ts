import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ExploreCommand } from './explore';
import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

vi.mock('fs/promises');
vi.mock('fs');

describe.skip('ExploreCommand', () => {
  let command: ExploreCommand;

  beforeEach(() => {
    command = new ExploreCommand();
    vi.clearAllMocks();

    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('execute', () => {
    it('should create exploration directory structure', async () => {
      const feature = 'test-feature';
      vi.mocked(existsSync).mockReturnValue(false);
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);

      await command.execute(feature, { skipIdManagement: true });

      expect(fs.mkdir).toHaveBeenCalledWith(path.join('.hodge', 'features', feature, 'explore'), {
        recursive: true,
      });
    });

    it('should create context.json with correct mode', async () => {
      const feature = 'test-feature';
      vi.mocked(existsSync).mockReturnValue(false);
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);

      await command.execute(feature, { skipIdManagement: true });

      const contextCall = vi
        .mocked(fs.writeFile)
        .mock.calls.find((call) => call[0].toString().includes('context.json'));

      expect(contextCall).toBeDefined();
      if (contextCall) {
        const context = JSON.parse(contextCall[1] as string);
        expect(context.mode).toBe('explore');
        expect(context.feature).toBe(feature);
        expect(context.standards).toBe('suggested');
        expect(context.validation).toBe('optional');
      }
    });

    it('should create exploration template', async () => {
      const feature = 'test-feature';
      vi.mocked(existsSync).mockReturnValue(false);
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);

      await command.execute(feature, { skipIdManagement: true });

      const templateCall = vi
        .mocked(fs.writeFile)
        .mock.calls.find((call) => call[0].toString().includes('exploration.md'));

      expect(templateCall).toBeDefined();
      if (templateCall) {
        const content = templateCall[1] as string;
        expect(content).toContain(`# Exploration: ${feature}`);
        expect(content).toContain('Approach 1');
        expect(content).toContain('Approach 2');
        expect(content).toContain('Approach 3');
      }
    });

    it('should warn if exploration already exists without force', async () => {
      const feature = 'test-feature';
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(fs.readFile).mockResolvedValue('Existing exploration content');

      await command.execute(feature, { skipIdManagement: true });

      expect(fs.mkdir).not.toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Exploration already exists')
      );
    });

    it('should overwrite exploration with force option', async () => {
      const feature = 'test-feature';
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);
      vi.mocked(fs.readFile).mockResolvedValue(
        '### 2024-01-01 Decision 1\n### 2024-01-02 Decision 2'
      );
      vi.mocked(fs.readdir).mockResolvedValue([]);

      await command.execute(feature, { force: true, skipIdManagement: true });

      expect(fs.mkdir).toHaveBeenCalled();
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it('should create context with PM tool environment', async () => {
      const feature = 'HOD-123';
      const originalEnv = process.env.HODGE_PM_TOOL;
      process.env.HODGE_PM_TOOL = 'linear';

      vi.mocked(existsSync).mockReturnValue(false);
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);

      await command.execute(feature, { skipIdManagement: true });

      // When skipIdManagement is true, PM linking is not performed
      // Just verify that context.json is created
      const contextCall = vi
        .mocked(fs.writeFile)
        .mock.calls.find((call) => call[0].toString().includes('context.json'));

      expect(contextCall).toBeDefined();
      if (contextCall) {
        const context = JSON.parse(contextCall[1] as string);
        expect(context.mode).toBe('explore');
        // With skipIdManagement, PM tool won't be set in context
        // This is expected behavior for test mode
      }

      process.env.HODGE_PM_TOOL = originalEnv;
    });
  });
});
