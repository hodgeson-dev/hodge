/**
 * Hodge Init Command
 * Smart context-aware initialization (orchestrator)
 */

import ora from 'ora';
import path from 'path';
import { ProjectDetector, ProjectInfo, DetectionError, ValidationError } from '../lib/detection.js';
import { StructureGenerator, StructureGenerationError } from '../lib/structure-generator.js';
import { createCommandLogger } from '../lib/logger.js';
import { InitDetection } from './init/init-detection.js';
import { InitInteraction, ExtendedProjectInfo } from './init/init-interaction.js';
import { ArchitectureGraphService } from '../lib/architecture-graph-service.js';
import { ToolchainService } from '../lib/toolchain-service.js';

/**
 * Options for the init command
 */
export interface InitOptions {
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
  private detection: InitDetection;
  private interaction: InitInteraction;
  private logger = createCommandLogger('init', { enableConsole: true });

  /**
   * Creates a new InitCommand instance
   */
  constructor(private rootPath: string = process.cwd()) {
    try {
      this.detector = new ProjectDetector(rootPath);
      this.generator = new StructureGenerator(rootPath);
      this.detection = new InitDetection();
      this.interaction = new InitInteraction(rootPath);
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
   */
  async execute(options: InitOptions = {}): Promise<void> {
    let spinner: ReturnType<typeof ora> | null = null;

    try {
      this.logger.debug('Starting init command execution', { options, rootPath: this.rootPath });

      // Validate options
      this.validateOptions(options);
      this.logger.debug('Options validated successfully');

      // Run project detection
      const projectInfo = await this.runProjectDetection(spinner);

      // Show detected configuration
      this.interaction.displayDetectedConfig(projectInfo);

      // Smart question flow based on context
      const shouldProceed = await this.interaction.smartQuestionFlow(projectInfo, options);
      this.logger.debug('Question flow completed', { shouldProceed });

      if (!shouldProceed) {
        this.logger.info('Initialization cancelled by user');
        return;
      }

      // Generate structure and configure project
      spinner = await this.generateAndConfigureProject(projectInfo, spinner);

      // Show completion message
      this.logger.info('Hodge initialization completed successfully');
      this.interaction.displayCompletionMessage(projectInfo as ExtendedProjectInfo);
    } catch (error) {
      this.handleExecutionError(error, spinner);
    }
  }

  /**
   * Run project detection with spinner
   */
  private async runProjectDetection(_spinner: ReturnType<typeof ora> | null): Promise<ProjectInfo> {
    const detectionSpinner = ora('Detecting project configuration...').start();

    const projectInfo = await this.detector.detectProject();
    this.logger.debug('Project detection completed', { projectInfo });

    detectionSpinner.succeed('Project detection complete');
    return projectInfo;
  }

  /**
   * Generate structure and configure project
   */
  private async generateAndConfigureProject(
    projectInfo: ProjectInfo,
    _spinner: ReturnType<typeof ora> | null
  ): Promise<ReturnType<typeof ora> | null> {
    // Generate the Hodge structure
    this.logger.debug('Starting structure generation');
    const generationSpinner = ora('Creating Hodge structure...').start();

    await this.generator.generateStructure(projectInfo);
    this.logger.debug('Structure generation completed');

    generationSpinner.succeed('Hodge structure created successfully');

    // Detect and configure toolchain
    await this.detection.detectAndConfigureToolchain(projectInfo);

    // HODGE-377.3: Generate initial architecture graph
    await this.generateInitialArchitectureGraph(projectInfo);

    // Run auto-detection for review profiles
    await this.detection.runAutoDetection(projectInfo);

    // Execute pattern learning if requested
    if ((projectInfo as ExtendedProjectInfo).shouldLearnPatterns) {
      await this.detection.executePatternLearning(projectInfo);
    }

    // Check and offer AI tool integrations
    await this.interaction.checkAndOfferAIIntegrations(
      projectInfo,
      path.join(projectInfo.rootPath, '.hodge')
    );

    return null;
  }

  /**
   * Handle execution errors
   */
  private handleExecutionError(error: unknown, spinner: ReturnType<typeof ora> | null): void {
    // Stop spinner if it's still running
    if (spinner) {
      spinner.fail('Operation failed');
    }

    // Handle different error types appropriately
    if (error instanceof ValidationError) {
      this.logValidationError(error);
    } else if (error instanceof DetectionError) {
      this.logDetectionError(error);
    } else if (error instanceof StructureGenerationError) {
      this.logGenerationError(error);
    } else {
      this.logGenericError(error);
    }

    process.exit(1);
  }

  /**
   * Validates the provided initialization options
   */
  private validateOptions(options: InitOptions): void {
    if (typeof options !== 'object') {
      throw new ValidationError('Options must be an object', 'options');
    }

    if (options.yes !== undefined && typeof options.yes !== 'boolean') {
      throw new ValidationError('Yes option must be a boolean', 'yes');
    }

    if (options.interactive !== undefined && typeof options.interactive !== 'boolean') {
      throw new ValidationError('Interactive option must be a boolean', 'interactive');
    }
  }

  // Error logging methods

  private logValidationError(error: ValidationError): void {
    this.logger.error('Validation failed', { error });
    if (error.field) {
      this.logger.error(`Field: ${error.field}`);
    }
  }

  private logDetectionError(error: DetectionError): void {
    this.logger.error('Project detection failed', { error });
    if (error.cause) {
      this.logger.error(`Cause: ${error.cause.message}`);
    }
  }

  private logGenerationError(error: StructureGenerationError): void {
    this.logger.error('Structure generation failed', { error });
    if (error.cause) {
      this.logger.error(`Cause: ${error.cause.message}`);
    }
  }

  private logGenericError(error: unknown): void {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    this.logger.error(`Initialization failed: ${errorMessage}`, {
      error: error as Error,
    });
  }

  /**
   * Generate initial architecture graph (HODGE-377.3)
   * Called after toolchain configuration to provide AI with codebase structure
   */
  private async generateInitialArchitectureGraph(projectInfo: ProjectInfo): Promise<void> {
    try {
      const spinner = ora('Generating architecture graph...').start();
      this.logger.debug('Starting initial architecture graph generation');

      const toolchainService = new ToolchainService(projectInfo.rootPath);
      const toolchainConfig = await toolchainService.loadConfig();

      const graphService = new ArchitectureGraphService();
      const result = await graphService.generateGraph({
        projectRoot: projectInfo.rootPath,
        toolchainConfig,
        quiet: true, // Suppress console output, we have spinner
      });

      if (result.success) {
        spinner.succeed('Architecture graph generated');
        this.logger.debug('Initial architecture graph generated successfully');
      } else {
        // Non-blocking failure - graph generation is not critical for init
        spinner.warn('Architecture graph generation skipped');
        this.logger.debug(`Graph generation skipped: ${result.error}`);
      }
    } catch (error) {
      // Non-blocking failure - log but don't throw
      this.logger.warn('Failed to generate initial architecture graph', {
        error: error as Error,
      });
    }
  }
}
