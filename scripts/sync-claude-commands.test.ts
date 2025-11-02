/**
 * @fileoverview Smoke tests for sync-claude-commands.js script
 *
 * Ensures that the sync script generates properly formatted TypeScript code
 * that passes Prettier checks in both local and CI environments.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { smokeTest } from '../src/test/helpers';

const SYNC_SCRIPT = path.join(__dirname, 'sync-claude-commands.js');
const COMMANDS_DIR = path.join(__dirname, '..', '.claude', 'commands');
const OUTPUT_FILE = path.join(__dirname, '..', 'src', 'lib', 'claude-commands.ts');

describe('sync-claude-commands', () => {
  let originalContent: string | null = null;

  beforeEach(() => {
    // Backup original file if it exists
    if (fs.existsSync(OUTPUT_FILE)) {
      originalContent = fs.readFileSync(OUTPUT_FILE, 'utf8');
    }
  });

  afterEach(() => {
    // Restore original file
    if (originalContent !== null) {
      fs.writeFileSync(OUTPUT_FILE, originalContent, 'utf8');
    }
  });

  smokeTest('should generate valid TypeScript', () => {
    // Run sync script
    execSync(`node ${SYNC_SCRIPT}`, { stdio: 'pipe' });

    // Check that output file exists
    expect(fs.existsSync(OUTPUT_FILE)).toBe(true);

    // Check that content is valid TypeScript (basic check)
    const content = fs.readFileSync(OUTPUT_FILE, 'utf8');
    expect(content).toContain('export interface ClaudeCommand');
    expect(content).toContain('export function getClaudeCommands()');
  });

  smokeTest(
    'should generate properly formatted code',
    () => {
      // Run sync script
      execSync(`node ${SYNC_SCRIPT}`, { stdio: 'pipe' });

      // Run prettier check on generated file
      expect(() => {
        execSync(`npx prettier --check ${OUTPUT_FILE}`, { stdio: 'pipe' });
      }).not.toThrow();
    },
    30000
  ); // Increased timeout to 30s for CI environments

  smokeTest(
    'should complete within reasonable time',
    () => {
      const start = Date.now();

      execSync(`node ${SYNC_SCRIPT}`, { stdio: 'pipe' });

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(10000); // 10 seconds max (relaxed for CI)
    },
    15000
  ); // Test timeout higher than assertion threshold

  smokeTest('should preserve command content', () => {
    // Get list of command files
    const commandFiles = fs.readdirSync(COMMANDS_DIR).filter((file) => file.endsWith('.md'));

    // Run sync script
    execSync(`node ${SYNC_SCRIPT}`, { stdio: 'pipe' });

    // Check that all commands are in output
    const content = fs.readFileSync(OUTPUT_FILE, 'utf8');

    for (const file of commandFiles) {
      const commandName = path.basename(file, '.md');
      expect(content).toContain(`name: '${commandName}'`);
    }
  });

  smokeTest(
    'should generate consistent output across runs',
    () => {
      // Run sync script twice
      execSync(`node ${SYNC_SCRIPT}`, { stdio: 'pipe' });
      const firstRun = fs.readFileSync(OUTPUT_FILE, 'utf8');

      execSync(`node ${SYNC_SCRIPT}`, { stdio: 'pipe' });
      const secondRun = fs.readFileSync(OUTPUT_FILE, 'utf8');

      // Output should be identical
      expect(firstRun).toBe(secondRun);
    },
    10000
  ); // Increased timeout to 10s to prevent flaky failures

  smokeTest('should handle prettier formatting gracefully', () => {
    // This test ensures the script doesn't crash if prettier has issues
    // It should warn but continue
    expect(() => {
      execSync(`node ${SYNC_SCRIPT}`, { stdio: 'pipe' });
    }).not.toThrow();

    // Generated file should exist even if prettier had issues
    expect(fs.existsSync(OUTPUT_FILE)).toBe(true);
  });
});
