import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import * as path from 'path';

describe('CommonJS Compatibility [smoke]', () => {
  it('should run hodge without ExperimentalWarning', () => {
    const hodgePath = path.join(__dirname, '../../dist/src/bin/hodge.js');

    // Run hodge --help and capture stderr
    const result = execSync(`node ${hodgePath} --help 2>&1`, {
      encoding: 'utf-8',
    });

    // Verify no ExperimentalWarning in output
    expect(result).not.toContain('ExperimentalWarning');
    expect(result).not.toContain('CommonJS module');
    expect(result).not.toContain('loading ES Module');

    // Verify command still works
    expect(result).toContain('Claude Code companion tool');
  });

  it('should import chalk without warnings in CommonJS', () => {
    // This test verifies chalk v4 works in our CommonJS setup
    const testCode = `
      const chalk = require('chalk');
      console.log(chalk.blue('test'));
    `;

    const result = execSync(`node -e "${testCode}" 2>&1`, {
      encoding: 'utf-8',
    });

    // Should output colored text without warnings
    expect(result).not.toContain('ExperimentalWarning');
    expect(result.trim()).toBeTruthy();
  });

  it('should import inquirer without warnings in CommonJS', () => {
    // Verify inquirer v8 works in CommonJS
    const testCode = `
      const inquirer = require('inquirer');
      console.log(typeof inquirer.prompt);
    `;

    const result = execSync(`node -e "${testCode}" 2>&1`, {
      encoding: 'utf-8',
    });

    // Should output 'function' without warnings
    expect(result).not.toContain('ExperimentalWarning');
    expect(result.trim()).toBe('function');
  });
});
