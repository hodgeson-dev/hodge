/**
 * Smoke tests for LanguageDetector
 * Part of HODGE-341.5: Multi-Language Toolchain Support
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { smokeTest } from '../test/helpers.js';
import { LanguageDetector } from './language-detector.js';
import { TempDirectoryFixture } from '../test/temp-directory-fixture.js';

describe('LanguageDetector - Smoke Tests', () => {
  let fixture: TempDirectoryFixture;
  let detector: LanguageDetector;

  beforeEach(async () => {
    fixture = new TempDirectoryFixture();
    const tempDir = await fixture.setup();
    detector = new LanguageDetector(tempDir);
  });

  afterEach(async () => {
    await fixture.cleanup();
  });

  smokeTest('should not crash when no language files exist', async () => {
    const results = await detector.detectLanguages();
    expect(Array.isArray(results)).toBe(true);
  });

  smokeTest('should detect Python via pyproject.toml', async () => {
    await fixture.writeFile('pyproject.toml', '[tool.poetry]\n');

    const results = await detector.detectLanguages();
    const python = results.find((r) => r.language === 'python');

    expect(python).toBeDefined();
    expect(python?.confidence).toBe('high');
    expect(python?.indicators).toContain('pyproject.toml');
  });

  smokeTest('should detect Kotlin via build.gradle.kts', async () => {
    await fixture.writeFile('build.gradle.kts', 'plugins { kotlin }');

    const results = await detector.detectLanguages();
    const kotlin = results.find((r) => r.language === 'kotlin');

    expect(kotlin).toBeDefined();
    expect(kotlin?.confidence).toBe('high');
  });

  smokeTest('should detect Java via pom.xml', async () => {
    await fixture.writeFile('pom.xml', '<project></project>');

    const results = await detector.detectLanguages();
    const java = results.find((r) => r.language === 'java');

    expect(java).toBeDefined();
    expect(java?.confidence).toBe('high');
  });

  smokeTest('should detect TypeScript via tsconfig.json', async () => {
    await fixture.writeFile('tsconfig.json', '{}');

    const results = await detector.detectLanguages();
    const ts = results.find((r) => r.language === 'typescript');

    expect(ts).toBeDefined();
    expect(ts?.confidence).toBe('high');
  });

  smokeTest('should distinguish Kotlin from Java in pom.xml', async () => {
    await fixture.writeFile('pom.xml', '<project><plugin>kotlin-maven-plugin</plugin></project>');

    const results = await detector.detectLanguages();
    const kotlin = results.find((r) => r.language === 'kotlin');
    const java = results.find((r) => r.language === 'java');

    // When pom.xml contains kotlin-maven-plugin, it should detect as Kotlin
    expect(kotlin).toBeDefined();
    expect(kotlin?.indicators).toContain('pom.xml (kotlin-maven-plugin)');
    expect(java).toBeUndefined(); // Should NOT detect as Java when Kotlin plugin is present
  });

  smokeTest('should detect multiple languages in monorepo', async () => {
    await fixture.writeFile('pyproject.toml', '[tool.poetry]\n');
    await fixture.writeFile('build.gradle.kts', 'plugins {}');
    await fixture.writeFile('tsconfig.json', '{}');

    const results = await detector.detectLanguages();

    // Should detect at least Python, Kotlin, and TypeScript
    expect(results.length).toBeGreaterThanOrEqual(3);
    const languages = results.map((r) => r.language);
    expect(languages).toContain('python');
    expect(languages).toContain('kotlin');
    expect(languages).toContain('typescript');
  });
});
