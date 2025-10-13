/**
 * Smoke tests for MonorepoDetector
 * Part of HODGE-341.5: Multi-Language Toolchain Support
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { smokeTest } from '../test/helpers.js';
import { MonorepoDetector } from './monorepo-detector.js';
import { TempDirectoryFixture } from '../test/temp-directory-fixture.js';

describe('MonorepoDetector - Smoke Tests', () => {
  let fixture: TempDirectoryFixture;
  let detector: MonorepoDetector;

  beforeEach(async () => {
    fixture = new TempDirectoryFixture();
    const tempDir = await fixture.setup();
    detector = new MonorepoDetector(tempDir);
  });

  afterEach(async () => {
    await fixture.cleanup();
  });

  smokeTest('should not crash when no projects exist', async () => {
    await expect(detector.detectProjects()).resolves.toBeDefined();
  });

  smokeTest('should detect single Python project', async () => {
    await fixture.writeFile('pyproject.toml', '[tool.poetry]\n');

    const projects = await detector.detectProjects();

    expect(projects.length).toBe(1);
    expect(projects[0].language).toBe('python');
    expect(projects[0].path).toBe('.');
  });

  smokeTest('should detect multiple projects', async () => {
    // Create Python project
    await fixture.writeFile('services/api/pyproject.toml', '[tool.poetry]\n');

    // Create Kotlin project
    await fixture.writeFile('services/auth/build.gradle.kts', 'plugins {}\n');

    const projects = await detector.detectProjects();

    expect(projects.length).toBe(2);
    expect(projects.some((p) => p.language === 'python')).toBe(true);
    expect(projects.some((p) => p.language === 'kotlin')).toBe(true);
  });

  smokeTest('should identify single-language project as not a monorepo', async () => {
    await fixture.writeFile('pyproject.toml', '[tool.poetry]\n');

    const isMonorepo = await detector.isMonorepo();

    expect(isMonorepo).toBe(false);
  });

  smokeTest('should identify multiple projects as monorepo', async () => {
    // Create Python project
    await fixture.writeFile('services/api/pyproject.toml', '[tool.poetry]\n');

    // Create Kotlin project
    await fixture.writeFile('services/auth/build.gradle.kts', 'plugins {}\n');

    const isMonorepo = await detector.isMonorepo();

    expect(isMonorepo).toBe(true);
  });

  smokeTest('should identify multiple languages in single project as monorepo', async () => {
    await fixture.writeFile('pyproject.toml', '[tool.poetry]\n');
    await fixture.writeFile('package.json', '{}');

    const isMonorepo = await detector.isMonorepo();

    expect(isMonorepo).toBe(true);
  });

  smokeTest('should exclude node_modules and venv directories', async () => {
    // Create project in root
    await fixture.writeFile('pyproject.toml', '[tool.poetry]\n');

    // Create build files in excluded directories
    await fixture.writeFile('node_modules/some-package/package.json', '{}');
    await fixture.writeFile('venv/lib/setup.py', '');

    const projects = await detector.detectProjects();

    // Should only detect the root project, not files in excluded dirs
    expect(projects.length).toBe(1);
    expect(projects[0].path).toBe('.');
  });

  smokeTest('should handle nested projects correctly', async () => {
    // Root project
    await fixture.writeFile('pyproject.toml', '[tool.poetry]\n');

    // Nested project
    await fixture.writeFile('subproject/build.gradle.kts', 'plugins {}\n');

    const projects = await detector.detectProjects();

    expect(projects.length).toBe(2);
    expect(projects.some((p) => p.path === '.')).toBe(true);
    expect(projects.some((p) => p.path === 'subproject')).toBe(true);
  });

  smokeTest('should group multiple build files in same directory as one project', async () => {
    // Project with both pyproject.toml and requirements.txt
    await fixture.writeFile('pyproject.toml', '[tool.poetry]\n');
    await fixture.writeFile('requirements.txt', 'django==4.0\n');

    const projects = await detector.detectProjects();

    expect(projects.length).toBe(1);
    expect(projects[0].buildFiles).toContain('pyproject.toml');
    expect(projects[0].buildFiles).toContain('requirements.txt');
  });
});
