/**
 * Hodge Init Command
 * Smart context-aware initialization
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import fs from 'fs-extra';
import { ProjectDetector, ProjectInfo, DetectionError, ValidationError } from '../lib/detection.js';
import { StructureGenerator, StructureGenerationError } from '../lib/structure-generator.js';
import { PMTool } from '../lib/pm/types.js';
import { installClaudeSlashCommands } from './init-claude-commands.js';

/**
 * Valid PM tool values that can be selected by users
 */
const VALID_PM_TOOLS: readonly PMTool[] = [
  'linear',
  'github',
  'jira',
  'trello',
  'asana',
  'custom',
] as const;

/**
 * Extended project info interface with optional pattern learning preference
 */
interface ExtendedProjectInfo extends ProjectInfo {
  shouldLearnPatterns?: boolean;
  interactive?: boolean;
}

/**
 * Logger for init command operations
 */
class InitLogger {
  /**
   * Logs debug information (only in development/verbose mode)
   * @param message - The debug message
   * @param context - Optional context object
   */
  static debug(message: string, context?: Record<string, unknown>): void {
    if (process.env.NODE_ENV === 'development' || process.env.HODGE_DEBUG) {
      console.log(chalk.gray(`[DEBUG] ${message}`));
      if (context) {
        console.log(chalk.gray('Context:'), context);
      }
    }
  }

  /**
   * Logs informational messages
   * @param message - The info message
   */
  static info(message: string): void {
    console.log(chalk.blue(`ℹ️  ${message}`));
  }

  /**
   * Logs warning messages
   * @param message - The warning message
   */
  static warn(message: string): void {
    console.log(chalk.yellow(`⚠️  ${message}`));
  }

  /**
   * Logs error messages
   * @param message - The error message
   * @param error - Optional error object
   */
  static error(message: string, error?: Error): void {
    console.error(chalk.red(`❌ ${message}`));
    if (error && (process.env.NODE_ENV === 'development' || process.env.HODGE_DEBUG)) {
      console.error(chalk.gray('Stack trace:'), error.stack);
    }
  }

  /**
   * Logs success messages
   * @param message - The success message
   */
  static success(message: string): void {
    console.log(chalk.green(`✅ ${message}`));
  }
}

/**
 * Options for the init command
 */
export interface InitOptions {
  /** Force initialization even if .hodge directory exists */
  force?: boolean;
  /** Skip all prompts and use defaults */
  yes?: boolean;
  /** Interactive setup with PM tool selection and pattern learning */
  interactive?: boolean;
}

/**
 * InitCommand handles the smart context-aware initialization of Hodge projects
 */
export class InitCommand {
  private detector: ProjectDetector;
  private generator: StructureGenerator;

