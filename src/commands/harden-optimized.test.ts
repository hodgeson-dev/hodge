import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { OptimizedHardenCommand } from './harden-optimized';
import { promises as fs, existsSync } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

// Mock modules
vi.mock('fs', () => ({
  promises: {
    mkdir: vi.fn(),
    readFile: vi.fn(),
    writeFile: vi.fn(),
    access: vi.fn(),
    readdir: vi.fn(),
  },
  existsSync: vi.fn(),
}));

vi.mock('child_process', () => ({
  exec: vi.fn((cmd, opts, callback) => {
    // Default mock behavior
    if (callback) {
      callback(null, { stdout: 'success', stderr: '' });
    }
  }),
}));

vi.mock('util', () => ({
  promisify: vi.fn((fn) => {
    return vi.fn().mockResolvedValue({ stdout: 'success', stderr: '' });
  }),
}));

vi.mock('chalk', () => ({
  default: {
    magenta: vi.fn((str) => str),
    gray: vi.fn((str) => str),
    blue: vi.fn((str) => str),
    red: Object.assign(
      vi.fn((str) => str),
      {
        bold: vi.fn((str) => str),
      }
    ),
    green: Object.assign(
      vi.fn((str) => str),
      {
        bold: vi.fn((str) => str),
      }
    ),
    yellow: vi.fn((str) => str),
    cyan: vi.fn((str) => str),
    bold: vi.fn((str) => str),
    dim: vi.fn((str) => str),
  },
}));

describe('OptimizedHardenCommand', () => {
  let command: OptimizedHardenCommand;
  let consoleLogSpy: any;
  let consoleErrorSpy: any;
  let processStdoutWriteSpy: any;

  beforeEach(() => {
    command = new OptimizedHardenCommand();
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    processStdoutWriteSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    vi.clearAllMocks();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    processStdoutWriteSpy.mockRestore();
  });

  describe('execute', () => {
    it('should validate feature name input', async () => {
      await expect(command.execute('', {})).rejects.toThrow('Feature name is required');
      await expect(command.execute(null as any, {})).rejects.toThrow('Feature name is required');
    });

    it('should check for build directory before proceeding', async () => {
      const mockExistsSync = vi.mocked(existsSync);
      mockExistsSync.mockReturnValue(false);

      await command.execute('test-feature', {});

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('No build found for this feature')
      );
    });
  });

  describe('error handling', () => {
    it('should handle and report errors properly', async () => {
      const mockExistsSync = vi.mocked(existsSync);
      mockExistsSync.mockImplementation(() => {
        throw new Error('Filesystem error');
      });

      await expect(command.execute('test-feature', {})).rejects.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Harden command failed')
      );
    });
  });
});
