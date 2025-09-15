#!/usr/bin/env node
import { Command } from 'commander';
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
  .option('-f, --force', 'Force re-exploration even if one exists')
  .action(async (feature: string, options: { force?: boolean }) => {
    const { ExploreCommand } = await import('../commands/explore');
    const exploreCommand = new ExploreCommand();
    await exploreCommand.execute(feature, options);
  });

program
  .command('build <feature>')
  .description('Build a feature with recommended standards')
  .option('--skip-checks', 'Skip exploration and decision checks')
  .action(async (feature: string, options: { skipChecks?: boolean }) => {
    const { BuildCommand } = await import('../commands/build');
    const buildCommand = new BuildCommand();
    await buildCommand.execute(feature, options);
  });

program
  .command('harden <feature>')
  .description('Harden a feature for production with enforced standards')
  .option('--skip-tests', 'Skip test execution')
  .option('--auto-fix', 'Attempt to auto-fix linting issues')
  .action(async (feature: string, options: { skipTests?: boolean; autoFix?: boolean }) => {
    const { HardenCommand } = await import('../commands/harden');
    const hardenCommand = new HardenCommand();
    await hardenCommand.execute(feature, options);
  });

program
  .command('status [feature]')
  .description('Show status of features and current context')
  .action(async (feature?: string) => {
    const { StatusCommand } = await import('../commands/status');
    const statusCommand = new StatusCommand();
    await statusCommand.execute(feature);
  });

program
  .command('decide <decision>')
  .description('Record a project decision')
  .option('-f, --feature <feature>', 'Associate decision with a specific feature')
  .action(async (decision: string, options: { feature?: string }) => {
    const { DecideCommand } = await import('../commands/decide');
    const decideCommand = new DecideCommand();
    await decideCommand.execute(decision, options);
  });

program
  .command('ship <feature>')
  .description('Ship a feature to production')
  .option('--skip-tests', 'Skip test execution (not recommended)')
  .option('-m, --message <message>', 'Custom commit message')
  .option('--no-commit', 'Skip automatic git commit')
  .option('--no-interactive', 'Disable interactive prompts')
  .option('-y, --yes', 'Accept all defaults')
  .option('--dry-run', 'Preview without making changes')
  .option('--push', 'Push to remote after shipping')
  .option('--no-push', 'Do not push to remote')
  .option('--push-branch <branch>', 'Push to specific branch')
  .option('--force-push', 'Force push (use with caution)')
  .option('--continue-push', 'Continue push from saved review')
  .action(
    async (
      feature: string,
      options: {
        skipTests?: boolean;
        message?: string;
        noCommit?: boolean;
        noInteractive?: boolean;
        yes?: boolean;
        dryRun?: boolean;
        push?: boolean;
        noPush?: boolean;
        pushBranch?: string;
        forcePush?: boolean;
        continuePush?: boolean;
      }
    ) => {
      const { ShipCommand } = await import('../commands/ship');
      const shipCommand = new ShipCommand();
      await shipCommand.execute(feature, options);
    }
  );

program
  .command('todos')
  .description('List all TODO comments in the codebase')
  .option('-p, --pattern <pattern>', 'Glob pattern for files to search')
  .option('--json', 'Output as JSON')
  .action(async (options: { pattern?: string; json?: boolean }) => {
    const { TodosCommand } = await import('../commands/todos');
    const todosCommand = new TodosCommand();
    todosCommand.execute(options);
  });

program.parse();
