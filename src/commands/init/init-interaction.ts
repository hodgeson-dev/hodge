/**
 * User Interaction for Init Command
 * Handles prompts, confirmations, and display logic
 */

import path from 'path';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import { ProjectInfo, ValidationError } from '../../lib/detection.js';
import { createCommandLogger } from '../../lib/logger.js';
import { installClaudeSlashCommands } from '../init-claude-commands.js';
import { InitOptions } from '../init.js';
import { InitPMConfig, VALID_PM_TOOLS } from './init-pm-config.js';

/**
 * Extended project info interface with optional pattern learning preference
 */
export interface ExtendedProjectInfo extends ProjectInfo {
  shouldLearnPatterns?: boolean;
  interactive?: boolean;
}

/**
 * Handles user interaction and prompts for init command
 */
export class InitInteraction {
  private logger = createCommandLogger('init-interaction', { enableConsole: true });
  private pmConfig: InitPMConfig;

  constructor(private rootPath: string = process.cwd()) {
    this.pmConfig = new InitPMConfig();
  }

  /**
   * Displays the detected project configuration
   */
  displayDetectedConfig(projectInfo: ProjectInfo): void {
    this.logger.info(chalk.blue('\n📋 Detected Configuration:'));
    this.logger.info(`   Name: ${chalk.white(projectInfo.name)}`);
    this.logger.info(`   Type: ${chalk.white(projectInfo.type)}`);
    this.logger.info(`   PM Tool: ${chalk.white(projectInfo.pmTool || 'None detected')}`);

    const tools = projectInfo.detectedTools;
    if (tools.packageManager) {
      this.logger.info(`   Package Manager: ${chalk.white(tools.packageManager)}`);
    }

    if (tools.testFramework.length > 0) {
      this.logger.info(`   Test Frameworks: ${chalk.white(tools.testFramework.join(', '))}`);
    }

    if (tools.linting.length > 0) {
      this.logger.info(`   Linting: ${chalk.white(tools.linting.join(', '))}`);
    }

    if (tools.buildTools.length > 0) {
      this.logger.info(`   Build Tools: ${chalk.white(tools.buildTools.join(', '))}`);
    }

    if (tools.hasGit) {
      const gitRemoteInfo = tools.gitRemote ? ` (${this.formatGitRemote(tools.gitRemote)})` : '';
      this.logger.info(`   Git: ${chalk.white('Yes')}${gitRemoteInfo}`);
    }

    this.logger.info(''); // Empty line for spacing
  }

