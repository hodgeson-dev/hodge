import { existsSync } from 'fs';
import fs from 'fs/promises';
import path from 'path';
import { ToolchainService } from './toolchain-service.js';
import type { RawToolResult } from '../types/toolchain.js';
import { isToolResultSuccessful } from '../types/toolchain.js';

/**
 * Ship record data structure
 * HODGE-356: Replaced shipChecks with qualityResults (RawToolResult[])
 * HODGE-341.2: Added commit tracking for toolchain file scoping
 */
export interface ShipRecordData {
  feature: string;
  timestamp: string;
  issueId: string | null;
  pmTool: string | null;
  validationPassed: boolean;
  qualityResults: RawToolResult[];
  commitMessage: string;
  // Commit tracking for toolchain file scoping (HODGE-341.2)
  buildStartCommit?: string; // First commit when build started
  hardenStartCommit?: string; // First commit when harden started
  shipCommit?: string; // Commit SHA when shipped
}

/**
 * Metadata backup data structure
 */
export interface MetadataBackup {
  projectManagement?: string;
  session?: string;
  context?: string;
}

/**
 * ShipService - Testable business logic for ship operations
 *
 * HODGE-356: Refactored to use ToolchainService for quality gates.
 * Eliminates hardcoded npm commands, returns RawToolResult[] directly.
 * Commands check success flags only, AI interprets error details.
 */
export class ShipService {
  private toolchainService: ToolchainService;

  constructor(cwd: string = process.cwd(), toolchainService?: ToolchainService) {
    this.toolchainService = toolchainService ?? new ToolchainService(cwd);
  }

  /**
   * Run all quality gates using toolchain
   * HODGE-356: Returns RawToolResult[] directly (no conversion)
   * HODGE-359.1: Added feature parameter to scope validation to buildStartCommit
   * @param feature - Feature name for scoping file checks (uses buildStartCommit from ship-record.json)
   * @param options - Quality gate options
   * @returns RawToolResult[] - Raw tool results from toolchain
   */
  async runQualityGates(
    feature?: string,
    options: { skipTests?: boolean } = {}
  ): Promise<RawToolResult[]> {
    // HODGE-359.1: Use 'feature' scope when feature provided to check files since buildStartCommit
    const scope = feature ? 'feature' : 'all';
    const results = await this.toolchainService.runQualityChecks(scope, feature);

    // Handle skipTests option by marking test results as skipped
    if (options.skipTests) {
      return results.map((r) =>
        r.type === 'testing'
          ? { ...r, skipped: true, reason: 'Tests skipped via --skip-tests flag' }
          : r
      );
    }

    return results;
  }

  /**
   * Generate ship record data
   * HODGE-356: Uses RawToolResult[] instead of shipChecks
   * @param params - Ship record parameters
   * @returns ShipRecordData - Ship record object
   */
  generateShipRecord(params: {
    feature: string;
    issueId: string | null;
    pmTool: string | null;
    validationPassed: boolean;
    qualityResults: RawToolResult[];
    commitMessage: string;
  }): ShipRecordData {
    return {
      feature: params.feature,
      timestamp: new Date().toISOString(),
      issueId: params.issueId,
      pmTool: params.pmTool,
      validationPassed: params.validationPassed,
      qualityResults: params.qualityResults,
      commitMessage: params.commitMessage,
    };
  }

