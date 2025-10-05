import { describe, expect } from 'vitest';
import { readFileSync } from 'fs';
import { smokeTest } from './helpers';

describe('HODGE-328: ESM validate-standards script', () => {
  smokeTest('should use ESM import syntax (not CommonJS require)', () => {
    const content = readFileSync('scripts/validate-standards.js', 'utf8');

    // Should have ESM imports
    expect(content).toContain('import fs from');
    expect(content).toContain('import { execSync }');

    // Should NOT have CommonJS require
    expect(content).not.toContain('= require(');
    expect(content).not.toContain("require('fs')");
    expect(content).not.toContain("require('child_process')");
  });

  smokeTest('should have all necessary ESM imports', () => {
    const content = readFileSync('scripts/validate-standards.js', 'utf8');

    // Verify all required imports are present
    expect(content).toContain("import fs from 'fs'");
    expect(content).toContain("import { execSync } from 'child_process'");

    // Should not import unused modules
    expect(content).not.toContain("import path from 'path'");
  });

  smokeTest('should start with node shebang', () => {
    const content = readFileSync('scripts/validate-standards.js', 'utf8');

    // Should have shebang for direct execution
    expect(content).toMatch(/^#!\/usr\/bin\/env node/);
  });

  smokeTest('should export async main function', () => {
    const content = readFileSync('scripts/validate-standards.js', 'utf8');

    // Should have async main function
    expect(content).toContain('async function main()');
    expect(content).toContain('main().catch(');
  });

  smokeTest('should have proper ESM error handling', () => {
    const content = readFileSync('scripts/validate-standards.js', 'utf8');

    // Should handle errors properly with process.exit
    expect(content).toContain('process.exit(1)');
    expect(content).toContain('process.exit(0)');

    // Should have catch block for main
    expect(content).toMatch(/main\(\)\.catch\(/);
  });
});
