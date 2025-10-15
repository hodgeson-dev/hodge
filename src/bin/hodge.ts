#!/usr/bin/env node
import { Command } from 'commander';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
  .description('Claude Code companion tool for AI-driven development')
  .version(packageJson.version)
  .option('--show-internal', 'Show internal commands used by Claude Code')
  .helpOption('-h, --help', 'Display help for command');

program
  .command('init')
  .description('Initialize Hodge in your project')
  .option('-f, --force', 'Force initialization even if .hodge directory exists')
  .option('-i, --interactive', 'Interactive setup with PM tool selection and pattern learning')
  .option('-y, --yes', 'Accept all defaults without prompts')
  .action(async (options: { force?: boolean; interactive?: boolean; yes?: boolean }) => {
    const { InitCommand } = await import('../commands/init.js');
    const initCommand = new InitCommand();
    await initCommand.execute(options);
  });

const exploreCmd = program
  .command('explore <feature>')
  .description('[Internal] Start exploring a new feature')
  .option('-f, --force', 'Force re-exploration even if one exists')
  .option('--from-spec <path>', 'Create feature from YAML specification file')
  .option('--pre-populate', 'Pre-populate feature from decisions (legacy)')
  .option('--decisions <decisions...>', 'Link specific decisions to the feature (legacy)')
  .action(
    async (
      feature: string,
      options: { force?: boolean; fromSpec?: string; prePopulate?: boolean; decisions?: string[] }
    ) => {
      const { ExploreCommand } = await import('../commands/explore.js');
      const exploreCommand = new ExploreCommand();
      await exploreCommand.execute(feature, options);
    }
  );

const buildCmd = program
  .command('build [feature]')
  .description('[Internal] Build a feature (uses current context if not specified)')
  .option('--skip-checks', 'Skip exploration and decision checks')
  .action(async (feature: string | undefined, options: { skipChecks?: boolean }) => {
    const { BuildCommand } = await import('../commands/build.js');
    const buildCommand = new BuildCommand();
    await buildCommand.execute(feature, options);
  });

const hardenCmd = program
  .command('harden [feature]')
  .description('[Internal] Harden a feature for production (uses current context if not specified)')
  .option('--skip-tests', 'Skip test execution')
  .option('--auto-fix', 'Attempt to auto-fix linting issues')
  .option('--fix', 'Run auto-fix on staged files (HODGE-341.6)')
  .option('--review', 'Return review context for AI code review (does not run validations)')
  .action(
    async (
      feature: string | undefined,
      options: { skipTests?: boolean; autoFix?: boolean; fix?: boolean; review?: boolean }
    ) => {
      const { HardenCommand } = await import('../commands/harden.js');
      const hardenCommand = new HardenCommand();
      await hardenCommand.execute(feature, options);
    }
  );

program
  .command('review')
  .description('[Internal] AI-orchestrated code review with flexible file scoping (HODGE-344.4)')
  .option('--file <path>', 'Review single file')
  .option('--directory <path>', 'Review all git-tracked files in directory (recursive)')
  .option('--last <count>', 'Review files from last N commits', parseInt)
  .option('--fix', 'Run auto-fix on scoped files (formatters and linters)')
  .action(async (options: { file?: string; directory?: string; last?: number; fix?: boolean }) => {
    const { ReviewCommand } = await import('../commands/review.js');
    const reviewCommand = new ReviewCommand();
    await reviewCommand.execute(options);
  });

const statusCmd = program
  .command('status [feature]')
  .description('[Internal] Show status of features')
  .action(async (feature?: string) => {
    const { StatusCommand } = await import('../commands/status.js');
    const statusCommand = new StatusCommand();
    await statusCommand.execute(feature);
  });

const contextCmd = program
  .command('context')
  .description('[Internal] Load project context and manage sessions')
  .option('--list', 'List all saved sessions')
  .option('--recent', 'Load most recent saved session')
  .option('--feature <feature>', 'Load context for specific feature')
  .action(async (options: { list?: boolean; recent?: boolean; feature?: string }) => {
    const { ContextCommand } = await import('../commands/context.js');
    const contextCommand = new ContextCommand();
    await contextCommand.execute(options);
  });

