import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import { HodgeMDGenerator } from './hodge-md-generator.js';

vi.mock('fs/promises');

describe('HodgeMDGenerator', () => {
  let generator: HodgeMDGenerator;

  beforeEach(() => {
    vi.clearAllMocks();
    generator = new HodgeMDGenerator();
  });

  describe('generate', () => {
    it('should generate HODGE.md with all sections', async () => {
      // Mock file system for various files
      vi.mocked(fs.readFile).mockImplementation(async (path) => {
        if (path.toString().includes('decisions.md')) {
          return '### 2025-01-16 - Use HODGE.md for cross-tool compatibility\nSome content\n### 2025-01-15 - Another decision';
        }
        if (path.toString().includes('standards.md')) {
          return '## Code Quality\n- Use TypeScript\n- Follow ESLint rules';
        }
        if (path.toString().includes('command-history.json')) {
          return JSON.stringify({ commands: ['hodge explore test', 'hodge build test'] });
        }
        if (path.toString().includes('issue-id.txt')) {
          return 'HOD-123';
        }
        throw new Error('File not found');
      });

      // Mock fs.access for mode detection
      vi.mocked(fs.access).mockImplementation(async (path) => {
        if (path.toString().includes('/build')) {
          return; // Build directory exists
        }
        throw new Error('File not found');
      });

      // Mock readdir for working files
      vi.mocked(fs.readdir).mockResolvedValue(['exploration.md', 'context.json'] as any);

      const result = await generator.generate('test-feature');

      expect(result).toContain('# HODGE.md');
      expect(result).toContain('## Current Status');
      expect(result).toContain('**Feature**: test-feature');
      expect(result).toContain('**Mode**: build');
      expect(result).toContain('**PM Issue**: HOD-123');
      expect(result).toContain('## Recent Decisions');
      expect(result).toContain('Use HODGE.md for cross-tool compatibility');
      expect(result).toContain('## Active Standards');
      expect(result).toContain('## Working Files');
      expect(result).toContain('## Recent Commands');
      expect(result).toContain('## Next Steps');
    });

    it('should handle missing files gracefully', async () => {
      // Mock all file reads to fail
      vi.mocked(fs.readFile).mockRejectedValue(new Error('File not found'));
      vi.mocked(fs.readdir).mockRejectedValue(new Error('Directory not found'));
      vi.mocked(fs.access).mockRejectedValue(new Error('File not found'));

      const result = await generator.generate('new-feature');

      expect(result).toContain('# HODGE.md');
      expect(result).toContain('**Feature**: new-feature');
      expect(result).toContain('**Mode**: explore');
      expect(result).not.toContain('**PM Issue**');
      expect(result).toContain('## Next Steps');
    });
  });

  describe('saveToFile', () => {
    it('should save generated markdown to default path', async () => {
      // Mock file operations
      vi.mocked(fs.readFile).mockRejectedValue(new Error('File not found'));
      vi.mocked(fs.readdir).mockRejectedValue(new Error('Directory not found'));
      vi.mocked(fs.access).mockRejectedValue(new Error('File not found'));
      vi.mocked(fs.writeFile).mockResolvedValue();

      await generator.saveToFile('test-feature');

      expect(fs.writeFile).toHaveBeenCalledWith(
        path.join(process.cwd(), '.hodge', 'HODGE.md'),
        expect.stringContaining('# HODGE.md'),
        'utf-8'
      );
    });

    it('should save to custom path if provided', async () => {
      // Mock file operations
      vi.mocked(fs.readFile).mockRejectedValue(new Error('File not found'));
      vi.mocked(fs.readdir).mockRejectedValue(new Error('Directory not found'));
      vi.mocked(fs.access).mockRejectedValue(new Error('File not found'));
      vi.mocked(fs.writeFile).mockResolvedValue();

      await generator.saveToFile('test-feature', '/custom/path/HODGE.md');

      expect(fs.writeFile).toHaveBeenCalledWith(
        '/custom/path/HODGE.md',
        expect.stringContaining('# HODGE.md'),
        'utf-8'
      );
    });
  });

  describe('detectAITool', () => {
    it('should detect Claude when .claude directory exists', async () => {
      vi.mocked(fs.access).mockImplementation(async (path) => {
        if (path.toString().includes('.claude')) {
          return;
        }
        throw new Error('Not found');
      });

      const tool = await generator.detectAITool();
      expect(tool).toBe('claude');
    });

    it('should detect Cursor when .cursorrules exists', async () => {
      vi.mocked(fs.access).mockImplementation(async (path) => {
        if (path.toString().includes('.cursorrules')) {
          return;
        }
        throw new Error('Not found');
      });

      const tool = await generator.detectAITool();
      expect(tool).toBe('cursor');
    });

    it('should return generic when no tool detected', async () => {
      vi.mocked(fs.access).mockRejectedValue(new Error('Not found'));

      const tool = await generator.detectAITool();
      expect(tool).toBe('generic');
    });
  });

  describe('addToolSpecificEnhancements', () => {
    it('should create Claude symlink when Claude detected', async () => {
      vi.mocked(fs.access).mockImplementation(async (path) => {
        if (path.toString().includes('.claude')) {
          return;
        }
        throw new Error('Not found');
      });
      vi.mocked(fs.mkdir).mockResolvedValue(undefined);
      vi.mocked(fs.symlink).mockResolvedValue(undefined);

      await generator.addToolSpecificEnhancements('.hodge/HODGE.md');

      expect(fs.mkdir).toHaveBeenCalledWith('.claude', { recursive: true });
      expect(fs.symlink).toHaveBeenCalled();
    });

    it('should create Cursor rules when Cursor detected', async () => {
      vi.mocked(fs.access).mockImplementation(async (path) => {
        if (path.toString().includes('.cursorrules')) {
          return;
        }
        throw new Error('Not found');
      });
      vi.mocked(fs.readFile).mockResolvedValue('# HODGE.md\nContent here');
      vi.mocked(fs.writeFile).mockResolvedValue();

      await generator.addToolSpecificEnhancements('.hodge/HODGE.md');

      expect(fs.writeFile).toHaveBeenCalledWith(
        '.cursorrules',
        expect.stringContaining('You are working with Hodge'),
        'utf-8'
      );
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(fs.access).mockRejectedValue(new Error('Not found'));
      vi.mocked(fs.mkdir).mockRejectedValue(new Error('Permission denied'));

      // Should not throw
      await expect(
        generator.addToolSpecificEnhancements('.hodge/HODGE.md')
      ).resolves.toBeUndefined();
    });
  });

  describe('shipped mode detection', () => {
    it('should return "shipped" when ship-record.json exists', async () => {
      vi.mocked(fs.access).mockImplementation(async (path) => {
        if (path.toString().includes('ship-record.json')) {
          return; // ship-record.json exists
        }
        if (path.toString().includes('/ship')) {
          return; // ship directory exists
        }
        throw new Error('File not found');
      });

      vi.mocked(fs.readFile).mockImplementation(async (path) => {
        if (path.toString().includes('ship-record.json')) {
          return JSON.stringify({ validationPassed: true });
        }
        return '';
      });
      vi.mocked(fs.readdir).mockResolvedValue([] as any);

      const result = await generator.generate('shipped-feature');

      expect(result).toContain('**Mode**: shipped');
      expect(result).toContain('Feature completed');
    });

    it('should return "ship" when ship directory exists but no ship-record.json', async () => {
      vi.mocked(fs.access).mockImplementation(async (path) => {
        if (path.toString().includes('ship-record.json')) {
          throw new Error('File not found'); // No ship-record.json
        }
        if (path.toString().includes('/ship')) {
          return; // ship directory exists
        }
        throw new Error('File not found');
      });

      vi.mocked(fs.readFile).mockResolvedValue('');
      vi.mocked(fs.readdir).mockResolvedValue([] as any);

      const result = await generator.generate('shipping-feature');

      expect(result).toContain('**Mode**: ship');
      expect(result).not.toContain('Feature completed');
    });
  });
});
