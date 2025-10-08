import { describe, it, expect } from 'vitest';
import { smokeTest } from '../test/helpers';
import * as fs from 'fs';
import * as path from 'path';
import { parseFrontmatter } from './frontmatter-parser';

const REVIEW_PROFILES_DIR = path.join(process.cwd(), 'review-profiles');

smokeTest('review-profiles directory exists', () => {
  expect(fs.existsSync(REVIEW_PROFILES_DIR)).toBe(true);
});

smokeTest('all profile files have valid frontmatter', () => {
  const profileFiles = findProfileFiles(REVIEW_PROFILES_DIR);

  expect(profileFiles.length).toBeGreaterThan(30); // Should have many profiles

  for (const filePath of profileFiles) {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Should not throw
    const parsed = parseFrontmatter(content);
    const frontmatter = parsed.data;

    // Basic validation
    expect(frontmatter.frontmatter_version).toBe('1.0.0');
    expect(frontmatter.scope).toBe('reusable');
    expect(frontmatter.version).toBeDefined();
    expect(frontmatter.maintained_by).toBe('hodge-framework');
  }
});

smokeTest('full content profiles have substantial markdown content', () => {
  const fullContentProfiles = [
    'languages/general-coding-standards.md',
    'testing/general-test-standards.md',
    'languages/typescript-5.x.md',
    'languages/javascript-es2020+.md',
    'frameworks/react-18.x.md',
    'testing/vitest-1.x.md',
    'testing/jest-29.x.md',
    'databases/prisma-5.x.md',
  ];

  for (const profile of fullContentProfiles) {
    const filePath = path.join(REVIEW_PROFILES_DIR, profile);
    expect(fs.existsSync(filePath)).toBe(true);

    const content = fs.readFileSync(filePath, 'utf-8');

    // Remove frontmatter
    const parts = content.split('---');
    expect(parts.length).toBeGreaterThanOrEqual(3);
    const markdownContent = parts.slice(2).join('---');

    // Should have substantial content (more than placeholder message)
    expect(markdownContent.length).toBeGreaterThan(500);
    expect(markdownContent).not.toContain('Profile content coming in future version');
  }
});

smokeTest('placeholder profiles exist and have clear placeholder message', () => {
  const placeholderProfiles = [
    'languages/typescript-4.x.md',
    'languages/javascript-es2015-2019.md',
    'frameworks/react-17.x.md',
    'testing/vitest-0.34+.md',
    'databases/prisma-4.x.md',
  ];

  for (const profile of placeholderProfiles) {
    const filePath = path.join(REVIEW_PROFILES_DIR, profile);
    expect(fs.existsSync(filePath)).toBe(true);

    const content = fs.readFileSync(filePath, 'utf-8');
    const parts = content.split('---');
    const markdownContent = parts.slice(2).join('---');

    // Placeholders should have the placeholder message
    expect(markdownContent).toContain('Profile content coming in future version');
  }
});

smokeTest('version-specific profiles include detection rules', () => {
  const versionedProfiles = [
    'languages/typescript-5.x.md',
    'languages/typescript-4.x.md',
    'frameworks/react-18.x.md',
    'testing/vitest-1.x.md',
    'testing/jest-29.x.md',
    'databases/prisma-5.x.md',
  ];

  for (const profile of versionedProfiles) {
    const filePath = path.join(REVIEW_PROFILES_DIR, profile);
    const content = fs.readFileSync(filePath, 'utf-8');
    const parsed = parseFrontmatter(content);
    const frontmatter = parsed.data;

    // Should have detection rules
    expect(frontmatter.detection).toBeDefined();
    expect(frontmatter.detection?.dependencies || frontmatter.detection?.files).toBeDefined();
  }
});

// Helper function to find all profile files recursively
function findProfileFiles(dir: string): string[] {
  const files: string[] = [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...findProfileFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files;
}
