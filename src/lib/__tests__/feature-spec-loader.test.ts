import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import * as yaml from 'js-yaml';
import { FeatureSpecLoader, type FeatureSpec } from '../feature-spec-loader';

describe('[unit] FeatureSpecLoader', () => {
  let loader: FeatureSpecLoader;
  let testDir: string;

  beforeEach(async () => {
    loader = new FeatureSpecLoader();
    // Create a unique temp directory for each test
    const tempBase = os.tmpdir();
    // eslint-disable-next-line sonarjs/pseudo-random -- Test isolation requires unique directory names
    const randomId = Math.random().toString(36).substring(7);
    testDir = path.join(tempBase, `hodge-test-${randomId}`);
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    // Clean up test directory
    if (testDir) {
      await fs.rm(testDir, { recursive: true, force: true });
    }
  });

  describe('loadSpec', () => {
    it('should load a valid YAML spec', async () => {
      const validSpec: FeatureSpec = {
        version: '1.0',
        metadata: {
          extracted_at: '2025-09-18T12:00:00Z',
          extracted_by: 'Claude',
          session_id: 'test-session',
        },
        feature: {
          name: 'TEST-001',
          description: 'Test feature for authentication',
          decisions: [
            { text: 'Use JWT for authentication', date: '2025-09-18' },
            { text: 'Implement refresh tokens', date: '2025-09-18' },
          ],
          rationale: 'Security best practices',
          scope: {
            included: ['Login flow', 'Token management'],
            excluded: ['Social auth'],
          },
          dependencies: ['jsonwebtoken', 'bcrypt'],
          effort: 'Medium',
          priority: 2,
          exploration_areas: [
            {
              area: 'Security',
              questions: ['How to handle token rotation?', 'What about rate limiting?'],
            },
          ],
          risks: ['Token theft', 'Session hijacking'],
        },
      };

      const specPath = path.join(testDir, 'test-spec.yaml');
      await fs.writeFile(specPath, yaml.dump(validSpec), 'utf-8');

      const loaded = await loader.loadSpec(specPath);

      expect(loaded).toEqual(validSpec);
      expect(loaded.feature.name).toBe('TEST-001');
      expect(loaded.feature.decisions).toHaveLength(2);
    });

    it('should reject spec without version', async () => {
      const invalidSpec = {
        feature: {
          name: 'TEST-001',
          description: 'Test feature',
        },
      };

      const specPath = path.join(testDir, 'invalid-spec.yaml');
      await fs.writeFile(specPath, yaml.dump(invalidSpec), 'utf-8');

      await expect(loader.loadSpec(specPath)).rejects.toThrow('Missing version field');
    });

    it('should reject spec without feature name', async () => {
      const invalidSpec = {
        version: '1.0',
        feature: {
          description: 'Test feature',
        },
      };

      const specPath = path.join(testDir, 'invalid-spec.yaml');
      await fs.writeFile(specPath, yaml.dump(invalidSpec), 'utf-8');

      await expect(loader.loadSpec(specPath)).rejects.toThrow('Missing feature.name');
    });

    it('should reject spec without feature description', async () => {
      const invalidSpec = {
        version: '1.0',
        feature: {
          name: 'TEST-001',
        },
      };

      const specPath = path.join(testDir, 'invalid-spec.yaml');
      await fs.writeFile(specPath, yaml.dump(invalidSpec), 'utf-8');

      await expect(loader.loadSpec(specPath)).rejects.toThrow('Missing feature.description');
    });

    it('should handle spec with minimal required fields', async () => {
      const minimalSpec: FeatureSpec = {
        version: '1.0',
        feature: {
          name: 'TEST-001',
          description: 'Minimal test feature',
        },
      };

      const specPath = path.join(testDir, 'minimal-spec.yaml');
      await fs.writeFile(specPath, yaml.dump(minimalSpec), 'utf-8');

      const loaded = await loader.loadSpec(specPath);

      expect(loaded.feature.name).toBe('TEST-001');
      expect(loaded.feature.description).toBe('Minimal test feature');
      expect(loaded.feature.decisions).toBeUndefined();
    });

    it('should reject invalid priority value', async () => {
      const invalidSpec = {
        version: '1.0',
        feature: {
          name: 'TEST-001',
          description: 'Test feature',
          priority: 10, // Invalid - should be 1-5
        },
      };

      const specPath = path.join(testDir, 'invalid-priority.yaml');
      await fs.writeFile(specPath, yaml.dump(invalidSpec), 'utf-8');

      await expect(loader.loadSpec(specPath)).rejects.toThrow('priority must be between 1 and 5');
    });

    it('should reject malformed YAML', async () => {
      const malformedYaml = `
version: 1.0
feature:
  name: TEST-001
  description: Test feature
  decisions:
    - text: Missing close bracket
    text: Another decision
`;

      const specPath = path.join(testDir, 'malformed.yaml');
      await fs.writeFile(specPath, malformedYaml, 'utf-8');

      await expect(loader.loadSpec(specPath)).rejects.toThrow();
    });

    it('should reject non-existent file', async () => {
      const nonExistentPath = path.join(testDir, 'does-not-exist.yaml');

      await expect(loader.loadSpec(nonExistentPath)).rejects.toThrow();
    });
  });

  describe('toPopulatorMetadata', () => {
    it('should convert spec to populator format', () => {
      const spec: FeatureSpec = {
        version: '1.0',
        feature: {
          name: 'TEST-001',
          description: 'Test feature',
          scope: {
            included: ['Feature A'],
            excluded: ['Feature B'],
          },
          dependencies: ['dep1', 'dep2'],
          effort: 'Large',
          rationale: 'Business needs',
          exploration_areas: [{ area: 'Performance', questions: ['How fast?'] }],
        },
      };

      const metadata = loader.toPopulatorMetadata(spec);

      expect(metadata).toEqual({
        description: 'Test feature',
        scope: {
          included: ['Feature A'],
          excluded: ['Feature B'],
        },
        dependencies: ['dep1', 'dep2'],
        effort: 'Large',
        rationale: 'Business needs',
        explorationAreas: [{ area: 'Performance', questions: ['How fast?'] }],
      });
    });

    it('should handle spec with minimal fields', () => {
      const spec: FeatureSpec = {
        version: '1.0',
        feature: {
          name: 'TEST-001',
          description: 'Minimal feature',
        },
      };

      const metadata = loader.toPopulatorMetadata(spec);

      expect(metadata).toEqual({
        description: 'Minimal feature',
        scope: undefined,
        dependencies: undefined,
        effort: undefined,
        rationale: undefined,
        explorationAreas: undefined,
      });
    });
  });

  describe('extractDecisions', () => {
    it('should extract decision texts', () => {
      const spec: FeatureSpec = {
        version: '1.0',
        feature: {
          name: 'TEST-001',
          description: 'Test',
          decisions: [{ text: 'Decision 1', date: '2025-09-18' }, { text: 'Decision 2' }],
        },
      };

      const decisions = loader.extractDecisions(spec);

      expect(decisions).toEqual(['Decision 1', 'Decision 2']);
    });

    it('should return empty array when no decisions', () => {
      const spec: FeatureSpec = {
        version: '1.0',
        feature: {
          name: 'TEST-001',
          description: 'Test',
        },
      };

      const decisions = loader.extractDecisions(spec);

      expect(decisions).toEqual([]);
    });
  });

  describe('generateFilename', () => {
    it('should generate timestamp-based filename', () => {
      const filename = FeatureSpecLoader.generateFilename('TEST-001');

      // Format: YYYY-MM-DD-HHMMSS-feature-name.yaml
      expect(filename).toMatch(/^\d{4}-\d{2}-\d{2}-\d{6}-test-001\.yaml$/);
    });

    it('should sanitize feature name', () => {
      const filename = FeatureSpecLoader.generateFilename('TEST/Feature@123!');

      expect(filename).toMatch(/^\d{4}-\d{2}-\d{2}-\d{6}-test-feature-123-\.yaml$/);
    });

    it('should handle spaces and special characters', () => {
      const filename = FeatureSpecLoader.generateFilename('My Feature (v2)');

      expect(filename).toMatch(/^\d{4}-\d{2}-\d{2}-\d{6}-my-feature-v2-\.yaml$/);
    });
  });
});
