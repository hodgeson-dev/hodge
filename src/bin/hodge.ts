#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../../package.json'), 'utf-8')
);

const program = new Command();

program
  .name('hodge')
  .description('AI development framework: Freedom to explore, discipline to build, confidence to ship')
  .version(packageJson.version);

program
  .command('init')
  .description('Initialize Hodge in your project')
  .option('-f, --force', 'Force initialization even if .hodge directory exists')
  .action(async (options) => {
    console.log(chalk.blue('🚀 Initializing Hodge...'));
    console.log('Options:', options);
    // TODO: Implement init command
    console.log(chalk.green('✅ Hodge initialized successfully!'));
  });

program
  .command('explore <feature>')
  .description('Start exploring a new feature with AI assistance')
  .action(async (feature) => {
    console.log(chalk.cyan(`🔍 Exploring: ${feature}`));
    // TODO: Implement explore command
  });

program
  .command('build <feature>')
  .description('Build a feature with recommended standards')
  .action(async (feature) => {
    console.log(chalk.yellow(`🔨 Building: ${feature}`));
    // TODO: Implement build command
  });

program
  .command('harden <feature>')
  .description('Harden a feature for production with enforced standards')
  .action(async (feature) => {
    console.log(chalk.red(`🛡️ Hardening: ${feature}`));
    // TODO: Implement harden command
  });

program
  .command('status [feature]')
  .description('Show status of features and current context')
  .action(async (feature) => {
    if (feature) {
      console.log(chalk.blue(`📊 Status for feature: ${feature}`));
    } else {
      console.log(chalk.blue('📊 Overall Hodge status'));
    }
    // TODO: Implement status command
  });

program.parse();