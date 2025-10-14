# Exploration: HODGE-341.6

## Feature Overview
**Title**: Auto-Fix Workflow - Tools Fix Simple Issues, AI Assists with Complex
**PM Issue**: HODGE-341.6
**Type**: sub-feature (child of HODGE-341)
**Created**: 2025-10-13T23:02:19.378Z

## Problem Statement

Developers currently run quality checks during `hodge harden` and see dozens of formatting, style, and linting violations that tools can automatically fix. However, there's no automated way to apply these fixes - developers must manually run `eslint --fix`, `prettier --write`, etc. This creates friction in the hardening workflow and wastes time on issues that tools can resolve automatically.

We need to integrate tool auto-fix capabilities into the harden workflow so that simple issues (formatting, style, auto-fixable lint rules) are resolved before AI review begins. This allows AI to focus on complex issues (architecture, naming, business logic) that require judgment, while tools handle mechanical fixes.

## Context
- **Standards**: Loaded (suggested only)
- **Available Patterns**: 15
- **Parent Feature**: HODGE-341 (Hybrid Code Quality Review System)
- **Shipped Siblings**: HODGE-341.1 (Core Toolchain), HODGE-341.2 (Advanced Tools), HODGE-341.3 (Critical File Selection), HODGE-341.4 (Profile Compression), HODGE-341.5 (Multi-Language Support)
- **Similar Features**: HODGE-327.2, hodge-branding, HODGE-002

## Conversation Summary

### Scope & Requirements (From User)

**1. Multi-language support**: All tools that support auto-fix across all languages
- TypeScript/JavaScript: eslint --fix, prettier --write
- Python: black, ruff --fix
- Kotlin: ktlint -F
- Java: google-java-format

**2. Configuration approach**: Use `fix_command` field in toolchain.yaml
```yaml
commands:
  eslint:
    command: npx eslint ${files}
    fix_command: npx eslint ${files} --fix  # Presence indicates auto-fix support
```
CLI detects presence of `fix_command` to determine which tools support auto-fix.

**3. Timing**: Auto-fix runs at start of `/harden` workflow
- Before quality checks run
- Before AI review begins
- Cleans code first, then harden the cleaned code

**4. Scope**: Limited to **staged files only** (git staged area)
- Respects developer's intent (only fix what they're ready to commit)
- Prevents touching unrelated files
- Aligns with typical pre-commit workflow

**5. Auto-staging**: Modify staged files and automatically re-stage fixes (git add)
- Developer sees clean diff of what was auto-fixed
- Ready to commit without manual re-staging
- Transparent workflow

**6. CLI command structure**: Two options discussed
- Option A: `hodge harden HODGE-XXX --review` auto-fixes first, then generates manifests
- Option B: `/harden` calls `hodge harden HODGE-XXX --fix` before calling `hodge harden HODGE-XXX --review`

User leaned toward having explicit command distinction.

**7. Error handling**: Report failures to AI, let AI handle fixing
- If auto-fix fails or introduces errors, include in quality-checks.md
- AI reviews as part of normal issue analysis
- Don't block workflow on auto-fix failures

**8. Reporting**: Clear output showing what was fixed
```
🔧 Auto-fixing staged files...
  ✓ eslint --fix: Fixed 42 issues in 8 files
  ✓ prettier --write: Formatted 15 files
  ✓ black: Formatted 3 files
  ⚠️ ruff --fix: Fixed 12 issues, 3 issues remain

📊 Auto-fix summary: 72 issues fixed across 26 files

Proceeding to quality checks...
```

### Workflow Integration

**Current `/harden` flow**:
```
/harden HODGE-XXX
  ↓
hodge harden HODGE-XXX --review
  ↓ Runs quality checks
  ↓ Generates manifests (review-manifest.yaml, quality-checks.md, critical-files.md)
  ↓
AI reads manifests, reviews code
  ↓
User: "fix these issues"
  ↓
AI uses Edit tool to apply fixes
  ↓
hodge harden HODGE-XXX (validation)
```

