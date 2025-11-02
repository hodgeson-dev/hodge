/**
 * Hodge Regen Command
 * HODGE-377.3: Regenerates auto-generated AI context files (architecture graph)
 *
 * This command regenerates architecture-graph.dot using the existing graph generation
 * logic from ArchitectureGraphService. Safe to run anytime after git pull/merge/rebase.
 */

import { createCommandLogger } from '../lib/logger.js';
import { ArchitectureGraphService } from '../lib/architecture-graph-service.js';
import { ToolchainService } from '../lib/toolchain-service.js';

/**
 * RegenCommand handles regeneration of auto-generated context files
 */
export class RegenCommand {
  private logger = createCommandLogger('regen', { enableConsole: true });
  private graphService = new ArchitectureGraphService();
  private toolchainService: ToolchainService;
  private basePath: string;

  /**
   * Creates a new RegenCommand instance
   * @param basePath - Optional base path for testing (defaults to process.cwd())
   */
  constructor(basePath: string = process.cwd()) {
    this.basePath = basePath;
    this.toolchainService = new ToolchainService(basePath);
  }

  /**
   * Execute the regen command
   * Regenerates architecture-graph.dot from current codebase state
   */
  async execute(): Promise<void> {
    try {
      this.logger.info('Regenerating architecture graph...');

      // Load toolchain configuration
      const toolchainConfig = await this.toolchainService.loadConfig();

      // toolchainConfig will throw if missing, so this check is defensive
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!toolchainConfig) {
        this.logger.error(
          '⚠️  No toolchain configuration found. Run "hodge init" to set up toolchain.'
        );
        process.exit(1);
      }

      // Generate architecture graph
      const result = await this.graphService.generateGraph({
        projectRoot: this.basePath,
        toolchainConfig,
        quiet: false,
      });

      if (!result.success) {
        this.logger.error(`⚠️  Failed to regenerate architecture graph: ${result.error}`);
        this.logger.info('   This may happen if dependency-cruiser is not configured.');
        this.logger.info('   Run "hodge init" to set up toolchain configuration.');
        process.exit(1);
      }

      this.logger.info('✓ Regenerated architecture-graph.dot');
    } catch (error) {
      const err = error as Error;
      this.logger.error('Failed to regenerate architecture graph', { error: err });
      this.logger.error(`⚠️  Error: ${err.message}`);
      process.exit(1);
    }
  }
}
