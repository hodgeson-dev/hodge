import { describe, expect, beforeEach } from 'vitest';
import { smokeTest } from '../../src/test/helpers';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

describe('hodge command context loading', () => {
  let testDir: string;

  beforeEach(async () => {
    // Create isolated test directory
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hodge-test-'));

    // Create minimal .hodge structure
    const hodgeDir = path.join(testDir, '.hodge');
    await fs.ensureDir(hodgeDir);
    await fs.ensureDir(path.join(hodgeDir, 'patterns'));

    // Create test files
    await fs.writeFile(
      path.join(hodgeDir, 'HODGE.md'),
      '# Test HODGE Context\nFeature: test\nMode: explore'
    );
    await fs.writeFile(
      path.join(hodgeDir, 'standards.md'),
      '# Test Standards\nAlways test behavior'
    );
    await fs.writeFile(
      path.join(hodgeDir, 'decisions.md'),
      '# Test Decisions\nDecision 1: Test everything'
    );
    await fs.writeFile(path.join(hodgeDir, 'patterns', 'test.md'), '# Test Pattern');
  });

  smokeTest('should use YAML manifest approach (HODGE-363)', async () => {
    // This test verifies that the /hodge command template
    // uses the YAML manifest approach instead of hardcoded bash commands
    const templatePath = path.join(process.cwd(), '.claude/commands/hodge.md');

    const content = await fs.readFile(templatePath, 'utf-8');

    // HODGE-363: Should call hodge context command to generate manifest
    expect(content).toContain('hodge context --feature {{feature}}');
    expect(content).toContain('hodge context');

    // Should describe YAML manifest structure
    expect(content).toContain('YAML manifest');
    expect(content).toContain('global_files');
    expect(content).toContain('patterns');
    expect(content).toContain('architecture_graph');

    // Should have AI instructions for reading manifest
    expect(content).toContain('Parse the YAML manifest');
    expect(content).toContain('status: available');

    // Should NOT use hardcoded primary bash commands (only examples)
    // The template should call hodge context, not directly cat files as primary flow
    const hodgeContextIndex = content.indexOf('hodge context');
    const firstCatIndex = content.indexOf('cat .hodge/HODGE.md');

    // hodge context command should appear before any cat examples
    expect(hodgeContextIndex).toBeGreaterThan(-1);
    expect(hodgeContextIndex).toBeLessThan(firstCatIndex);

    // Should NOT have old hardcoded ls patterns command
    expect(content).not.toContain('ls -la .hodge/patterns/');
  });

  smokeTest('should provide AI instructions for manifest parsing', async () => {
    const templatePath = path.join(process.cwd(), '.claude/commands/hodge.md');

    const content = await fs.readFile(templatePath, 'utf-8');

    // Should have clear AI instructions for reading files from manifest
    expect(content).toContain('MANDATORY');
    expect(content).toContain('MUST READ ALL');

    // Should explain feature_context section
    expect(content).toContain('feature_context');

    // Should provide example read sequence with cat commands
    expect(content).toContain('cat .hodge/HODGE.md');
    expect(content).toContain('cat .hodge/standards.md');
  });

  smokeTest('should describe manifest format and context-aware suggestions', async () => {
    const templatePath = path.join(process.cwd(), '.claude/commands/hodge.md');

    const content = await fs.readFile(templatePath, 'utf-8');

    // Should describe the Load Context Manifest step
    expect(content).toContain('Load Context Manifest');

    // Should provide context-aware suggestions based on status
    expect(content).toContain('hodge status');
    expect(content).toContain('Based on the status output');

    // Should have usage patterns
    expect(content).toContain('Usage Patterns');
  });
});
