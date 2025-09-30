import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('[smoke] build.md template - PM issue check', () => {
  it('should contain PM issue check section', () => {
    const buildTemplate = readFileSync(join(__dirname, 'build.md'), 'utf-8');

    // Check for key sections
    expect(buildTemplate).toContain('## PM Issue Check (Before Build)');
    expect(buildTemplate).toContain('Check for PM Issue Mapping');
    expect(buildTemplate).toContain('.hodge/id-mappings.json');
  });

  it('should contain user prompt for unmapped features', () => {
    const buildTemplate = readFileSync(join(__dirname, 'build.md'), 'utf-8');

    expect(buildTemplate).toContain("doesn't have a PM issue tracking it yet");
    expect(buildTemplate).toContain('Would you like to create a PM issue for this work?');
    expect(buildTemplate).toContain('a) Yes - Create a PM issue');
    expect(buildTemplate).toContain('b) No - Continue without PM tracking');
  });

  it('should reference /plan command for single issue creation', () => {
    const buildTemplate = readFileSync(join(__dirname, 'build.md'), 'utf-8');

    expect(buildTemplate).toContain('/plan {{feature}}');
    expect(buildTemplate).toContain('single-issue plan');
  });

  it('should document non-blocking behavior', () => {
    const buildTemplate = readFileSync(join(__dirname, 'build.md'), 'utf-8');

    expect(buildTemplate).toContain('Proceed with build anyway');
    expect(buildTemplate).toContain('non-blocking');
    expect(buildTemplate).toContain('freedom to explore');
  });

  it('should have skip logic for already mapped features', () => {
    const buildTemplate = readFileSync(join(__dirname, 'build.md'), 'utf-8');

    expect(buildTemplate).toContain('If Feature IS Already Mapped');
    expect(buildTemplate).toContain('Skip the prompt');
  });
});