  /**
   * Generate release notes markdown
   * HODGE-356: Uses RawToolResult[] instead of shipChecks
   * @param params - Release notes parameters
   * @returns string - Release notes markdown
   */
  generateReleaseNotes(params: {
    feature: string;
    issueId: string | null;
    qualityResults: RawToolResult[];
  }): string {
    const { feature, issueId, qualityResults } = params;
    const date = new Date().toLocaleDateString();

    // Count results by type
    const testResults = qualityResults.filter((r) => r.type === 'testing');
    const lintResults = qualityResults.filter((r) => r.type === 'linting');
    const typeCheckResults = qualityResults.filter((r) => r.type === 'type_checking');

    // Determine status for each category
    let testsStatus: string;
    if (testResults.length === 0) {
      testsStatus = '⚠️ Not Configured';
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Boolean OR for .every() logic
    } else if (testResults.every((r) => isToolResultSuccessful(r))) {
      testsStatus = '✅ Passing';
    } else {
      testsStatus = '❌ Failed';
    }

    let lintStatus: string;
    if (lintResults.length === 0) {
      lintStatus = '⚠️ Not Configured';
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Boolean OR for .every() logic
    } else if (lintResults.every((r) => isToolResultSuccessful(r))) {
      lintStatus = '✅ Passing';
    } else {
      lintStatus = '❌ Failed';
    }

    let typeCheckStatus: string;
    if (typeCheckResults.length === 0) {
      typeCheckStatus = '⚠️ Not Configured';
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Boolean OR for .every() logic
    } else if (typeCheckResults.every((r) => isToolResultSuccessful(r))) {
      typeCheckStatus = '✅ Passing';
    } else {
      typeCheckStatus = '❌ Failed';
    }

    return `## ${feature}

${issueId ? `**PM Issue**: ${issueId}\n` : ''}**Shipped**: ${date}

### What's New
- ${feature} implementation complete
- Full test coverage
- Production ready

### Quality Metrics
- Tests: ${testsStatus}
- Type Checking: ${typeCheckStatus}
- Linting: ${lintStatus}
- Total Checks: ${qualityResults.length}
`;
  }

  /**
   * Backup metadata files for rollback
   * @param feature - Feature name (unused but kept for API consistency)
   * @returns MetadataBackup - Backup data
   */
  async backupMetadata(_feature: string): Promise<MetadataBackup> {
    const backup: MetadataBackup = {};

    // Backup project management file
    const pmPath = path.join('.hodge', 'project_management.md');
    if (existsSync(pmPath)) {
      backup.projectManagement = await fs.readFile(pmPath, 'utf-8');
    }

    // Backup session file
    const sessionPath = path.join('.hodge', '.session');
    if (existsSync(sessionPath)) {
      backup.session = await fs.readFile(sessionPath, 'utf-8');
    }

    // Backup context file
    const contextPath = path.join('.hodge', 'context.json');
    if (existsSync(contextPath)) {
      backup.context = await fs.readFile(contextPath, 'utf-8');
    }

    return backup;
  }

  /**
   * Restore metadata files from backup
   * @param feature - Feature name (unused but kept for API consistency)
   * @param backup - Backup data to restore
   */
  async restoreMetadata(_feature: string, backup: MetadataBackup): Promise<void> {
    // Restore project management file
    if (backup.projectManagement) {
      const pmPath = path.join('.hodge', 'project_management.md');
      await fs.writeFile(pmPath, backup.projectManagement);
    }

    // Restore session file
    if (backup.session) {
      const sessionPath = path.join('.hodge', '.session');
      await fs.writeFile(sessionPath, backup.session);
    }

    // Restore context file
    if (backup.context) {
      const contextPath = path.join('.hodge', 'context.json');
      await fs.writeFile(contextPath, backup.context);
    }
  }

  /**
   * Read ship-record.json for a feature
   * HODGE-341.2: Helper for reading commit tracking data
   * @param feature - Feature name
   * @returns ShipRecordData or null if doesn't exist
   */
  async readShipRecord(feature: string): Promise<ShipRecordData | null> {
    const shipRecordPath = path.join('.hodge', 'features', feature, 'ship-record.json');

    if (!existsSync(shipRecordPath)) {
      return null;
    }

    try {
      const content = await fs.readFile(shipRecordPath, 'utf-8');
      return JSON.parse(content) as ShipRecordData;
    } catch {
      return null;
    }
  }

  /**
   * Write or update ship-record.json for a feature
   * HODGE-356: Updated to use qualityResults instead of shipChecks
   * @param feature - Feature name
   * @param updates - Partial updates to apply
   */
  async updateShipRecord(feature: string, updates: Partial<ShipRecordData>): Promise<void> {
    const featureDir = path.join('.hodge', 'features', feature);
    const shipRecordPath = path.join(featureDir, 'ship-record.json');

    // Read existing record or create new one
    let record: ShipRecordData;
    const existing = await this.readShipRecord(feature);

    if (existing) {
      // Update existing record
      record = { ...existing, ...updates };
    } else {
      // Create new minimal record (will be fully populated during ship)
      record = {
        feature,
        timestamp: new Date().toISOString(),
        issueId: null,
        pmTool: null,
        validationPassed: false,
        qualityResults: [],
        commitMessage: '',
        ...updates,
      };
    }

    // Ensure feature directory exists
    await fs.mkdir(featureDir, { recursive: true });

    // Write updated record
    await fs.writeFile(shipRecordPath, JSON.stringify(record, null, 2));
  }

