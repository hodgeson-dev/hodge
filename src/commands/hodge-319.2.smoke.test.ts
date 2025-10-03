/**
 * HODGE-319.2 Smoke Tests: Invisible Temp File Creation (Write Tool Migration)
 *
 * Validates that /plan and /ship slash commands use Write tool instead of bash heredoc
 * for creating temporary interaction files.
 *
 * Scope (from exploration.md):
 * - Replace bash heredoc with Write tool in /plan command
 * - Replace bash heredoc with Write tool in /ship command
 * - No CLI code changes (template-only refactoring)
 * - Maintain exact same file creation behavior
 */

import { describe, expect } from 'vitest';
import * as fs from 'fs-extra';
import * as path from 'path';
import { smokeTest } from '../test/helpers.js';

const PLAN_TEMPLATE_PATH = path.join(process.cwd(), '.claude', 'commands', 'plan.md');
const SHIP_TEMPLATE_PATH = path.join(process.cwd(), '.claude', 'commands', 'ship.md');

describe('HODGE-319.2: Invisible Temp File Creation', () => {
  smokeTest('plan.md should not contain bash heredoc (cat > file << EOF)', async () => {
    const content = await fs.readFile(PLAN_TEMPLATE_PATH, 'utf-8');

    // Verify no bash heredoc patterns
    expect(content).not.toContain('cat >');
    expect(content).not.toContain("<< 'EOF'");
    expect(content).not.toContain('<< EOF');
  });

  smokeTest('plan.md should use Write tool for temp file creation', async () => {
    const content = await fs.readFile(PLAN_TEMPLATE_PATH, 'utf-8');

    // Verify Write tool instructions present
    expect(content).toContain('Write to:');
    expect(content).toContain('.hodge/temp/plan-interaction/{{feature}}/plan.json');
    expect(content).toContain('Use the Write tool');
  });

  smokeTest('plan.md should not contain mkdir commands', async () => {
    const content = await fs.readFile(PLAN_TEMPLATE_PATH, 'utf-8');

    // Verify no directory creation commands (Write tool handles this)
    expect(content).not.toContain('mkdir -p .hodge/temp/plan-interaction');
  });

  smokeTest('plan.md should use Write tool (which auto-creates directories)', async () => {
    const content = await fs.readFile(PLAN_TEMPLATE_PATH, 'utf-8');

    // Verify Write tool usage (implicitly handles directory creation)
    expect(content).toContain('Use the Write tool to create the plan file');
    expect(content).toContain('Write to:');
  });

  smokeTest('ship.md should not contain bash heredoc (cat > file << EOF)', async () => {
    const content = await fs.readFile(SHIP_TEMPLATE_PATH, 'utf-8');

    // Verify no bash heredoc patterns
    expect(content).not.toContain('cat >');
    expect(content).not.toContain("<< 'EOF'");
    expect(content).not.toContain('<< EOF');
  });

  smokeTest('ship.md should use Write tool for interaction state files', async () => {
    const content = await fs.readFile(SHIP_TEMPLATE_PATH, 'utf-8');

    // Verify Write tool instructions for both ui.md and state.json
    expect(content).toContain('Write to:');
    expect(content).toContain('.hodge/temp/ship-interaction/{{feature}}/ui.md');
    expect(content).toContain('.hodge/temp/ship-interaction/{{feature}}/state.json');
    expect(content).toContain('Use the Write tool');
  });

  smokeTest('ship.md should use Write tool for lessons documentation', async () => {
    const content = await fs.readFile(SHIP_TEMPLATE_PATH, 'utf-8');

    // Verify Write tool instructions for lessons file
    expect(content).toContain('.hodge/lessons/{{feature}}-{{slug}}.md');
    expect(content).toContain('Use the Write tool');
  });

  smokeTest('ship.md should not contain mkdir commands', async () => {
    const content = await fs.readFile(SHIP_TEMPLATE_PATH, 'utf-8');

    // Verify no directory creation commands (Write tool handles this)
    expect(content).not.toContain('mkdir -p .hodge/temp/ship-interaction');
    expect(content).not.toContain('mkdir -p .hodge/lessons');
  });

  smokeTest('ship.md should document Write tool auto-creates directories', async () => {
    const content = await fs.readFile(SHIP_TEMPLATE_PATH, 'utf-8');

    // Verify documentation about automatic directory creation
    expect(content).toContain('Write tool creates parent directories automatically');
  });

  smokeTest('templates should maintain same file creation locations', async () => {
    const planContent = await fs.readFile(PLAN_TEMPLATE_PATH, 'utf-8');
    const shipContent = await fs.readFile(SHIP_TEMPLATE_PATH, 'utf-8');

    // Verify file paths unchanged (only creation method changed)
    expect(planContent).toContain('.hodge/temp/plan-interaction/{{feature}}/plan.json');
    expect(shipContent).toContain('.hodge/temp/ship-interaction/{{feature}}/ui.md');
    expect(shipContent).toContain('.hodge/temp/ship-interaction/{{feature}}/state.json');
    expect(shipContent).toContain('.hodge/lessons/{{feature}}-{{slug}}.md');
  });
});
