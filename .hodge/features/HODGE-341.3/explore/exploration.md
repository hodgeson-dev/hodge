# Exploration: HODGE-341.3

## Feature Overview
**Title**: Critical File Selection Algorithm for Risk-Based Code Review
**PM Issue**: HODGE-341.3
**Type**: sub-feature (child of HODGE-341)
**Created**: 2025-10-11T22:08:00Z

## Problem Statement

When hardening features, AI cannot efficiently review all changed files (could be 50-100 files in a typical feature). We need an algorithm that identifies the highest-risk files for deep AI review based on tool diagnostics, architectural impact, and change characteristics. The algorithm must integrate into the `hodge harden --review` workflow to provide comprehensive context (tool diagnostics + critical files + review manifest) before AI makes recommendations to the user.

## Context
- **Standards**: Loaded (suggested only in explore mode)
- **Available Patterns**: 12
- **Parent Feature**: HODGE-341 (Hybrid Code Quality Review System)
- **Shipped Siblings**: HODGE-341.1, HODGE-341.2
- **Related Features**: HODGE-333.4 (Review Tier Classifier), HODGE-334 (CLI-AI Separation)

## Conversation Summary

### Architectural Understanding

The `hodge harden` command has two distinct code paths:

**Path 1: `hodge harden {{feature}}`** (validation only)
- Runs validation checks (tests, lint, typecheck, build)
- Generates validation-results.json and harden-report.md
- Used AFTER AI has fixed issues to verify they're resolved

**Path 2: `hodge harden {{feature}} --review`** (analysis + context preparation)
- Analyzes changed files (git diff + line counts)
- Classifies into review tier (SKIP/QUICK/STANDARD/FULL)
- Generates review-manifest.yaml
- **SHOULD ALSO**: Run quality checks, generate quality-checks.md, run critical file selection, generate critical-files.md

**Key insight from discussion**: The `--review` path should generate ALL analysis artifacts so AI has complete context before making recommendations. This means moving quality checks execution from the base command into the `--review` path.

### Integration with /harden Slash Command

Current flow has AI calling `hodge harden --review` first, then later calling `hodge harden` for validation. But quality-checks.md was being generated in the second call, meaning AI didn't have tool diagnostics when making initial recommendations.

**Revised flow**:
1. `/harden` calls `hodge harden {{feature}} --review` once
2. CLI generates: review-manifest.yaml, quality-checks.md, critical-files.md
3. AI reads all three files + loads context per tier
4. AI synthesizes tool diagnostics + critical file deep analysis
5. AI writes ai-recommendations.md and presents to user
6. User approves/revises recommendations
7. AI fixes issues, writes ai-decisions.md
8. AI calls `hodge harden {{feature}}` to validate fixes

### Git Diff Scoping

Changed files must be scoped to the build/harden cycle, not the entire feature history. Use `buildStartCommit` from `.hodge/features/{{feature}}/ship-record.json` as the base commit.

**Fallback**: If ship-record.json missing or no buildStartCommit, fall back to all uncommitted changes (git diff HEAD).

This aligns with existing tracking in harden.ts:376-388 where buildStartCommit and hardenStartCommit are recorded.

### Import Fan-In Analysis

**Discovery**: Import fan-in (how many files import this file) is a strong signal for impact radius:
- File imported by 47 others = change affects many files = HIGH RISK
- File imported by 0 others = leaf file = LOW RISK

This is different from dependency-cruiser output, which focuses on architectural violations. Fan-in analysis identifies broadly-used infrastructure files that deserve extra review attention.

**Scope**: Analyze entire project (all files in src/) for accurate impact radius. Relatively cheap (one-time analysis per harden run, ~50-100 lines of code).

**Import resolution rules**:
- Count local project imports only (exclude node_modules)
- Include cross-package imports in monorepos
- Ignore circular imports (just count, no cycle detection)

### Severity Weighting

Tool output contains severity information in human-readable format. Use basic keyword matching to extract severity:
- "error", "blocker", "critical" → high score multiplier
- "warning", "warn" → medium score multiplier
- "info", "note" → low score multiplier

**Division of responsibility**:
- **CLI algorithm**: Surface files with most/highest-severity issues
- **AI judgment**: Prioritize fixes based on business context (e.g., "this blocker is in rarely-used code, but these warnings are in payment processing")

This basic approach is sufficient for HODGE-341.3. More sophisticated severity normalization can be added in future phases if needed.

### Critical Path Definition