  /**
   * Validate ship prerequisites (hardening and validation results)
   * @param feature - Feature name
   * @param skipTests - Whether to skip prerequisite checks
   * @returns Object with validation status
   */
  async validateShipPrerequisites(
    feature: string,
    skipTests: boolean
  ): Promise<{
    hardenDirExists: boolean;
    buildDirExists: boolean;
    validationPassed: boolean;
    shouldContinue: boolean;
  }> {
    const featureDir = path.join('.hodge', 'features', feature);
    const hardenDir = path.join(featureDir, 'harden');
    const buildDir = path.join(featureDir, 'build');

    const hardenDirExists = existsSync(hardenDir);
    const buildDirExists = existsSync(buildDir);

    // Check validation results from hardening
    let validationPassed = false;
    const validationFile = path.join(hardenDir, 'validation-results.json');

    if (existsSync(validationFile)) {
      try {
        const results = JSON.parse(await fs.readFile(validationFile, 'utf-8')) as RawToolResult[];
        // All non-skipped checks must have errorCount === 0 (or success for legacy)
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Boolean OR for .every() logic
        validationPassed = results.every((r) => isToolResultSuccessful(r));

        if (!validationPassed && !skipTests) {
          return {
            hardenDirExists,
            buildDirExists,
            validationPassed,
            shouldContinue: false,
          };
        }
      } catch {
        // Could not read validation results, continue anyway
      }
    }

    return {
      hardenDirExists,
      buildDirExists,
      validationPassed,
      shouldContinue: true,
    };
  }

  /**
   * Load PM integration details (issue ID)
   * @param feature - Feature name
   * @returns Object with PM tool and issue ID
   */
  async loadPMIntegration(feature: string): Promise<{
    pmTool: string | null;
    issueId: string | null;
  }> {
    const featureDir = path.join('.hodge', 'features', feature);
    const pmTool = process.env.HODGE_PM_TOOL ?? null;
    const issueIdFile = path.join(featureDir, 'issue-id.txt');
    let issueId = null;

    if (existsSync(issueIdFile)) {
      issueId = (await fs.readFile(issueIdFile, 'utf-8')).trim();
    }

    return { pmTool, issueId };
  }

