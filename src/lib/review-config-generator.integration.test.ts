/**
 * Integration tests for ReviewConfigGenerator
 *
 * Tests end-to-end markdown generation with real file system operations
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ReviewConfigGenerator } from './review-config-generator.js';
import { integrationTest } from '../test/helpers.js';
import type { DetectionResult } from './auto-detection-service.js';
import type { ProfileEntry } from './profile-discovery-service.js';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

describe('ReviewConfigGenerator Integration', () => {
  let tempDir: string;
  let hodgeDir: string;
  let generator: ReviewConfigGenerator;

  beforeEach(async () => {
    // Create isolated temp directory for each test
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hodge-review-config-test-'));
    hodgeDir = path.join(tempDir, '.hodge');
    await fs.ensureDir(hodgeDir);
    generator = new ReviewConfigGenerator(hodgeDir);
  });

  afterEach(async () => {
    // Clean up temp directory
    await fs.remove(tempDir);
  });

  integrationTest('should generate review-config.md with detected profiles', async () => {
    const detectionResults: DetectionResult[] = [
      {
        profile: {
          path: 'languages/typescript.md',
          frontmatter: {
            scope: 'reusable',
            type: 'language',
            version: '1.0.0',
            frontmatter_version: '1.0.0',
            maintained_by: 'test',
          },
        },
        detected: true,
        reason: 'Found: tsconfig.json',
      },
      {
        profile: {
          path: 'frameworks/react.md',
          frontmatter: {
            scope: 'reusable',
            type: 'framework',
            version: '1.0.0',
            frontmatter_version: '1.0.0',
            maintained_by: 'test',
          },
        },
        detected: true,
        reason: 'Found: react',
      },
    ];

    await generator.generate(detectionResults);

    const configPath = path.join(hodgeDir, 'review-config.md');
    expect(await fs.pathExists(configPath)).toBe(true);

    const content = await fs.readFile(configPath, 'utf-8');

    // Check frontmatter
    expect(content).toContain('---');
    expect(content).toContain('version: "1.0.0"');
    expect(content).toContain('auto_detected: true');

    // Check headers
    expect(content).toContain('# Review Configuration');
    expect(content).toContain('## Active Profiles');

    // Check profile listings
    expect(content).toContain('languages/typescript.md');
    expect(content).toContain('frameworks/react.md');
  });

  integrationTest('should group profiles by category', async () => {
    const detectionResults: DetectionResult[] = [
      {
        profile: {
          path: 'languages/typescript.md',
          frontmatter: {
            scope: 'reusable',
            type: 'language',
            version: '1.0.0',
            frontmatter_version: '1.0.0',
            maintained_by: 'test',
          },
        },
        detected: true,
        reason: 'Found',
      },
      {
        profile: {
          path: 'languages/javascript.md',
          frontmatter: {
            scope: 'reusable',
            type: 'language',
            version: '1.0.0',
            frontmatter_version: '1.0.0',
            maintained_by: 'test',
          },
        },
        detected: true,
        reason: 'Found',
      },
      {
        profile: {
          path: 'frameworks/react.md',
          frontmatter: {
            scope: 'reusable',
            type: 'framework',
            version: '1.0.0',
            frontmatter_version: '1.0.0',
            maintained_by: 'test',
          },
        },
        detected: true,
        reason: 'Found',
      },
    ];

    await generator.generate(detectionResults);

    const content = await fs.readFile(path.join(hodgeDir, 'review-config.md'), 'utf-8');

    // Check category headers
    expect(content).toContain('### Languages');
    expect(content).toContain('### Frameworks');

    // Languages should be listed together
    const languagesIndex = content.indexOf('### Languages');
    const frameworksIndex = content.indexOf('### Frameworks');
    const tsIndex = content.indexOf('languages/typescript.md');
    const jsIndex = content.indexOf('languages/javascript.md');

    expect(tsIndex).toBeGreaterThan(languagesIndex);
    expect(tsIndex).toBeLessThan(frameworksIndex);
    expect(jsIndex).toBeGreaterThan(languagesIndex);
    expect(jsIndex).toBeLessThan(frameworksIndex);
  });

  integrationTest('should include auto-detection results section', async () => {
    const detectionResults: DetectionResult[] = [
      {
        profile: {
          path: 'languages/typescript.md',
          frontmatter: {
            scope: 'reusable',
            type: 'language',
            version: '1.0.0',
            frontmatter_version: '1.0.0',
            maintained_by: 'test',
          },
        },
        detected: true,
        reason: 'Found: tsconfig.json',
      },
    ];

    await generator.generate(detectionResults, { includeDetectionResults: true });

    const content = await fs.readFile(path.join(hodgeDir, 'review-config.md'), 'utf-8');

    expect(content).toContain('## Auto-Detection Results');
    expect(content).toContain('Detected during `hodge init`:');
    expect(content).toContain('Found: tsconfig.json');
  });

  integrationTest('should exclude auto-detection results when option is false', async () => {
    const detectionResults: DetectionResult[] = [
      {
        profile: {
          path: 'languages/typescript.md',
          frontmatter: {
            scope: 'reusable',
            type: 'language',
            version: '1.0.0',
            frontmatter_version: '1.0.0',
            maintained_by: 'test',
          },
        },
        detected: true,
        reason: 'Found: tsconfig.json',
      },
    ];

    await generator.generate(detectionResults, { includeDetectionResults: false });

    const content = await fs.readFile(path.join(hodgeDir, 'review-config.md'), 'utf-8');

    expect(content).not.toContain('## Auto-Detection Results');
  });

  integrationTest('should include manual customization instructions', async () => {
    const detectionResults: DetectionResult[] = [
      {
        profile: {
          path: 'languages/typescript.md',
          frontmatter: {
            scope: 'reusable',
            type: 'language',
            version: '1.0.0',
            frontmatter_version: '1.0.0',
            maintained_by: 'test',
          },
        },
        detected: true,
        reason: 'Found',
      },
    ];

    await generator.generate(detectionResults, { includeInstructions: true });

    const content = await fs.readFile(path.join(hodgeDir, 'review-config.md'), 'utf-8');

    expect(content).toContain('## Manual Customization');
    expect(content).toContain('You can add or remove profiles');
  });

  integrationTest('should exclude instructions when option is false', async () => {
    const detectionResults: DetectionResult[] = [
      {
        profile: {
          path: 'languages/typescript.md',
          frontmatter: {
            scope: 'reusable',
            type: 'language',
            version: '1.0.0',
            frontmatter_version: '1.0.0',
            maintained_by: 'test',
          },
        },
        detected: true,
        reason: 'Found',
      },
    ];

    await generator.generate(detectionResults, { includeInstructions: false });

    const content = await fs.readFile(path.join(hodgeDir, 'review-config.md'), 'utf-8');

    expect(content).not.toContain('## Manual Customization');
  });

  integrationTest('should format profile names correctly', async () => {
    const detectionResults: DetectionResult[] = [
      {
        profile: {
          path: 'languages/typescript.md',
          frontmatter: {
            scope: 'reusable',
            type: 'language',
            version: '1.0.0',
            frontmatter_version: '1.0.0',
            maintained_by: 'test',
          },
        },
        detected: true,
        reason: 'Found',
      },
      {
        profile: {
          path: 'ui-libraries/chakra-ui.md',
          frontmatter: {
            scope: 'reusable',
            type: 'ui',
            version: '1.0.0',
            frontmatter_version: '1.0.0',
            maintained_by: 'test',
          },
        },
        detected: true,
        reason: 'Found',
      },
    ];

    await generator.generate(detectionResults);

    const content = await fs.readFile(path.join(hodgeDir, 'review-config.md'), 'utf-8');

    // Check formatted names
    expect(content).toContain('TypeScript'); // Special case
    expect(content).toContain('Chakra UI'); // Special case
  });

  integrationTest('should handle empty detection results', async () => {
    const detectionResults: DetectionResult[] = [];

    await generator.generate(detectionResults);

    const configPath = path.join(hodgeDir, 'review-config.md');
    expect(await fs.pathExists(configPath)).toBe(true);

    const content = await fs.readFile(configPath, 'utf-8');

    expect(content).toContain('# Review Configuration');
    expect(content).toContain('## Active Profiles');
  });

  integrationTest('should only include detected profiles in active list', async () => {
    const detectionResults: DetectionResult[] = [
      {
        profile: {
          path: 'languages/typescript.md',
          frontmatter: {
            scope: 'reusable',
            type: 'language',
            version: '1.0.0',
            frontmatter_version: '1.0.0',
            maintained_by: 'test',
          },
        },
        detected: true,
        reason: 'Found',
      },
      {
        profile: {
          path: 'languages/python.md',
          frontmatter: {
            scope: 'reusable',
            type: 'language',
            version: '1.0.0',
            frontmatter_version: '1.0.0',
            maintained_by: 'test',
          },
        },
        detected: false,
        reason: 'Not found',
      },
    ];

    await generator.generate(detectionResults);

    const content = await fs.readFile(path.join(hodgeDir, 'review-config.md'), 'utf-8');

    // Should include TypeScript
    expect(content).toContain('languages/typescript.md');

    // Should NOT include Python
    expect(content).not.toContain('languages/python.md');
  });

  integrationTest('should generate valid markdown structure', async () => {
    const detectionResults: DetectionResult[] = [
      {
        profile: {
          path: 'languages/typescript.md',
          frontmatter: {
            scope: 'reusable',
            type: 'language',
            version: '1.0.0',
            frontmatter_version: '1.0.0',
            maintained_by: 'test',
          },
        },
        detected: true,
        reason: 'Found',
      },
    ];

    await generator.generate(detectionResults);

    const content = await fs.readFile(path.join(hodgeDir, 'review-config.md'), 'utf-8');

    // Check markdown structure
    expect(content).toMatch(/^---\n/); // Starts with frontmatter
    expect(content).toMatch(/\n---\n/); // Frontmatter closing
    expect(content).toContain('# Review Configuration'); // H1 header
    expect(content).toContain('## Active Profiles'); // H2 header
    expect(content).toContain('### Languages'); // H3 header
  });
});
