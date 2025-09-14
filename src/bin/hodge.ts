#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { readFileSync } from 'fs';
import { join } from 'path';

interface PackageJson {
  version: string;
  name: string;
  description: string;
}

const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../../package.json'), 'utf-8')
) as PackageJson;

const program = new Command();

program
  .name('hodge')
  .description(
    'AI development framework: Freedom to explore, discipline to build, confidence to ship'
  )
  .version(packageJson.version);

program
  .command('init')
  .description('Initialize Hodge in your project')
  .option('-f, --force', 'Force initialization even if .hodge directory exists')
  .option('-i, --interactive', 'Interactive setup with PM tool selection and pattern learning')
  .option('-y, --yes', 'Accept all defaults without prompts')
  .action(async (options: { force?: boolean; interactive?: boolean; yes?: boolean }) => {
    const { InitCommand } = await import('../commands/init');
    const initCommand = new InitCommand();
    await initCommand.execute(options);
  });

program
  .command('explore <feature>')
  .description('Start exploring a new feature with AI assistance')
  .action((feature) => {
    // TODO: Implement explore command
    process.stdout.write(chalk.cyan(`🔍 Exploring: ${feature}\n`));
  });

program
  .command('build <feature>')
  .description('Build a feature with recommended standards')
  .action((feature) => {
    // TODO: Implement build command
    process.stdout.write(chalk.yellow(`🔨 Building: ${feature}\n`));
  });

program
  .command('harden <feature>')
  .description('Harden a feature for production with enforced standards')
  .action((feature) => {
    // TODO: Implement harden command
    process.stdout.write(chalk.red(`🛡️ Hardening: ${feature}\n`));
  });

program
  .command('status [feature]')
  .description('Show status of features and current context')
  .action((feature) => {
    // TODO: Implement status command
    if (feature) {
      process.stdout.write(chalk.blue(`📊 Status for feature: ${feature}\n`));
    } else {
      process.stdout.write(chalk.blue('📊 Overall Hodge status\n'));
    }
  });

program.parse();
