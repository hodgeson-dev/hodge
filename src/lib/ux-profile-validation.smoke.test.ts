import { describe, expect } from 'vitest';
import { promises as fs } from 'fs';
import { join } from 'path';
import * as YAML from 'js-yaml';
import { smokeTest } from '../test/helpers.js';

/**
 * Smoke tests for UX review profile validation (HODGE-346.1)
 *
 * These tests verify that the UX review profile for Claude Code slash commands
 * exists, is properly formatted, and can be loaded by the review system.
 */

describe('UX Review Profile Validation', () => {
  const profilePath = join(
    process.cwd(),
    '.hodge/review-profiles/ux-patterns/claude-code-slash-commands.yaml'
  );
  const mdPath = join(
    process.cwd(),
    '.hodge/review-profiles/ux-patterns/claude-code-slash-commands.md'
  );

  smokeTest('profile YAML file exists', async () => {
    await expect(fs.access(profilePath)).resolves.not.toThrow();
  });

  smokeTest('profile markdown documentation exists', async () => {
    await expect(fs.access(mdPath)).resolves.not.toThrow();
  });

  smokeTest('profile YAML is valid and parseable', async () => {
    const content = await fs.readFile(profilePath, 'utf-8');
    const parsed = YAML.load(content);

    expect(parsed).toBeDefined();
    expect(parsed).toHaveProperty('meta');
    expect(parsed).toHaveProperty('rules');
  });

  smokeTest('profile has required meta fields', async () => {
    const content = await fs.readFile(profilePath, 'utf-8');
    const parsed = YAML.load(content);

    expect(parsed.meta).toHaveProperty('version');
    expect(parsed.meta).toHaveProperty('category');
    expect(parsed.meta).toHaveProperty('applies_to');
    expect(parsed.meta.applies_to).toContain('.claude/commands/*.md');
  });

  smokeTest('profile contains mandatory UX rules', async () => {
    const content = await fs.readFile(profilePath, 'utf-8');
    const parsed = YAML.load(content);

    const mandatoryRuleIds = [
      'interaction-start-box',
      'response-indicator-emoji',
      'alphabetized-choice-lists',
      'recommendation-marking',
      'bulleted-slash-commands',
      'collaborative-error-recovery',
      'knowledgeable-peer-tone',
      'pattern-consistency',
    ];

    const ruleIds = parsed.rules.map((rule: { id: string }) => rule.id);

    mandatoryRuleIds.forEach((mandatoryId) => {
      expect(ruleIds).toContain(mandatoryId);
    });
  });

  smokeTest('all rules have required fields', async () => {
    const content = await fs.readFile(profilePath, 'utf-8');
    const parsed = YAML.load(content);

    parsed.rules.forEach((rule: Record<string, unknown>) => {
      expect(rule).toHaveProperty('id');
      expect(rule).toHaveProperty('name');
      expect(rule).toHaveProperty('enforcement');
      expect(rule).toHaveProperty('severity');
      expect(rule).toHaveProperty('desc');

      // Verify enforcement values are valid
      expect(['MANDATORY', 'SUGGESTED']).toContain(rule.enforcement);

      // Verify severity values are valid
      expect(['BLOCKER', 'WARNING', 'SUGGESTION']).toContain(rule.severity);
    });
  });

  smokeTest('mandatory rules use BLOCKER or WARNING severity', async () => {
    const content = await fs.readFile(profilePath, 'utf-8');
    const parsed = YAML.load(content);

    const mandatoryRules = parsed.rules.filter(
      (rule: { enforcement: string }) => rule.enforcement === 'MANDATORY'
    );

    mandatoryRules.forEach((rule: { severity: string; id: string }) => {
      expect(['BLOCKER', 'WARNING']).toContain(rule.severity);
    });
  });

  smokeTest('profile markdown documentation is comprehensive', async () => {
    const content = await fs.readFile(mdPath, 'utf-8');

    // Check for key sections
    expect(content).toContain('# UX Review Profile');
    expect(content).toContain('## Core Visual Language');
    expect(content).toContain('## Smart Intelligence');
    expect(content).toContain('## Error Recovery & Tone');
    expect(content).toContain('## Validation Checklist');
    expect(content).toContain('## Validation Against Existing Standards');
  });

  smokeTest('profile validates against existing standards', async () => {
    const content = await fs.readFile(mdPath, 'utf-8');

    // Verify conflicts were checked
    expect(content).toContain('**Conflicts Checked**: ✅ None found');
    expect(content).toContain('.hodge/standards.md');
    expect(content).toContain('.hodge/decisions.md');
    expect(content).toContain('.hodge/patterns/');
  });

  smokeTest('profile rules include examples for complex patterns', async () => {
    const content = await fs.readFile(profilePath, 'utf-8');
    const parsed = YAML.load(content);

    const complexRules = [
      'interaction-start-box',
      'response-indicator-emoji',
      'recommendation-marking',
      'hybrid-information-display',
      'progress-celebration',
    ];

    complexRules.forEach((ruleId) => {
      const rule = parsed.rules.find((r: { id: string }) => r.id === ruleId);
      expect(rule).toBeDefined();
      expect(rule).toHaveProperty('example');
    });
  });
});