**New `/harden` flow with auto-fix**:
```
/harden HODGE-XXX
  ↓
hodge harden HODGE-XXX --fix
  ↓ Gets staged files from git
  ↓ Runs fix_command for each tool on staged files
  ↓ Stages fixed files (git add)
  ↓ Reports what was fixed
  ↓
hodge harden HODGE-XXX --review
  ↓ Runs quality checks on cleaned code
  ↓ Generates manifests with remaining issues
  ↓
AI reads manifests, reviews code
  ↓
User: "fix these issues" (only complex issues remain)
  ↓
AI uses Edit tool for complex fixes
  ↓
hodge harden HODGE-XXX (validation)
```

### Technical Considerations

**Staged files detection**:
- Use `git diff --cached --name-only` to get staged files
- Filter to files matching tool's scope (e.g., only .ts/.tsx for eslint)
- Pass scoped file list to `fix_command` with `${files}` substitution

**Tool execution order**:
- Formatters first (prettier, black, google-java-format) - establish baseline formatting
- Linters second (eslint --fix, ruff --fix, ktlint -F) - fix issues that respect formatting

**Git integration**:
- Check for staged changes before starting
- Run fix commands with file list
- Stage modified files automatically (git add)
- Handle edge case: no staged files (skip auto-fix, proceed to review)

**Error scenarios**:
- Tool not installed: Skip with warning
- Tool fails to fix: Report in output, include stdout/stderr in quality-checks.md
- Git staging fails: Report error, don't block workflow

**Monorepo support**:
- Auto-fix runs per-project (same scoping as quality checks)
- Staged files filtered to each project's language
- Results aggregated across projects

## Implementation Approaches

### Approach 1: Explicit `--fix` Flag with Separate Command (Recommended)

**Description**: Add new `hodge harden HODGE-XXX --fix` command that runs auto-fix on staged files. The `/harden` slash command calls this before calling `--review`.

**Core Components**:

