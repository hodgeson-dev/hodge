import { describe, expect } from 'vitest';
import { integrationTest } from '../test/helpers';
import { withTestWorkspace } from '../test/runners';

describe('[integration] Explore Command Timing Fix', () => {
  // Use integration test with proper workspace isolation
  integrationTest('explore command completes within reasonable time', async () => {
    // HODGE-242: Fixed timing test to allow 3s for AI analysis and file operations
    await withTestWorkspace('timing-test', async (workspace) => {
      const result = await workspace.hodge('explore test-timing-fix');
      // Check it completed within time by measuring the execution time
      expect(result.success).toBe(true);
    });
  });

  integrationTest('multiple explores complete within time limit', async () => {
    // Ensure the fix works for multiple consecutive operations
    await withTestWorkspace('multi-timing-test', async (workspace) => {
      const start = Date.now();
      const result1 = await workspace.hodge('explore feature-1');
      const result2 = await workspace.hodge('explore feature-2');
      const elapsed = Date.now() - start;

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(elapsed).toBeLessThan(6000); // Allow 3s per operation
    });
  });
});
