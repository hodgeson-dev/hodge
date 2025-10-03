import { describe, it, expect } from 'vitest';
import { smokeTest } from '../test/helpers.js';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../..');

describe('ESM Configuration - HODGE-318', () => {
  smokeTest('should have package.json configured for ESM', async () => {
    const packageJsonPath = path.join(projectRoot, 'package.json');
    const packageJson = await fs.readJSON(packageJsonPath);

    expect(packageJson.type).toBe('module');
    expect(packageJson.engines.node).toBe('>=20.0.0');
  });

  smokeTest('should have tsconfig.json configured for NodeNext', async () => {
    const tsconfigPath = path.join(projectRoot, 'tsconfig.json');
    const tsconfig = await fs.readJSON(tsconfigPath);

    expect(tsconfig.compilerOptions.module).toBe('NodeNext');
    expect(tsconfig.compilerOptions.moduleResolution).toBe('NodeNext');
  });

  smokeTest('should have CI workflow without Node 18.x', async () => {
    const workflowPath = path.join(projectRoot, '.github/workflows/quality.yml');
    const workflowContent = await fs.readFile(workflowPath, 'utf-8');

    // Should include 20.x and 22.x
    expect(workflowContent).toContain('20.x');
    expect(workflowContent).toContain('22.x');

    // Should NOT include 18.x in the matrix
    const matrixMatch = workflowContent.match(/node-version:\s*\[([\s\S]*?)\]/);
    expect(matrixMatch).toBeTruthy();
    const matrixContent = matrixMatch![1];
    expect(matrixContent).not.toContain('18.x');
  });

  smokeTest('should load vitest config without ERR_REQUIRE_ESM', async () => {
    const vitestConfigPath = path.join(projectRoot, 'vitest.config.ts');

    // If we got this far in the test suite, vitest loaded successfully
    // This is a meta-test that the config loads without CommonJS/ESM errors
    expect(await fs.pathExists(vitestConfigPath)).toBe(true);
  });

  smokeTest('should have README documenting Node 20.x+ requirement', async () => {
    const readmePath = path.join(projectRoot, 'README.md');
    const readmeContent = await fs.readFile(readmePath, 'utf-8');

    // Should mention Node 20.x requirement
    expect(readmeContent).toMatch(/Node\.?js.*≥\s*20\.0\.0/i);
  });
});
