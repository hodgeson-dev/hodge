import { describe, expect } from 'vitest';
import { readFileSync } from 'fs';
import { integrationTest } from '../src/test/helpers.js';

describe('HODGE-328: ESM validate-standards CI integration', () => {
  integrationTest('should use ESM syntax compatible with package.json type=module', () => {
    // Read package.json configuration
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));

    // Read validate-standards script content
    const scriptContent = readFileSync('scripts/validate-standards.js', 'utf8');

    // Verify ESM configuration
    expect(packageJson.type).toBe('module');

    // Verify script uses ESM imports (not CommonJS require)
    expect(scriptContent).toContain("import fs from 'fs'");
    expect(scriptContent).toContain("import { execSync } from 'child_process'");
    expect(scriptContent).not.toContain('= require(');

    // Verify shebang for Node.js execution
    expect(scriptContent).toMatch(/^#!\/usr\/bin\/env node/);
  });

  integrationTest('should have proper ESM module structure', () => {
    const scriptContent = readFileSync('scripts/validate-standards.js', 'utf8');

    // Should have async main function (ESM pattern)
    expect(scriptContent).toContain('async function main()');

    // Should call main with catch (ESM error handling)
    expect(scriptContent).toMatch(/main\(\)\.catch\(/);

    // Should use process.exit for status codes
    expect(scriptContent).toContain('process.exit(1)');
    expect(scriptContent).toContain('process.exit(0)');

    // Should NOT use module.exports (CommonJS)
    expect(scriptContent).not.toContain('module.exports');

    // Should NOT use __dirname (CommonJS-specific)
    expect(scriptContent).not.toContain('__dirname');
  });

  integrationTest('should have all necessary imports for validation', () => {
    const scriptContent = readFileSync('scripts/validate-standards.js', 'utf8');

    // Verify imports match actual usage
    expect(scriptContent).toContain('import fs from');
    expect(scriptContent).toContain('import { execSync }');

    // Verify fs usage exists (readFileSync calls)
    expect(scriptContent).toMatch(/fs\.readFileSync/);
    expect(scriptContent).toMatch(/fs\.existsSync/);

    // Verify execSync usage exists (running validation commands)
    expect(scriptContent).toMatch(/execSync\(/);
  });
});
