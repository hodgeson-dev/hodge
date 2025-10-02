import { describe } from 'vitest';
import { smokeTest } from './helpers.js';
import * as fs from 'fs';
import * as path from 'path';

describe('Explore Command - No Approach Generation (HODGE-285)', () => {
  const explorePath = path.join(process.cwd(), 'src', 'commands', 'explore.ts');

  smokeTest('should not contain generateApproaches method', async () => {
    const content = fs.readFileSync(explorePath, 'utf-8');

    // Verify method is removed
    expect(content).not.toContain('generateApproaches(');
    expect(content).not.toContain('private generateApproaches');

    // Verify comment about removal exists
    expect(content).toContain('AI handles approach generation');
  });

  smokeTest('should not contain generateImplementationHints method', async () => {
    const content = fs.readFileSync(explorePath, 'utf-8');

    // Verify method is removed
    expect(content).not.toContain('generateImplementationHints(');
    expect(content).not.toContain('private generateImplementationHints');

    // Verify comment about removal exists
    expect(content).toContain('AI provides implementation guidance');
  });

  smokeTest('should create minimal exploration template', async () => {
    const content = fs.readFileSync(explorePath, 'utf-8');

    // Check for placeholder comments in template
    expect(content).toContain('<!-- AI will generate 2-3 approaches here -->');
    expect(content).toContain('<!-- AI will provide recommendation -->');
    expect(content).toContain('<!-- AI will list decisions for /decide command -->');
  });

  smokeTest('should not reference approach count in output', async () => {
    const content = fs.readFileSync(explorePath, 'utf-8');

    // Verify no references to approach count
    expect(content).not.toContain('suggested approaches');
    expect(content).not.toContain('template.approaches.length');
    expect(content).toContain('Generate and review implementation approaches');
  });

  smokeTest('explore.md should instruct AI to generate approaches', async () => {
    const exploreMdPath = path.join(process.cwd(), '.claude', 'commands', 'explore.md');
    const content = fs.readFileSync(exploreMdPath, 'utf-8');

    // Check for conversational exploration instructions (HODGE-314)
    expect(content).toContain('Conversational Exploration');
    expect(content).toContain('Implementation Approaches');
    expect(content).toContain('Example Approach Format');
  });
});