**Inferred critical paths** (via import fan-in):
- Files with high fan-in are automatically considered critical
- No configuration needed, scales to any project

**Configured critical paths** (project-specific overrides):
- Add to `.hodge/toolchain.yaml` for business-critical or security-critical paths
- Examples: src/payments/, src/auth/, src/lib/*-service.ts

**Transparency**: AI recommendations should show both inferred and configured critical paths, explaining how they influenced scoring. This helps users understand prioritization and adjust configuration if needed.

### Top N File Cap

**Default**: 10 files for deep AI review (balances thoroughness with token budget)

**Configurable**: Add `max_critical_files` setting to `.hodge/toolchain.yaml` for larger reviews

**Beyond the cap**: AI can recommend additional `/review` commands for specific files or directories that didn't make the top N but still warrant attention.

### AI Artifact Files

Record the full AI decision-making process for learning and debugging:

**ai-recommendations.md** (generated BEFORE user interaction):
- Initial analysis based on quality-checks.md, critical-files.md, standards, principles, patterns, profiles
- Blockers (MUST FIX), Warnings (SHOULD FIX), Suggestions (OPTIONAL)
- Critical path impact analysis
- Recommended action plan

**ai-decisions.md** (generated AFTER user interaction):
- User feedback and approvals/modifications
- Final action plan with specific fixes applied
- Detailed changes made (diffs)
- Items deferred or skipped per user request

**Benefits**:
- Pattern recognition: See which issues AI catches most often
- False positives: Identify recommendations users frequently skip
- Algorithm tuning: Understand if critical file scoring works
- User preferences: Learn project-specific tolerances
- Audit trail: Understand why certain changes were made
- Future context: AI sessions can read past decisions

### Edge Cases Handled

1. **No buildStartCommit**: Fallback to uncommitted changes (git diff HEAD)
2. **Circular imports**: Count imports, ignore cycles (no detection logic needed)
3. **Top N cap**: Default 10, configurable via toolchain.yaml
4. **No quality check issues**: Let AI decide whether to review based on file characteristics (size, fan-in)
5. **Import resolution**: Only local project imports, include cross-package in monorepos, exclude node_modules

## Implementation Approaches

### Approach 1: Risk-Weighted Scoring with Import Impact Analysis (Recommended)

**Description**: Implement a comprehensive scoring algorithm that combines multiple risk factors, with import fan-in analysis as a primary architectural signal, integrated into the `hodge harden --review` code path.

**Core Components**:

1. **ImportAnalyzer Service** (`src/lib/import-analyzer.ts`):
   ```typescript
   export class ImportAnalyzer {
     /**
      * Analyze import fan-in across entire project
      * @returns Map of file path to import count
      */
     analyzeFanIn(projectRoot: string): Map<string, number> {
       const fanInMap = new Map<string, number>();

       // Read all source files
       const files = glob.sync('**/*.{ts,js,tsx,jsx}', {
         cwd: projectRoot,
         ignore: ['**/node_modules/**', '**/dist/**', '**/*.test.*', '**/*.spec.*']
       });

       for (const file of files) {
         const content = fs.readFileSync(path.join(projectRoot, file), 'utf-8');

         // Extract import statements
         const imports = this.extractImports(content);

         for (const importPath of imports) {
           // Resolve to absolute project path
           const resolved = this.resolveImportPath(importPath, file, projectRoot);

           if (resolved && this.isLocalImport(resolved, projectRoot)) {
             fanInMap.set(resolved, (fanInMap.get(resolved) || 0) + 1);
           }
         }
       }

       return fanInMap;
     }

     private extractImports(content: string): string[] {
       // Match: import ... from 'path'
       // Match: require('path')
       const importRegex = /(?:from|require\()\s*['"]([^'"]+)['"]/g;
       const imports: string[] = [];
       let match;

       while ((match = importRegex.exec(content)) !== null) {
         imports.push(match[1]);
       }

       return imports;
     }

     private resolveImportPath(importPath: string, fromFile: string, projectRoot: string): string | null {
       // Handle relative imports: ./foo, ../bar
       if (importPath.startsWith('.')) {
         const fromDir = path.dirname(path.join(projectRoot, fromFile));
         return path.relative(projectRoot, path.resolve(fromDir, importPath));
       }

       // Handle absolute imports: @/lib/foo, src/lib/foo
       // Resolve via tsconfig paths or package.json exports
       return this.resolveAbsoluteImport(importPath, projectRoot);
     }

     private isLocalImport(resolvedPath: string, projectRoot: string): boolean {
       // Exclude node_modules, dist, etc.
       return !resolvedPath.includes('node_modules') &&
              !resolvedPath.startsWith('..');
     }
   }
   ```

2. **SeverityExtractor Utility** (`src/lib/severity-extractor.ts`):
   ```typescript
   export type SeverityLevel = 'blocker' | 'critical' | 'warning' | 'info';

   export class SeverityExtractor {
     /**
      * Extract severity from tool output using keyword matching
      */
     extractSeverity(output: string): Map<SeverityLevel, number> {
       const counts = new Map<SeverityLevel, number>([
         ['blocker', 0],
         ['critical', 0],
         ['warning', 0],
         ['info', 0]
       ]);

       const lines = output.split('\n');

       for (const line of lines) {
         const lower = line.toLowerCase();

         if (lower.match(/\b(error|blocker|critical|fail)\b/)) {
           counts.set('blocker', counts.get('blocker')! + 1);
         } else if (lower.match(/\b(warn|warning)\b/)) {
           counts.set('warning', counts.get('warning')! + 1);
         } else if (lower.match(/\b(info|note|hint)\b/)) {
           counts.set('info', counts.get('info')! + 1);
         }
       }

       return counts;
     }
   }
   ```

3. **CriticalFileSelector Service** (`src/lib/critical-file-selector.ts`):
   ```typescript
   export interface FileScore {
     path: string;
     score: number;
     riskFactors: string[];
     linesChanged: number;
     importFanIn: number;
     severityCounts: Map<SeverityLevel, number>;
   }

   export interface CriticalFilesReport {
     topFiles: FileScore[];
     allFiles: FileScore[];
     inferredCriticalPaths: string[];
     configuredCriticalPaths: string[];
     algorithm: string;
   }

   export class CriticalFileSelector {
     constructor(
       private importAnalyzer: ImportAnalyzer,
       private severityExtractor: SeverityExtractor
     ) {}

     /**
      * Select critical files for AI review based on risk scoring
      */
     async selectCriticalFiles(
       changedFiles: ChangedFile[],
       qualityCheckResults: RawToolResult[],
       config: {
         maxFiles?: number;
         criticalPaths?: string[];
       }
     ): Promise<CriticalFilesReport> {
       const maxFiles = config.maxFiles || 10;

       // 1. Analyze import fan-in across project
       const fanInMap = this.importAnalyzer.analyzeFanIn(process.cwd());

       // 2. Identify inferred critical paths (high fan-in files)
       const inferredCriticalPaths = this.inferCriticalPaths(fanInMap);

       // 3. Score each changed file
       const scoredFiles: FileScore[] = changedFiles.map(file => {
         return this.scoreFile(
           file,
           fanInMap,
           qualityCheckResults,
           config.criticalPaths || [],
           inferredCriticalPaths
         );
       });

       // 4. Sort by score (highest first) and cap at maxFiles
       const sorted = scoredFiles.sort((a, b) => b.score - a.score);
       const topFiles = sorted.slice(0, maxFiles);

       return {
         topFiles,
         allFiles: sorted,
         inferredCriticalPaths,
         configuredCriticalPaths: config.criticalPaths || [],
         algorithm: 'risk-weighted-v1.0'
       };
     }

     private scoreFile(
       file: ChangedFile,
       fanInMap: Map<string, number>,
       qualityCheckResults: RawToolResult[],
       configuredPaths: string[],
       inferredPaths: string[]
     ): FileScore {
       let score = 0;
       const riskFactors: string[] = [];

       // Extract severity counts from quality check results
       const severityCounts = this.extractSeverityForFile(file.path, qualityCheckResults);
       const importFanIn = fanInMap.get(file.path) || 0;

       // Factor 1: Severity-weighted issues
       const blockerCount = severityCounts.get('blocker') || 0;
       const criticalCount = severityCounts.get('critical') || 0;
       const warningCount = severityCounts.get('warning') || 0;

       if (blockerCount > 0) {
         score += blockerCount * 100;
         riskFactors.push(`${blockerCount} blocker issue${blockerCount > 1 ? 's' : ''}`);
       }

       if (criticalCount > 0) {
         score += criticalCount * 75;
         riskFactors.push(`${criticalCount} critical issue${criticalCount > 1 ? 's' : ''}`);
       }

       if (warningCount > 0) {
         score += warningCount * 25;
         riskFactors.push(`${warningCount} warning${warningCount > 1 ? 's' : ''}`);
       }

       // Factor 2: Import fan-in (impact radius)
       if (importFanIn > 20) {
         score += importFanIn * 2;
         riskFactors.push(`high impact (${importFanIn} imports)`);
       } else if (importFanIn > 5) {
         score += importFanIn * 1;
         riskFactors.push(`medium impact (${importFanIn} imports)`);
       }

       // Factor 3: Lines changed
       if (file.linesChanged > 200) {
         score += 50;
         riskFactors.push(`large change (${file.linesChanged} lines)`);
       } else if (file.linesChanged > 100) {
         score += 25;
         riskFactors.push(`medium change (${file.linesChanged} lines)`);
       } else {
         score += file.linesChanged * 0.5;
       }

       // Factor 4: New files (higher risk)
       if (file.linesDeleted === 0 && file.linesAdded > 0) {
         score += 50;
         riskFactors.push('new file');
       }

       // Factor 5: Configured critical paths
       for (const criticalPath of configuredPaths) {
         if (this.matchesPath(file.path, criticalPath)) {
           score += 50;
           riskFactors.push(`critical path: ${criticalPath}`);
           break;
         }
       }

       // Factor 6: Inferred critical paths (high fan-in)
       if (inferredPaths.includes(file.path)) {
         riskFactors.push('inferred critical (high fan-in)');
       }

       // Factor 7: Test files (weight down)
       if (file.path.includes('.test.') || file.path.includes('.spec.')) {
         score = Math.max(0, score - 50);
         riskFactors.push('test file (lower priority)');
       }

       return {
         path: file.path,
         score: Math.round(score),
         riskFactors,
         linesChanged: file.linesChanged,
         importFanIn,
         severityCounts
       };
     }

     private inferCriticalPaths(fanInMap: Map<string, number>): string[] {
       // Files with >20 imports are considered critical infrastructure
       const threshold = 20;
       return Array.from(fanInMap.entries())
         .filter(([_, count]) => count > threshold)
         .map(([path, _]) => path)
         .sort((a, b) => (fanInMap.get(b) || 0) - (fanInMap.get(a) || 0));
     }

     private extractSeverityForFile(
       filePath: string,
       results: RawToolResult[]
     ): Map<SeverityLevel, number> {
       const counts = new Map<SeverityLevel, number>([
         ['blocker', 0],
         ['critical', 0],
         ['warning', 0],
         ['info', 0]
       ]);

       for (const result of results) {
         if (result.skipped) continue;

         // Check if tool output mentions this file
         const output = result.stdout + result.stderr;
         if (!output.includes(filePath)) continue;

         // Extract severity from lines mentioning this file
         const lines = output.split('\n').filter(line => line.includes(filePath));
         const fileOutput = lines.join('\n');

         const severities = this.severityExtractor.extractSeverity(fileOutput);

         for (const [level, count] of severities.entries()) {
           counts.set(level, counts.get(level)! + count);
         }
       }

       return counts;
     }

     private matchesPath(filePath: string, pattern: string): boolean {
       // Support glob patterns: src/payments/, src/lib/*-service.ts
       const globPattern = pattern.replace(/\*/g, '.*');
       const regex = new RegExp(globPattern);
       return regex.test(filePath);
     }
   }
   ```

4. **Report Generator** (`src/lib/critical-files-report-generator.ts`):
   ```typescript
   export class CriticalFilesReportGenerator {
     generateReport(report: CriticalFilesReport, timestamp: string): string {
       let markdown = `# Critical Files for Review\n\n`;
       markdown += `**Generated**: ${timestamp}\n`;
       markdown += `**Algorithm**: ${report.algorithm}\n`;
       markdown += `**Scope**: ${report.allFiles.length} files changed, top ${report.topFiles.length} selected for deep review\n\n`;

       // Scoring factors
       markdown += `## Scoring Factors\n\n`;
       markdown += `- Blocker issues: +100 points each\n`;
       markdown += `- Critical issues: +75 points each\n`;
       markdown += `- Warning issues: +25 points each\n`;
       markdown += `- Import fan-in: +2 points per import (high impact files)\n`;
       markdown += `- Lines changed: +0.5 points per line, bonus for large changes (>100 lines)\n`;
       markdown += `- New files: +50 points\n`;
       markdown += `- Critical path match: +50 points\n`;
       markdown += `- Test files: -50 points (lower priority)\n\n`;

       // Critical paths
       markdown += `## Critical Path Analysis\n\n`;

       if (report.inferredCriticalPaths.length > 0) {
         markdown += `**Inferred Critical Paths** (by import fan-in >20):\n`;
         report.inferredCriticalPaths.forEach(path => {
           markdown += `- ${path}\n`;
         });
         markdown += `\n`;
       }

       if (report.configuredCriticalPaths.length > 0) {
         markdown += `**Configured Critical Paths** (from .hodge/toolchain.yaml):\n`;
         report.configuredCriticalPaths.forEach(path => {
           markdown += `- ${path}\n`;
         });
         markdown += `\n`;
       }

       // Top N files
       markdown += `## Top ${report.topFiles.length} Critical Files\n\n`;
       markdown += `| Rank | Score | File | Risk Factors |\n`;
       markdown += `|------|-------|------|-------------|\n`;

       report.topFiles.forEach((file, index) => {
         markdown += `| ${index + 1} | ${file.score} | ${file.path} | ${file.riskFactors.join(', ')} |\n`;
       });

       markdown += `\n`;

       // All files table
       markdown += `## All Changed Files (${report.allFiles.length} total)\n\n`;
       markdown += `| File | Score | Included in Review |\n`;
       markdown += `|------|-------|-----------------|\n`;

       report.allFiles.forEach(file => {
         const included = report.topFiles.some(f => f.path === file.path);
         const rank = included ? report.topFiles.findIndex(f => f.path === file.path) + 1 : '-';
         markdown += `| ${file.path} | ${file.score} | ${included ? `✅ Yes (Rank ${rank})` : '❌ No'} |\n`;
       });

       markdown += `\n---\n`;
       markdown += `**Note**: Focus your deep review on the Top ${report.topFiles.length} files. Other files should receive basic checks only.\n`;

       return markdown;
     }
   }
   ```

5. **Integration with HardenCommand** (modify `src/commands/harden.ts:469-543`):
   ```typescript
   private async handleReviewMode(feature: string, hardenDir: string): Promise<void> {
     this.logger.info(chalk.blue('🔍 Review Mode: Analyzing changes and generating review manifest\n'));

     try {
       // 1. Get changed files from build commit to HEAD
       const shipRecord = await this.shipService.loadShipRecord(feature);
       const buildStartCommit = shipRecord?.buildStartCommit || 'HEAD';

       const gitAnalyzer = new GitDiffAnalyzer();
       const changedFiles = await gitAnalyzer.getChangedFiles(buildStartCommit);

       if (changedFiles.length === 0) {
         this.logger.info(chalk.yellow('⚠️  No changed files found'));
         return;
       }

       this.logger.info(chalk.green(`📄 Found ${changedFiles.length} changed files\n`));

       // 2. Run quality checks (MOVED FROM BASE COMMAND)
       this.logger.info(chalk.blue('🔍 Running quality checks...\n'));
       const qualityCheckResults = await this.hardenService.runQualityChecks(feature);

       // Generate quality-checks.md
       const qualityChecksReport = this.generateQualityChecksReport(qualityCheckResults);
       await fs.writeFile(path.join(hardenDir, 'quality-checks.md'), qualityChecksReport);
       this.logger.info(chalk.green('✓ Quality checks complete\n'));

       // 3. Run critical file selection
       this.logger.info(chalk.blue('🎯 Selecting critical files...\n'));

       const toolchainConfig = await this.loadToolchainConfig();
       const selector = new CriticalFileSelector(
         new ImportAnalyzer(),
         new SeverityExtractor()
       );

       const criticalFilesReport = await selector.selectCriticalFiles(
         changedFiles,
         qualityCheckResults,
         {
           maxFiles: toolchainConfig.max_critical_files || 10,
           criticalPaths: toolchainConfig.critical_paths || []
         }
       );

       // Generate critical-files.md
       const reportGen = new CriticalFilesReportGenerator();
       const criticalFilesMarkdown = reportGen.generateReport(
         criticalFilesReport,
         new Date().toISOString()
       );
       await fs.writeFile(path.join(hardenDir, 'critical-files.md'), criticalFilesMarkdown);

       this.logger.info(chalk.green(`✓ Selected ${criticalFilesReport.topFiles.length} critical files\n`));

       // 4. Classify changes into review tier (EXISTING)
       const classifier = new ReviewTierClassifier();
       const recommendation = classifier.classifyChanges(changedFiles);

       // 5. Generate review manifest (EXISTING)
       const manifestGen = new ReviewManifestGenerator();
       const manifest = manifestGen.generateManifest(feature, changedFiles, recommendation);

       const manifestPath = path.join(hardenDir, 'review-manifest.yaml');
       await fs.writeFile(manifestPath, yaml.dump(manifest));

       // 6. Summary
       this.logger.info(chalk.bold('Review Context Ready:'));
       this.logger.info(chalk.gray(`   review-manifest.yaml - Context files to load`));
       this.logger.info(chalk.gray(`   quality-checks.md - Tool diagnostics`));
       this.logger.info(chalk.gray(`   critical-files.md - Top ${criticalFilesReport.topFiles.length} files for deep review`));
       this.logger.info(chalk.green('\n✅ AI can now conduct comprehensive code review'));

     } catch (error) {
       this.logger.error(chalk.red(`❌ Failed to prepare review context`), { error: error as Error });
       throw error;
     }
   }
   ```

6. **Update toolchain.yaml schema** (documentation in `src/bundled-config/tool-registry.yaml`):
   ```yaml
   # Example .hodge/toolchain.yaml
   version: "1.0"
   language: typescript

   # Optional: Override critical file selection settings
   max_critical_files: 10  # Default: 10, increase for larger reviews
   critical_paths:
     - src/payments/      # Business-critical payment processing
     - src/auth/          # Security-critical authentication
     - src/lib/*-service.ts  # Core service pattern

   commands:
     typescript:
       command: npx tsc --noEmit
     # ... rest of commands
   ```

7. **Update /harden slash command template** (`.claude/commands/harden.md`):

   Add after Step 2 (Read Review Manifest):
   ```markdown
   ### Step 2.5: Read Quality Checks Report
   ```bash
   cat .hodge/features/{{feature}}/harden/quality-checks.md
   ```

   This contains raw tool diagnostics from all quality checks.

   ### Step 2.6: Read Critical Files Manifest
   ```bash
   cat .hodge/features/{{feature}}/harden/critical-files.md
   ```

   This shows which files the algorithm scored as highest risk based on:
   - Tool diagnostics (blockers, warnings)
   - Import fan-in (architectural impact)
   - Change size (lines modified)
   - Critical paths (configured + inferred)
   ```

   Update Step 5 (Conduct AI Code Review):
   ```markdown
   ### Step 5: Conduct AI Code Review

   **Synthesize all context**:
   - Tool diagnostics (from quality-checks.md)
   - Critical files (from critical-files.md)
   - Standards, principles, patterns, profiles (per tier)

   **Review strategy**:
   - **Deep Review** (Top N critical files): Architecture, naming, lessons-learned, business logic
   - **Tool-Based Review** (All files): Issues found by tools (from quality-checks.md)
   - **Basic Review** (Other changed files): Obvious standards violations only
   ```

   Add new Step 6 (Write AI Recommendations):
   ```markdown
   ### Step 6: Write AI Recommendations

   **IMPORTANT**: Before presenting to user, write your initial recommendations to file.

   Use the Write tool to create `.hodge/features/{{feature}}/harden/ai-recommendations.md`:

   ```markdown
   # AI Recommendations: {{feature}}

   **Generated**: [ISO timestamp]
   **Based on**: quality-checks.md, critical-files.md, standards, principles, patterns, profiles

   ## Analysis Summary

   **Tool Diagnostics**: [N] blockers, [N] warnings across [N] files
   **Critical Files**: [N] files scored, top issues in [file1, file2, file3]
   **Standards Review**: [N] violations found

   ## Recommended Actions

   ### Blockers (MUST FIX):
   1. **[file:line]** - [Issue description]
      - Severity: BLOCKER (from [tool])
      - Context: [Critical path/High fan-in/etc]
      - Fix: [Proposed fix]

   ### Warnings (SHOULD FIX):
   [... warnings ...]

   ### Suggestions (OPTIONAL):
   [... suggestions ...]

   ## Critical Path Impact Analysis

   Files reviewed by import fan-in:
   - [file] ([N] imports) - [N] issues → [PRIORITY]

   Files in configured critical paths:
   - [file] - [N] issues → [PRIORITY]

   ## Recommendation Summary

   I recommend fixing:
   - All [N] blockers (required for ship)
   - [N] of [N] warnings
   - Defer suggestions to future refactor
   ```
   ```

   Add new Step 7 (Present Recommendations to User):
   ```markdown
   ### Step 7: Present Recommendations to User

   Present a summary of your recommendations:

   ```
   ## Harden Recommendations for {{feature}}

   Based on:
   - Tool diagnostics (quality-checks.md)
   - Critical file analysis (critical-files.md)
   - Project standards, principles, patterns, profiles

   ### Summary:
   - 🚫 **[N] Blockers** (must fix before proceeding)
   - ⚠️ **[N] Warnings** (should address before ship)
   - 💡 **[N] Suggestions** (optional improvements)

   ### Top Issues:
   1. [Brief description of top blocker]
   2. [Brief description of second blocker]
   3. [Brief description of top warning]

   Would you like me to:
   a) Fix all blockers and warnings
   b) Fix only blockers
   c) Let you review/revise recommendations first
   d) Show me the full ai-recommendations.md file
   ```

   Wait for user response.
   ```

   Add new Step 8 (Apply Fixes and Record Decisions):
   ```markdown
   ### Step 8: Apply Fixes and Record Decisions

   Based on user approval:
   1. Apply fixes using Edit tool
   2. Explain each fix as you make it

   After all fixes applied, write ai-decisions.md:

   ```markdown
   # AI Decisions: {{feature}}

   **Generated**: [ISO timestamp]
   **User Approval**: [Summary of user feedback]

   ## User Feedback

   [Exact user response]

   ## Final Action Plan

   ### Actions Taken:
   1. ✅ Fixed [file:line] - [Description]
   2. ✅ Fixed [file:line] - [Description]
   3. ⏭️ Skipped [file:line] - [Reason per user request]

   ### Actions Deferred:
   - [Suggestion deferred]

   ## Changes Made

   ### [file]
   ```diff
   - old code
   + new code
   ```

   [Explanation of change]

   ## Validation Ready

   All approved fixes applied. Ready to run: `hodge harden {{feature}}`
   ```
   ```

**Pros**:
- **Comprehensive risk assessment**: Multiple factors contribute to scoring
- **Architectural awareness**: Import fan-in reveals impact radius
- **Transparent**: Shows inferred + configured critical paths, explains scoring
- **Configurable**: Users can tune max_critical_files and add project-specific critical paths
- **Integrated**: Fits cleanly into existing --review workflow
- **AI-friendly**: Generates markdown reports AI can easily interpret
- **Learning-enabled**: ai-recommendations.md and ai-decisions.md capture full decision process
- **Scales to any project**: Import analysis works regardless of project structure
- **Simple severity extraction**: Basic keyword matching, no complex parsing

**Cons**:
- **Import analysis overhead**: Must read all source files (mitigated: runs once per harden, relatively fast)
- **Keyword matching limitations**: May misclassify severity in some tool outputs (acceptable for initial version)
- **Configuration burden**: Users must add critical_paths if they want custom overrides (optional, works without)

**When to use**: This is the recommended approach for HODGE-341.3. It balances comprehensiveness with implementation complexity, provides clear value through import analysis, and integrates cleanly into the existing architecture.

### Approach 2: Simple Change-Based Scoring (No Import Analysis)

**Description**: Implement a simpler scoring algorithm based only on git diff data and tool diagnostics, without import analysis.

**Scoring formula**:
```typescript
fileScore =
  (blockerCount * 100) +
  (warningCount * 25) +
  (linesChanged * 0.5) +
  (isNewFile ? 50 : 0) +
  (matchesCriticalPath ? 50 : 0)  // Only configured paths
```

**Pros**:
- Simpler implementation (~50% less code)
- Faster execution (no import analysis)
- Still captures most high-risk files

**Cons**:
- **Missing architectural context**: Cannot identify broadly-used infrastructure files
- **No inferred critical paths**: Relies entirely on user configuration
- **Lower quality scoring**: File with 1 blocker but 50 dependents scores same as file with 1 blocker and 0 dependents

**Why rejected**: Import fan-in provides critical architectural context that change-based scoring cannot capture. A file touched by 47 other files deserves extra scrutiny regardless of change size.

### Approach 3: AI-Driven Selection (No CLI Algorithm)

**Description**: Skip algorithmic file selection entirely. Let AI read all changed files and quality checks, make its own judgment about which files need deep review.

**Flow**:
1. `hodge harden --review` generates quality-checks.md only
2. AI reads all changed files (from git diff) + quality checks
3. AI selects critical files ad-hoc during review

**Pros**:
- No algorithm implementation needed
- AI has full flexibility

**Cons**:
- **Token budget problem unsolved**: AI must read all 50-100 changed files to decide
- **Non-deterministic**: Different AI sessions might select different files
- **Not testable**: Cannot validate file selection logic
- **Violates CLI Architecture Standards**: "CLI Responsibility: Structure discovery, validation, and manifest building"

**Why rejected**: This doesn't solve the core problem HODGE-341.3 is meant to address (reducing AI token usage). Pre-filtering by CLI is essential.

## Recommendation

**Approach 1: Risk-Weighted Scoring with Import Impact Analysis** is strongly recommended because:

1. **Solves the token budget problem**: Reduces AI's workload from 100 files → 10 files
2. **Architectural awareness**: Import fan-in reveals infrastructure files that deserve extra scrutiny
3. **Transparent and configurable**: Shows reasoning, allows customization
4. **Integrated**: Fits into existing --review workflow cleanly
5. **Learning-enabled**: Captures AI decision-making for future improvements
6. **Scalable**: Works for any project size/structure

The import analysis overhead (~50-100 lines of code, one-time per harden run) is well worth the improved file selection quality.

## Test Intentions

Behavioral expectations for HODGE-341.3:

1. **Git diff scoping**: CriticalFileSelector uses buildStartCommit..HEAD range from ship-record.json, falls back to uncommitted changes if buildStartCommit missing

2. **Import fan-in analysis**: ImportAnalyzer reads all source files, counts local project imports (excludes node_modules), includes cross-package imports in monorepos

3. **Severity extraction**: SeverityExtractor uses keyword matching (error/blocker/critical/warning) on tool output to weight file scores

4. **Critical path matching**: Files matching configured patterns in toolchain.yaml critical_paths get +50 points

5. **Inferred critical paths**: Files with >20 import fan-in are identified as infrastructure and listed in report

6. **Top N capping**: Algorithm returns top N files by score (default 10, configurable via toolchain.yaml max_critical_files)

7. **critical-files.md generation**: Report shows ranked files with score, risk factors, import fan-in, and explains inferred + configured critical paths

8. **Quality checks in --review**: `hodge harden --review` runs ToolchainService quality checks and generates quality-checks.md

9. **ai-recommendations.md generation**: /harden slash command writes initial recommendations before user interaction

10. **ai-decisions.md generation**: /harden slash command writes final decisions after user approves and fixes applied

11. **Configured settings**: toolchain.yaml accepts optional max_critical_files (number) and critical_paths (string array)

12. **Edge case handling**:
    - Missing buildStartCommit → falls back to uncommitted changes
    - Circular imports → counted, not detected
    - No issues from tools → AI decides whether to review based on file characteristics
    - Test files → weighted down in scoring (-50 points)

## Decisions Decided During Exploration

1. ✓ **Git diff scope**: Use buildStartCommit from ship-record.json, fallback to uncommitted changes if missing

2. ✓ **Import fan-in analysis**: Analyze entire project (all src/ files) for accurate impact radius

3. ✓ **Severity weighting**: Basic keyword matching (error/blocker/critical/warning) from tool output - sufficient for surfacing high-risk files, AI refines with business context

4. ✓ **Critical paths**: Inferred from import fan-in (>20 imports = critical infrastructure) + configurable overrides in toolchain.yaml

5. ✓ **Quality checks execution**: Move from base `harden` command into `--review` path so AI has complete context before making recommendations

6. ✓ **AI artifact files**: Generate ai-recommendations.md (initial analysis before user interaction) and ai-decisions.md (final decisions after fixes applied) for learning and debugging

7. ✓ **Circular imports**: Count imports, ignore cycles (no cycle detection needed)

8. ✓ **Top N cap**: Default 10 files, configurable in toolchain.yaml via max_critical_files setting. AI can recommend additional `/review` for specific files/directories beyond the cap

9. ✓ **Import scope**: Only local project imports (exclude node_modules), include cross-package imports in monorepos

10. ✓ **No issues scenario**: Let AI decide whether to review based on file characteristics (size, fan-in) when quality checks pass

11. ✓ **Architectural integration**: `--review` path generates ALL analysis artifacts (review-manifest.yaml, quality-checks.md, critical-files.md) so AI has complete context upfront

12. ✓ **Transparency**: Show inferred and configured critical paths in report, explain how they influenced scoring

## Decisions Needed

**No decisions needed** - all design decisions were resolved during exploration conversation.

## Next Steps
- [ ] Use `/decide` if any decisions need formal recording
- [ ] Proceed to `/build HODGE-341.3` with Approach 1

---
*Exploration completed: 2025-10-11*
*AI exploration based on conversational discovery*
