/**
 * Local PM Adapter Utility Functions
 * HODGE-377.5: Extracted from local-pm-adapter.ts to reduce file length
 */

import { promises as fs } from 'fs';
import path from 'path';

/**
 * Load sub-feature metadata from exploration.md
 * Helper to reduce function length in getSubIssues
 */
export async function loadSubFeatureMetadata(
  subId: string,
  featuresDir: string
): Promise<{ title: string; description: string }> {
  try {
    const explorationPath = path.join(featuresDir, subId, 'explore', 'exploration.md');
    const explorationContent = await fs.readFile(explorationPath, 'utf-8');

    // Extract title from first markdown header
    let title = `Sub-feature ${subId}`;
    const titleRegex = /^#\s+([^\n]+)/m;
    const titleMatch = titleRegex.exec(explorationContent);
    if (titleMatch) {
      title = titleMatch[1].trim();
    }

    // Extract problem statement as description
    let description = '';
    const problemStart = explorationContent.indexOf('## Problem Statement');
    if (problemStart !== -1) {
      const contentAfter = explorationContent.slice(problemStart + 20);
      const nextSection = contentAfter.indexOf('\n##');
      const problemText = nextSection !== -1 ? contentAfter.slice(0, nextSection) : contentAfter;
      description = problemText.trim();
    }

    return { title, description };
  } catch {
    return { title: `Sub-feature ${subId}`, description: '' };
  }
}
