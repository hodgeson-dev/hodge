import { describe, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { smokeTest } from './helpers.js';

describe('[smoke] HODGE-352: Project cleanup and OSS organization', () => {
  smokeTest('outdated directories should not exist', () => {
    const projectRoot = join(process.cwd());

    // Should NOT exist (deleted)
    expect(existsSync(join(projectRoot, 'podge'))).toBe(false);
    expect(existsSync(join(projectRoot, 'tests'))).toBe(false);
    expect(existsSync(join(projectRoot, 'file'))).toBe(false);
    expect(existsSync(join(projectRoot, 'IMPLEMENTATION_PLAN.md'))).toBe(false);
  });

  smokeTest('new documentation structure should exist', () => {
    const projectRoot = join(process.cwd());

    // Should exist (created)
    expect(existsSync(join(projectRoot, 'docs'))).toBe(true);
    expect(existsSync(join(projectRoot, 'docs/getting-started.md'))).toBe(true);
    expect(existsSync(join(projectRoot, 'docs/basic-usage.md'))).toBe(true);
    expect(existsSync(join(projectRoot, 'docs/advanced'))).toBe(true);
    expect(existsSync(join(projectRoot, 'docs/advanced/README.md'))).toBe(true);
  });

  smokeTest('professional OSS files should exist', () => {
    const projectRoot = join(process.cwd());

    expect(existsSync(join(projectRoot, 'CODE_OF_CONDUCT.md'))).toBe(true);
    expect(existsSync(join(projectRoot, 'SECURITY.md'))).toBe(true);
  });

  smokeTest('examples directory structure should exist', () => {
    const projectRoot = join(process.cwd());

    expect(existsSync(join(projectRoot, 'examples'))).toBe(true);
    expect(existsSync(join(projectRoot, 'examples/README.md'))).toBe(true);
  });

  smokeTest('scripts documentation should exist', () => {
    const projectRoot = join(process.cwd());

    expect(existsSync(join(projectRoot, 'scripts/README.md'))).toBe(true);
  });

  smokeTest('package.json should be rebranded to @hodgeson/hodge', () => {
    const projectRoot = join(process.cwd());
    const packageJson = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf-8'));

    expect(packageJson.name).toBe('@hodgeson/hodge');
    expect(packageJson.author).toBe('Hodgeson');
    expect(packageJson.repository.url).toBe('git+https://github.com/hodgeson-dev/hodge.git');
    expect(packageJson.homepage).toBe('https://www.hodgeson.dev');
  });

  smokeTest('gitignore should include new entries', () => {
    const projectRoot = join(process.cwd());
    const gitignore = readFileSync(join(projectRoot, '.gitignore'), 'utf-8');

    expect(gitignore).toContain('.hodge/review-profiles/');
    expect(gitignore).toContain('report/');
  });

  smokeTest('README should have professional structure with badges', () => {
    const projectRoot = join(process.cwd());
    const readme = readFileSync(join(projectRoot, 'README.md'), 'utf-8');

    // Check for badges
    expect(readme).toContain('![Build Status]');
    expect(readme).toContain('![npm version]');
    expect(readme).toContain('![License: MIT]');

    // Check for key sections
    expect(readme).toContain('## ✨ Features');
    expect(readme).toContain('## 🚀 Quick Start');
    expect(readme).toContain('## 📖 Progressive Workflow');
    expect(readme).toContain('www.hodgeson.dev');
  });

  smokeTest('CHANGELOG should document rebranding', () => {
    const projectRoot = join(process.cwd());
    const changelog = readFileSync(join(projectRoot, 'CHANGELOG.md'), 'utf-8');

    expect(changelog).toContain('HODGE-352');
    expect(changelog).toContain('@hodgeson/hodge');
    expect(changelog).toContain('www.hodgeson.dev');
    expect(changelog).toContain('Removed obsolete files');
  });

  smokeTest('CONTRIBUTING should reference new repository', () => {
    const projectRoot = join(process.cwd());
    const contributing = readFileSync(join(projectRoot, 'CONTRIBUTING.md'), 'utf-8');

    expect(contributing).toContain('github.com/hodgeson-dev/hodge');
    expect(contributing).not.toContain('github.com/agile-explorations/hodge');
  });
});
