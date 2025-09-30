import { describe, expect } from 'vitest';
import { smokeTest } from './helpers';
import * as fs from 'fs';
import * as path from 'path';

describe('Documentation Hierarchy Smoke Tests', () => {
  smokeTest('documentation files should exist with proper structure', async () => {
    const docsRoot = path.join(process.cwd(), '.hodge');

    // Core documentation files should exist
    expect(fs.existsSync(path.join(docsRoot, 'standards.md'))).toBe(true);
    expect(fs.existsSync(path.join(docsRoot, 'principles.md'))).toBe(true);
    expect(fs.existsSync(path.join(docsRoot, 'decisions.md'))).toBe(true);
    expect(fs.existsSync(path.join(docsRoot, 'patterns', 'README.md'))).toBe(true);
    expect(fs.existsSync(path.join(docsRoot, 'lessons'))).toBe(true);
  });

  smokeTest('standards should include mandatory enforcement language', async () => {
    const standardsPath = path.join(process.cwd(), '.hodge', 'standards.md');
    const content = fs.readFileSync(standardsPath, 'utf-8');

    // Mandatory enforcement
    expect(content).toContain('THESE STANDARDS ARE MANDATORY');
    expect(content).toContain('Freedom to explore, discipline to ship');

    // Progressive enforcement sections
    expect(content).toContain('Explore Phase');
    expect(content).toContain('Build Phase');
    expect(content).toContain('Harden Phase');
    expect(content).toContain('Ship Phase');
  });

  smokeTest('principles should contain both philosophy and architecture', async () => {
    const principlesPath = path.join(process.cwd(), '.hodge', 'principles.md');
    const content = fs.readFileSync(principlesPath, 'utf-8');

    // Development philosophy
    expect(content).toContain('Progressive Enhancement');
    expect(content).toContain('Behavior-Focused Testing');
    expect(content).toContain('Learn from Success');

    // Architectural principles
    expect(content).toContain('AI-Backend Separation');
    expect(content).toContain('Data Transfer Patterns');
  });

  smokeTest('slash commands should include documentation hierarchy features', async () => {
    const commandsRoot = path.join(process.cwd(), '.claude', 'commands');

    // /ship should have lesson capture (updated with interactive flow)
    const shipContent = fs.readFileSync(path.join(commandsRoot, 'ship.md'), 'utf-8');
    expect(shipContent).toContain('Capture lessons learned');
    expect(shipContent).toContain('Interactive Lessons Enhancement');
    expect(shipContent).toContain('Pattern Potential');

    // /explore should review lessons and patterns
    const exploreContent = fs.readFileSync(path.join(commandsRoot, 'explore.md'), 'utf-8');
    expect(exploreContent).toContain('Review Relevant Context');
    expect(exploreContent).toContain('Check Lessons from Similar Features');
    expect(exploreContent).toContain('Review Applicable Patterns');

    // /decide should consider principles
    const decideContent = fs.readFileSync(path.join(commandsRoot, 'decide.md'), 'utf-8');
    expect(decideContent).toContain('Review Guiding Principles');
    expect(decideContent).toContain('Principle Consideration');
    expect(decideContent).toContain('Alignment:');
  });
});
