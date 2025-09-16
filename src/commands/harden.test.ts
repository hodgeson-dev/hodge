import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { HardenCommand } from './harden';
import fs from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

vi.mock('fs/promises');
vi.mock('fs');

// Mock execAsync directly in the module
vi.mock('child_process', () => ({
  exec: vi.fn(),
}));

vi.mock('util', () => ({
  promisify: vi.fn(() => vi.fn().mockResolvedValue({ stdout: 'Success', stderr: '' })),
}));

describe.skip('HardenCommand', () => {
  let command: HardenCommand;

  beforeEach(() => {
    command = new HardenCommand();
    vi.clearAllMocks();

    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('execute', () => {
    it('should require build to exist', async () => {
      const feature = 'test-feature';
      vi.mocked(existsSync).mockReturnValue(false);

      await command.execute(feature);

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('No build found'));
      expect(fs.mkdir).not.toHaveBeenCalled();
    });

    it('should create harden directory structure', async () => {
      const feature = 'test-feature';

      vi.mocked(existsSync).mockImplementation((path) => {
        if (path.toString().includes('build')) return true;
        return false;
      });

      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);
      vi.mocked(fs.readFile).mockResolvedValue('HOD-123');

      await command.execute(feature);

      expect(fs.mkdir).toHaveBeenCalledWith(path.join('.hodge', 'features', feature, 'harden'), {
        recursive: true,
      });
    });

    it('should create context.json with harden mode', async () => {
      const feature = 'test-feature';

      vi.mocked(existsSync).mockImplementation((path) => {
        if (path.toString().includes('build')) return true;
        return false;
      });

      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);
      vi.mocked(fs.readFile).mockResolvedValue('HOD-123');

      await command.execute(feature);

      const contextCall = vi
        .mocked(fs.writeFile)
        .mock.calls.find((call) => call[0].toString().includes('context.json'));

      expect(contextCall).toBeDefined();
      if (contextCall) {
        const context = JSON.parse(contextCall[1] as string);
        expect(context.mode).toBe('harden');
        expect(context.feature).toBe(feature);
        expect(context.standards).toBe('enforced');
        expect(context.validation).toBe('required');
      }
    });

    // TODO: Add validation tests once execAsync mocking is properly implemented
    // These tests require complex mocking of the promisified exec function

    it('should create harden report', async () => {
      const feature = 'test-feature';

      vi.mocked(existsSync).mockImplementation((path) => {
        if (path.toString().includes('build')) return true;
        return false;
      });

      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);
      vi.mocked(fs.readFile).mockResolvedValue('HOD-123');

      await command.execute(feature);

      const reportCall = vi
        .mocked(fs.writeFile)
        .mock.calls.find((call) => call[0].toString().includes('harden-report.md'));

      expect(reportCall).toBeDefined();
      if (reportCall) {
        const content = reportCall[1] as string;
        expect(content).toContain(`# Harden Report: ${feature}`);
        expect(content).toContain('Validation Results');
        expect(content).toContain('Standards Compliance');
        expect(content).toContain('Next Steps');
      }
    });

    it('should save validation results', async () => {
      const feature = 'test-feature';

      vi.mocked(existsSync).mockImplementation((path) => {
        if (path.toString().includes('build')) return true;
        return false;
      });

      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.writeFile).mockResolvedValue(undefined);
      vi.mocked(fs.readFile).mockResolvedValue('HOD-123');

      await command.execute(feature);

      const resultsCall = vi
        .mocked(fs.writeFile)
        .mock.calls.find((call) => call[0].toString().includes('validation-results.json'));

      expect(resultsCall).toBeDefined();
      if (resultsCall) {
        const results = JSON.parse(resultsCall[1] as string);
        expect(results).toHaveProperty('tests');
        expect(results).toHaveProperty('lint');
        expect(results).toHaveProperty('typecheck');
        expect(results).toHaveProperty('build');
      }
    });
  });
});
