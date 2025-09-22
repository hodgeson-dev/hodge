import { describe, expect } from 'vitest';
import { smokeTest } from './helpers.js';
import * as fs from 'fs';
import * as path from 'path';

describe('Decide Command Template Updates (HODGE-284)', () => {
  const decidePath = path.join(process.cwd(), '.claude', 'commands', 'decide.md');
  const explorePath = path.join(process.cwd(), '.claude', 'commands', 'explore.md');

  smokeTest('decide.md should include Decision Categories Framework', async () => {
    const content = fs.readFileSync(decidePath, 'utf-8');

    // Check for Decision Categories Framework
    expect(content).toContain('Decision Categories Framework');
    expect(content).toContain('Implementation Approach');
    expect(content).toContain('Scope Decisions');
    expect(content).toContain('Technical Choices');
    expect(content).toContain('Naming Conventions');
    expect(content).toContain('Testing Strategy');
    expect(content).toContain('TODO Resolution');
  });

  smokeTest('decide.md should check exploration for decisions', async () => {
    const content = fs.readFileSync(decidePath, 'utf-8');

    // Check for exploration as primary source
    expect(content).toContain('PRIMARY SOURCE - Current Exploration');
    expect(content).toContain('.hodge/features/{{current_feature}}/explore/exploration.md');
    expect(content).toContain('Decisions Needed');
  });

  smokeTest('decide.md should require recommended option', async () => {
    const content = fs.readFileSync(decidePath, 'utf-8');

    // Check for recommended option requirement
    expect(content).toContain('(Recommended)');
    expect(content).toContain('REQUIREMENT**: Always mark one option as "(Recommended)"');
  });

  smokeTest('decide.md should instruct to find multiple decisions', async () => {
    const content = fs.readFileSync(decidePath, 'utf-8');

    // Check for multiple decision gathering
    expect(content).toContain('Try to find at least 2-3 decisions');
    expect(content).toContain('always check all categories');
  });

  smokeTest('explore.md should include Decisions Needed section', async () => {
    const content = fs.readFileSync(explorePath, 'utf-8');

    // Check for Decisions Needed documentation
    expect(content).toContain('Document Decisions Needed');
    expect(content).toContain('## Decisions Needed');
    expect(content).toContain('These decisions will be presented by `/decide`');
  });

  smokeTest('explore.md should list decision categories to document', async () => {
    const content = fs.readFileSync(explorePath, 'utf-8');

    // Check for decision categories in explore
    expect(content).toContain('Implementation approach decision');
    expect(content).toContain('Scope decisions');
    expect(content).toContain('Technical choices');
    expect(content).toContain('Testing strategy');
  });
});
