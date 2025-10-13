/**
 * Smoke tests for FrameworkDetector
 * Part of HODGE-341.5: Multi-Language Toolchain Support
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { smokeTest } from '../test/helpers.js';
import { FrameworkDetector } from './framework-detector.js';
import { TempDirectoryFixture } from '../test/temp-directory-fixture.js';

describe('FrameworkDetector - Smoke Tests', () => {
  let fixture: TempDirectoryFixture;
  let detector: FrameworkDetector;

  beforeEach(async () => {
    fixture = new TempDirectoryFixture();
    const tempDir = await fixture.setup();
    detector = new FrameworkDetector(tempDir);
  });

  afterEach(async () => {
    await fixture.cleanup();
  });

  smokeTest('should not crash when detecting Python frameworks', async () => {
    await expect(detector.detectFrameworks('python')).resolves.toBeDefined();
  });

  smokeTest('should not crash when detecting Kotlin frameworks', async () => {
    await expect(detector.detectFrameworks('kotlin')).resolves.toBeDefined();
  });

  smokeTest('should not crash when detecting Java frameworks', async () => {
    await expect(detector.detectFrameworks('java')).resolves.toBeDefined();
  });

  smokeTest('should return empty array for unsupported language', async () => {
    const result = await detector.detectFrameworks('typescript');
    expect(result).toEqual([]);
  });

  smokeTest('should detect Django from requirements.txt', async () => {
    await fixture.writeFile('requirements.txt', 'Django==4.0.0\n');

    const frameworks = await detector.detectFrameworks('python');

    expect(frameworks).toContain('django');
  });

  smokeTest('should detect Flask from requirements.txt', async () => {
    await fixture.writeFile('requirements.txt', 'flask==2.0.0\n');

    const frameworks = await detector.detectFrameworks('python');

    expect(frameworks).toContain('flask');
  });

  smokeTest('should detect FastAPI from pyproject.toml', async () => {
    await fixture.writeFile('pyproject.toml', '[tool.poetry.dependencies]\nfastapi = "^0.100.0"\n');

    const frameworks = await detector.detectFrameworks('python');

    expect(frameworks).toContain('fastapi');
  });

  smokeTest('should detect multiple Python frameworks', async () => {
    await fixture.writeFile('requirements.txt', 'Django==4.0.0\nflask==2.0.0\n');

    const frameworks = await detector.detectFrameworks('python');

    expect(frameworks).toContain('django');
    expect(frameworks).toContain('flask');
    expect(frameworks.length).toBe(2);
  });

  smokeTest('should deduplicate frameworks from multiple files', async () => {
    await fixture.writeFile('requirements.txt', 'Django==4.0.0\n');
    await fixture.writeFile('pyproject.toml', '[tool.poetry.dependencies]\ndjango = "^4.0"\n');

    const frameworks = await detector.detectFrameworks('python');

    expect(frameworks).toEqual(['django']);
  });

  smokeTest('should detect Spring Boot from build.gradle.kts', async () => {
    await fixture.writeFile(
      'build.gradle.kts',
      'dependencies {\n  implementation("org.springframework.boot:spring-boot-starter")\n}\n'
    );

    const frameworks = await detector.detectFrameworks('kotlin');

    expect(frameworks).toContain('spring-boot');
  });

  smokeTest('should detect Ktor from build.gradle.kts', async () => {
    await fixture.writeFile(
      'build.gradle.kts',
      'dependencies {\n  implementation("io.ktor:ktor-server-core")\n}\n'
    );

    const frameworks = await detector.detectFrameworks('kotlin');

    expect(frameworks).toContain('ktor');
  });

  smokeTest('should detect Jetpack Compose from build.gradle.kts', async () => {
    await fixture.writeFile(
      'build.gradle.kts',
      'dependencies {\n  implementation("androidx.compose:compose-runtime")\n}\n'
    );

    const frameworks = await detector.detectFrameworks('kotlin');

    expect(frameworks).toContain('jetpack-compose');
  });

  smokeTest('should detect Spring Boot from pom.xml', async () => {
    await fixture.writeFile(
      'pom.xml',
      '<dependencies>\n  <dependency>\n    <artifactId>spring-boot-starter</artifactId>\n  </dependency>\n</dependencies>\n'
    );

    const frameworks = await detector.detectFrameworks('java');

    expect(frameworks).toContain('spring-boot');
  });

  smokeTest('should detect Spring Security from build.gradle', async () => {
    await fixture.writeFile(
      'build.gradle',
      'dependencies {\n  implementation "org.springframework.security:spring-security-core"\n}\n'
    );

    const frameworks = await detector.detectFrameworks('java');

    expect(frameworks).toContain('spring-security');
  });

  smokeTest('should handle case insensitivity for Python frameworks', async () => {
    await fixture.writeFile('requirements.txt', 'DJANGO==4.0.0\n');

    const frameworks = await detector.detectFrameworks('python');

    expect(frameworks).toContain('django');
  });
});