const decideCmd = program
  .command('decide <decision>')
  .description('[Internal] Record a project decision')
  .option('-f, --feature <feature>', 'Associate decision with a specific feature')
  .action(async (decision: string, options: { feature?: string }) => {
    const { DecideCommand } = await import('../commands/decide.js');
    const decideCommand = new DecideCommand();
    await decideCommand.execute(decision, options);
  });

program
  .command('plan [feature]')
  .description('[Internal] Plan work structure and create PM issues')
  .option('--lanes <number>', 'Number of development lanes', parseInt)
  .option('--create-pm', 'Create PM issues in Linear after saving plan')
  .action(async (feature: string | undefined, options: { lanes?: number; createPm?: boolean }) => {
    const { PlanCommand } = await import('../commands/plan.js');
    const planCommand = new PlanCommand();
    await planCommand.execute({ feature, ...options });
  });

const shipCmd = program
  .command('ship [feature]')
  .description('[Internal] Ship a feature (uses current context if not specified)')
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
      feature: string | undefined,
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
      const { ShipCommand } = await import('../commands/ship.js');
      const shipCommand = new ShipCommand();
      await shipCommand.execute(feature, options);
    }
  );

const todosCmd = program
  .command('todos')
  .description('[Internal] List TODO comments')
  .option('-p, --pattern <pattern>', 'Glob pattern for files to search')
  .option('--json', 'Output as JSON')
  .action(async (options: { pattern?: string; json?: boolean }) => {
    const { TodosCommand } = await import('../commands/todos.js');
    const todosCommand = new TodosCommand();
    todosCommand.execute(options);
  });

const linkCmd = program
  .command('link <localID> <externalID>')
  .description('[Internal] Link feature IDs')
  .action(async (localID: string, externalID: string) => {
    const { LinkCommand } = await import('../commands/link.js');
    const linkCommand = new LinkCommand();
    await linkCommand.execute(localID, externalID);
  });

// Public command for viewing logs - always visible
program
  .command('logs')
  .description('View and manage Hodge logs')
  .option('-l, --level <level>', 'Filter by log level (info, warn, error, debug)')
  .option('-c, --command <command>', 'Filter by command name')
  .option('-t, --tail <number>', 'Show only last n lines')
  .option('-f, --follow', 'Follow log output (like tail -f)')
  .option('--clear', 'Clear all log files')
  .option('--no-pretty', 'Disable pretty printing, show raw JSON')
  .action(
    async (options: {
      level?: string;
      command?: string;
      tail?: string;
      follow?: boolean;
      clear?: boolean;
      pretty?: boolean;
    }) => {
      const { LogsCommand } = await import('../commands/logs.js');
      const logsCommand = new LogsCommand();
      await logsCommand.execute({
        ...options,
        tail: options.tail ? parseInt(options.tail) : undefined,
      });
    }
  );

// Check if --show-internal is in the args BEFORE we parse
const showInternal = process.argv.includes('--show-internal');

// Hide internal commands unless --show-internal is used
if (!showInternal) {
  const internalCommands = [
    exploreCmd,
    buildCmd,
    hardenCmd,
    statusCmd,
    contextCmd,
    decideCmd,
    shipCmd,
    todosCmd,
    linkCmd,
  ];

  internalCommands.forEach((cmd) => {
    // TypeScript doesn't know about hidden property, use type assertion
    (cmd as unknown as { _hidden: boolean })._hidden = true;
  });
}

// Add custom help text
program.on('--help', () => {
  if (!showInternal) {
    console.log('');
    console.log('This tool is designed to work with Claude Code.');
    console.log('Run "hodge init" to set up your project, then use Claude Code slash commands.');
    console.log('');
    console.log('For internal commands (used by Claude), run: hodge --show-internal --help');
  }
});

program.parse();