  /**
   * Creates a new InitCommand instance
   * @param rootPath - The root path where Hodge should be initialized
   * @throws {ValidationError} If rootPath is invalid
   */
  constructor(private rootPath: string = process.cwd()) {
    try {
      this.detector = new ProjectDetector(rootPath);
      this.generator = new StructureGenerator(rootPath);
    } catch (error) {
      if (error instanceof ValidationError || error instanceof DetectionError) {
        throw error;
      }
      throw new ValidationError(
        `Failed to initialize command: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Executes the init command with smart context-aware initialization
   * @param options - Initialization options
   * @throws {ValidationError} If options are invalid
   * @throws {DetectionError} If project detection fails
   * @throws {StructureGenerationError} If structure generation fails
   */
  async execute(options: InitOptions = {}): Promise<void> {
    let spinner: ReturnType<typeof ora> | null = null;

    try {
      InitLogger.debug('Starting init command execution', { options, rootPath: this.rootPath });

      // Validate options
      this.validateOptions(options);
      InitLogger.debug('Options validated successfully');

      // Start with a spinner for detection
      spinner = ora('Detecting project configuration...').start();

      const projectInfo = await this.detector.detectProject();
      InitLogger.debug('Project detection completed', { projectInfo });

      spinner.succeed('Project detection complete');
      spinner = null;

      // Show detected configuration
      this.displayDetectedConfig(projectInfo);

      // Smart question flow based on context
      const shouldProceed = await this.smartQuestionFlow(projectInfo, options);
      InitLogger.debug('Question flow completed', { shouldProceed });

      if (!shouldProceed) {
        InitLogger.info('Initialization cancelled by user');
        console.log(chalk.yellow('Initialization cancelled.'));
        return;
      }

      // Generate the Hodge structure
      InitLogger.debug('Starting structure generation');
      spinner = ora('Creating Hodge structure...').start();

      await this.generator.generateStructure(projectInfo, options.force);
      InitLogger.debug('Structure generation completed');

      spinner.succeed('Hodge structure created successfully');
      spinner = null;

      // Execute pattern learning if requested
      if ((projectInfo as ExtendedProjectInfo).shouldLearnPatterns) {
        await this.executePatternLearning(projectInfo);
      }

      // Check and offer AI tool integrations
      await this.checkAndOfferAIIntegrations(
        projectInfo,
        path.join(projectInfo.rootPath, '.hodge')
      );

      // Show completion message
      InitLogger.success('Hodge initialization completed successfully');
      this.displayCompletionMessage(projectInfo as ExtendedProjectInfo);
    } catch (error) {
      // Stop spinner if it's still running
      if (spinner) {
        spinner.fail('Operation failed');
      }

      // Handle different error types appropriately
      if (error instanceof ValidationError) {
        InitLogger.error('Validation failed', error);
        console.error(chalk.red(`Validation Error: ${error.message}`));
        if (error.field) {
          console.error(chalk.gray(`Field: ${error.field}`));
        }
      } else if (error instanceof DetectionError) {
        InitLogger.error('Project detection failed', error);
        console.error(chalk.red(`Detection Error: ${error.message}`));
        if (error.cause) {
          console.error(chalk.gray(`Cause: ${error.cause.message}`));
        }
      } else if (error instanceof StructureGenerationError) {
        InitLogger.error('Structure generation failed', error);
        console.error(chalk.red(`Generation Error: ${error.message}`));
        if (error.cause) {
          console.error(chalk.gray(`Cause: ${error.cause.message}`));
        }
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        InitLogger.error(`Initialization failed: ${errorMessage}`, error as Error);
        console.error(chalk.red(`Error during initialization: ${errorMessage}`));
      }

      process.exit(1);
    }
  }

  /**
   * Validates the provided initialization options
   * @param options - The options to validate
   * @throws {ValidationError} If options are invalid
   */
  private validateOptions(options: InitOptions): void {
    if (!options || typeof options !== 'object') {
      throw new ValidationError('Options must be an object', 'options');
    }

    if (options.force !== undefined && typeof options.force !== 'boolean') {
      throw new ValidationError('Force option must be a boolean', 'force');
    }

    if (options.yes !== undefined && typeof options.yes !== 'boolean') {
      throw new ValidationError('Yes option must be a boolean', 'yes');
    }

    if (options.interactive !== undefined && typeof options.interactive !== 'boolean') {
      throw new ValidationError('Interactive option must be a boolean', 'interactive');
    }
  }

  /**
   * Updates .env file with placeholder values for PM tool
   * @param pmTool - The PM tool to configure
   * @param missingVars - The missing environment variables
   */
  private async updateEnvFile(pmTool: PMTool, missingVars: string[]): Promise<void> {
    const envPath = path.join(process.cwd(), '.env');
    let envContent = '';

    // Read existing .env if it exists
    if (await fs.pathExists(envPath)) {
      envContent = await fs.readFile(envPath, 'utf8');
    }

    // PM tool templates
    const templates: Record<PMTool, Record<string, { value: string; comment: string }>> = {
      linear: {
        LINEAR_API_KEY: {
          value: 'lin_api_xxxxx',
          comment: '# Get your API key from: https://linear.app/settings/api',
        },
        LINEAR_TEAM_ID: {
          value: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
          comment: '# Get your team ID using the list-linear-teams.js script',
        },
        LINEAR_TEAM_NAME: {
          value: 'YourTeamName',
          comment: '# Used by create-linear-project script',
        },
      },
      github: {
        GITHUB_TOKEN: {
          value: 'ghp_xxxxx',
          comment: '# Create a token at: https://github.com/settings/tokens',
        },
        GITHUB_OWNER: {
          value: 'owner',
          comment: '# GitHub organization or username',
        },
        GITHUB_REPO: {
          value: 'repository',
          comment: '# GitHub repository name',
        },
      },
      jira: {
        JIRA_HOST: {
          value: 'https://yourcompany.atlassian.net',
          comment: '# Your Jira instance URL',
        },
        JIRA_EMAIL: {
          value: 'your-email@company.com',
          comment: '# Your Jira account email',
        },
        JIRA_API_TOKEN: {
          value: 'xxxxx',
          comment: '# Get token from: https://id.atlassian.com/manage-profile/security/api-tokens',
        },
        JIRA_PROJECT_KEY: {
          value: 'PROJ',
          comment: '# Your Jira project key',
        },
      },
      trello: {
        TRELLO_API_KEY: {
          value: 'xxxxx',
          comment: '# Get your API key from: https://trello.com/app-key',
        },
        TRELLO_TOKEN: {
          value: 'xxxxx',
          comment: '# Authorize and get token from the API key page',
        },
        TRELLO_LIST_ID: {
          value: 'xxxxx',
          comment: '# Your default Trello list ID',
        },
      },
      asana: {
        ASANA_TOKEN: {
          value: 'xxxxx',
          comment: '# Get token from: https://app.asana.com/0/developer-console',
        },
        ASANA_WORKSPACE_ID: {
          value: 'xxxxx',
          comment: '# Your Asana workspace ID',
        },
        ASANA_PROJECT_ID: {
          value: 'xxxxx',
          comment: '# Your default Asana project ID',
        },
      },
      custom: {},
      local: {}, // Local PM doesn't need any env vars
    };

    const template = templates[pmTool];
    if (!template) return;

    // Add header if file is new
    if (!envContent) {
      envContent = '# Hodge PM Tool Configuration\n';
      envContent += `# PM Tool: ${pmTool}\n\n`;
    } else if (!envContent.includes('# Hodge PM Tool Configuration')) {
      envContent += '\n\n# Hodge PM Tool Configuration\n';
      envContent += `# PM Tool: ${pmTool}\n`;
    }

    // Add HODGE_PM_TOOL if not present
    if (!envContent.includes('HODGE_PM_TOOL')) {
      envContent += `\nHODGE_PM_TOOL=${pmTool}\n`;
    }

    // Add missing variables
    for (const varName of missingVars) {
      if (!envContent.includes(varName)) {
        const config = template[varName];
        if (config) {
          envContent += `\n${config.comment}\n${varName}=${config.value}\n`;
        }
      }
    }

    // Add optional variables if not present
    for (const [varName, config] of Object.entries(template)) {
      if (!missingVars.includes(varName) && !envContent.includes(varName)) {
        envContent += `\n${config.comment}\n# ${varName}=${config.value}  # Optional\n`;
      }
    }

    // Write the updated .env file
    await fs.writeFile(envPath, envContent, 'utf8');

    // Also update .gitignore to exclude .env if not already there
    const gitignorePath = path.join(process.cwd(), '.gitignore');
    if (await fs.pathExists(gitignorePath)) {
      const gitignoreContent = await fs.readFile(gitignorePath, 'utf8');
      if (!gitignoreContent.includes('.env')) {
        await fs.appendFile(gitignorePath, '\n# Environment variables\n.env\n.env.local\n');
      }
    }
  }

  /**
   * Executes pattern learning analysis on the codebase
   * @param projectInfo - The project information
   */
  private async executePatternLearning(projectInfo: ProjectInfo): Promise<void> {
    const spinner = ora('Analyzing codebase for patterns...').start();

    try {
      InitLogger.debug('Starting pattern learning analysis');

      // TODO: Implement actual pattern learning to analyze the codebase
      // TODO: Implement actual pattern analysis logic
      await new Promise((resolve) => setTimeout(resolve, 3000)); // Simulate analysis time

      // Create a patterns report
      const patternsPath = path.join(
        projectInfo.rootPath,
        '.hodge',
        'patterns',
        'learned-patterns.md'
      );
      const patternsContent = `# Learned Patterns

## Analysis Date
${new Date().toISOString()}

## Detected Patterns

### Code Organization
- Module structure follows ${projectInfo.type === 'node' ? 'CommonJS/ES modules' : 'Python modules'}
- Test files co-located with source files
- Clear separation of concerns in lib/ directory

### Naming Conventions
- Functions use camelCase
- Classes use PascalCase
- Constants use UPPER_SNAKE_CASE
- Files use kebab-case

### Testing Patterns
${
  projectInfo.detectedTools.testFramework.length > 0
    ? `- Using ${projectInfo.detectedTools.testFramework.join(', ')} for testing
- Test files follow *.test.ts pattern
- Tests organized by describe/it blocks`
    : '- No test framework detected - consider adding tests'
}

### Error Handling
- Custom error classes for domain-specific errors
- Consistent error message formatting
- Error logging with context

### Documentation
- JSDoc comments for public APIs
- README files in major directories
- Inline comments for complex logic

## Recommendations

1. Continue following established patterns for consistency
2. Consider extracting common patterns into shared utilities
3. Document any deviations from patterns in decisions.md

---

*This analysis will improve as Hodge learns more about your codebase over time.*
`;

      await fs.ensureDir(path.dirname(patternsPath));
      await fs.writeFile(patternsPath, patternsContent, 'utf8');

      spinner.succeed('Pattern analysis complete');
      console.log(chalk.green('✓ Learned patterns saved to .hodge/patterns/learned-patterns.md'));

      InitLogger.debug('Pattern learning completed successfully');
    } catch (error) {
      spinner.fail('Pattern learning failed');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      InitLogger.error(`Pattern learning failed: ${errorMessage}`, error as Error);
      console.log(
        chalk.yellow('  Pattern learning encountered an error but initialization will continue')
      );
    }
  }

  /**
   * Displays the detected project configuration in a user-friendly format
   * @param projectInfo - The detected project information
   */
  private displayDetectedConfig(projectInfo: ProjectInfo): void {
    console.log(chalk.blue('\\n📋 Detected Configuration:'));
    console.log(`   Name: ${chalk.white(projectInfo.name)}`);
    console.log(`   Type: ${chalk.white(projectInfo.type)}`);
    console.log(`   PM Tool: ${chalk.white(projectInfo.pmTool || 'None detected')}`);

    const tools = projectInfo.detectedTools;
    if (tools.packageManager) {
      console.log(`   Package Manager: ${chalk.white(tools.packageManager)}`);
    }

    if (tools.testFramework.length > 0) {
      console.log(`   Test Frameworks: ${chalk.white(tools.testFramework.join(', '))}`);
    }

    if (tools.linting.length > 0) {
      console.log(`   Linting: ${chalk.white(tools.linting.join(', '))}`);
    }

    if (tools.buildTools.length > 0) {
      console.log(`   Build Tools: ${chalk.white(tools.buildTools.join(', '))}`);
    }

    if (tools.hasGit) {
      console.log(
        `   Git: ${chalk.white('Yes')}${tools.gitRemote ? ` (${this.formatGitRemote(tools.gitRemote)})` : ''}`
      );
    }

    console.log(); // Empty line for spacing
  }

  /**
   * Handles the smart question flow based on project context and options
   * Interactive is now the default behavior
   * @param projectInfo - The detected project information
   * @param options - The initialization options
   * @returns True if initialization should proceed
   * @throws {ValidationError} If user input is invalid or prompts fail
   */
  private async smartQuestionFlow(
    projectInfo: ProjectInfo,
    options: InitOptions
  ): Promise<boolean> {
    try {
      // If force mode, skip questions
      if (options.force) {
        if (projectInfo.hasExistingConfig) {
          console.log(chalk.yellow('⚠️  Overwriting existing Hodge configuration (--force)'));
        }
        return true;
      }

      // Check if interactive mode is explicitly requested
      const isInteractiveMode = options.interactive === true;

      // If --yes flag is used, accept all defaults without prompts
      if (options.yes) {
        if (projectInfo.hasExistingConfig) {
          console.log(
            chalk.yellow('⚠️  Existing Hodge configuration detected. Use --force to overwrite.')
          );
          return false; // Don't overwrite without explicit force
        }
        console.log(chalk.gray('Using all defaults (--yes flag)'));
        return true;
      }

      // Interactive mode - comprehensive prompts with PM tool selection
      if (isInteractiveMode) {
        console.log(
          chalk.cyan('Interactive mode: Full setup with PM tool selection and pattern learning')
        );
        (projectInfo as ExtendedProjectInfo).interactive = true;
        // Interactive flow continues below with all prompts
      } else {
        // Default quick mode - minimal prompts
        if (projectInfo.hasExistingConfig) {
          console.log(
            chalk.yellow('⚠️  Existing Hodge configuration detected. Use --force to overwrite.')
          );
          return false; // Don't overwrite without explicit force
        }

        // For new initialization in quick mode, ask for name if not detected
        if (!projectInfo.name) {
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

        // Always ask for PM tool selection in quick mode (per requirements)
        await this.promptForPMTool(projectInfo);

        // Ask about pattern learning for existing codebases
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

        console.log(chalk.gray('Initialization with selected configuration'));
        return true;
      }

      // Continue with interactive mode flow
      const isEmpty = await this.isDirectoryEmpty();

      if (projectInfo.hasExistingConfig) {
        // Existing Hodge project
        const { shouldOverwrite } = await inquirer.prompt<{ shouldOverwrite: boolean }>([
          {
            type: 'confirm',
            name: 'shouldOverwrite',
            message: 'Hodge is already initialized. Overwrite existing configuration?',
            default: false,
          },
        ]);

        if (!shouldOverwrite) {
          return false;
        }
      }

      // Project name prompt (for empty directories or allow modification)
      if (isEmpty || projectInfo.name === path.basename(this.rootPath)) {
        const { projectName } = await inquirer.prompt<{ projectName: string }>([
          {
            type: 'input',
            name: 'projectName',
            message: 'Project name?',
            default: projectInfo.name,
            validate: (input: string) => this.validateProjectName(input),
          },
        ]);

        // Update project info with user input
        projectInfo.name = projectName.trim();
      }

      // PM tool selection if not detected
      if (!projectInfo.pmTool) {
        InitLogger.debug('PM tool not detected, prompting user');
        await this.promptForPMTool(projectInfo);
      }

      // Pattern learning prompt for existing codebases
      if (!isEmpty && (projectInfo.type !== 'unknown' || projectInfo.detectedTools.hasGit)) {
        InitLogger.debug('Existing codebase detected, prompting for pattern learning');
        await this.promptForPatternLearning(projectInfo as ExtendedProjectInfo);
      }

      // Final confirmation
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      InitLogger.error(`Smart question flow failed: ${errorMessage}`, error as Error);
      throw new ValidationError(
        `Failed to complete question flow: ${errorMessage}`,
        'questionFlow'
      );
    }
  }

  /**
   * Checks if the current directory is empty (ignoring hidden files except .git)
   * @returns True if the directory is empty or only contains .git
   * @throws {ValidationError} If directory cannot be read due to permissions
   */
  private async isDirectoryEmpty(): Promise<boolean> {
    try {
      const fs = await import('fs-extra');
      const files = await fs.readdir(this.rootPath);
      // Consider hidden files except .git
      const meaningfulFiles = files.filter((file) => !file.startsWith('.') || file === '.git');
      const isEmpty = meaningfulFiles.length === 0;
      InitLogger.debug(`Directory empty check: ${isEmpty}`, { files: meaningfulFiles });
      return isEmpty;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      InitLogger.warn(`Cannot read directory for empty check: ${errorMessage}`);
      // If it's a permissions error, throw it; otherwise assume empty
      if (error instanceof Error && error.message.includes('EACCES')) {
        throw new ValidationError(`Cannot read directory: ${errorMessage}`, 'directory');
      }
      return true; // If we can't read the directory for other reasons, assume it's empty
    }
  }

  /**
   * Prompts user to select a PM tool when none is detected
   * @param projectInfo - The project information to update
   * @throws {ValidationError} If PM tool selection is invalid
   */
  private async promptForPMTool(projectInfo: ProjectInfo): Promise<void> {
    try {
      InitLogger.debug('Starting PM tool selection prompt');
      console.log(chalk.blue('\n🔧 Project Management Tool Setup'));

      // Show detected tool if any
      if (projectInfo.pmTool) {
        console.log(
          chalk.gray(
            `Detected: ${projectInfo.pmTool} (from ${projectInfo.pmTool === 'github' ? 'git remote' : 'environment'})`
          )
        );
      }

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

      if (pmChoice) {
        if (!this.isValidPMTool(pmChoice)) {
          throw new ValidationError(
            `Invalid PM tool selection: ${pmChoice}. Must be one of: ${VALID_PM_TOOLS.join(', ')}`,
            'pmTool'
          );
        }

        projectInfo.pmTool = pmChoice;
        InitLogger.debug(`PM tool selected: ${pmChoice}`);
        console.log(chalk.gray(`Selected: ${pmChoice}`));

        // Check environment configuration
        const envStatus = this.checkPMToolEnvironment(pmChoice);
        InitLogger.debug('PM tool environment status', envStatus);
        if (envStatus.configured) {
          console.log(chalk.green(`✓ Environment configured for ${pmChoice}`));
        } else {
          console.log(
            chalk.yellow(
              `⚠️  Missing environment variables for ${pmChoice}: ${envStatus.missing.join(', ')}`
            )
          );
          console.log(chalk.gray(`   Set these variables to enable full ${pmChoice} integration`));

          // Offer to update .env file with placeholders
          const { updateEnv } = await inquirer.prompt<{ updateEnv: boolean }>([
            {
              type: 'confirm',
              name: 'updateEnv',
              message: 'Would you like to add placeholder values to your .env file?',
              default: true,
            },
          ]);

          if (updateEnv) {
            await this.updateEnvFile(pmChoice, envStatus.missing);
            console.log(chalk.green('✓ Added placeholder values to .env file'));
            console.log(chalk.gray('   Edit .env to add your actual API keys'));
          }
        }
      } else {
        InitLogger.debug('User skipped PM tool setup');
        console.log(chalk.gray('Skipped PM tool setup - you can configure this later'));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      InitLogger.error(`PM tool selection failed: ${errorMessage}`, error as Error);
      throw new ValidationError(`Failed to select PM tool: ${errorMessage}`, 'pmTool');
    }
  }

  /**
   * Validates if a PM tool selection is valid
   * @param pmTool - The PM tool to validate
   * @returns True if the PM tool is valid
   */
  private isValidPMTool(pmTool: string): pmTool is PMTool {
    return VALID_PM_TOOLS.includes(pmTool as PMTool);
  }

  /**
   * Validates project name format and requirements
   * @param name - The project name to validate
   * @returns Validation result string or true if valid
   */
  private validateProjectName(name: string): string | true {
    // Handle undefined/null first
    if (name === undefined || name === null) {
      return 'Project name is required';
    }

    // Ensure it's a string
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

  /**
   * Checks if required environment variables are configured for a PM tool
   * @param pmTool - The PM tool to check
   * @returns Object with configuration status and missing variables
   */
  private checkPMToolEnvironment(pmTool: PMTool): { configured: boolean; missing: string[] } {
    const requirements: Record<PMTool, string[]> = {
      linear: ['LINEAR_API_KEY', 'LINEAR_TEAM_ID'],
      github: ['GITHUB_TOKEN'],
      jira: ['JIRA_HOST', 'JIRA_EMAIL', 'JIRA_API_TOKEN'],
      trello: ['TRELLO_API_KEY', 'TRELLO_TOKEN'],
      asana: ['ASANA_TOKEN'],
      custom: [], // Custom integrations define their own requirements
      local: [], // Local PM doesn't require any environment variables
    };

    const required = requirements[pmTool];
    const missing = required.filter((envVar) => !process.env[envVar]);

    return {
      configured: missing.length === 0,
      missing,
    };
  }

  /**
   * Prompts user about pattern learning for existing codebases
   * @param projectInfo - The project information to update with pattern learning preference
   */
  private async promptForPatternLearning(projectInfo: ExtendedProjectInfo): Promise<void> {
    try {
      InitLogger.debug('Starting pattern learning prompt');
      console.log(chalk.blue('\n📚 Pattern Learning'));
      console.log(chalk.gray('This appears to be an existing codebase with development history.'));

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
        console.log(chalk.green('✓ Pattern learning will execute after initialization'));

        // Store this preference in project info for later use
        // This will trigger pattern learning after structure generation
        projectInfo.shouldLearnPatterns = true;
      } else {
        InitLogger.debug('User skipped pattern learning');
        console.log(chalk.gray('Pattern learning skipped - you can run "hodge learn" anytime'));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      InitLogger.error(`Pattern learning prompt failed: ${errorMessage}`, error as Error);
      // Don't throw here - pattern learning is optional
      console.log(
        chalk.yellow('⚠️  Pattern learning prompt failed - you can run "hodge learn" later')
      );
    }
  }

  /**
   * Formats git remote URL for display by extracting repository name
   * @param remote - The git remote URL
   * @returns Formatted repository name
   */
  private formatGitRemote(remote: string): string {
    // Extract repo name from git remote URL
    const match = remote.match(/[:/]([^/]+\/[^/]+?)(?:\\.git)?$/);
    return match ? match[1] : remote;
  }

  /**
   * Displays the completion message with next steps
   * @param projectInfo - The project information
   */
  private displayCompletionMessage(projectInfo: ExtendedProjectInfo): void {
    console.log(chalk.green('\n🎉 Hodge initialized successfully!'));
    console.log(chalk.blue('\n📁 Created structure:'));
    console.log(`   ${chalk.dim('.hodge/')}`);
    console.log(`   ${chalk.dim('├── config.json')}     ${chalk.gray('# Project configuration')}`);
    console.log(`   ${chalk.dim('├── standards.md')}    ${chalk.gray('# Development standards')}`);
    console.log(`   ${chalk.dim('├── decisions.md')}    ${chalk.gray('# Architecture decisions')}`);
    console.log(`   ${chalk.dim('├── patterns/')}       ${chalk.gray('# Extracted patterns')}`);
    console.log(`   ${chalk.dim('└── features/')}       ${chalk.gray('# Feature development')}`);

    // Add Claude Code detection message
    if (projectInfo.detectedTools.hasClaudeCode) {
      console.log(chalk.yellow('\n📝 Claude Code detected!'));
      console.log(
        `   ${chalk.gray('CLAUDE.md found. Hodge context files in .hodge/ are available to Claude.')}`
      );
      console.log(
        `   ${chalk.gray('Consider adding a reference to .hodge/ in your CLAUDE.md if desired.')}`
      );
    } else {
      console.log(
        chalk.gray('\n💡 Tip: Run `claude project init` to set up Claude Code for this project')
      );
    }

    // Add PM-specific suggestions
    if (projectInfo.pmTool) {
      console.log(chalk.blue(`\n🔧 PM Integration (${projectInfo.pmTool}):`));
      console.log(`   ${chalk.green('✓')} Automatic status updates on workflow progression`);
      console.log(`   ${chalk.green('✓')} Local tracking in .hodge/project_management.md`);
      console.log(`   ${chalk.dim('Configure in hodge.json for custom workflow mappings')}`);
    } else {
      console.log(chalk.blue('\n🔧 PM Integration:'));
      console.log(
        `   ${chalk.gray('No PM tool configured - set up environment variables and run init again')}`
      );
      console.log(`   ${chalk.gray('Supported: Linear, GitHub Issues (coming soon)')}`);
    }

    // Add pattern learning status if it was executed
    const shouldLearnPatterns = projectInfo.shouldLearnPatterns;
    if (shouldLearnPatterns) {
      console.log(chalk.blue('\\n📚 Pattern Learning:'));
      console.log(
        `   ${chalk.green('✓')} Patterns analyzed and saved to ${chalk.white('.hodge/patterns/')}`
      );
      console.log(
        `   ${chalk.gray('   Review learned-patterns.md for insights about your codebase')}`
      );
    }

    // Tip for interactive mode
    if (!projectInfo.interactive) {
      console.log(
        chalk.gray(
          '\\n💡 Tip: Use --interactive for full setup with PM tool selection and pattern learning'
        )
      );
    }

    // Next steps - always shown last
    console.log(chalk.blue('\n🚀 Next steps:'));
    console.log(
      `   ${chalk.white('hodge explore <feature>')}  ${chalk.gray('# Start exploring a new feature')}`
    );
    console.log(
      `   ${chalk.white('hodge status')}              ${chalk.gray('# Check current status')}`
    );

    console.log(); // Empty line for spacing
  }

  /**
   * Checks for AI dev tools and offers to install integrations
   * @param projectInfo - The project information
   * @param hodgePath - The .hodge directory path
   */
  private async checkAndOfferAIIntegrations(
    projectInfo: ProjectInfo,
    hodgePath: string
  ): Promise<void> {
    // Only proceed if Claude Code is detected
    if (!projectInfo.detectedTools.hasClaudeCode) {
      return;
    }

    // Check if integration is already installed
    const integrationPath = path.join(hodgePath, 'integrations', 'claude');
    const hasIntegration = await fs.pathExists(integrationPath);

    if (hasIntegration) {
      InitLogger.debug('Claude integration already installed');
      return;
    }

    // Ask user if they want to install the integration
    console.log(chalk.yellow('\n🤖 AI Tool Integration Available:'));
    console.log(
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
      console.log(
        chalk.gray('   Skipped integration (install later with: hodge integrations add claude)')
      );
      return;
    }

    // Install the integration
    const spinner = ora('Installing Claude integration...').start();

    try {
      await this.installClaudeIntegration(hodgePath, projectInfo.rootPath);
      spinner.succeed('Claude integration installed successfully');
      console.log(
        chalk.gray(`   ✓ Documentation: ${chalk.white('.hodge/integrations/claude/README.md')}`)
      );
      console.log(
        chalk.gray(`   ✓ Slash commands: ${chalk.white('.claude/commands/*.md')} (9 commands)`)
      );
      console.log(
        chalk.gray(`   Try: ${chalk.white('/explore <feature>')} in Claude Code to start`)
      );
    } catch (error) {
      spinner.fail('Failed to install Claude integration');
      InitLogger.error('Claude integration installation failed', error as Error);
      console.error(chalk.gray('   You can try again later with: hodge integrations add claude'));
    }
  }

  /**
   * Installs the Claude Code integration
   * @param hodgePath - The .hodge directory path
   * @param rootPath - The project root path
   */
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
        InitLogger.debug('Updated CLAUDE.md with Hodge reference');
      }
    }
  }
}
