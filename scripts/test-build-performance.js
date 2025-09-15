#!/usr/bin/env node

/**
 * Performance test for build command optimization
 * Compares standard vs optimized implementation
 */

import chalk from 'chalk';
import { BuildCommand } from '../dist/src/commands/build.js';
import { OptimizedBuildCommand } from '../dist/src/commands/build-optimized.js';
import { promises as fs } from 'fs';
import path from 'path';

async function setupTestEnvironment() {
  // Create test directories and files
  const testFeature = 'perf-test-' + Date.now();
  const featureDir = path.join('.hodge', 'features', testFeature);
  const exploreDir = path.join(featureDir, 'explore');

  await fs.mkdir(exploreDir, { recursive: true });
  await fs.writeFile(path.join(exploreDir, 'decision.md'), '# Decision made');
  await fs.writeFile(path.join(featureDir, 'issue-id.txt'), 'TEST-123');

  // Create standards and patterns if they don't exist
  await fs.mkdir('.hodge/patterns', { recursive: true });
  await fs.writeFile(
    '.hodge/standards.md',
    '# Project Standards\n\n- Use TypeScript\n- Follow ESLint rules'
  );
  await fs.writeFile(
    '.hodge/patterns/test-pattern.md',
    '# Test Pattern\n\nExample pattern for testing'
  );

  return testFeature;
}

async function measurePerformance(command, feature, runs = 5) {
  const times = [];

  for (let i = 0; i < runs; i++) {
    const start = Date.now();
    await command.execute(feature + '-' + i, { skipChecks: true });
    times.push(Date.now() - start);

    // Small delay between runs
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  return {
    avg: times.reduce((a, b) => a + b) / times.length,
    min: Math.min(...times),
    max: Math.max(...times),
    times,
  };
}

async function cleanupTestEnvironment(feature) {
  try {
    const featureDir = path.join('.hodge', 'features');
    const dirs = await fs.readdir(featureDir);

    // Clean up test directories
    for (const dir of dirs) {
      if (dir.startsWith('perf-test-')) {
        await fs.rm(path.join(featureDir, dir), { recursive: true, force: true });
      }
    }
  } catch (error) {
    // Ignore cleanup errors
  }
}

async function main() {
  console.log(chalk.bold('\n🚀 Build Command Performance Test\n'));
  console.log(chalk.gray('Setting up test environment...'));

  const testFeature = await setupTestEnvironment();

  try {
    // Test standard implementation
    console.log(chalk.yellow('\n📊 Testing Standard Build Command:'));
    const standardCommand = new BuildCommand();
    delete process.env.HODGE_USE_OPTIMIZED; // Ensure standard version is used
    const standardResults = await measurePerformance(standardCommand, testFeature + '-std');

    console.log(chalk.gray(`  Average: ${standardResults.avg.toFixed(2)}ms`));
    console.log(chalk.gray(`  Min: ${standardResults.min}ms, Max: ${standardResults.max}ms`));
    console.log(chalk.gray(`  All runs: ${standardResults.times.join(', ')}ms`));

    // Test optimized implementation
    console.log(chalk.cyan('\n📊 Testing Optimized Build Command:'));
    const optimizedCommand = new OptimizedBuildCommand();
    const optimizedResults = await measurePerformance(optimizedCommand, testFeature + '-opt');

    console.log(chalk.gray(`  Average: ${optimizedResults.avg.toFixed(2)}ms`));
    console.log(chalk.gray(`  Min: ${optimizedResults.min}ms, Max: ${optimizedResults.max}ms`));
    console.log(chalk.gray(`  All runs: ${optimizedResults.times.join(', ')}ms`));

    // Calculate improvement
    const improvement = (
      ((standardResults.avg - optimizedResults.avg) / standardResults.avg) *
      100
    ).toFixed(1);
    const cacheImprovement = (
      ((optimizedResults.times[0] - optimizedResults.times[4]) / optimizedResults.times[0]) *
      100
    ).toFixed(1);

    console.log(chalk.bold('\n📈 Performance Results:'));
    console.log(chalk.green(`  ✅ Overall improvement: ${improvement}%`));
    console.log(chalk.green(`  ✅ First run → Cached run: ${cacheImprovement}% faster`));
    console.log(
      chalk.green(
        `  ✅ Average time reduced: ${standardResults.avg.toFixed(0)}ms → ${optimizedResults.avg.toFixed(0)}ms`
      )
    );

    if (improvement > 50) {
      console.log(chalk.green.bold('\n🎉 Excellent! Achieved >50% performance improvement!'));
    } else if (improvement > 30) {
      console.log(chalk.green('\n✨ Good! Achieved significant performance improvement!'));
    } else {
      console.log(chalk.yellow('\n⚡ Moderate performance improvement achieved.'));
    }
  } finally {
    console.log(chalk.gray('\nCleaning up test environment...'));
    await cleanupTestEnvironment(testFeature);
  }
}

// Suppress console output during tests
const originalLog = console.log;
console.log = (...args) => {
  // Only show performance test output
  if (
    args[0]?.includes('📊') ||
    args[0]?.includes('🚀') ||
    args[0]?.includes('📈') ||
    args[0]?.includes('✅') ||
    args[0]?.includes('Average') ||
    args[0]?.includes('Min') ||
    args[0]?.includes('All runs') ||
    args[0]?.includes('Setting up') ||
    args[0]?.includes('Cleaning')
  ) {
    originalLog(...args);
  }
};

main().catch((error) => {
  console.error(chalk.red('Error running performance test:'), error);
  process.exit(1);
});