  /**
   * Handles the smart question flow based on project context and options
   */
  async smartQuestionFlow(projectInfo: ProjectInfo, options: InitOptions): Promise<boolean> {
    try {
      if (!this.checkExistingConfig(projectInfo)) {
        return false;
      }

      if (options.yes) {
        this.logger.info(chalk.gray('Using all defaults (--yes flag)'));
        return true;
      }

      const isInteractiveMode = options.interactive === true;
      if (!isInteractiveMode) {
        return await this.runQuickModeFlow(projectInfo);
      }

      return await this.runInteractiveModeFlow(projectInfo);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Smart question flow failed: ${errorMessage}`, { error: error as Error });
      throw new ValidationError(
        `Failed to complete question flow: ${errorMessage}`,
        'questionFlow'
      );
    }
  }

  /**
   * Prompts user to select a PM tool when none is detected
   */
  async promptForPMTool(projectInfo: ProjectInfo): Promise<void> {
    try {
      this.logger.debug('Starting PM tool selection prompt');
      this.logger.info(chalk.blue('\n🔧 Project Management Tool Setup'));

      this.showDetectedPMTool(projectInfo);

      const pmChoice = await this.selectPMTool(projectInfo);

      if (pmChoice) {
        await this.configurePMTool(projectInfo, pmChoice);
      } else {
        this.handleSkippedPMSetup();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`PM tool selection failed: ${errorMessage}`, { error: error as Error });
      throw new ValidationError(`Failed to select PM tool: ${errorMessage}`, 'pmTool');
    }
  }

  /**
   * Displays the completion message with next steps
   */
  displayCompletionMessage(projectInfo: ExtendedProjectInfo): void {
    this.logger.info(chalk.green('\n🎉 Hodge initialized successfully!'));
    this.logger.info(chalk.blue('\n📁 Created structure:'));
    this.logger.info(`   ${chalk.dim('.hodge/')}`);
    this.logger.info(
      `   ${chalk.dim('├── config.json')}     ${chalk.gray('# Project configuration')}`
    );
    this.logger.info(
      `   ${chalk.dim('├── standards.md')}    ${chalk.gray('# Development standards')}`
    );
    this.logger.info(
      `   ${chalk.dim('├── decisions.md')}    ${chalk.gray('# Architecture decisions')}`
    );
    this.logger.info(
      `   ${chalk.dim('├── patterns/')}       ${chalk.gray('# Extracted patterns')}`
    );
    this.logger.info(
      `   ${chalk.dim('└── features/')}       ${chalk.gray('# Feature development')}`
    );

    // Add Claude Code detection message
    if (projectInfo.detectedTools.hasClaudeCode) {
      this.logger.info(chalk.yellow('\n📝 Claude Code detected!'));
      this.logger.info(
        `   ${chalk.gray('CLAUDE.md found. Hodge context files in .hodge/ are available to Claude.')}`
      );
      this.logger.info(
        `   ${chalk.gray('Consider adding a reference to .hodge/ in your CLAUDE.md if desired.')}`
      );
    } else {
      this.logger.info(
        chalk.gray('\n💡 Tip: Run `claude project init` to set up Claude Code for this project')
      );
    }

    // Add PM-specific suggestions
    if (projectInfo.pmTool) {
      this.logger.info(chalk.blue(`\n🔧 PM Integration (${projectInfo.pmTool}):`));
      this.logger.info(`   ${chalk.green('✓')} Automatic status updates on workflow progression`);
      this.logger.info(`   ${chalk.green('✓')} Local tracking in .hodge/project_management.md`);
      this.logger.info(`   ${chalk.dim('Configure in hodge.json for custom workflow mappings')}`);
    } else {
      this.logger.info(chalk.blue('\n🔧 PM Integration:'));
      this.logger.info(
        `   ${chalk.gray('No PM tool configured - set up environment variables and run init again')}`
      );
      this.logger.info(`   ${chalk.gray('Supported: Linear, GitHub Issues (coming soon)')}`);
    }

    // Add pattern learning status if it was executed
    const shouldLearnPatterns = projectInfo.shouldLearnPatterns;
    if (shouldLearnPatterns) {
      this.logger.info(chalk.blue('\n📚 Pattern Learning:'));
      this.logger.info(
        `   ${chalk.green('✓')} Patterns analyzed and saved to ${chalk.white('.hodge/patterns/')}`
      );
      this.logger.info(
        `   ${chalk.gray('   Review learned-patterns.md for insights about your codebase')}`
      );
    }

    // Tip for interactive mode
    if (!projectInfo.interactive) {
      this.logger.info(
        chalk.gray(
          '\n💡 Tip: Use --interactive for full setup with PM tool selection and pattern learning'
        )
      );
    }

    // Next steps - always shown last
    this.logger.info(chalk.blue('\n🚀 Next steps:'));
    this.logger.info(
      `   ${chalk.white('hodge explore <feature>')}  ${chalk.gray('# Start exploring a new feature')}`
    );
    this.logger.info(
      `   ${chalk.white('hodge status')}              ${chalk.gray('# Check current status')}`
    );

    this.logger.info(''); // Empty line for spacing
  }

  /**
   * Checks for AI dev tools and offers to install integrations
   */
  async checkAndOfferAIIntegrations(projectInfo: ProjectInfo, hodgePath: string): Promise<void> {
    // Only proceed if Claude Code is detected
    if (!projectInfo.detectedTools.hasClaudeCode) {
      return;
    }

    // Check if integration is already installed
    const integrationPath = path.join(hodgePath, 'integrations', 'claude');
    const hasIntegration = await fs.pathExists(integrationPath);

    if (hasIntegration) {
      this.logger.debug('Claude integration already installed');
      return;
    }

    // Ask user if they want to install the integration
    this.logger.info(chalk.yellow('\n🤖 AI Tool Integration Available:'));
    this.logger.info(
      `   ${chalk.gray('Claude Code detected. Hodge can install enhanced integration.')}`
    );

    const { shouldInstall } = await inquirer.prompt<{ shouldInstall: boolean }>([
      {
        type: 'confirm',
        name: 'shouldInstall',
        message: 'Install Hodge integration for Claude Code?',
        default: true,
      },
    ]);

    if (!shouldInstall) {
      this.logger.info(
        chalk.gray('   Skipped integration (install later with: hodge integrations add claude)')
      );
      return;
    }

    // Install the integration
    const spinner = ora('Installing Claude integration...').start();

    try {
      await this.installClaudeIntegration(hodgePath, projectInfo.rootPath);
      spinner.succeed('Claude integration installed successfully');
      this.logger.info(
        chalk.gray(`   ✓ Documentation: ${chalk.white('.hodge/integrations/claude/README.md')}`)
      );
      this.logger.info(
        chalk.gray(`   ✓ Slash commands: ${chalk.white('.claude/commands/*.md')} (9 commands)`)
      );
      this.logger.info(
        chalk.gray(`   Try: ${chalk.white('/explore <feature>')} in Claude Code to start`)
      );
    } catch (error) {
      spinner.fail('Failed to install Claude integration');
      this.logger.error('Claude integration installation failed', { error: error as Error });
      this.logger.error(
        chalk.gray('   You can try again later with: hodge integrations add claude')
      );
    }
  }

  // Private helper methods

  private checkExistingConfig(projectInfo: ProjectInfo): boolean {
    if (projectInfo.hasExistingConfig) {
      this.logger.error(chalk.red('⚠️  Hodge is already initialized in this directory.'));
      this.logger.error(chalk.gray('   To re-initialize:'));
      this.logger.error(chalk.gray('   1. Manually remove the .hodge/ directory'));
      this.logger.error(chalk.gray('   2. Run hodge init again'));
      this.logger.error(
        chalk.gray('   (Future: Use hodge init --update to preserve customizations)')
      );
      return false;
    }
    return true;
  }

  private async runQuickModeFlow(projectInfo: ProjectInfo): Promise<boolean> {
    if (!projectInfo.name) {
      await this.promptForProjectName(projectInfo);
    }

    await this.promptForPMTool(projectInfo);
    await this.promptForPatternLearningIfNeeded(projectInfo);

    this.logger.info(chalk.gray('Initialization with selected configuration'));
    return true;
  }

  private async runInteractiveModeFlow(projectInfo: ProjectInfo): Promise<boolean> {
    this.logger.info(
      chalk.cyan('Interactive mode: Full setup with PM tool selection and pattern learning')
    );
    (projectInfo as ExtendedProjectInfo).interactive = true;

    const isEmpty = await this.isDirectoryEmpty();

    if (projectInfo.hasExistingConfig && !(await this.confirmOverwrite())) {
      return false;
    }

    if (isEmpty || projectInfo.name === path.basename(this.rootPath)) {
      await this.promptForProjectNameInteractive(projectInfo);
    }

    if (!projectInfo.pmTool) {
      this.logger.debug('PM tool not detected, prompting user');
      await this.promptForPMTool(projectInfo);
    }

    if (!isEmpty && (projectInfo.type !== 'unknown' || projectInfo.detectedTools.hasGit)) {
      this.logger.debug('Existing codebase detected, prompting for pattern learning');
      await this.promptForPatternLearning(projectInfo as ExtendedProjectInfo);
    }

    return await this.confirmProceed(projectInfo);
  }

  private async promptForProjectName(projectInfo: ProjectInfo): Promise<void> {
    const { projectName } = await inquirer.prompt<{ projectName: string }>([
      {
        type: 'input',
        name: 'projectName',
        message: 'Project name:',
        default: path.basename(this.rootPath),
        validate: (input: string) => this.validateProjectName(input),
      },
    ]);
    (projectInfo as ExtendedProjectInfo).name = projectName;
  }

  private async promptForProjectNameInteractive(projectInfo: ProjectInfo): Promise<void> {
    const { projectName } = await inquirer.prompt<{ projectName: string }>([
      {
        type: 'input',
        name: 'projectName',
        message: 'Project name?',
        default: projectInfo.name,
        validate: (input: string) => this.validateProjectName(input),
      },
    ]);
    projectInfo.name = projectName.trim();
  }

  private async promptForPatternLearningIfNeeded(projectInfo: ProjectInfo): Promise<void> {
    const hasExistingCode = projectInfo.type !== 'unknown' || projectInfo.detectedTools.hasGit;
    if (hasExistingCode) {
      const { shouldLearn } = await inquirer.prompt<{ shouldLearn: boolean }>([
        {
          type: 'confirm',
          name: 'shouldLearn',
          message: 'Analyze and learn patterns from your existing codebase?',
          default: true,
        },
      ]);
      (projectInfo as ExtendedProjectInfo).shouldLearnPatterns = shouldLearn;
    }
  }

  private async promptForPatternLearning(projectInfo: ExtendedProjectInfo): Promise<void> {
    try {
      this.logger.debug('Starting pattern learning prompt');
      this.logger.info(chalk.blue('\n📚 Pattern Learning'));
      this.logger.info(
        chalk.gray('This appears to be an existing codebase with development history.')
      );

      const { shouldLearnPatterns } = await inquirer.prompt<{ shouldLearnPatterns: boolean }>([
        {
          type: 'confirm',
          name: 'shouldLearnPatterns',
          message:
            'Would you like Hodge to analyze your codebase and learn patterns after initialization?',
          default: true,
        },
      ]);

      if (shouldLearnPatterns) {
        this.logger.info(chalk.green('✓ Pattern learning will execute after initialization'));
        projectInfo.shouldLearnPatterns = true;
      } else {
        this.logger.debug('User skipped pattern learning');
        this.logger.info(
          chalk.gray('Pattern learning skipped - you can run "hodge learn" anytime')
        );
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Pattern learning prompt failed: ${errorMessage}`, {
        error: error as Error,
      });
      this.logger.info(
        chalk.yellow('⚠️  Pattern learning prompt failed - you can run "hodge learn" later')
      );
    }
  }

  private async confirmOverwrite(): Promise<boolean> {
    const { shouldOverwrite } = await inquirer.prompt<{ shouldOverwrite: boolean }>([
      {
        type: 'confirm',
        name: 'shouldOverwrite',
        message: 'Hodge is already initialized. Overwrite existing configuration?',
        default: false,
      },
    ]);
    return shouldOverwrite;
  }

  private async confirmProceed(projectInfo: ProjectInfo): Promise<boolean> {
    const { shouldProceed } = await inquirer.prompt<{ shouldProceed: boolean }>([
      {
        type: 'confirm',
        name: 'shouldProceed',
        message: projectInfo.hasExistingConfig
          ? 'Overwrite existing Hodge configuration with these settings?'
          : 'Initialize Hodge with the above configuration?',
        default: true,
      },
    ]);
    return shouldProceed;
  }

  private async isDirectoryEmpty(): Promise<boolean> {
    try {
      const files = await fs.readdir(this.rootPath);
      // Consider hidden files except .git
      const meaningfulFiles = files.filter((file) => !file.startsWith('.') || file === '.git');
      const isEmpty = meaningfulFiles.length === 0;
      this.logger.debug(`Directory empty check: ${isEmpty}`, { files: meaningfulFiles });
      return isEmpty;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Cannot read directory for empty check: ${errorMessage}`);
      // If it's a permissions error, throw it; otherwise assume empty
      if (error instanceof Error && error.message.includes('EACCES')) {
        throw new ValidationError(`Cannot read directory: ${errorMessage}`, 'directory');
      }
      return true; // If we can't read the directory for other reasons, assume it's empty
    }
  }

  private showDetectedPMTool(projectInfo: ProjectInfo): void {
    if (projectInfo.pmTool) {
      const source = projectInfo.pmTool === 'github' ? 'git remote' : 'environment';
      this.logger.info(chalk.gray(`Detected: ${projectInfo.pmTool} (from ${source})`));
    }
  }

  private async selectPMTool(projectInfo: ProjectInfo): Promise<string | null> {
    const { pmChoice } = await inquirer.prompt<{ pmChoice: string }>([
      {
        type: 'list',
        name: 'pmChoice',
        message: 'Which project management tool would you like to use?',
        choices: [
          { name: '📋 Linear (requires LINEAR_API_KEY)', value: 'linear' },
          { name: '🐙 GitHub Issues (requires GITHUB_TOKEN)', value: 'github' },
          { name: '🎯 Jira (requires JIRA_API_TOKEN)', value: 'jira' },
          { name: '📌 Trello (requires TRELLO_API_KEY)', value: 'trello' },
          { name: '📝 Asana (requires ASANA_TOKEN)', value: 'asana' },
          { name: '🔧 Custom integration', value: 'custom' },
          { name: '⏭️  Skip - set up later', value: null },
        ],
        default: projectInfo.pmTool || null,
      },
    ]);
    return pmChoice;
  }

  private async configurePMTool(projectInfo: ProjectInfo, pmChoice: string): Promise<void> {
    if (!this.pmConfig.isValidPMTool(pmChoice)) {
      throw new ValidationError(
        `Invalid PM tool selection: ${pmChoice}. Must be one of: ${VALID_PM_TOOLS.join(', ')}`,
        'pmTool'
      );
    }

    projectInfo.pmTool = pmChoice;
    this.logger.debug(`PM tool selected: ${pmChoice}`);
    this.logger.info(chalk.gray(`Selected: ${pmChoice}`));

    await this.pmConfig.checkAndConfigureEnvironment(pmChoice);
  }

  private handleSkippedPMSetup(): void {
    this.logger.debug('User skipped PM tool setup');
    this.logger.info(chalk.gray('Skipped PM tool setup - you can configure this later'));
  }

  private validateProjectName(name: string): string | true {
    // Handle empty string or whitespace-only
    if (!name.trim()) {
      return 'Project name is required';
    }

    // Ensure it's a string (already guaranteed by type system)
    if (typeof name !== 'string') {
      return 'Project name must be a string';
    }

    const trimmed = name.trim();
    if (!trimmed) {
      return 'Project name is required';
    }

    if (trimmed.length < 2) {
      return 'Project name must be at least 2 characters long';
    }

    if (trimmed.length > 50) {
      return 'Project name must be 50 characters or less';
    }

    if (!/^[a-zA-Z0-9-_]+$/.test(trimmed)) {
      return 'Project name can only contain letters, numbers, hyphens, and underscores';
    }

    // Prevent reserved names
    const reservedNames = ['hodge', 'node_modules', 'dist', 'build', '.git', '.hodge'];
    if (reservedNames.includes(trimmed.toLowerCase())) {
      return `Project name "${trimmed}" is reserved and cannot be used`;
    }

    return true;
  }

  private formatGitRemote(remote: string): string {
    // Extract repo name from git remote URL
    // Use atomic groups to prevent backtracking (ReDoS prevention)
    const match = /[:/]([a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+)(?:\.git)?$/.exec(remote);
    return match ? match[1] : remote;
  }

  private async installClaudeIntegration(hodgePath: string, rootPath: string): Promise<void> {
    const integrationPath = path.join(hodgePath, 'integrations', 'claude');
    await fs.ensureDir(integrationPath);

    // Create main integration README
    const readmeContent = `# Hodge Integration for Claude Code

This integration enhances Claude's understanding of your Hodge workflow.

## Available Context

Claude can now access and understand:
- \`.hodge/standards.md\` - Your project's coding standards
- \`.hodge/decisions.md\` - Architectural decisions history
- \`.hodge/features/\` - Feature exploration and implementation
- \`.hodge/patterns/\` - Extracted code patterns

## Suggested Workflow

1. **Explore**: Start with \`hodge explore <feature>\`
2. **Ask Claude**: "Help me implement [feature] following Hodge standards"
3. **Build**: Use \`hodge build\` to structure implementation
4. **Ship**: Complete with \`hodge ship\` for git integration

## Claude Instructions

When working on this project, Claude should:
- Reference standards in \`.hodge/standards.md\`
- Check decisions in \`.hodge/decisions.md\` before proposing changes
- Use patterns from \`.hodge/patterns/\` when applicable
- Follow the explore → build → ship workflow

## Hodge Commands

You can ask Claude to help with:
- \`hodge explore <feature>\` - Explore new features
- \`hodge build\` - Build with standards enforcement
- \`hodge ship\` - Ship with git integration
- \`hodge decide\` - Record architectural decisions
- \`hodge harden\` - Run quality checks
- \`hodge status\` - Check project status

## Tips for Better AI Assistance

1. **Be specific about Hodge context**: "Check Hodge standards before implementing"
2. **Reference decisions**: "Is this aligned with our Hodge decisions?"
3. **Use patterns**: "Apply relevant Hodge patterns to this code"
4. **Follow workflow**: Start with explore, then build, finally ship

## Pattern Library

As you ship features, Hodge learns patterns and saves them to \`.hodge/patterns/\`.
Ask Claude to "use Hodge patterns" to apply these learned patterns.
`;

    await fs.writeFile(path.join(integrationPath, 'README.md'), readmeContent, 'utf8');

    // Create workflow guide
    const workflowContent = `# Hodge Workflow with Claude Code

## The Three Modes

### 1. Explore Mode
- Freedom to experiment
- Standards suggested but not enforced
- Multiple approaches encouraged

**With Claude**: "Let's explore different ways to implement [feature]"

### 2. Build Mode
- Standards enforced
- Patterns applied
- Production-ready code

**With Claude**: "Help me build [feature] following Hodge standards"

### 3. Ship Mode
- Git integration
- Pattern extraction
- Decision recording

**With Claude**: "Let's ship this feature with proper git commit"

## Example Claude Prompts

### For Exploration
"I want to explore implementing user authentication. Check .hodge/features/ for similar work."

### For Building
"Build the authentication feature following .hodge/standards.md and using patterns from .hodge/patterns/"

### For Shipping
"Help me create a good commit message for this authentication feature"

## Best Practices

1. Always start with \`hodge explore\` for new features
2. Ask Claude to check standards before building
3. Use \`hodge decide\` for important architectural choices
4. Run \`hodge harden\` before shipping
5. Use \`hodge ship\` for consistent git workflow
`;

    await fs.writeFile(path.join(integrationPath, 'workflow.md'), workflowContent, 'utf8');

    // Install Claude slash commands
    await installClaudeSlashCommands(rootPath);

    // Optionally append to CLAUDE.md if it exists
    const claudeMdPath = path.join(rootPath, 'CLAUDE.md');
    if (await fs.pathExists(claudeMdPath)) {
      const existingContent = await fs.readFile(claudeMdPath, 'utf8');

      // Only add if not already referenced
      if (!existingContent.includes('Hodge') && !existingContent.includes('.hodge')) {
        const appendContent = `

## Hodge Framework Integration

This project uses Hodge for development workflow management. Key resources:
- Standards: \`.hodge/standards.md\`
- Decisions: \`.hodge/decisions.md\`
- Integration guide: \`.hodge/integrations/claude/README.md\`

When assisting with code, please follow Hodge standards and check architectural decisions.
`;
        await fs.appendFile(claudeMdPath, appendContent, 'utf8');
        this.logger.debug('Updated CLAUDE.md with Hodge reference');
      }
    }
  }
}