  /**
   * Create git commit with rollback on failure
   * @param commitMessage - Commit message to use
   * @param feature - Feature name for rollback
   * @param metadataBackup - Backup data for rollback
   * @returns Whether commit was successful
   */
  async createShipCommit(
    commitMessage: string,
    feature: string,
    metadataBackup: MetadataBackup
  ): Promise<{ success: boolean; error?: Error }> {
    try {
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);

      // Stage all changes including metadata updates
      await execAsync('git add -A');

      // Create commit with the generated message
      await execAsync(
        `git commit -m "${commitMessage.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`
      );

      return { success: true };
    } catch (error) {
      // Rollback metadata changes on commit failure
      await this.restoreMetadata(feature, metadataBackup);

      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * Check if all quality gates passed
   * @param qualityResults - Quality check results
   * @param skipTests - Whether tests were skipped
   * @returns Whether ready to ship
   */
  checkQualityGatesPassed(qualityResults: RawToolResult[], skipTests: boolean): boolean {
    // Debug: Log each result to understand failures
    qualityResults.forEach((r) => {
      const passed = isToolResultSuccessful(r);
      if (!passed) {
        console.error(
          `❌ Quality gate failed: ${r.type}:${r.tool} - skipped=${r.skipped} success=${isToolResultSuccessful(r)}`
        );
      }
    });
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Boolean OR for .every() logic
    const allPassed = qualityResults.every((r) => isToolResultSuccessful(r));
    return allPassed || skipTests;
  }

  /**
   * Get quality results categorized by type
   * @param qualityResults - All quality results
   * @returns Categorized results
   */
  categorizeQualityResults(qualityResults: RawToolResult[]): {
    testResults: RawToolResult[];
    lintResults: RawToolResult[];
    typeCheckResults: RawToolResult[];
    testsPassed: boolean;
    lintPassed: boolean;
    typeCheckPassed: boolean;
  } {
    const testResults = qualityResults.filter((r) => r.type === 'testing');
    const lintResults = qualityResults.filter((r) => r.type === 'linting');
    const typeCheckResults = qualityResults.filter((r) => r.type === 'type_checking');

    return {
      testResults,
      lintResults,
      typeCheckResults,
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Boolean OR for .every() logic
      testsPassed: testResults.every((r) => isToolResultSuccessful(r)),
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Boolean OR for .every() logic
      lintPassed: lintResults.every((r) => isToolResultSuccessful(r)),
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Boolean OR for .every() logic
      typeCheckPassed: typeCheckResults.every((r) => isToolResultSuccessful(r)),
    };
  }

  /**
   * Learn patterns from shipped code (optional feature)
   * @param feature - Feature name
   * @returns Learning result or null if failed
   */
  async learnPatternsFromShippedCode(feature: string): Promise<unknown> {
    try {
      const { PatternLearner } = await import('../lib/pattern-learner.js');
      const learner = new PatternLearner();
      const learningResult = await learner.analyzeShippedCode(feature);
      return learningResult;
    } catch {
      return null;
    }
  }

  /**
   * Get commit message from interaction state or use default
   * @param feature - Feature name
   * @param issueId - PM issue ID (optional)
   * @param providedMessage - Message from options (optional)
   * @param noInteractive - Skip interaction state check
   * @returns Commit message and whether it was edited
   */
  async resolveCommitMessage(
    feature: string,
    issueId: string | null,
    providedMessage?: string,
    noInteractive?: boolean
  ): Promise<{ message: string; wasEdited: boolean }> {
    // Use provided message if available
    if (providedMessage) {
      return { message: providedMessage, wasEdited: false };
    }

    // Check interaction state unless disabled
    if (!noInteractive) {
      const { InteractionStateManager } = await import('./interaction-state.js');
      const interactionManager = new InteractionStateManager<{ edited?: string }>('ship', feature);
      const existingState = await interactionManager.load();

      if (existingState?.data.edited) {
        const message = existingState.data.edited;
        // Clean up interaction files after use
        await interactionManager.cleanup();
        return { message, wasEdited: true };
      }
    }

    // Fallback to default message
    const closesLine = issueId ? ` (closes ${issueId})` : '';
    const closesFooter = issueId ? `\n- Closes ${issueId}` : '';
    const message =
      `ship: ${feature}${closesLine}\n\n` +
      `- Implementation complete\n` +
      `- Tests passing\n` +
      `- Documentation updated` +
      closesFooter;

    return { message, wasEdited: false };
  }

  /**
   * Determine if shipping should continue based on prerequisites
   * Returns action: 'continue' | 'abort-not-built' | 'abort-not-hardened' | 'abort-validation-failed' | 'warn-no-validation'
   * @param prerequisites - Prerequisite validation results
   * @param skipTests - Whether tests are being skipped
   * @returns Action to take
   */
  determineShipAction(
    prerequisites: {
      hardenDirExists: boolean;
      buildDirExists: boolean;
      shouldContinue: boolean;
      validationPassed: boolean;
    },
    skipTests: boolean
  ): { action: string; warning?: string } {
    // Not built or hardened at all
    if (!prerequisites.buildDirExists) {
      return { action: 'abort-not-built' };
    }

    // Built but not hardened
    if (!prerequisites.hardenDirExists) {
      if (skipTests) {
        return { action: 'continue', warning: 'no-harden' };
      }
      return { action: 'abort-not-hardened' };
    }

    // Validation checks failed
    if (!prerequisites.shouldContinue) {
      return { action: 'abort-validation-failed' };
    }

    // Could not read validation results
    // HODGE-359.1: Simplified conditional - hardenDirExists is always true here due to line 530 check
    if (!prerequisites.validationPassed) {
      return { action: 'continue', warning: 'no-validation-data' };
    }

    return { action: 'continue' };
  }
}
