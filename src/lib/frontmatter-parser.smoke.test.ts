/**
 * Frontmatter Parser - Smoke Tests
 *
 * Quick sanity checks for frontmatter parsing functionality.
 */

import { describe, expect } from 'vitest';
import { parseFrontmatter } from './frontmatter-parser.js';
import { smokeTest } from '../test/helpers.js';

describe('FrontmatterParser', () => {
  smokeTest('parses valid frontmatter from markdown', () => {
    const markdown = `---
frontmatter_version: "1.0.0"
scope: reusable
type: universal
version: "1.0.0"
name: Test Profile
description: A test profile
---

# Content here
`;

    const result = parseFrontmatter(markdown);

    expect(result.data.frontmatter_version).toBe('1.0.0');
    expect(result.data.scope).toBe('reusable');
    expect(result.data.type).toBe('universal');
    expect(result.data.name).toBe('Test Profile');
    expect(result.content).toContain('# Content here');
  });

  smokeTest('throws error on missing frontmatter', () => {
    const markdown = '# Just content, no frontmatter';

    expect(() => parseFrontmatter(markdown)).toThrow('Missing YAML frontmatter');
  });

  smokeTest('throws error on empty content', () => {
    expect(() => parseFrontmatter('')).toThrow('Cannot parse frontmatter from empty content');
  });

  smokeTest('validates required frontmatter fields', () => {
    const markdown = `---
frontmatter_version: "1.0.0"
---

Content`;

    expect(() => parseFrontmatter(markdown)).toThrow('Missing required frontmatter field');
  });

  smokeTest('validates frontmatter_version is 1.0.0', () => {
    const markdown = `---
frontmatter_version: "2.0.0"
scope: reusable
type: universal
version: "1.0.0"
---

Content`;

    expect(() => parseFrontmatter(markdown)).toThrow('Unsupported frontmatter_version');
  });

  smokeTest('validates scope enum values', () => {
    const markdown = `---
frontmatter_version: "1.0.0"
scope: invalid
type: universal
version: "1.0.0"
---

Content`;

    expect(() => parseFrontmatter(markdown)).toThrow('Invalid scope');
  });

  smokeTest('validates version semver format', () => {
    const markdown = `---
frontmatter_version: "1.0.0"
scope: reusable
type: universal
version: "not-semver"
---

Content`;

    expect(() => parseFrontmatter(markdown)).toThrow('Invalid version format');
  });

  smokeTest('handles malformed YAML gracefully', () => {
    const markdown = `---
this is: [not: valid: yaml
---

Content`;

    expect(() => parseFrontmatter(markdown)).toThrow('Malformed YAML frontmatter');
  });
});
