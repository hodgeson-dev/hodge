import { describe, expect } from 'vitest';
import { smokeTest } from './helpers.js';
import * as fs from 'fs';
import * as path from 'path';

describe('Standards Enforcement Clarity (HODGE-283)', () => {
  const standardsPath = path.join(process.cwd(), '.hodge', 'standards.md');
  const principlesPath = path.join(process.cwd(), '.hodge', 'principles.md');

  smokeTest('standards.md should have enforcement metadata headers', async () => {
    const content = fs.readFileSync(standardsPath, 'utf-8');

    // Check for enforcement metadata patterns
    expect(content).toContain('**Enforcement:');
    expect(content).toContain('Build(suggested)');
    expect(content).toContain('Harden(required)');
    expect(content).toContain('Ship(mandatory)');
    expect(content).toContain('ALL PHASES (mandatory)');
  });

  smokeTest('standards.md should have quick reference table', async () => {
    const content = fs.readFileSync(standardsPath, 'utf-8');

    // Check for the quick reference table
    expect(content).toContain('## Quick Reference: Enforcement by Phase');
    expect(content).toContain('| Standard Category | Explore | Build | Harden | Ship |');
    expect(content).toContain(
      '| **Core Standards** | Optional | Suggested | Required | Mandatory |'
    );
  });

  smokeTest('principles.md should have enforcement guide', async () => {
    const content = fs.readFileSync(principlesPath, 'utf-8');

    // Check for enforcement guide section
    expect(content).toContain('## Standards Enforcement Guide');
    expect(content).toContain('### Understanding Enforcement Notation');
    expect(content).toContain('### AI Interpretation');
  });

  smokeTest('enforcement metadata should be parseable', async () => {
    const content = fs.readFileSync(standardsPath, 'utf-8');

    // Simple regex to find enforcement headers
    const enforcementPattern = /\*\*Enforcement: ([^*]+)\*\*/g;
    const matches = Array.from(content.matchAll(enforcementPattern));

    // Should have multiple enforcement headers
    expect(matches.length).toBeGreaterThan(5);

    // Each match should have valid content
    matches.forEach((match) => {
      const enforcementText = match[1];
      expect(enforcementText).toBeTruthy();

      // Should contain phase indicators or ALL PHASES
      const hasPhaseInfo =
        enforcementText.includes('Build') ||
        enforcementText.includes('Harden') ||
        enforcementText.includes('Ship') ||
        enforcementText.includes('ALL PHASES') ||
        enforcementText.includes('Progressive');

      expect(hasPhaseInfo).toBe(true);
    });
  });

  smokeTest('critical standards should remain marked', async () => {
    const content = fs.readFileSync(standardsPath, 'utf-8');

    // Check that critical markers are still present
    expect(content).toContain('⚠️ **THESE STANDARDS ARE MANDATORY**');
    expect(content).toContain('**⚠️ CRITICAL**');
  });

  smokeTest('slash command templates should contain standards review sections', async () => {
    // Check that harden.md contains standards review
    const hardenPath = path.join(process.cwd(), '.claude', 'commands', 'harden.md');
    const hardenContent = fs.readFileSync(hardenPath, 'utf-8');

    expect(hardenContent).toContain('Pre-Harden Code Review');
    expect(hardenContent).toContain('Conduct AI Code Review');
    expect(hardenContent).toContain('MANDATORY');

    // Check that ship.md contains standards review
    const shipPath = path.join(process.cwd(), '.claude', 'commands', 'ship.md');
    const shipContent = fs.readFileSync(shipPath, 'utf-8');

    expect(shipContent).toContain('Standards Review Process');
    expect(shipContent).toContain('AI Standards Compliance Check');
    expect(shipContent).toContain('BLOCKING Level');
  });

  smokeTest('refine.md should describe two-phase refinement process', async () => {
    const refinePath = path.join(process.cwd(), '.claude', 'commands', 'refine.md');
    const refineContent = fs.readFileSync(refinePath, 'utf-8');

    expect(refineContent).toContain('Two-Phase Refinement Conversation');
    expect(refineContent).toContain('Phase 1: Address Known Questions');
    expect(refineContent).toContain('Phase 2: Open Implementation Drill-Down');
  });
});
