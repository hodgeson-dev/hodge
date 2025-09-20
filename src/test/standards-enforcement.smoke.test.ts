import { describe } from 'vitest';
import { smokeTest } from './helpers';
import * as fs from 'fs';
import * as path from 'path';

describe('Standards Enforcement Smoke Tests', () => {
  smokeTest('slash command templates should contain standards review sections', async () => {
    // Check that harden.md contains standards review
    const hardenPath = path.join(process.cwd(), '.claude', 'commands', 'harden.md');
    const hardenContent = fs.readFileSync(hardenPath, 'utf-8');

    expect(hardenContent).toContain('Pre-Harden Standards Review');
    expect(hardenContent).toContain('AI Standards Compliance Checklist');
    expect(hardenContent).toContain('MANDATORY');

    // Check that ship.md contains standards review
    const shipPath = path.join(process.cwd(), '.claude', 'commands', 'ship.md');
    const shipContent = fs.readFileSync(shipPath, 'utf-8');

    expect(shipContent).toContain('Standards Review Process');
    expect(shipContent).toContain('AI Standards Compliance Check');
    expect(shipContent).toContain('BLOCKING Level');
  });

  smokeTest('standards.md should contain mandatory enforcement language', async () => {
    const standardsPath = path.join(process.cwd(), '.hodge', 'standards.md');
    const standardsContent = fs.readFileSync(standardsPath, 'utf-8');

    expect(standardsContent).toContain('THESE STANDARDS ARE MANDATORY');
    expect(standardsContent).toContain('Non-compliance will block shipping');
  });

  smokeTest('decide.md should prevent skipping interactive mode', async () => {
    const decidePath = path.join(process.cwd(), '.claude', 'commands', 'decide.md');
    const decideContent = fs.readFileSync(decidePath, 'utf-8');

    expect(decideContent).toContain('DEFAULT BEHAVIOR: Interactive Decision Mode');
    expect(decideContent).toContain('WRONG: Jumping to recording');
    expect(decideContent).toContain('RIGHT: Present options first');
  });
});