**1. AutoFixService** (`src/lib/auto-fix-service.ts`):
```typescript
export interface AutoFixResult {
  tool: string;
  filesProcessed: number;
  issuesFixed: number;
  success: boolean;
  stdout: string;
  stderr: string;
  duration: number;
}

export interface AutoFixReport {
  timestamp: string;
  stagedFiles: string[];
  results: AutoFixResult[];
  totalIssuesFixed: number;
  totalFilesModified: number;
  failures: AutoFixResult[];
}

export class AutoFixService {
  constructor(
    private toolchainService: ToolchainService,
    private gitService: GitService,
    private logger: CommandLogger
  ) {}

  /**
   * Run auto-fix on staged files for all tools with fix_command
   */
  async runAutoFix(featureId: string): Promise<AutoFixReport> {
    // 1. Get staged files from git
    const stagedFiles = await this.gitService.getStagedFiles();

    if (stagedFiles.length === 0) {
      this.logger.info('No staged files - skipping auto-fix');
      return this.emptyReport();
    }

    this.logger.info(`🔧 Auto-fixing ${stagedFiles.length} staged files...`);

    // 2. Load toolchain config
    const config = await this.toolchainService.loadConfig();

    // 3. Identify tools with fix_command
    const fixableTools = this.getFixableTools(config);

    if (fixableTools.length === 0) {
      this.logger.info('No tools with fix_command configured - skipping auto-fix');
      return this.emptyReport();
    }

    // 4. Run fix commands in order (formatters first, then linters)
    const results: AutoFixResult[] = [];
    const orderedTools = this.orderToolsByType(fixableTools);

    for (const tool of orderedTools) {
      const result = await this.runToolFix(tool, stagedFiles, config);
      results.push(result);

      // Report progress
      if (result.success) {
        this.logger.info(`  ✓ ${tool}: Fixed ${result.issuesFixed} issues in ${result.filesProcessed} files`);
      } else {
        this.logger.warn(`  ⚠️ ${tool}: ${result.stderr || 'Failed to apply fixes'}`);
      }
    }

    // 5. Stage modified files
    await this.restageFiles(stagedFiles);

    // 6. Generate report
    const report = this.generateReport(stagedFiles, results);
    this.logger.info(`\n📊 Auto-fix summary: ${report.totalIssuesFixed} issues fixed across ${report.totalFilesModified} files\n`);

    return report;
  }

  private async runToolFix(
    toolName: string,
    stagedFiles: string[],
    config: ToolchainConfig
  ): Promise<AutoFixResult> {
    const startTime = Date.now();

    try {
      // Get fix command from config
      const toolConfig = config.commands[toolName];
      if (!toolConfig.fix_command) {
        return this.createSkippedResult(toolName, 'No fix_command configured');
      }

      // Filter files to tool's scope
      const scopedFiles = this.filterFilesForTool(stagedFiles, toolName, config);
      if (scopedFiles.length === 0) {
        return this.createSkippedResult(toolName, 'No files match tool scope');
      }

      // Substitute ${files} in fix_command
      const command = toolConfig.fix_command.replace('${files}', scopedFiles.join(' '));

      // Execute fix command
      const result = await exec(command, {
        encoding: 'utf-8',
        maxBuffer: 10 * 1024 * 1024
      });

      // Parse output to count issues fixed (heuristic)
      const issuesFixed = this.parseIssuesFixed(result.stdout, toolName);

      return {
        tool: toolName,
        filesProcessed: scopedFiles.length,
        issuesFixed,
        success: result.exitCode === 0,
        stdout: result.stdout,
        stderr: result.stderr,
        duration: Date.now() - startTime
      };

    } catch (error) {
      return {
        tool: toolName,
        filesProcessed: 0,
        issuesFixed: 0,
        success: false,
        stdout: '',
        stderr: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime
      };
    }
  }

  private async restageFiles(stagedFiles: string[]): Promise<void> {
    // Re-stage files that were modified by auto-fix
    // This ensures git diff shows the auto-fixes clearly
    await this.gitService.stageFiles(stagedFiles);
  }

  private getFixableTools(config: ToolchainConfig): string[] {
    const tools: string[] = [];

    if (config.language === 'multi') {
      // Monorepo: collect fixable tools from all projects
      for (const project of config.projects) {
        for (const [toolName, toolConfig] of Object.entries(project.commands)) {
          if (toolConfig.fix_command) {
            tools.push(toolName);
          }
        }
      }
    } else {
      // Single language: collect from commands
      for (const [toolName, toolConfig] of Object.entries(config.commands)) {
        if (toolConfig.fix_command) {
          tools.push(toolName);
        }
      }
    }

    return [...new Set(tools)]; // Deduplicate
  }

  private orderToolsByType(tools: string[]): string[] {
    // Run formatters first, then linters
    const formatters = ['prettier', 'black', 'google-java-format', 'ktlint'];
    const linters = ['eslint', 'ruff'];

    const ordered: string[] = [];

    // Add formatters first
    for (const tool of tools) {
      if (formatters.includes(tool)) {
        ordered.push(tool);
      }
    }

    // Add linters second
    for (const tool of tools) {
      if (linters.includes(tool)) {
        ordered.push(tool);
      }
    }

    // Add any other tools
    for (const tool of tools) {
      if (!ordered.includes(tool)) {
        ordered.push(tool);
      }
    }

    return ordered;
  }

  private filterFilesForTool(
    files: string[],
    toolName: string,
    config: ToolchainConfig
  ): string[] {
    // Filter files based on tool's language/extensions
    // Example: eslint only runs on .ts/.tsx/.js/.jsx files
    const extensions = this.getToolExtensions(toolName);

    return files.filter(file =>
      extensions.some(ext => file.endsWith(ext))
    );
  }

  private getToolExtensions(toolName: string): string[] {
    // Map tools to file extensions they handle
    const extensionMap: Record<string, string[]> = {
      eslint: ['.ts', '.tsx', '.js', '.jsx'],
      prettier: ['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.yml', '.yaml'],
      black: ['.py'],
      ruff: ['.py'],
      ktlint: ['.kt', '.kts'],
      'google-java-format': ['.java']
    };

    return extensionMap[toolName] || [];
  }

  private parseIssuesFixed(output: string, toolName: string): number {
    // Heuristic parsing of tool output to count fixes
    // eslint: "✖ 42 problems (42 errors, 0 warnings)"
    // prettier: "3 files formatted"
    // black: "reformatted 5 files"

    const patterns: Record<string, RegExp> = {
      eslint: /(\d+) problems?/,
      prettier: /(\d+) files? formatted/,
      black: /reformatted (\d+) files?/,
      ruff: /Fixed (\d+) errors?/
    };

    const pattern = patterns[toolName];
    if (!pattern) return 0;

    const match = output.match(pattern);
    return match ? parseInt(match[1], 10) : 0;
  }

  private generateReport(
    stagedFiles: string[],
    results: AutoFixResult[]
  ): AutoFixReport {
    const totalIssuesFixed = results.reduce((sum, r) => sum + r.issuesFixed, 0);
    const totalFilesModified = results.reduce((sum, r) => sum + r.filesProcessed, 0);
    const failures = results.filter(r => !r.success);

    return {
      timestamp: new Date().toISOString(),
      stagedFiles,
      results,
      totalIssuesFixed,
      totalFilesModified,
      failures
    };
  }

  private emptyReport(): AutoFixReport {
    return {
      timestamp: new Date().toISOString(),
      stagedFiles: [],
      results: [],
      totalIssuesFixed: 0,
      totalFilesModified: 0,
      failures: []
    };
  }

  private createSkippedResult(toolName: string, reason: string): AutoFixResult {
    return {
      tool: toolName,
      filesProcessed: 0,
      issuesFixed: 0,
      success: true, // Skipped is not a failure
      stdout: reason,
      stderr: '',
      duration: 0
    };
  }
}
```

