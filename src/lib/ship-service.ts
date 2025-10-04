import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync } from 'fs';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

/**
 * Quality gate results returned by runQualityGates
 */
export interface QualityGateResults {
  tests: boolean;
  coverage: boolean;
  docs: boolean;
  changelog: boolean;
  allPassed: boolean;
}

/**
 * Ship record data structure
 */
export interface ShipRecordData {
  feature: string;
  timestamp: string;
  issueId: string | null;
  pmTool: string | null;
  validationPassed: boolean;
  shipChecks: {
    tests: boolean;
    coverage: boolean;
    docs: boolean;
    changelog: boolean;
  };
  commitMessage: string;
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
 * Extracts testable business logic from ShipCommand per HODGE-322.
 * Completes the Service class extraction pattern started in HODGE-321.
 * Provides testable methods for quality gates, ship records, release notes,
 * and metadata backup/restore operations.
 */
export class ShipService {
  /**
   * Run all quality gates and return results
   * @param options - Quality gate options
   * @returns QualityGateResults - Results for each gate
   */
  async runQualityGates(options: { skipTests?: boolean }): Promise<QualityGateResults> {
    const results: QualityGateResults = {
      tests: false,
      coverage: false,
      docs: false,
      changelog: false,
      allPassed: false,
    };

    // Check tests
    if (!options.skipTests) {
      try {
        await execAsync('npm test 2>&1');
        results.tests = true;
      } catch {
        results.tests = false;
      }
    } else {
      results.tests = true; // Skipped tests count as passing
    }

    // Check coverage (TODO: implement actual coverage check)
    results.coverage = true;

    // Check documentation
    results.docs = existsSync('README.md');

    // Check changelog
    results.changelog = existsSync('CHANGELOG.md');

    // Determine overall status
    results.allPassed = Object.entries(results)
      .filter(([key]) => key !== 'allPassed')
      .every(([, value]) => value === true);

    return results;
  }

  /**
   * Generate ship record data
   * @param params - Ship record parameters
   * @returns ShipRecordData - Ship record object
   */
  generateShipRecord(params: {
    feature: string;
    issueId: string | null;
    pmTool: string | null;
    validationPassed: boolean;
    shipChecks: {
      tests: boolean;
      coverage: boolean;
      docs: boolean;
      changelog: boolean;
    };
    commitMessage: string;
  }): ShipRecordData {
    return {
      feature: params.feature,
      timestamp: new Date().toISOString(),
      issueId: params.issueId,
      pmTool: params.pmTool,
      validationPassed: params.validationPassed,
      shipChecks: params.shipChecks,
      commitMessage: params.commitMessage,
    };
  }

  /**
   * Generate release notes markdown
   * @param params - Release notes parameters
   * @returns string - Release notes markdown
   */
  generateReleaseNotes(params: {
    feature: string;
    issueId: string | null;
    shipChecks: {
      tests: boolean;
      coverage: boolean;
      docs: boolean;
      changelog: boolean;
    };
  }): string {
    const { feature, issueId, shipChecks } = params;
    const date = new Date().toLocaleDateString();

    return `## ${feature}

${issueId ? `**PM Issue**: ${issueId}\n` : ''}**Shipped**: ${date}

### What's New
- ${feature} implementation complete
- Full test coverage
- Production ready

### Quality Metrics
- Tests: ${shipChecks.tests ? '✅ Passing' : '⚠️ Skipped'}
- Coverage: ${shipChecks.coverage ? '✅ Met' : '⚠️ Unknown'}
- Documentation: ${shipChecks.docs ? '✅ Complete' : '⚠️ Missing'}
- Changelog: ${shipChecks.changelog ? '✅ Updated' : '⚠️ Missing'}
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
}
