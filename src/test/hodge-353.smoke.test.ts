/**
 * HODGE-353: NPM Package Publishing Setup
 * Smoke tests to validate package configuration and structure
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { smokeTest } from './helpers.js';

describe('[smoke] HODGE-353: NPM Package Publishing', () => {
  smokeTest('package.json has required publishing configuration', () => {
    const packageJsonPath = join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

    // Check required fields
    expect(packageJson.name).toBe('@hodgeson/hodge');
    expect(packageJson.version).toBeDefined();
    expect(packageJson.main).toBeDefined();
    expect(packageJson.types).toBeDefined();
    expect(packageJson.bin).toBeDefined();
    expect(packageJson.bin.hodge).toBeDefined();

    // Check publishConfig
    expect(packageJson.publishConfig).toBeDefined();
    expect(packageJson.publishConfig.access).toBe('public');

    // Check files array includes required entries
    expect(packageJson.files).toContain('dist');
    expect(packageJson.files).toContain('README.md');
    expect(packageJson.files).toContain('LICENSE');

    // Check repository configuration
    expect(packageJson.repository).toBeDefined();
    expect(packageJson.repository.type).toBe('git');
    expect(packageJson.repository.url).toContain('hodgeson-dev/hodge');

    // Check homepage
    expect(packageJson.homepage).toBe('https://www.hodgeson.dev');
  });

  smokeTest('prepublishOnly script is configured', () => {
    const packageJsonPath = join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

    expect(packageJson.scripts.prepublishOnly).toBeDefined();
    expect(packageJson.scripts.prepublishOnly).toContain('build');
  });

  smokeTest('validate-release workflow exists', () => {
    const workflowPath = join(process.cwd(), '.github/workflows/validate-release.yml');
    expect(existsSync(workflowPath)).toBe(true);

    const workflowContent = readFileSync(workflowPath, 'utf-8');

    // Check workflow triggers on version tags
    expect(workflowContent).toContain('tags:');
    expect(workflowContent).toContain("'v*'");

    // Check it runs quality checks
    expect(workflowContent).toContain('npm test');
    expect(workflowContent).toContain('npm run typecheck');
    expect(workflowContent).toContain('npm run lint');

    // Check it validates package contents
    expect(workflowContent).toContain('Validate package contents');
    expect(workflowContent).toContain('publishConfig');

    // Check it validates build artifacts
    expect(workflowContent).toContain('Check build artifacts');
    expect(workflowContent).toContain('dist/');

    // Check it tests package creation
    expect(workflowContent).toContain('npm pack --dry-run');
  });

  smokeTest('CONTRIBUTING.md has release process documentation', () => {
    const contributingPath = join(process.cwd(), 'CONTRIBUTING.md');
    expect(existsSync(contributingPath)).toBe(true);

    const contributingContent = readFileSync(contributingPath, 'utf-8');

    // Check for release process section
    expect(contributingContent).toContain('## Release Process');

    // Check for NPM account setup
    expect(contributingContent).toContain('### NPM Account Setup');
    expect(contributingContent).toContain('Create NPM Account');
    expect(contributingContent).toContain('npmjs.com');
    expect(contributingContent).toContain('Two-Factor Authentication');

    // Check for @hodgeson organization setup
    expect(contributingContent).toContain('@hodgeson');
    expect(contributingContent).toContain('Organization');

    // Check for release workflow steps
    expect(contributingContent).toContain('### Release Workflow');
    expect(contributingContent).toContain('Update CHANGELOG');
    expect(contributingContent).toContain('Bump Version');
    expect(contributingContent).toContain('npm version prerelease');
    expect(contributingContent).toContain('Push Tag');
    expect(contributingContent).toContain('git push --follow-tags');
    expect(contributingContent).toContain('Publish to NPM');
    expect(contributingContent).toContain('npm publish --tag alpha');

    // Check for release checklist
    expect(contributingContent).toContain('Release Checklist');

    // Check for troubleshooting
    expect(contributingContent).toContain('Troubleshooting');
  });

  smokeTest('required build artifacts are present after build', () => {
    // This test assumes build has been run
    // In CI, prepublishOnly ensures build happens before publish
    const distPath = join(process.cwd(), 'dist');

    // Check dist directory exists (created by build)
    expect(existsSync(distPath)).toBe(true);

    // Check critical entry points
    const binPath = join(distPath, 'src/bin/hodge.js');
    const mainPath = join(distPath, 'index.js');
    const packageJsonPath = join(distPath, 'package.json');

    expect(existsSync(binPath)).toBe(true);
    expect(existsSync(mainPath)).toBe(true);
    expect(existsSync(packageJsonPath)).toBe(true);

    // Check templates are copied
    const templatesPath = join(distPath, 'src/templates');
    expect(existsSync(templatesPath)).toBe(true);

    // Check review profiles are copied
    const profilesPath = join(distPath, 'review-profiles');
    expect(existsSync(profilesPath)).toBe(true);
  });

  smokeTest('LICENSE file exists for NPM package', () => {
    const licensePath = join(process.cwd(), 'LICENSE');
    expect(existsSync(licensePath)).toBe(true);

    const licenseContent = readFileSync(licensePath, 'utf-8');
    expect(licenseContent).toContain('MIT License');
  });

  smokeTest('README.md exists for NPM package page', () => {
    const readmePath = join(process.cwd(), 'README.md');
    expect(existsSync(readmePath)).toBe(true);

    const readmeContent = readFileSync(readmePath, 'utf-8');

    // Check it has installation instructions
    expect(readmeContent.toLowerCase()).toContain('install');
    expect(readmeContent).toContain('npm');

    // Check it mentions the package name
    expect(readmeContent).toContain('hodge');
  });
});
