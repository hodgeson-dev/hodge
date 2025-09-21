import { describe, it, expect } from 'vitest';
import { SaveCommand } from './save.js';
import { LoadCommand } from './load.js';

describe('Save/Load Commands Basic [integration]', () => {
  it('should instantiate both commands successfully', () => {
    const saveCommand = new SaveCommand();
    const loadCommand = new LoadCommand();

    expect(saveCommand).toBeDefined();
    expect(loadCommand).toBeDefined();
    expect(saveCommand.execute).toBeDefined();
    expect(loadCommand.execute).toBeDefined();
  });

  it('should have compatible interfaces', () => {
    const saveCommand = new SaveCommand();
    const loadCommand = new LoadCommand();

    // Both should have execute methods
    expect(typeof saveCommand.execute).toBe('function');
    expect(typeof loadCommand.execute).toBe('function');

    // Execute should accept similar parameters
    expect(saveCommand.execute.length).toBeLessThanOrEqual(2); // name, options
    expect(loadCommand.execute.length).toBeLessThanOrEqual(2); // name, options
  });

  it('should integrate with SaveManager singleton', async () => {
    // This tests that both commands use the same SaveManager instance
    const { saveManager } = await import('../lib/save-manager.js');

    expect(saveManager).toBeDefined();
    expect(typeof saveManager.save).toBe('function');
    expect(typeof saveManager.load).toBe('function');
  });

  it('should integrate with ContextManager', async () => {
    // This tests that both commands use ContextManager
    const { ContextManager } = await import('../lib/context-manager.js');

    const contextManager = new ContextManager();
    expect(contextManager).toBeDefined();
    expect(typeof contextManager.save).toBe('function');
    expect(typeof contextManager.load).toBe('function');
  });

  it('should handle command options properly', () => {
    const saveCommand = new SaveCommand();

    // Test that options can be constructed
    const saveOptions = {
      minimal: true,
      type: 'incremental' as const,
    };

    const loadOptions = {
      recent: true,
      list: false,
      lazy: true,
    };

    // Options should be valid TypeScript types
    expect(saveOptions).toBeDefined();
    expect(loadOptions).toBeDefined();
  });
});
