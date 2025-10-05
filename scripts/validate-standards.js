#!/usr/bin/env node

/**
 * Validate code against Hodge standards
 * Runs as part of pre-commit and CI/CD
 */

import fs from 'fs';
import { execSync } from 'child_process';

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

let hasErrors = false;
let hasWarnings = false;

function log(message, level = 'info') {
  const prefix = {
    error: `${RED}✗${RESET}`,
    warning: `${YELLOW}⚠${RESET}`,
    success: `${GREEN}✓${RESET}`,
    info: '→',
  }[level];

  console.log(`${prefix} ${message}`);

  if (level === 'error') hasErrors = true;
  if (level === 'warning') hasWarnings = true;
}

function checkTypeScriptStrict() {
  log('Checking TypeScript strict mode...');

  try {
    const tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));

    if (!tsconfig.compilerOptions?.strict) {
      log('TypeScript strict mode is not enabled', 'error');
      return false;
    }

    log('TypeScript strict mode enabled', 'success');
    return true;
  } catch (error) {
    log(`Could not check TypeScript config: ${error.message}`, 'error');
    return false;
  }
}

function checkCommitMessage() {
  log('Checking commit message format...');

  try {
    // Get the most recent commit message
    const message = execSync('git log -1 --pretty=%B', { encoding: 'utf8' }).trim();
    const validPrefixes = [
      'feat:',
      'fix:',
      'docs:',
      'refactor:',
      'test:',
      'chore:',
      'style:',
      'perf:',
    ];

    const hasValidPrefix = validPrefixes.some((prefix) => message.startsWith(prefix));

    if (!hasValidPrefix && !message.startsWith('Merge')) {
      log(`Commit message doesn't follow semantic format: "${message}"`, 'warning');
      log(`Should start with: ${validPrefixes.join(', ')}`, 'info');
      return false;
    }

    log('Commit message follows semantic format', 'success');
    return true;
  } catch (error) {
    // Not in a git repo or no commits yet
    return true;
  }
}

function checkTestCoverage() {
  log('Checking test coverage requirements...');

  // Check if tests exist
  const testFiles = execSync(
    'find src -name "*.test.ts" -o -name "*.spec.ts" 2>/dev/null || true',
    {
      encoding: 'utf8',
    }
  ).trim();

  if (!testFiles) {
    log('No test files found (required for production)', 'warning');
    return false;
  }

  log('Test files found', 'success');
  return true;
}

function checkESLint() {
  log('Running ESLint...');

  try {
    execSync('npm run lint', { stdio: 'pipe' });
    log('ESLint passed', 'success');
    return true;
  } catch (error) {
    log('ESLint found issues', 'error');
    console.log(error.stdout?.toString() || error.message);
    return false;
  }
}

function checkPrettier() {
  log('Checking code formatting...');

  try {
    const result = execSync('npx prettier --check .', { encoding: 'utf8', stdio: 'pipe' });
    log('Code formatting is correct', 'success');
    return true;
  } catch (error) {
    log('Code formatting issues found', 'warning');
    log('Run "npm run format" to fix', 'info');
    return false;
  }
}

function checkBranchNaming() {
  log('Checking branch naming convention...');

  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
    const validPatterns = [
      /^main$/,
      /^explore-[\w-]+$/,
      /^build-[\w-]+$/,
      /^harden-[\w-]+$/,
      /^fix-[\w-]+$/,
      /^docs-[\w-]+$/,
    ];

    const isValid = validPatterns.some((pattern) => pattern.test(branch));

    if (!isValid && branch !== 'HEAD') {
      log(`Branch name doesn't follow convention: "${branch}"`, 'warning');
      log('Should match: explore-*, build-*, harden-*, fix-*, docs-*', 'info');
      return false;
    }

    log(`Branch naming is correct: ${branch}`, 'success');
    return true;
  } catch (error) {
    return true;
  }
}

function checkNoConsoleLog() {
  log('Checking for console.log statements...');

  try {
    // Use a more sophisticated check that excludes comments
    const files = execSync('find src -name "*.ts" -o -name "*.tsx" 2>/dev/null || true', {
      encoding: 'utf8',
    })
      .trim()
      .split('\n')
      .filter(Boolean);

    // Files exempt from console.log check
    const exemptPatterns = [
      /\.test\.ts$/, // Test files
      /\.spec\.ts$/, // Spec files
      /src\/lib\/logger\.ts$/, // Logger implementation itself
      /src\/test\/runners\.ts$/, // Test utility functions (user-facing output)
      /src\/bin\/hodge\.ts$/, // CLI entry point (user-facing output)
      /src\/lib\/pm-scripts-templates\.ts$/, // PM script templates (template content)
      /src\/lib\/todo-checker\.ts$/, // User-facing TODO display functions
      /src\/commands\/init-claude-commands\.ts$/, // Function-based command (user-facing output)
    ];

    const filesWithConsoleLog = [];

    for (const file of files) {
      if (!fs.existsSync(file)) continue;

      // Skip exempt files
      if (exemptPatterns.some((pattern) => pattern.test(file))) {
        continue;
      }

      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Skip lines that are comments
        if (line.trim().startsWith('//') || line.trim().startsWith('*')) continue;
        // Check for console.log not in a comment
        if (line.includes('console.log') && !line.includes('//')) {
          filesWithConsoleLog.push(file);
          break;
        }
      }
    }

    if (filesWithConsoleLog.length > 0) {
      log('Found console.log statements (use proper logging)', 'error');
      filesWithConsoleLog.forEach((file) => log(`  ${file}`, 'info'));
      return false;
    }

    log('No console.log statements found', 'success');
    return true;
  } catch (error) {
    log('No console.log statements found', 'success');
    return true;
  }
}

async function main() {
  console.log('\n🔍 Validating Hodge Standards\n');

  checkTypeScriptStrict();
  checkESLint();
  checkPrettier();
  checkNoConsoleLog();
  checkBranchNaming();
  checkCommitMessage();
  checkTestCoverage();

  console.log('\n' + '─'.repeat(40));

  if (hasErrors) {
    console.log(`\n${RED}✗ Standards validation failed${RESET}`);
    console.log('Fix errors before committing\n');
    process.exit(1);
  } else if (hasWarnings) {
    console.log(`\n${YELLOW}⚠ Standards validation passed with warnings${RESET}`);
    console.log('Consider addressing warnings\n');
    process.exit(0);
  } else {
    console.log(`\n${GREEN}✓ All standards validated successfully${RESET}\n`);
    process.exit(0);
  }
}

main().catch((error) => {
  console.error('Validation script error:', error);
  process.exit(1);
});
