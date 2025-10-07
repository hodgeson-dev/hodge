/**
 * Markdown Utilities
 *
 * Simple utilities for working with markdown content.
 */

/**
 * Count level-2 headings (##) in markdown content
 *
 * @param markdown - Markdown content
 * @returns Number of ## headings found
 */
export function countLevel2Headings(markdown: string): number {
  if (!markdown) {
    return 0;
  }

  const lines = markdown.split('\n');
  let count = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    // Match ## at start of line (but not ###, ####, etc.)
    if (trimmed.startsWith('## ') && !trimmed.startsWith('### ')) {
      count++;
    }
  }

  return count;
}
