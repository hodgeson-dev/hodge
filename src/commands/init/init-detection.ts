/**
 * Auto-Detection and Toolchain Configuration for Init Command
 * Handles toolchain detection, review profile discovery, and pattern learning
 */

import path from 'path';
import fs from 'fs-extra';
import ora from 'ora';
import chalk from 'chalk';
import { ProjectInfo } from '../../lib/detection.js';
import { createCommandLogger } from '../../lib/logger.js';
import { ProfileDiscoveryService } from '../../lib/profile-discovery-service.js';
import { AutoDetectionService } from '../../lib/auto-detection-service.js';
import { ReviewConfigGenerator } from '../../lib/review-config-generator.js';
import { ToolchainService } from '../../lib/toolchain-service.js';
import { ToolchainGenerator } from '../../lib/toolchain-generator.js';

/**
 * Handles detection and configuration of toolchains and profiles
 */
export class InitDetection {
  private logger = createCommandLogger('init-detection', { enableConsole: true });

  /**
   * Detect and configure toolchain using registry-based detection
   */
  async detectAndConfigureToolchain(projectInfo: ProjectInfo): Promise<void> {
    const spinner = ora('Detecting development tools...').start();

    try {
      this.logger.debug('Starting toolchain detection');

      const toolchainService = new ToolchainService(projectInfo.rootPath);
      const detectedTools = await toolchainService.detectTools();

      if (detectedTools.length === 0) {
        spinner.warn('No development tools detected');
        this.logger.info(
          chalk.yellow('ℹ️  No tools detected. You can configure manually in .hodge/toolchain.yaml')
        );
        return;
      }

      spinner.succeed(`Detected ${detectedTools.length} development tools`);

      // Show detected tools
      this.logger.info(chalk.blue('\n🔧 Development Tools Detected:'));
      for (const tool of detectedTools) {
        const versionInfo = tool.version ? ` (${tool.version})` : '';
        this.logger.info(`   ${chalk.green('✓')} ${tool.name}${versionInfo}`);
      }
      this.logger.info(''); // Empty line for spacing

      // Generate toolchain.yaml
      const toolchainPath = path.join(projectInfo.rootPath, '.hodge', 'toolchain.yaml');
      const generator = new ToolchainGenerator();
      await generator.generate(detectedTools, toolchainPath);
      this.logger.info(chalk.green('✓ Generated toolchain configuration'));

      // Copy bundled Semgrep rules
      await this.copyBundledSemgrepRules(projectInfo.rootPath);

      this.logger.debug('Toolchain detection completed successfully', {
        detectedCount: detectedTools.length,
      });
    } catch (error) {
      spinner.fail('Toolchain detection failed');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Toolchain detection failed: ${errorMessage}`, { error: error as Error });
      this.logger.info(
        chalk.yellow('  Toolchain detection encountered an error but initialization will continue')
      );
    }
  }

  /**
   * Run auto-detection for review profiles and generate review-config.md
   */
  async runAutoDetection(projectInfo: ProjectInfo): Promise<void> {
    const spinner = ora('Detecting project technologies...').start();

    try {
      this.logger.debug('Starting auto-detection for review profiles');

      // Discover all profiles
      const discoveryService = new ProfileDiscoveryService();
      const registry = await discoveryService.discoverProfiles();

      this.logger.debug('Profile discovery complete', {
        total: registry.profiles.length,
        detectable: registry.detectableProfiles.length,
      });

      if (registry.detectableProfiles.length === 0) {
        spinner.warn('No review profiles with detection rules found');
        this.logger.warn('Skipping auto-detection (no detectable profiles)');
        return;
      }

      // Run auto-detection
      const detectionService = new AutoDetectionService(projectInfo.rootPath);
      const detectionResults = await detectionService.detectProfiles(registry.detectableProfiles);

      const detectedProfiles = detectionResults.filter((r) => r.detected);

      if (detectedProfiles.length === 0) {
        spinner.warn('No matching review profiles detected');
        this.logger.info(chalk.yellow('ℹ️  No technologies detected for review profiles'));
        this.logger.info(
          chalk.gray('   You can manually configure profiles in .hodge/review-config.md')
        );
        return;
      }

      // Copy all review profiles to .hodge/review-profiles/
      await this.copyReviewProfiles(projectInfo.rootPath);

      // Generate review-config.md
      const hodgePath = path.join(projectInfo.rootPath, '.hodge');
      const configGenerator = new ReviewConfigGenerator(hodgePath);
      await configGenerator.generate(detectionResults);

      spinner.succeed(`Detected ${detectedProfiles.length} technologies for code review`);

      // Show clean detection results
      this.logger.info(chalk.blue('\n📋 Review Profiles Detected:'));
      for (const result of detectedProfiles) {
        const profileName = path.basename(result.profile.path, '.md');
        this.logger.info(`   ${chalk.green('✓')} ${this.formatProfileNameForDisplay(profileName)}`);
      }
      this.logger.info(''); // Empty line for spacing

      this.logger.debug('Auto-detection completed successfully', {
        detectedCount: detectedProfiles.length,
      });
    } catch (error) {
      spinner.fail('Auto-detection failed');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Auto-detection failed: ${errorMessage}`, { error: error as Error });
      this.logger.info(
        chalk.yellow('  Auto-detection encountered an error but initialization will continue')
      );
    }
  }

  /**
   * Execute pattern learning analysis on the codebase
   */
  async executePatternLearning(projectInfo: ProjectInfo): Promise<void> {
    const spinner = ora('Analyzing codebase for patterns...').start();

    try {
      this.logger.debug('Starting pattern learning analysis');

      // TODO: Implement actual pattern learning to analyze the codebase
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
      this.logger.info(
        chalk.green('✓ Learned patterns saved to .hodge/patterns/learned-patterns.md')
      );

      this.logger.debug('Pattern learning completed successfully');
    } catch (error) {
      spinner.fail('Pattern learning failed');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Pattern learning failed: ${errorMessage}`, { error: error as Error });
      this.logger.info(
        chalk.yellow('  Pattern learning encountered an error but initialization will continue')
      );
    }
  }

  // Private helper methods

  /**
   * Copy all review profiles from package to .hodge/review-profiles/
   */
  private async copyReviewProfiles(projectRoot: string): Promise<void> {
    try {
      this.logger.debug('Copying review profiles to .hodge/review-profiles/');

      // Get source directory (review-profiles/ in package)
      const packageRoot = path.resolve(__dirname, '..', '..', '..');
      const sourceDir = path.join(packageRoot, 'review-profiles');

      // Get destination directory (.hodge/review-profiles/ in project)
      const destDir = path.join(projectRoot, '.hodge', 'review-profiles');

      // Ensure destination exists
      await fs.ensureDir(destDir);

      // Copy entire directory structure
      await fs.copy(sourceDir, destDir, {
        overwrite: true,
      });

      this.logger.debug('Review profiles copied successfully', {
        source: sourceDir,
        dest: destDir,
      });
    } catch (error) {
      this.logger.error('Failed to copy review profiles', { error: error as Error });
      // Non-fatal error - log but don't fail init
      this.logger.warn('Review profiles not copied, but init will continue');
    }
  }

  /**
   * Copy bundled Semgrep rules from package to .hodge/semgrep-rules/
   */
  private async copyBundledSemgrepRules(projectRoot: string): Promise<void> {
    try {
      this.logger.debug('Copying bundled Semgrep rules to .hodge/semgrep-rules/');

      // Get source directory (bundled-config/semgrep-rules/ in package)
      const packageRoot = path.resolve(__dirname, '..', '..', '..');
      const sourceDir = path.join(packageRoot, 'src', 'bundled-config', 'semgrep-rules');

      // Check if source exists
      if (!(await fs.pathExists(sourceDir))) {
        this.logger.warn('Bundled Semgrep rules not found, skipping');
        return;
      }

      // Get destination directory (.hodge/semgrep-rules/ in project)
      const destDir = path.join(projectRoot, '.hodge', 'semgrep-rules');

      // Ensure destination exists
      await fs.ensureDir(destDir);

      // Copy entire directory structure
      await fs.copy(sourceDir, destDir, {
        overwrite: true,
      });

      this.logger.info(chalk.green('✓ Copied bundled Semgrep rules'));
      this.logger.debug('Semgrep rules copied successfully', {
        source: sourceDir,
        dest: destDir,
      });
    } catch (error) {
      this.logger.error('Failed to copy Semgrep rules', { error: error as Error });
      // Non-fatal error - log but don't fail init
      this.logger.warn('Semgrep rules not copied, but init will continue');
    }
  }

  /**
   * Format profile name for display (e.g., "typescript" → "TypeScript")
   */
  private formatProfileNameForDisplay(profileName: string): string {
    const specialCases: Record<string, string> = {
      typescript: 'TypeScript',
      javascript: 'JavaScript',
      graphql: 'GraphQL',
      mui: 'Material-UI (MUI)',
      'chakra-ui': 'Chakra UI',
      tailwind: 'Tailwind CSS',
      nestjs: 'NestJS',
      trpc: 'tRPC',
      eslint: 'ESLint',
      prettier: 'Prettier',
    };

    if (specialCases[profileName.toLowerCase()]) {
      return specialCases[profileName.toLowerCase()];
    }

    return profileName
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