**2. GitService Enhancement** (`src/lib/git-service.ts`):
```typescript
export class GitService {
  // ... existing methods ...

  /**
   * Get list of staged files (files in git index)
   */
  async getStagedFiles(): Promise<string[]> {
    const result = await exec('git diff --cached --name-only', {
      encoding: 'utf-8'
    });

    return result.stdout
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  }

  /**
   * Stage files (add to git index)
   */
  async stageFiles(files: string[]): Promise<void> {
    if (files.length === 0) return;

    const command = `git add ${files.join(' ')}`;
    await exec(command, { encoding: 'utf-8' });
  }
}
```

**3. HardenCommand Enhancement** (`src/commands/harden.ts`):
```typescript
export class HardenCommand {
  private autoFixService: AutoFixService;

  constructor(/* existing dependencies */) {
    // ... existing initialization ...
    this.autoFixService = new AutoFixService(
      this.toolchainService,
      this.gitService,
      this.logger
    );
  }

  async execute(options: { feature: string; review?: boolean; fix?: boolean }): Promise<void> {
    const { feature, review, fix } = options;

    // Handle --fix flag
    if (fix) {
      await this.handleAutoFix(feature);
      return;
    }

    // Handle --review flag
    if (review) {
      await this.handleReviewMode(feature, hardenDir);
      return;
    }

    // Base validation mode (existing)
    await this.runValidation(feature);
  }

  private async handleAutoFix(feature: string): Promise<void> {
    this.logger.info(chalk.blue('🔧 Auto-Fix Mode: Running auto-fixable tools on staged files\n'));

    try {
      // Run auto-fix
      const report = await this.autoFixService.runAutoFix(feature);

      // Save report for reference
      const hardenDir = path.join('.hodge', 'features', feature, 'harden');
      await fs.mkdir(hardenDir, { recursive: true });
      await fs.writeFile(
        path.join(hardenDir, 'auto-fix-report.json'),
        JSON.stringify(report, null, 2)
      );

      // Check for failures
      if (report.failures.length > 0) {
        this.logger.warn(chalk.yellow(`\n⚠️ ${report.failures.length} tool(s) failed to auto-fix`));
        this.logger.info(chalk.gray('Failures will be included in quality check report\n'));
      }

      this.logger.info(chalk.green('✅ Auto-fix complete\n'));

    } catch (error) {
      this.logger.error(chalk.red('❌ Auto-fix failed'), { error: error as Error });
      throw error;
    }
  }

  // ... rest of existing methods ...
}
```

