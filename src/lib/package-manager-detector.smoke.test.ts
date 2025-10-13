/**
 * Smoke tests for PackageManagerDetector
 * Part of HODGE-341.5: Multi-Language Toolchain Support
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { smokeTest } from '../test/helpers.js';
import { PackageManagerDetector } from './package-manager-detector.js';
import { TempDirectoryFixture } from '../test/temp-directory-fixture.js';

describe('PackageManagerDetector - Smoke Tests', () => {
  let fixture: TempDirectoryFixture;
  let detector: PackageManagerDetector;

  beforeEach(async () => {
    fixture = new TempDirectoryFixture();
    const tempDir = await fixture.setup();
    detector = new PackageManagerDetector(tempDir);
  });

  afterEach(async () => {
    await fixture.cleanup();
  });

  smokeTest('should not crash when detecting Python package manager', async () => {
    await expect(detector.detectPython()).resolves.toBeDefined();
  });

  smokeTest('should not crash when detecting Java build tool', async () => {
    await expect(detector.detectJava()).resolves.toBeDefined();
  });

  smokeTest('should default to pip when no Python indicators exist', async () => {
    const result = await detector.detectPython();
    expect(result).toBe('pip');
  });

  smokeTest('should default to gradle when no Java indicators exist', async () => {
    const result = await detector.detectJava();
    expect(result).toBe('gradle');
  });

  smokeTest('should detect poetry from pyproject.toml', async () => {
    await fixture.writeFile('pyproject.toml', '[tool.poetry]\nname = "test"\n');

    const result = await detector.detectPython();
    expect(result).toBe('poetry');
  });

  smokeTest('should detect pipenv from Pipfile', async () => {
    await fixture.writeFile('Pipfile', '[[source]]\n');

    const result = await detector.detectPython();
    expect(result).toBe('pipenv');
  });

  smokeTest('should prefer poetry over pipenv', async () => {
    await fixture.writeFile('pyproject.toml', '[tool.poetry]\nname = "test"\n');
    await fixture.writeFile('Pipfile', '[[source]]\n');

    const result = await detector.detectPython();
    expect(result).toBe('poetry');
  });

  smokeTest('should detect gradle from build.gradle.kts', async () => {
    await fixture.writeFile('build.gradle.kts', 'plugins {}\n');

    const result = await detector.detectJava();
    expect(result).toBe('gradle');
  });

  smokeTest('should detect gradle from build.gradle', async () => {
    await fixture.writeFile('build.gradle', 'plugins {}\n');

    const result = await detector.detectJava();
    expect(result).toBe('gradle');
  });

  smokeTest('should detect gradle from gradlew wrapper', async () => {
    await fixture.writeFile('gradlew', '#!/bin/bash\n');

    const result = await detector.detectJava();
    expect(result).toBe('gradle');
  });

  smokeTest('should detect maven from pom.xml', async () => {
    await fixture.writeFile('pom.xml', '<project></project>\n');

    const result = await detector.detectJava();
    expect(result).toBe('maven');
  });

  smokeTest('should prefer gradle over maven when both exist', async () => {
    await fixture.writeFile('build.gradle.kts', 'plugins {}\n');
    await fixture.writeFile('pom.xml', '<project></project>\n');

    const result = await detector.detectJava();
    expect(result).toBe('gradle');
  });

  smokeTest('should not detect poetry from pyproject.toml without [tool.poetry]', async () => {
    await fixture.writeFile('pyproject.toml', '[tool.black]\n');

    const result = await detector.detectPython();
    expect(result).toBe('pip'); // Falls back to pip
  });
});