**4. Extend toolchain.yaml schema**:
```yaml
# .hodge/toolchain.yaml
version: "1.0"
language: typescript

commands:
  typescript:
    command: npx tsc --noEmit
    # No fix_command - type errors can't be auto-fixed

  eslint:
    command: npx eslint ${files}
    fix_command: npx eslint ${files} --fix  # Auto-fix support

  prettier:
    command: npx prettier --check ${files}
    fix_command: npx prettier --write ${files}  # Auto-fix support

  vitest:
    command: npx vitest run
    # No fix_command - test failures can't be auto-fixed

quality_checks:
  type_checking: [typescript]
  linting: [eslint]
  testing: [vitest]
  formatting: [prettier]
```

**5. Update `/harden` slash command** (`.claude/commands/harden.md`):

Add new Step 1:
```markdown
### Step 1: Auto-Fix Staged Files

Run auto-fix to clean up formatting and simple linting issues:

\`\`\`bash
hodge harden {{feature}} --fix
\`\`\`

This runs all tools with `fix_command` configured in toolchain.yaml on staged files only. Tools fix what they can automatically (formatting, style, auto-fixable lint rules).

**What gets auto-fixed**:
- Formatting (prettier, black, google-java-format)
- Import organization (eslint, ruff)
- Simple lint rules (eslint --fix, ruff --fix)
- Code style (ktlint -F)

**What remains for AI review**:
- Type errors (require code changes)
- Complexity violations (require refactoring)
- Architecture issues (require judgment)
- Naming improvements (require context)
- Business logic errors (require understanding)

After auto-fix completes, proceed to Step 2.

### Step 2: Run Review Mode (was Step 1)
\`\`\`bash
hodge harden {{feature}} --review
\`\`\`
```

Update Step 5 note:
```markdown
### Step 5: Conduct AI Code Review

**Note**: Auto-fix has already resolved mechanical issues (formatting, simple lint rules). Focus your review on:
- Issues tools couldn't fix (complexity, architecture, naming)
- Failures reported in auto-fix-report.json (if any)
- Business logic correctness
```

**6. Tool Registry Updates** (`src/bundled-config/tool-registry.yaml`):

Add `fix_command` to each tool that supports auto-fix:
```yaml
tools:
  eslint:
    languages: [typescript, javascript]
    detection:
      config_files: [.eslintrc.json, .eslintrc.js, eslint.config.js]
      dependencies: [eslint]
      path: [eslint]
    command_template: "npx eslint ${files}"
    fix_command: "npx eslint ${files} --fix"  # NEW
    version_command: "npx eslint --version"
    provides: [linting]

  prettier:
    languages: [typescript, javascript]
    detection:
      config_files: [.prettierrc, .prettierrc.json, prettier.config.js]
      dependencies: [prettier]
      path: [prettier]
    command_template: "npx prettier --check ${files}"
    fix_command: "npx prettier --write ${files}"  # NEW
    version_command: "npx prettier --version"
    provides: [formatting]

  black:
    languages: [python]
    detection:
      config_files: [pyproject.toml]
      dependencies: [black]
      path: [black]
    command_template: "black --check ${files}"
    fix_command_template: "black ${files}"  # NEW
    version_command: "black --version"
    provides: [formatting]

  ruff:
    languages: [python]
    detection:
      config_files: [ruff.toml, pyproject.toml]
      dependencies: [ruff]
      path: [ruff]
    command_template: "ruff check ${files}"
    fix_command_template: "ruff check ${files} --fix"  # NEW
    version_command: "ruff --version"
    provides: [linting, formatting]

  ktlint:
    languages: [kotlin]
    detection:
      config_files: [.editorconfig]
      dependencies: [ktlint]
      path: [ktlint]
    command_template: "ktlint ${files}"
    fix_command_template: "ktlint -F ${files}"  # NEW
    version_command: "ktlint --version"
    provides: [formatting, linting]

  google-java-format:
    languages: [java]
    detection:
      dependencies: [com.google.googlejavaformat:google-java-format]
      path: [google-java-format]
    command_template: "google-java-format --dry-run ${files}"
    fix_command_template: "google-java-format --replace ${files}"  # NEW
    version_command: "google-java-format --version"
    provides: [formatting]
```

**7. Update `hodge init` to include fix_command**:

When generating toolchain.yaml, include `fix_command` from tool registry's `fix_command_template`:
```typescript
// In InitCommand
const toolConfig = {
  command: tool.command_template,
  ...(tool.fix_command_template && { fix_command: tool.fix_command_template })
};
```

**Pros**:
- **Clear separation**: `--fix` runs auto-fix, `--review` runs quality checks
- **Explicit workflow**: `/harden` calls both in sequence
- **Debuggable**: Can run `hodge harden --fix` independently to test auto-fix
- **Configurable**: Users control which tools auto-fix via toolchain.yaml
- **Multi-language**: Works across TypeScript, Python, Kotlin, Java
- **Staged files only**: Respects developer intent
- **Auto-stages fixes**: Transparent workflow, ready to commit
- **Error tolerant**: Failures don't block workflow, reported to AI

**Cons**:
- **Two commands**: Adds complexity to CLI interface (mitigated: slash command handles orchestration)
- **Git dependency**: Requires git for staged files (acceptable: Hodge already assumes git)

**When to use**: This is the recommended approach. Clean separation of concerns, explicit workflow, easy to test and debug.

### Approach 2: Integrated into `--review` (Auto-Fix First, Then Review)

**Description**: `hodge harden HODGE-XXX --review` automatically runs auto-fix before generating manifests. No separate `--fix` flag.

**Flow**:
```typescript
async handleReviewMode(feature: string, hardenDir: string): Promise<void> {
  // Step 1: Auto-fix (NEW)
  this.logger.info('🔧 Auto-fixing staged files...');
  const autoFixReport = await this.autoFixService.runAutoFix(feature);

  // Step 2: Quality checks (existing)
  this.logger.info('🔍 Running quality checks...');
  const qualityCheckResults = await this.hardenService.runQualityChecks(feature);

  // Step 3: Critical file selection (existing)
  // ... rest of existing review mode ...
}
```

**Pros**:
- **Simpler CLI**: No new flag, `--review` does everything
- **Fewer slash command steps**: `/harden` only calls one command

**Cons**:
- **Less explicit**: User doesn't control when auto-fix runs
- **Harder to debug**: Can't test auto-fix independently
- **Mixed responsibilities**: `--review` now does fixing AND reviewing
- **Less testable**: Auto-fix and review coupled in same code path

**Why rejected**: Violates single responsibility principle. `--review` should generate manifests, not modify code. Explicit `--fix` command is clearer.

### Approach 3: Pre-Commit Hook (Not CLI Command)

**Description**: Instead of CLI command, add auto-fix as a git pre-commit hook. Runs automatically when developer commits.

**Pros**:
- **Automatic**: No manual invocation needed
- **Standard practice**: Many projects use pre-commit hooks

**Cons**:
- **Not part of harden workflow**: Runs during commit, not during harden
- **User surprise**: Auto-fixes happen without explicit request
- **Harder to control**: Can't easily skip or configure per-commit
- **Outside Hodge scope**: Pre-commit hooks are git config, not Hodge feature
- **Doesn't integrate with AI review**: Separate workflow from `/harden`

**Why rejected**: Doesn't solve the problem. We need auto-fix integrated into harden workflow, not commit workflow.

## Recommendation

**Approach 1: Explicit `--fix` Flag with Separate Command** is strongly recommended because:

1. **Clear separation of concerns**: `--fix` modifies code, `--review` analyzes code
2. **Explicit workflow**: `/harden` orchestrates both steps clearly
3. **Independently testable**: Can test auto-fix without running full review
4. **User control**: Developer sees exactly when auto-fix runs
5. **Debuggable**: Failures in auto-fix don't affect review, and vice versa
6. **Multi-language support**: Leverages existing toolchain infrastructure from 341.1, 341.2, 341.5
7. **Configurable**: Users add/remove fix_command per tool in toolchain.yaml
8. **Error tolerant**: Failures reported but don't block workflow
9. **Staged files scope**: Respects developer intent, aligns with pre-commit workflow
10. **Auto-staging**: Transparent, ready to commit

The key insight: **Auto-fix is a separate concern from quality checking**. Tools that fix should run before tools that check. Keeping them as separate CLI commands maintains clean architecture and makes the workflow explicit.

## Test Intentions

Behavioral expectations for HODGE-341.6:

1. **Staged files detection**: `AutoFixService` gets staged files using `git diff --cached --name-only`

2. **No staged files**: When no files staged, auto-fix skips with informational message (not error)

3. **Tool filtering**: Auto-fix only runs tools with `fix_command` configured in toolchain.yaml

4. **File scoping**: Each tool only processes files matching its extensions (eslint → .ts/.tsx, black → .py, etc.)

5. **Execution order**: Formatters run first (prettier, black, google-java-format), then linters (eslint --fix, ruff --fix, ktlint -F)

6. **Auto-staging**: After fixes applied, modified files are automatically staged (git add)

7. **Report generation**: Auto-fix generates report with per-tool results (files processed, issues fixed, duration)

8. **Success reporting**: Console output shows summary of fixes per tool with ✓ or ⚠️ indicators

9. **Failure handling**: Failed tools logged with stderr, don't block workflow, included in auto-fix-report.json

10. **Multi-language support**: Works across TypeScript/JavaScript, Python, Kotlin, Java projects

11. **Monorepo support**: Auto-fix runs per-project, results aggregated across projects

12. **Tool registry integration**: `hodge init` includes `fix_command` from tool registry when generating toolchain.yaml

13. **Issue counting**: Parse tool output to count issues fixed (heuristic patterns per tool)

14. **CLI flag**: `hodge harden HODGE-XXX --fix` runs auto-fix mode

15. **Slash command integration**: `/harden` calls `hodge harden --fix` before `hodge harden --review`

16. **Report persistence**: Auto-fix report saved to `.hodge/features/HODGE-XXX/harden/auto-fix-report.json`

17. **Empty toolchain**: When no tools have `fix_command`, auto-fix skips with informational message

18. **Git availability**: Auto-fix requires git, fails gracefully if git not available (error message, don't crash)

## Decisions Decided During Exploration

1. ✓ **Multi-language scope**: All tools that support auto-fix across TypeScript, Python, Kotlin, Java

2. ✓ **Configuration approach**: Use `fix_command` field in toolchain.yaml, CLI detects presence for auto-fix capability

3. ✓ **Timing**: Auto-fix runs at start of `/harden` workflow, before quality checks and AI review

4. ✓ **Scope**: Limited to staged files only (git staged area)

5. ✓ **Auto-staging**: Modify files and automatically re-stage fixes (git add)

6. ✓ **CLI structure**: Explicit `hodge harden --fix` command, called by `/harden` before `--review`

7. ✓ **Error handling**: Report failures to AI via quality-checks.md, don't block workflow

8. ✓ **Reporting format**: Show per-tool results with ✓/⚠️ indicators, summary of total fixes

9. ✓ **Execution order**: Formatters first, then linters (ensures consistent baseline)

10. ✓ **File filtering**: Each tool only processes files matching its language/extensions

11. ✓ **Tool registry updates**: Add `fix_command_template` to all tools that support auto-fix

12. ✓ **Slash command workflow**: `/harden` calls `--fix` then `--review` sequentially

## Decisions Needed

**No decisions needed** - all design decisions were resolved during exploration conversation.

## Next Steps
- [ ] Proceed to `/build HODGE-341.6` with Approach 1
- [ ] Implement `AutoFixService` with staged file detection and fix command execution
- [ ] Enhance `GitService` with `getStagedFiles()` and `stageFiles()` methods
- [ ] Add `--fix` flag to `HardenCommand`
- [ ] Update tool registry with `fix_command_template` for all auto-fixable tools
- [ ] Update `/harden` slash command template to call `--fix` before `--review`
- [ ] Create smoke tests for auto-fix workflow
- [ ] Update CLAUDE.md to document auto-fix workflow

---
*Exploration completed: 2025-10-13*
*AI exploration based on conversational discovery*
