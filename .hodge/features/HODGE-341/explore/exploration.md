# Exploration: HODGE-341

## Feature Overview
**PM Issue**: HODGE-341
**Type**: general
**Created**: 2025-10-09T19:07:29.042Z

## Problem Statement (User-Provided)

Refactor code quality checks in hardening and reviews to use hybrid approach with automated tools plus focused AI review

**Includes**: Multi-language toolchain configuration (originally HODGE-342) - leverage native build tools like package.json scripts and gradle tasks

## Context
- **Standards**: Loaded (suggested only)
- **Available Patterns**: 12

- **Similar Features**: HODGE-327.2, hodge-branding, HODGE-002
- **Relevant Patterns**: None identified

## Background (from HODGE-337 learnings)

During HODGE-337 implementation, we discovered a fundamental scalability problem with the current file-by-file AI review approach:

### The Problem
- **Token Limits**: AI attempting to read all 32 changed files (~50K-100K tokens) plus context exceeds practical limits
- **Large Codebases**: For directories with 100+ files or multi-directory reviews, comprehensive file-by-file review is impossible
- **Manual Duplication**: AI manually checking what automated tools already verify (type safety, style, complexity)

### Current Architecture Issues
1. AI reads every changed file and applies review profiles manually
2. No integration with existing quality tools (TypeScript compiler, ESLint, Vitest)
3. Review profiles contain rules that tools already enforce
4. Doesn't scale beyond ~30-50 files due to token constraints

### Key Insights from Discussion
1. AI was checking for issues that automated tools catch automatically - 80% of review criteria can be validated by tools, only 20% requires AI judgment (architecture, patterns, security)
2. **Leverage existing build systems** (package.json scripts, gradle tasks, Makefiles) instead of reinventing tool execution - developers already define quality standards in build scripts

## Implementation Approaches

### Approach 1: Hybrid Two-Phase Review (Recommended from HODGE-337)

**Phase 1 - Automated Tool Diagnostics** (comprehensive, automatic):
- TypeScript compiler (`tsc --noEmit`) - type safety, strict mode violations
- ESLint - code style, complexity, potential bugs
- Test runners (Vitest/Jest) - test results, coverage
- Build process - compilation errors, warnings

**Phase 2 - AI Review of Diagnostics + Critical Files** (focused, judgment-based):
- AI reviews diagnostics summary (~5K tokens)
- AI reads only critical files flagged by tier classifier
- AI applies review profiles for architecture, patterns, security
- AI generates findings report with context from diagnostics

**Benefits**:
- Scales to any codebase size (diagnostics are pre-aggregated)
- Tools check 80% of rules comprehensively
- AI adds value where tools can't (architecture, design, lessons-learned violations)
- Token efficient: ~45K tokens vs 70K-120K for manual file-by-file

**Implementation**:
```typescript
// In HardenService or new DiagnosticsService
async runQualityChecks(): Promise<DiagnosticsReport> {
  const [typeCheck, lint, tests] = await Promise.all([
    this.runTypeScript(),
    this.runESLint(),
    this.runTests()
  ]);

  return {
    summary: this.aggregateDiagnostics([typeCheck, lint, tests]),
    criticalFiles: this.identifyCriticalFiles(typeCheck, lint),
    passRate: this.calculatePassRate([typeCheck, lint, tests])
  };
}
```

### Approach 2: Profile-Based Tool Selection

**Concept**: Review profiles specify which tools enforce their rules

```yaml
# In review-profiles/languages/typescript-5.x.md frontmatter
enforced_by:
  - tool: tsc
    flags: --strict --noEmit
    checks: [type-safety, null-checking, any-usage]
  - tool: eslint
    config: .eslintrc.json
    checks: [complexity, naming]
ai_review_focus: [architecture, patterns, lessons-learned]
```

**Benefits**:
- Clear separation: tools for enforcement, AI for judgment
- Profile evolution: add tools as they become available
- Transparent to users: "TypeScript compiler enforces these 5 rules, AI reviews these 3 patterns"

**Challenges**:
- Requires updating all review profiles with tool mappings
- Tool configuration must match profile expectations

### Approach 3: Incremental File Review with Caching

**Concept**: Cache AI review results per file, only re-review changed files

**Benefits**:
- Reduces duplicate work across reviews
- Could work with current architecture

**Challenges**:
- Complex cache invalidation (file changed, but dependencies changed?)
- Doesn't solve the 100+ files problem
- Adds caching complexity without addressing root cause

## Tool Scope Limiting Strategy

### The Scope Problem

Different Hodge commands analyze different subsets of code:
- **`/harden`**: Only uncommitted changes (files in git working tree + staged)
- **`/review file`**: Single file specified by user
- **`/review directory`**: All files in specified directory
- **`/review recent --last N`**: Files changed in last N commits

**Challenge**: Most quality tools are designed to run on entire projects, not subsets.

### Tool Capabilities Analysis

| Tool | Supports File Args | Supports Directory Args | Project-Wide Only | Notes |
|------|-------------------|------------------------|-------------------|-------|
| **TypeScript (tsc)** | ✅ Yes | ✅ Yes | ⚠️  Better project-wide | Uses tsconfig.json, understands dependencies |
| **ESLint** | ✅ Yes | ✅ Yes | ❌ No | `eslint src/file.ts src/other.ts` |
| **eslint-plugin-sonarjs** | ✅ Yes | ✅ Yes | ❌ No | Works via ESLint |
| **Vitest** | ✅ Yes | ✅ Yes | ❌ No | `vitest run src/file.test.ts` |
| **Prettier** | ✅ Yes | ✅ Yes | ❌ No | `prettier --check file.ts` |
| **jscpd** | ✅ Yes | ✅ Yes | ⚠️  Better project-wide | Needs multiple files to detect duplication |
| **dependency-cruiser** | ❌ No | ❌ No | ✅ Yes | Analyzes entire dependency graph |
| **Semgrep** | ✅ Yes | ✅ Yes | ❌ No | `semgrep --config auto file.ts` |

### Proposed Solution: Hybrid Scoping Strategy

**Approach 1: File-Level Scoping** (fastest, less accurate)
```typescript
// /harden command
const uncommittedFiles = await git.getUncommittedFiles();
const filteredFiles = uncommittedFiles.filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));

// Run tools with file arguments
await exec(`eslint ${filteredFiles.join(' ')}`);
await exec(`npx tsc --noEmit ${filteredFiles.join(' ')}`);  // May miss type errors from dependencies
await exec(`semgrep --config auto ${filteredFiles.join(' ')}`);

// Skip project-wide tools
logger.warn('Skipping dependency-cruiser (requires full project analysis)');
```

**Approach 2: Smart Scoping** (recommended)
```typescript
interface ScopeStrategy {
  canScopeToFiles: boolean;
  requiresFullProject: boolean;
  gracefulDegradation: boolean;
}

const toolScoping: Record<string, ScopeStrategy> = {
  eslint: { canScopeToFiles: true, requiresFullProject: false, gracefulDegradation: false },
  tsc: { canScopeToFiles: true, requiresFullProject: false, gracefulDegradation: true },
  jscpd: { canScopeToFiles: true, requiresFullProject: false, gracefulDegradation: true },
  'dependency-cruiser': { canScopeToFiles: false, requiresFullProject: true, gracefulDegradation: false },
};

async function runScopedQualityChecks(scope: 'uncommitted' | 'file' | 'directory' | 'recent', files: string[]) {
  for (const [tool, strategy] of Object.entries(toolScoping)) {
    if (scope === 'uncommitted' && strategy.requiresFullProject) {
      // Skip project-wide tools for scoped analysis
      logger.info(`Skipping ${tool} (requires full project, run 'hodge quality' for full analysis)`);
      continue;
    }

    if (strategy.canScopeToFiles) {
      // Run on specific files
      await runTool(tool, files);
    } else {
      // Run on entire project
      await runTool(tool, []);
    }
  }
}
```

**Approach 3: Two-Tier Analysis** (most thorough)
```typescript
// Tier 1: Scoped (fast feedback on changed code)
await runScopedTools(uncommittedFiles);  // eslint, semgrep, tsc on specific files

// Tier 2: Project-wide (comprehensive but slower) - only if Tier 1 passes
if (scopedDiagnostics.blockers === 0) {
  await runProjectWideTools();  // dependency-cruiser, full tsc, jscpd
}
```

### Recommended Strategy

**For `/harden` (uncommitted changes)**:
1. **Always run scoped**: ESLint, Semgrep, Prettier on uncommitted files only
2. **Run TypeScript scoped with caveat**: `tsc` on specific files, but note "may miss cross-file type errors"
3. **Skip project-wide tools**: dependency-cruiser, jscpd (warn user to run full quality check before shipping)
4. **Alternative**: Add `--full` flag for project-wide analysis

**For `/review file|directory|recent`**:
1. **Run tools on specified scope**: All tools support file/directory arguments
2. **Include context files for TypeScript**: Use tsconfig.json to understand dependencies
3. **Skip dependency-cruiser**: Module graph analysis not meaningful for subset

**For new `hodge quality` command** (full project analysis):
1. **Run all tools project-wide**: No scoping, comprehensive analysis
2. **Called before `/ship`**: Ensures full quality check before release

### TypeScript-Specific Scoping Challenge

TypeScript's type checker needs context beyond the files being checked:

```bash
# ❌ Misses type errors from dependencies
tsc --noEmit src/file-a.ts

# ✅ Better: Use project references or full project
tsc --noEmit  # Checks all files, reports errors for uncommitted only
```

**Solution**: Run full `tsc --noEmit`, filter diagnostics to uncommitted files:

```typescript
async function runScopedTypeScript(uncommittedFiles: string[]): Promise<Diagnostic[]> {
  // Run full type check (understands all dependencies)
  const allDiagnostics = await exec('tsc --noEmit --pretty false --format json');

  // Filter diagnostics to uncommitted files only
  const scopedDiagnostics = allDiagnostics.filter(d =>
    uncommittedFiles.some(file => d.fileName.includes(file))
  );

  return scopedDiagnostics;
}
```

**Trade-off**: Runs full type check (slower) but accurate results

### Duplication Detection Scoping

jscpd needs multiple files to detect duplication:

```typescript
async function runScopedDuplication(uncommittedFiles: string[]): Promise<Diagnostic[]> {
  if (uncommittedFiles.length < 2) {
    return { skipped: true, reason: 'jscpd needs 2+ files to detect duplication' };
  }

  // Run jscpd on uncommitted files
  return await exec(`jscpd --format json ${uncommittedFiles.join(' ')}`);
}
```

**Limitation**: Won't catch duplication between uncommitted file and existing codebase

**Alternative**: Run jscpd project-wide, filter results to uncommitted files

### Build Script Scope Arguments

For tools wrapped in build scripts, pass file arguments:

```json
// package.json
{
  "scripts": {
    "hodge:lint": "eslint",
    "hodge:typecheck": "tsc --noEmit",
    "hodge:format:check": "prettier --check"
  }
}
```

Usage:
```bash
# Scoped execution
npm run hodge:lint -- src/file.ts src/other.ts

# Full project
npm run hodge:lint
```

Hodge CLI:
```typescript
async function runBuildScript(target: string, files?: string[]) {
  const fileArgs = files ? `-- ${files.join(' ')}` : '';
  return await exec(`npm run hodge:${target} ${fileArgs}`);
}
```

## Direct Tool Execution Strategy

### The Multi-Language Challenge

Different languages have different tools but same capabilities:

| Capability | TypeScript/JS | Python | Go | Kotlin/Java |
|------------|---------------|--------|-----|-------------|
| **Type Checking** | tsc | mypy, pyright | go vet | kotlinc -Xjsr305 |
| **Linting** | eslint | pylint, ruff | golangci-lint | ktlint, detekt |
| **Testing** | vitest, jest | pytest | go test | junit, kotest |
| **Formatting** | prettier | black, ruff | gofmt | ktfmt |

### Current Architecture Limitations

1. **Hardcoded TypeScript**: Current implementation assumes tsc, eslint, vitest
2. **No Discovery**: Can't auto-detect language and tools
3. **No Extensibility**: Adding Python support requires code changes
4. **Tool Fragmentation**: Each language ecosystem has 3-5 competing tools

### Why Direct Execution Instead of Build Script Integration

**Initial consideration**: Use build scripts (`npm run hodge:lint`, `./gradlew hodgeLint`)

**Problems with build script approach**:
1. **Script pollution**: Creates duplicate scripts alongside existing `lint`, `test`, `typecheck`
2. **Maintenance burden**: Users must keep `hodge:*` scripts in sync with their configs
3. **Zero-config violated**: Requires `hodge init` to create scripts before working
4. **File scoping complexity**: Passing file arguments varies by build system
5. **Configuration duplication**: Scripts wrap tools that already have config files

**Why direct execution is better**:
1. ✅ **Zero-config**: Works immediately, detects and runs tools directly
2. ✅ **No pollution**: No new scripts added to package.json/build.gradle
3. ✅ **Respects existing configs**: Uses `.eslintrc`, `tsconfig.json`, `vitest.config.ts`
4. ✅ **Smart scoping**: Hodge knows how to pass files to each tool
5. ✅ **Single source of truth**: Tool configs are authoritative
6. ✅ **Maintainable**: Hodge handles tool knowledge, users handle tool configs only

### Solution: Direct Tool Execution with Declarative Config

**Key Insight**: Tools already have CLIs and config systems. Hodge detects and runs them directly, with optional `.hodge/toolchain.yaml` for discovery and overrides.

```typescript
// Hodge detects and runs tools directly
class ToolchainService {
  async runQualityChecks(files?: string[]): Promise<DiagnosticReport> {
    const config = await this.loadToolchainConfig();  // .hodge/toolchain.yaml (required)

    const diagnostics = await Promise.all([
      this.runTypeChecking(config, files),
      this.runLinting(config, files),
      this.runTesting(config, files),
      this.runFormatting(config, files),
      this.runComplexityAnalysis(config, files),
      this.runDuplicationDetection(config, files),
      this.runArchitectureValidation(config, files),
    ]);

    return this.aggregateDiagnostics(diagnostics);
  }

  // Quality check methods use toolchain.yaml to determine which tool to run
  private async runLinting(config: ToolchainConfig, files?: string[]): Promise<Diagnostic[]> {
    // 1. Check for explicit override in .hodge/toolchain.yaml
    if (config.command_overrides?.linting) {
      return await this.executeTool(config.command_overrides.linting, files);
    }

    // 2. Use tools from quality_checks mapping
    const lintingTools = config.quality_checks?.linting || [];
    if (lintingTools.length === 0) {
      logger.info('No linting tool configured - skipping');
      return [];
    }

    const toolName = lintingTools[0];  // Use first configured tool
    const toolConfig = config.detected_tools[toolName];
    return await this.executeTool(toolConfig.command, files);
  }

  private async runTypeChecking(config: ToolchainConfig, files?: string[]): Promise<Diagnostic[]> {
    const tools = config.quality_checks?.type_checking || [];
    if (tools.length === 0) {
      logger.info('No type checking tool configured - skipping');
      return [];
    }

    const toolConfig = config.detected_tools[tools[0]];
    return await this.executeTool(toolConfig.command, files);
  }

  private async runComplexityAnalysis(config: ToolchainConfig, files?: string[]): Promise<Diagnostic[]> {
    const tools = config.quality_checks?.complexity || [];
    if (tools.length === 0) {
      logger.info('No complexity analysis tool configured - skipping');
      return [];
    }

    // Some check types may use multiple tools (e.g., eslint-plugin-sonarjs + gocyclo)
    const results = await Promise.all(
      tools.map(tool => {
        const toolConfig = config.detected_tools[tool];
        return this.executeTool(toolConfig.command, files);
      })
    );

    return results.flat();
  }

  // Helper to execute tool commands with file scoping
  private async executeTool(command: string, files?: string[]): Promise<Diagnostic[]> {
    const substituted = command.replace('${files}', files?.join(' ') || '.');
    const result = await exec(substituted);
    return this.parseDiagnostics(result);
  }

  private async loadToolchainConfig(): Promise<ToolchainConfig> {
    if (!await exists('.hodge/toolchain.yaml')) {
      throw new Error(
        'No .hodge/toolchain.yaml found. Run `hodge init` to set up your project.'
      );
    }
    return await readYaml('.hodge/toolchain.yaml');
  }
}
```

**Benefits**:
- **Zero Configuration**: Auto-detects tools, runs immediately
- **Declarative Discovery**: `.hodge/toolchain.yaml` documents tools in use
- **Respects Tool Configs**: Uses `.eslintrc`, `tsconfig.json`, etc. as single source of truth
- **Smart Scoping**: Hodge knows how to pass files to each tool appropriately
- **Flexible Overrides**: Optional custom commands for edge cases
- **No Script Pollution**: Doesn't add duplicate scripts to package.json

### Tool Detection

```typescript
interface ToolDetector {
  detect(): Promise<boolean>;
  run(files?: string[]): Promise<DiagnosticResult>;
  getVersion(): Promise<string>;
}

class EslintDetector implements ToolDetector {
  async detect(): Promise<boolean> {
    // Check if eslint is installed
    return await hasPackage('eslint') || await exists('.eslintrc.json') || await exists('.eslintrc.js');
  }

  async run(files?: string[]): Promise<DiagnosticResult> {
    const fileArgs = files ? files.join(' ') : '.';
    return await exec(`npx eslint ${fileArgs} --format=json`);
  }

  async getVersion(): Promise<string> {
    const result = await exec('npx eslint --version');
    return result.stdout.trim();
  }
}

// Similar implementations for: TypeScriptDetector, PrettierDetector, VitestDetector, etc.
```

### Language-Specific Tool Detection

**TypeScript/JavaScript**:
```typescript
const detectors = [
  new TypeScriptDetector(),    // tsconfig.json or typescript package
  new EslintDetector(),         // .eslintrc or eslint package
  new PrettierDetector(),       // .prettierrc or prettier package
  new VitestDetector(),         // vitest.config.ts or vitest package
  new JestDetector(),           // jest.config.js or jest package
];
```

**Python**:
```typescript
const detectors = [
  new MypyDetector(),           // mypy.ini or mypy package
  new PylintDetector(),         // .pylintrc or pylint package
  new BlackDetector(),          // pyproject.toml [tool.black] or black package
  new PytestDetector(),         // pytest.ini or pytest package
];
```

**Auto-detection process**:
```typescript
async function detectTools(): Promise<ToolchainConfig> {
  const detected: ToolchainConfig = {
    language: await detectLanguage(),
    tools: {}
  };

  for (const detector of getDetectorsForLanguage(detected.language)) {
    if (await detector.detect()) {
      detected.tools[detector.name] = {
        detected: true,
        version: await detector.getVersion(),
      };
    }
  }

  return detected;
}
```

### Three-Tier Execution Strategy

Hodge uses a three-tier fallback for running quality checks:

**Tier 1: Explicit override in `.hodge/toolchain.yaml`** (highest priority)
```yaml
commands:
  lint: npm run custom-lint  # User-specified command
```

**Tier 2: Auto-detected tool** (most common)
```typescript
if (await eslintDetector.detect()) {
  await exec('npx eslint .');
}
```

**Tier 3: Standard script fallback** (compatibility)
```typescript
if (await hasScript('lint')) {
  logger.info('Using existing lint script');
  await exec('npm run lint');
}
```

**Result**: Works zero-config for 90% of projects, flexible for 10%

### Toolchain Configuration File

**`.hodge/toolchain.yaml`** - ALWAYS created by `hodge init` for discoverability

**Purpose**:
1. **Discovery**: Documents which tools are in use
2. **Overrides**: Allows custom commands for edge cases
3. **Transparency**: Developers can see exactly how quality checks run

**Example** (TypeScript project):
```yaml
# .hodge/toolchain.yaml
version: "1.0"
language: typescript

# Auto-detected tools with their capabilities
detected_tools:
  typescript:
    version: 5.3.3
    provides: [type_checking]
    command: npx tsc --noEmit

  eslint:
    version: 8.57.0
    provides: [linting]
    command: npx eslint ${files} --format=json

  eslint-plugin-sonarjs:
    version: 0.25.0
    provides: [complexity, code_smells]
    command: null  # Runs via eslint

  prettier:
    version: 3.2.5
    provides: [formatting]
    command: npx prettier --check ${files}

  vitest:
    version: 1.5.0
    provides: [testing]
    command: npx vitest run --coverage

# Quality check type mapping (what runs for each check type)
quality_checks:
  type_checking: [typescript]
  linting: [eslint]
  testing: [vitest]
  formatting: [prettier]
  complexity: [eslint-plugin-sonarjs]  # Via eslint
  code_smells: [eslint-plugin-sonarjs]  # Via eslint
  duplication: []  # None detected
  architecture: []  # None detected
  maintainability: []  # Will be calculated from metrics

# Recommended missing tools
recommended:
  - name: jscpd
    provides: [duplication]
    install: npm install --save-dev jscpd

  - name: dependency-cruiser
    provides: [architecture]
    install: npm install --save-dev dependency-cruiser

# Optional: Override commands (initially empty)
command_overrides: {}
  # Example overrides:
  # type_checking: npm run check-types
  # linting: npm run custom-lint
```

**Example** (Python project):
```yaml
# .hodge/toolchain.yaml
version: "1.0"
language: python

# Auto-detected tools with their capabilities
detected_tools:
  mypy:
    version: 1.9.0
    provides: [type_checking]
    command: python -m mypy .

  pylint:
    version: 3.1.0
    provides: [linting, code_smells]
    command: python -m pylint src/ --output-format=json

  black:
    version: 24.3.0
    provides: [formatting]
    command: python -m black --check .

  pytest:
    version: 8.1.0
    provides: [testing]
    command: python -m pytest --cov

  radon:
    version: 6.0.1
    provides: [complexity, maintainability]
    command: radon cc . --json --min C  # Complexity
    additional_commands:
      maintainability: radon mi . --json --min B

# Quality check type mapping
quality_checks:
  type_checking: [mypy]
  linting: [pylint]
  testing: [pytest]
  formatting: [black]
  complexity: [radon]
  code_smells: [pylint]
  duplication: []  # None detected
  architecture: []  # None detected
  maintainability: [radon]  # Python has native MI!

# Recommended missing tools
recommended:
  - name: jscpd
    provides: [duplication]
    install: pip install jscpd

# Optional: Override commands (initially empty)
command_overrides: {}
```

### Multi-Language Projects (Monorepos)

```yaml
# .hodge/toolchain.yaml for monorepo
version: "1.0"
language: multi

projects:
  - path: packages/frontend
    language: typescript
    detected_tools:
      typescript:
        version: 5.3.3
        provides: [type_checking]
        command: npx tsc --noEmit

      eslint:
        version: 8.57.0
        provides: [linting]
        command: npx eslint ${files} --format=json

      eslint-plugin-sonarjs:
        version: 0.25.0
        provides: [complexity, code_smells]
        command: null  # Runs via eslint

      vitest:
        version: 1.5.0
        provides: [testing]
        command: npx vitest run --coverage

      prettier:
        version: 3.2.5
        provides: [formatting]
        command: npx prettier --check ${files}

    quality_checks:
      type_checking: [typescript]
      linting: [eslint]
      testing: [vitest]
      formatting: [prettier]
      complexity: [eslint-plugin-sonarjs]
      code_smells: [eslint-plugin-sonarjs]
      duplication: []
      architecture: []
      maintainability: []

    recommended:
      - name: jscpd
        provides: [duplication]
        install: npm install --save-dev jscpd
      - name: dependency-cruiser
        provides: [architecture]
        install: npm install --save-dev dependency-cruiser

  - path: services/api
    language: python
    detected_tools:
      mypy:
        version: 1.9.0
        provides: [type_checking]
        command: mypy ${files} --no-error-summary

      pytest:
        version: 8.1.0
        provides: [testing]
        command: pytest --json-report --json-report-file=pytest-report.json

      pylint:
        version: 3.1.0
        provides: [linting, code_smells]
        command: pylint ${files} --output-format=json

      black:
        version: 24.2.0
        provides: [formatting]
        command: black --check ${files}

      radon:
        version: 6.0.1
        provides: [complexity, maintainability]
        command: radon cc ${files} --json --min C
        additional_commands:
          maintainability: radon mi ${files} --json --min B

    quality_checks:
      type_checking: [mypy]
      linting: [pylint]
      testing: [pytest]
      formatting: [black]
      complexity: [radon]
      code_smells: [pylint]
      duplication: []
      architecture: []
      maintainability: [radon]

    recommended:
      - name: jscpd
        provides: [duplication]
        install: pip install jscpd
      - name: import-linter
        provides: [architecture]
        install: pip install import-linter

  - path: services/worker
    language: go
    detected_tools:
      go:
        version: 1.22.0
        provides: [type_checking, testing]
        command: go vet ./...
        additional_commands:
          test: go test ./... -v -json

      golangci-lint:
        version: 1.56.2
        provides: [linting, complexity, code_smells]
        command: golangci-lint run ${files} --out-format json

      gofmt:
        version: go1.22.0
        provides: [formatting]
        command: gofmt -l ${files}

      gocyclo:
        version: 0.8.0
        provides: [complexity]
        command: gocyclo -over 10 ${files}

    quality_checks:
      type_checking: [go]
      linting: [golangci-lint]
      testing: [go]
      formatting: [gofmt]
      complexity: [golangci-lint, gocyclo]
      code_smells: [golangci-lint]
      duplication: []
      architecture: []
      maintainability: []

    recommended:
      - name: jscpd
        provides: [duplication]
        install: go install github.com/kucherenko/jscpd
      - name: go-mod-graph-chart
        provides: [architecture]
        install: go install github.com/nikolaydubina/go-mod-graph-chart

    command_overrides: {}
```

## `hodge init` Toolchain Detection and Configuration

### No Build Scripts Needed

Unlike the initial design, `hodge init` does NOT create build scripts. Instead, it:
1. **Detects language and tools**
2. **Creates `.hodge/toolchain.yaml`** for discoverability
3. **Prompts to install missing tools** (optional)
4. **Documents detected setup**

### Tool Detection Process

```typescript
// InitService behavior
async function initializeToolchain() {
  // 1. Detect language
  const language = await detectLanguage();
  logger.info(`Detected language: ${language}`);

  // 2. Detect installed tools
  const detectors = getDetectorsForLanguage(language);
  const detectedTools: Record<string, string> = {};

  for (const detector of detectors) {
    if (await detector.detect()) {
      const version = await detector.getVersion();
      detectedTools[detector.name] = version;
      logger.success(`✓ Found ${detector.name} ${version}`);
    } else {
      logger.info(`  ${detector.name} not installed`);
    }
  }

  // 3. Create .hodge/toolchain.yaml with detected tools
  const toolchainConfig: ToolchainConfig = {
    version: "1.0",
    language,
    detected_tools: detectedTools,
    commands: {},  // Empty, user can add overrides
    additional_tools: [],
  };

  await writeYaml('.hodge/toolchain.yaml', toolchainConfig);
  logger.success('Created .hodge/toolchain.yaml');

  // 4. Identify recommended missing tools
  const recommended = getRecommendedTools(language);
  const missing = recommended.filter(t => !detectedTools[t]);

  if (missing.length > 0) {
    logger.warn('\nRecommended tools not installed:');
    for (const tool of missing) {
      logger.info(`  • ${tool}`);
    }

    const installCmd = getInstallCommand(language, missing);
    logger.info(`\nTo install: ${installCmd}`);

    // Optional: Prompt to install
    const shouldInstall = await prompt('Install missing tools? (y/N)');
    if (shouldInstall.toLowerCase() === 'y') {
      await exec(installCmd);
      // Re-detect after installation
      await this.initializeToolchain();
    }
  }

  return toolchainConfig;
}

function getRecommendedTools(language: string): string[] {
  switch (language) {
    case 'typescript':
      return ['typescript', 'eslint', 'eslint-plugin-sonarjs', 'prettier', 'vitest'];
    case 'python':
      return ['mypy', 'pylint', 'black', 'pytest', 'radon'];
    case 'go':
      return ['golangci-lint'];
    case 'rust':
      return [];  // Tools bundled with Rust
    default:
      return [];
  }
}

function getInstallCommand(language: string, tools: string[]): string {
  switch (language) {
    case 'typescript':
      return `npm install --save-dev ${tools.join(' ')}`;
    case 'python':
      return `pip install ${tools.join(' ')}`;
    case 'go':
      return `go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest`;
    default:
      return '';
  }
}
```

### User Experience

**Example 1: TypeScript project with tools already installed**

```bash
$ hodge init

✨ Initializing Hodge in TypeScript project...

Detected language: typescript

✓ Found typescript 5.3.3
✓ Found eslint 8.57.0
✓ Found prettier 3.2.5
✓ Found vitest 1.5.0
  eslint-plugin-sonarjs not installed

✅ Created .hodge/ directory structure
✅ Created .hodge/toolchain.yaml (documents 4 detected tools)

⚠️  Recommended tools not installed:
  • eslint-plugin-sonarjs

To install: npm install --save-dev eslint-plugin-sonarjs

📖 Tools are ready! Run 'hodge harden' or 'hodge quality' to verify setup
```

**Example 2: New Python project without tools**

```bash
$ hodge init

✨ Initializing Hodge in Python project...

Detected language: python

  mypy not installed
  pylint not installed
  black not installed
  pytest not installed
  radon not installed

✅ Created .hodge/ directory structure
✅ Created .hodge/toolchain.yaml

⚠️  Recommended tools not installed:
  • mypy
  • pylint
  • black
  • pytest
  • radon

To install: pip install mypy pylint black pytest radon

Install missing tools? (y/N): y

Installing tools...
✓ Successfully installed mypy 1.9.0
✓ Successfully installed pylint 3.1.0
✓ Successfully installed black 24.3.0
✓ Successfully installed pytest 8.1.0
✓ Successfully installed radon 6.0.1

✅ Updated .hodge/toolchain.yaml with detected tools

📖 Tools are ready! Run 'hodge quality' to verify setup
```

**Generated `.hodge/toolchain.yaml`**:

```yaml
version: "1.0"
language: typescript

# Auto-detected during hodge init
detected_tools:
  typescript: 5.3.3
  eslint: 8.57.0
  prettier: 3.2.5
  vitest: 1.5.0

# Optional: Override how tools are executed (initially empty)
commands: {}

# Optional: Additional tools beyond standard checks (initially empty)
additional_tools: []
```

**Benefits**:
1. ✅ **Zero script pollution**: No changes to package.json, build.gradle, etc.
2. ✅ **Discoverable**: Developers can open `.hodge/toolchain.yaml` to see what's configured
3. ✅ **Transparent**: Comments show default commands Hodge will use
4. ✅ **Flexible**: Easy to add overrides if needed
5. ✅ **Works immediately**: After init, `hodge harden` and `hodge quality` just work

## Expanded Tooling Analysis

### Tools That Can Replace AI Review Tasks

After analyzing available quality tools, we can delegate **~85% of review criteria** to automated tools:

#### **Static Analysis & Code Quality**
- **eslint-plugin-sonarjs**: Code smells, cognitive complexity (CLI-native)
  - Replaces: ~40% of AI manual checks (complexity, duplication, basic patterns)
  - Languages: JavaScript/TypeScript
  - Output: JSON reports with severity levels
  - License: LGPL-3.0 (CLI tool, no server required)
  - 30+ rules including cognitive complexity, code smells, anti-patterns

- **Dependency Cruiser**: Module dependency analysis, architectural boundaries
  - Replaces: ~20% of AI coupling/cohesion checks
  - Languages: JavaScript/TypeScript (primary use case)
  - Checks: Circular dependencies, forbidden imports, layering violations
  - License: MIT
  - Output: JSON format

#### **Security Scanning**
- **Semgrep**: Security patterns, custom rules
  - Replaces: ~15% of AI security checks
  - Languages: 30+ languages
  - Checks: SQL injection, XSS, hardcoded secrets, project-specific patterns

- **Snyk/npm audit**: Dependency vulnerabilities
  - Already integrated in Hodge pre-push hooks
  - Languages: Package manager dependent

#### **Duplication Detection**
- **jscpd**: Copy-paste detection across files
  - Replaces: ~10% of AI DRY violation checks
  - Languages: 150+ languages
  - Checks: Duplicated code blocks (configurable threshold)

#### **What AI Still Needs to Check (~15%)**
- ❌ **Semantic naming quality**: "handler" vs "processUserAuthentication"
- ❌ **Lessons-learned violations**: Project-specific patterns from `.hodge/lessons/`
- ❌ **Architectural intent**: Alignment with project principles
- ❌ **Business logic correctness**: Does this solve the right problem?
- ❌ **Cross-file patterns**: Is this the right place for this code?

### Multi-Language Tooling Strategy

**Comprehensive CLI Tools by Language** (no servers, all CLI-native):

| Language | Complexity & Code Smells | Duplication | Architecture/Dependencies | Maintainability Index | License |
|----------|-------------------------|-------------|---------------------------|----------------------|---------|
| **TypeScript/JS** | eslint-plugin-sonarjs | jscpd | dependency-cruiser | Calculate* | LGPL-3.0, MIT |
| **Python** | radon + pylint | jscpd | import-linter | radon mi ✅ | MIT |
| **Go** | golangci-lint | golangci-lint (dupl) | go mod graph + analysis | Calculate* | GPL-3.0 |
| **Java** | PMD + Checkstyle | PMD CPD | ArchUnit (test-based) | Calculate* | Apache-2.0 |
| **Kotlin** | detekt | jscpd | detekt (imports module) | Calculate* | Apache-2.0 |
| **Rust** | clippy | jscpd | cargo-modules | Calculate* | MIT/Apache-2.0 |
| **C/C++** | clang-tidy + cppcheck | jscpd | include-what-you-use | Calculate* | Apache-2.0 |
| **Ruby** | rubocop + reek | flay or jscpd | packwerk | Calculate* | MIT |
| **PHP** | phpstan | phpcpd | deptrac | Calculate* | MIT |

*Calculate = Hodge calculates from tool metrics using standard MI formula

**Key Insights**:
1. **jscpd is universal** - Works for 150+ languages (MIT license)
2. **Only Python has native MI** - radon provides built-in maintainability index
3. **All languages have complexity tools** - Native to each ecosystem
4. **Architecture validation varies** - TypeScript has dependency-cruiser, Python has import-linter, others use language-specific tools
5. **All tools are CLI-native** - No servers, safe for commercial use

### Maintainability Index Calculation

Since most languages don't provide built-in MI, Hodge will calculate it:

```typescript
// Based on SonarQube/Microsoft formula (public algorithm)
interface MaintainabilityMetrics {
  cyclomaticComplexity: number;  // From language-specific tool
  linesOfCode: number;            // From file analysis
  commentPercentage: number;      // From file analysis
  duplicatedLines: number;        // From jscpd
}

function calculateMaintainabilityIndex(metrics: MaintainabilityMetrics): number {
  // Microsoft's formula (adapted by SonarQube)
  const mi = Math.max(0,
    171 -
    5.2 * Math.log(metrics.cyclomaticComplexity) -
    0.23 * metrics.cyclomaticComplexity -
    16.2 * Math.log(metrics.linesOfCode) +
    50 * Math.sin(Math.sqrt(2.4 * metrics.commentPercentage))
  ) * 100 / 171;

  // Apply duplication penalty
  const dupPenalty = metrics.duplicatedLines / metrics.linesOfCode * 100;

  return Math.max(0, mi - dupPenalty);
}

function rateMaintenability(score: number): 'A' | 'B' | 'C' | 'D' | 'E' {
  if (score >= 80) return 'A';  // Excellent
  if (score >= 60) return 'B';  // Good
  if (score >= 40) return 'C';  // Fair
  if (score >= 20) return 'D';  // Poor
  return 'E';                    // Critical
}
```

**Data Sources**:
- Python: Uses `radon mi` directly (built-in)
- Other languages: Aggregate from language-specific complexity tools + jscpd

### Implementation Phases

#### **Phase 1: Leverage Existing Tools (TypeScript/JS)**
```yaml
# In .hodge/toolchain.yaml or package.json scripts
quality_checks:
  type_safety:
    command: tsc --noEmit
    parser: typescript-diagnostics

  linting:
    command: eslint . --format=json
    parser: eslint-json

  testing:
    command: vitest run --coverage --reporter=json
    parser: vitest-json

  security:
    command: npm audit --json
    parser: npm-audit-json

  formatting:
    command: prettier --check . --format=json
    parser: prettier-json
```

**AI Review Scope**: Reads diagnostics summary (~5K tokens) + critical files only

#### **Phase 2: Add High-Value CLI Tools**

**Important**: All tools are CLI-native with permissive licenses (MIT/Apache/LGPL) - no servers required, safe for commercial projects.

```yaml
quality_checks:
  # ... existing tools ...

  complexity_analysis:
    tool: eslint-plugin-sonarjs
    command: eslint . --format json
    parser: eslint-json
    license: LGPL-3.0
    checks: [cognitive_complexity, code_smells, duplicate_patterns]
    # 20+ rules including cognitive complexity, duplicate functions, code smells

  duplication_detection:
    tool: jscpd
    command: jscpd --format json --min-lines 10 --min-tokens 50 src/
    parser: jscpd-json
    license: MIT
    languages: 150+
    # Detects copy-paste code blocks across files

  architecture_validation:
    tool: dependency-cruiser
    command: dependency-cruiser --output-type json --config .dependency-cruiser.js
    parser: dependency-cruiser-json
    license: MIT
    checks: [circular_deps, forbidden_imports, layering_violations]

  security_patterns:
    tool: semgrep
    command: semgrep --config auto --json
    parser: semgrep-json
    license: LGPL-2.1
    languages: 30+
    # Auto-detects language and applies security rules
    # Can load custom rules from .hodge/semgrep-rules/

  framework_patterns:
    tool: semgrep
    command: semgrep --config .hodge/semgrep-rules/ --json
    parser: semgrep-json
    # Custom framework-specific anti-patterns (Prisma N+1, React hooks, etc.)
```

**AI Review Scope**: Reads aggregated diagnostics (~10K tokens) + only files flagged by tools

#### **Phase 3: Multi-Language Support**

All tools below are CLI-native with permissive licenses:

**Python Example:**
```yaml
language: python
quality_checks:
  type_safety:
    tool: mypy
    command: mypy . --strict --show-error-codes --json-report mypy-report
    parser: mypy-json
    license: MIT

  linting:
    tool: pylint
    command: pylint --output-format=json src/
    parser: pylint-json
    license: GPL-2.0
    # Alternative: ruff (MIT, faster but fewer checks)

  complexity_and_smells:
    tool: radon
    command: radon cc . --json --min C
    parser: radon-json
    license: MIT
    provides: [cyclomatic_complexity, code_smells]

  maintainability:
    tool: radon
    command: radon mi . --json --min B
    parser: radon-json
    license: MIT
    provides: maintainability_index_native  # ✅ Built-in!

  security_patterns:
    tool: semgrep
    command: semgrep --config auto --json
    parser: semgrep-json
    license: LGPL-2.1

  duplication:
    tool: jscpd
    command: jscpd --format json src/
    parser: jscpd-json
    license: MIT

  architecture_validation:
    tool: import-linter
    command: lint-imports --config .import-linter
    parser: import-linter-json
    license: BSD-2-Clause
    checks: [forbidden_imports, layer_violations, dependency_rules]
```

**Go Example:**
```yaml
language: go
quality_checks:
  comprehensive_linting:
    tool: golangci-lint
    command: golangci-lint run --out-format json
    parser: golangci-json
    license: GPL-3.0
    provides: [type_safety, complexity, code_smells, duplication]
    # Aggregates 50+ linters: gocyclo, gocognit, dupl, goconst, gocritic, etc.

  testing:
    tool: go test
    command: go test -v -coverprofile=coverage.out -json ./...
    parser: go-test-json
    license: BSD-3-Clause

  security_patterns:
    tool: semgrep
    command: semgrep --config auto --json
    parser: semgrep-json
    license: LGPL-2.1

  maintainability:
    tool: hodge-calculate
    method: calculate_from_golangci_metrics
    provides: maintainability_index
```

**Java Example:**
```yaml
language: java
quality_checks:
  complexity_and_smells:
    tool: pmd
    command: pmd check -d src/ -f json -R rulesets/java/quickstart.xml
    parser: pmd-json
    license: Apache-2.0
    provides: [complexity, code_smells, best_practices]

  style_and_complexity:
    tool: checkstyle
    command: checkstyle -f json -c checkstyle.xml src/
    parser: checkstyle-json
    license: LGPL-2.1

  duplication:
    tool: pmd-cpd
    command: pmd cpd --minimum-tokens 50 --files src/ --format json
    parser: pmd-cpd-json
    license: Apache-2.0

  security_patterns:
    tool: semgrep
    command: semgrep --config auto --json
    parser: semgrep-json
    license: LGPL-2.1

  maintainability:
    tool: hodge-calculate
    method: calculate_from_pmd_metrics
```

**Kotlin Example:**
```yaml
language: kotlin
quality_checks:
  complexity_and_smells:
    tool: detekt
    command: detekt --input src/ --report json:detekt-report.json
    parser: detekt-json
    license: Apache-2.0
    provides: [complexity, code_smells, style]
    # 200+ rules including complexity thresholds

  duplication:
    tool: jscpd
    command: jscpd --format json src/
    parser: jscpd-json
    license: MIT

  security_patterns:
    tool: semgrep
    command: semgrep --config auto --json
    parser: semgrep-json
    license: LGPL-2.1

  maintainability:
    tool: hodge-calculate
    method: calculate_from_detekt_metrics
```

**Rust Example:**
```yaml
language: rust
quality_checks:
  comprehensive_linting:
    tool: clippy
    command: cargo clippy --message-format json
    parser: cargo-clippy-json
    license: MIT/Apache-2.0
    provides: [complexity, code_smells, idiomatic_patterns]
    # 600+ lints including complexity and anti-patterns

  testing:
    tool: cargo-test
    command: cargo test --no-fail-fast -- --format json
    parser: cargo-test-json
    license: MIT/Apache-2.0

  security_audit:
    tool: cargo-audit
    command: cargo audit --json
    parser: cargo-audit-json
    license: MIT/Apache-2.0

  duplication:
    tool: jscpd
    command: jscpd --format json src/
    parser: jscpd-json
    license: MIT

  maintainability:
    tool: hodge-calculate
    method: calculate_from_clippy_metrics
```

**Ruby Example:**
```yaml
language: ruby
quality_checks:
  linting_and_complexity:
    tool: rubocop
    command: rubocop --format json
    parser: rubocop-json
    license: MIT
    provides: [complexity, style, code_smells]

  code_smells:
    tool: reek
    command: reek --format json src/
    parser: reek-json
    license: MIT
    # Specialized for smell detection: 20+ smell types

  duplication:
    tool: flay
    command: flay --fuzzy src/
    parser: flay-text
    license: MIT

  security_patterns:
    tool: semgrep
    command: semgrep --config auto --json
    parser: semgrep-json
    license: LGPL-2.1

  maintainability:
    tool: hodge-calculate
    method: calculate_from_rubocop_metrics
```

**C/C++ Example:**
```yaml
language: c_cpp
quality_checks:
  comprehensive_linting:
    tool: clang-tidy
    command: clang-tidy -checks='*' --format-style=json src/*.cpp
    parser: clang-tidy-json
    license: Apache-2.0
    provides: [complexity, readability, performance, safety]
    # 400+ checks

  additional_checks:
    tool: cppcheck
    command: cppcheck --enable=all --xml src/
    parser: cppcheck-xml
    license: GPL-3.0

  duplication:
    tool: jscpd
    command: jscpd --format json src/
    parser: jscpd-json
    license: MIT

  maintainability:
    tool: hodge-calculate
    method: calculate_from_clang_metrics
```

**PHP Example:**
```yaml
language: php
quality_checks:
  complexity_and_types:
    tool: phpstan
    command: phpstan analyse --error-format=json src/
    parser: phpstan-json
    license: MIT

  duplication:
    tool: phpcpd
    command: phpcpd --log-json=report.json src/
    parser: phpcpd-json
    license: BSD-3-Clause

  security_patterns:
    tool: semgrep
    command: semgrep --config auto --json
    parser: semgrep-json
    license: LGPL-2.1

  maintainability:
    tool: hodge-calculate
    method: calculate_from_phpstan_metrics
```

### Diagnostic Aggregation Format

All tools output normalized to this format:

```typescript
interface DiagnosticReport {
  tool: string;
  language: string;
  timestamp: string;
  summary: {
    total_issues: number;
    by_severity: {
      blocker: number;
      critical: number;
      major: number;
      minor: number;
      info: number;
    };
    pass_rate: number; // 0-100
  };
  issues: Array<{
    file: string;
    line?: number;
    column?: number;
    severity: 'blocker' | 'critical' | 'major' | 'minor' | 'info';
    rule: string;
    message: string;
    category: 'type-safety' | 'security' | 'complexity' | 'duplication' | 'style' | 'architecture';
  }>;
  critical_files: string[]; // Files with blocker/critical issues
}
```

### Critical File Selection Algorithm

**How are "critical files" chosen for AI deep review?**

AI cannot read all 100+ files, so we use a scoring algorithm to identify highest-risk files:

```typescript
class CriticalFileSelector {
  selectCriticalFiles(diagnostics, changedFiles, config): string[] {
    const scored = changedFiles.map(file => ({
      file,
      score: this.calculateCriticalityScore(file, diagnostics, config)
    }));

    // Sort by score, take top 10 (token budget limit)
    return scored.sort((a, b) => b.score - a.score)
                 .slice(0, 10)
                 .map(s => s.file);
  }

  private calculateCriticalityScore(file, diagnostics, config): number {
    let score = 0;

    // 1. Critical path files (src/commands/, src/lib/core/, .hodge/standards.md)
    if (config.critical_paths.some(p => file.startsWith(p))) {
      score += 1000;
    }

    // 2. Blocker/Critical issues from tools
    const fileIssues = this.getIssuesForFile(file, diagnostics);
    score += fileIssues.filter(i => i.severity === 'blocker').length * 500;
    score += fileIssues.filter(i => i.severity === 'critical').length * 200;

    // 3. High cognitive complexity
    score += fileIssues.filter(i => i.rule === 'cognitive-complexity').length * 100;

    // 4. Security issues
    score += fileIssues.filter(i => i.category === 'security').length * 150;

    // 5. Architectural violations
    score += fileIssues.filter(i => i.category === 'architecture').length * 100;

    // 6. New files (no git history) - need more scrutiny
    if (this.isNewFile(file)) score += 50;

    // 7. Large changes (>100 lines)
    if (this.getLinesChanged(file) > 100) score += 30;

    // 8. Test files are less critical
    if (file.includes('.test.') || file.includes('.spec.')) score *= 0.5;

    return score;
  }
}
```

**Example scoring** (HODGE-337 with 32 files):
- `src/lib/review-manifest-generator.ts`: Score 1130 (critical path + complexity + large) ✅
- `src/commands/harden.ts`: Score 1030 (critical path + large) ✅
- `src/lib/review-tier-classifier.smoke.test.ts`: Score 0 (test file) ❌
- Result: AI reads top 5-10 files, not all 32

### Scalability to 100+ Files - Clarification

**Claim**: "Can handle 100+ file reviews"

**What this means**:
- ✅ **Tools check ALL files comprehensively** (type safety, complexity, duplication, security)
- ✅ **AI reviews diagnostics for ALL files** (sees all tool findings)
- ✅ **AI deeply reviews top 10-15 critical files** (scoring algorithm)
- ⚠️  **AI does NOT read all 100 files** (impossible due to token limits)

**Token math for 100 files**:
- All files read: 100 × 2K = 200K tokens ❌ EXCEEDS LIMIT
- Tool-first approach: ~27K tokens ✅ CONSTANT (doesn't scale with file count)

**Why this works**:
1. Tools never miss patterns (comprehensive, 0 tokens)
2. AI sees all findings via diagnostics (aggregated, ~3K tokens)
3. AI focuses on highest-risk code (scoring algorithm caps at 10 files)
4. Matches human code review (seniors focus on high-risk areas, not every line)

**User control**:
```bash
# Standard: Top 10 critical files
hodge harden HODGE-341 --review

# Custom: Specify additional files
hodge harden HODGE-341 --review --files="src/lib/*.ts"
```

### Tool Findings → Fix Workflow

**How does the communication work?**

**Phase 1: Auto-Fix (Non-Interactive)**
```typescript
// Hodge auto-fixes what tools can fix
async runQualityChecks(): Promise<DiagnosticsReport> {
  // 1. Auto-fix simple issues
  await exec('eslint . --fix');        // Fixes style automatically
  await exec('prettier --write .');     // Fixes formatting automatically

  // 2. Run diagnostics (can't auto-fix complex issues)
  const diagnostics = await this.runDiagnostics();

  return diagnostics;
}
```

**Phase 2: AI Review (Interactive via Slash Command)**
```markdown
# In .claude/commands/harden.md

After tools run:
1. Tools auto-fixed 42 issues (style, formatting)
2. 15 issues remain (complexity, naming, architecture)
3. AI reviews diagnostics + critical files
4. AI generates report with findings

If user asks: "Please fix the issues"
→ AI uses Edit tool to implement fixes
→ Focuses on auto-fixable issues first
→ Suggests refactoring for complex issues
```

**Communication flow**:
```
Tools → JSON Diagnostics → Hodge CLI → Console Output
                                           ↓
                        AI reads diagnostics + critical files
                                           ↓
                        AI generates review report
                                           ↓
                        User: "Fix these issues"
                                           ↓
                        AI: Uses Edit tool to implement fixes
```

**What AI can auto-fix**:
- ✅ Import organization
- ✅ Variable naming (with user approval)
- ✅ Extract functions for complexity
- ⚠️  Complex refactoring (suggests approach, user decides)

### Custom Semgrep Rules for Framework Patterns

**Risk Assessment: MEDIUM-LOW (7/10 confidence)**

Semgrep excels at catching framework-specific anti-patterns:

```yaml
# .hodge/semgrep-rules/prisma-anti-patterns.yaml
rules:
  - id: prisma-n-plus-one
    pattern: |
      for (const $USER of $USERS) {
        await prisma.$MODEL.findMany({ where: { $FIELD: $USER.$ID } })
      }
    message: N+1 query detected - use include/select in parent query
    severity: ERROR
    languages: [typescript, javascript]

  - id: prisma-missing-transaction
    pattern: |
      await prisma.$MODEL.create(...)
      await prisma.$OTHER.create(...)
    message: Related writes should be wrapped in transaction
    severity: WARNING
    languages: [typescript, javascript]

# .hodge/semgrep-rules/react-anti-patterns.yaml
rules:
  - id: react-missing-deps
    pattern: |
      useEffect(() => {
        $FUNC($VAR)
      }, [])
    message: Missing dependency - add $VAR to deps array
    severity: WARNING
    languages: [typescript, javascript]

  - id: react-inline-function-render
    pattern: |
      <$COMPONENT onClick={() => $HANDLER()} />
    message: Inline function creates new reference on every render - extract or use useCallback
    severity: INFO
    languages: [typescript, javascript, tsx, jsx]

# .hodge/semgrep-rules/graphql-anti-patterns.yaml
rules:
  - id: graphql-no-dataloader
    pattern: |
      $RESOLVER: async ($PARENT, $ARGS, $CONTEXT) => {
        return await $MODEL.find({ $FIELD: $PARENT.$ID })
      }
    message: Potential N+1 query - use DataLoader for batch loading
    severity: WARNING
    languages: [typescript, javascript]
```

**Benefits**:
- Fast execution (<5 seconds)
- Catches 40-50% of framework anti-patterns
- Zero AI tokens
- Easy to extend with project-specific patterns

### Optimized AI Review Profiles

**Problem**: Current profiles are verbose (1,500-2,000 tokens each)

**Solution**: Compress profiles to YAML format for AI consumption

**Current Format** (1,500 tokens):
```markdown
## Error Handling
**Enforcement: SUGGESTED** | **Severity: WARNING**

All async operations should handle errors properly. Check for missing error handling in critical paths, empty catch blocks, and uncaught promise rejections.

**Guidance**: Empty catch blocks are code smells unless justified with comment. Error messages should be actionable (tell user what to do).
```

**Optimized Format** (~200 tokens):
```yaml
# .hodge/review-profiles/languages/typescript-5.x.yaml
version: "1.0.0"
language: typescript
applies_to: ["**/*.ts", "**/*.tsx"]

# Only rules needing AI judgment (Semgrep/ESLint handle patterns)
ai_rules:
  avoid_any:
    severity: warning
    check: any_type_usage
    except: [explore_phase, untyped_libs]
    suggest: unknown_or_proper_types

  naming_quality:
    severity: suggestion
    check: [vague_names, unclear_intent]
    flag: ["handler", "manager", "util", "helper", "data"]
    prefer: descriptive_action_names

  discriminated_unions:
    severity: suggestion
    use_for: [state_machines, result_types, variants]

  architectural_alignment:
    severity: warning
    check: [lessons_violations, pattern_misuse, srp_violations]

ai_focus:
  - semantic_naming_quality
  - architectural_alignment
  - lessons_learned_violations
  - framework_idiom_usage
  - cross_file_patterns
```

**Token Reduction**: 87% (200 tokens vs 1,500 tokens)

### Rule Distribution: Tools vs AI

| Rule Category | Tool (0 tokens) | AI (compressed) |
|---------------|-----------------|-----------------|
| **Type Safety** | TypeScript ✅ | - |
| **Linting/Style** | ESLint ✅ | - |
| **Complexity** | eslint-sonarjs ✅ | - |
| **Duplication** | jscpd ✅ | - |
| **Architecture/Dependencies** | dependency-cruiser ✅ | - |
| **Security Patterns** | Semgrep ✅ | - |
| **Framework Anti-Patterns** | Semgrep ✅ | - |
| **Magic Numbers** | ESLint ✅ | - |
| **Empty Catch Blocks** | ESLint ✅ | - |
| **Function Length** | ESLint ✅ | - |
| **Semantic Naming** | - | AI ✅ |
| **Architectural Alignment** | - | AI ✅ |
| **Lessons Learned** | - | AI ✅ |
| **Business Logic** | - | AI ✅ |
| **Cross-File Patterns** | - | AI ✅ |

**Result**: Tools handle 65-70% of checks, AI focuses on 30-35% requiring judgment

### Token Usage Comparison

**Current Approach (Manual File Reading)**:
- Read 32 files × ~2K tokens = ~64K tokens
- Load 4 review profiles × ~1,500 tokens = ~6K tokens
- AI analysis and report = ~3K tokens
- **Total: ~73K tokens**

**Optimized Approach (Tools + Compressed Profiles)**:
- Semgrep scan = 0 tokens (pre-AI, <5 sec)
- ESLint + sonarjs = 0 tokens (pre-AI, <10 sec)
- jscpd duplication = 0 tokens (pre-AI, <5 sec)
- dependency-cruiser = 0 tokens (pre-AI, <3 sec)
- Aggregated diagnostics summary = ~2K tokens
- Load 4 compressed profiles × ~200 tokens = ~800 tokens
- Read 5 critical files × ~2K tokens = ~10K tokens
- AI analysis focused on judgment = ~3K tokens
- **Total: ~15.8K tokens (78% reduction)**

For 100+ file reviews:
- **Current**: Impossible (200K+ tokens)
- **Optimized**: ~18K tokens (tools scan all, AI reviews summary + 10 critical files)

## Recommendation

**Approach 1 (Hybrid Two-Phase Review) with CLI-Native Tooling + Profile Compression** is recommended because:

1. **Solves Scalability**: Works for 10 files or 1000 files
2. **Optimal Division of Labor**:
   - Tools handle 65-70% of checks (patterns, complexity, duplication)
   - AI focuses on 30-35% requiring judgment (naming, architecture, lessons)
3. **Massive Token Reduction**: 78% fewer tokens (15.8K vs 73K)
4. **Fast Feedback**: Tools execute in <20 seconds total (pre-AI)
5. **Better Quality**: Tools never miss patterns, AI brings contextual judgment
6. **Framework Coverage**: Semgrep custom rules catch Prisma/React/GraphQL anti-patterns
7. **Commercial Safe**: All CLI-native tools with permissive licenses (MIT/Apache/LGPL)
8. **Multi-Language Ready**: Same pattern works for TypeScript, Python, Go, Kotlin, Rust
9. **Incremental Adoption**:
   - Phase 1: Existing tools (TypeScript, ESLint, Vitest)
   - Phase 2: Add CLI tools (eslint-sonarjs, jscpd, dependency-cruiser, semgrep)
   - Phase 3: Multi-language support
   - Phase 4: Compress AI profiles (87% token reduction)

## Decisions Needed

### Tool Detection and Execution

1. **Tool Detection Strategy**
   - Which detection methods? (package in devDependencies, config files, executables in PATH)
   - Priority order when multiple detection signals present?
   - How to handle tool version compatibility with review profiles?
   - Should we warn if detected version doesn't match recommended version?

2. **Toolchain Config Management**
   - Always create `.hodge/toolchain.yaml` on init for discoverability
   - Should `detected_tools` be read-only or allow manual edits?
   - How often to re-detect tools? (only on init, or periodically)?
   - Should we warn if toolchain.yaml is outdated?

3. **Tool Scope Limiting**
   - How do we run tools on subset of files (/harden = uncommitted, /review = specific files)?
   - Do tools support file/directory arguments? (eslint src/file.ts, tsc --project tsconfig.json)
   - How to handle tools that only work project-wide? (some tools require full context)
   - Should we use git diff to generate file list, then pass to tools?
   - Trade-off: Scoped analysis (faster) vs. missing cross-file issues (less accurate)

4. **Fallback Behavior**
   - If build system lacks a target, run tools directly or skip with warning?
   - Auto-detect and run tools (npx tsc --noEmit) or fail fast?
   - How verbose should fallback logging be (silent, info, verbose)?

5. **Multi-Language Projects**
   - One `.hodge/toolchain.yaml` with per-directory configs or auto-detect based on file locations?
   - How to handle polyglot files (TypeScript + Python in same directory)?
   - Run all language toolchains or only for changed files?

### Tool Integration

6. **Diagnostic Aggregation**
   - How do we normalize output from different tools (tsc JSON vs eslint JSON vs go test)?
   - Create universal DiagnosticResult format or preserve tool-specific details?
   - What information must be preserved (file, line, severity, message, rule ID)?
   - How do we handle tools that don't output JSON?

7. **Tool Availability**
   - What happens if tools aren't available (e.g., Python project without mypy)?
   - Auto-install missing tools or skip those checks with warning?
   - Should we validate tool versions match review profiles?
   - How do we handle version drift in monorepos?

8. **Semgrep Custom Rules**
   - Ship Hodge with default framework rules (Prisma, React, GraphQL, etc.)?
   - Allow users to add project-specific rules in `.hodge/semgrep-rules/`?
   - How do we version and maintain default rules as frameworks evolve?
   - Run Semgrep twice (auto rules + custom rules) or merge configs?

### AI Review Integration

9. **AI Profile Compression**
   - Migrate all profiles to compressed YAML format immediately or gradually?
   - Keep verbose .md files for human documentation, load .yaml for AI?
   - A/B test: Does AI perform worse with compressed profiles?
   - Provide conversion tool for users with custom profiles?

10. **AI Review Scope**
    - What triggers full AI review vs diagnostics-only?
    - Which files are "critical" enough to warrant AI file reading?
    - How do we balance token usage with review depth?
    - Should tier classifier consider tool findings when determining tier?

11. **Rule Distribution**
    - Clear documentation: "These rules are checked by ESLint, these by AI"?
    - If tool check fails, should AI still review that category?
    - How do we handle cases where both tool and AI flag same issue?

12. **Review Context Optimization**
    - Create `.hodge/review-context.yaml` for compressed project-specific guidance?
    - What goes in review-context.yaml vs. keeping in principles.md/standards.md?
    - Should lessons have an index or just load paths via manifest (HODGE-334 pattern)?
    - How do we balance token optimization with context richness?
    - Token target: ~500-800 tokens for review-context.yaml vs. 2,500+ for full principles.md?

### Implementation Planning

13. **Migration Path**
    - Support both old (verbose) and new (compressed) profiles during transition?
    - What's the upgrade path for existing features mid-development?
    - Do we need feature flags to control rollout?
    - Timeline: Can we ship Phase 1-2 without profile compression?

14. **Integration Points**
    - Should this live in HardenService, new DiagnosticsService, or BuildSystemService?
    - How does this integrate with existing ReviewManifestGenerator?
    - What's the CLI command structure (flags, output format)?
    - Separation of concerns: BuildSystemService for tool execution, DiagnosticsService for aggregation?

## What AI Needs for Judgment-Based Reviews

After tools handle 65-70% of mechanical checks, AI performs judgment-based reviews requiring project context. Following the HODGE-334 pattern (CLI identifies files, AI interprets content), here's what AI needs for each judgment category:

### 1. Semantic Naming Quality

**What AI checks**: "handler" vs "processUserAuthentication", vague names vs intention-revealing names

**Required context**:
- Project naming conventions (Services end in 'Service', Commands match CLI names)
- Good/bad examples from this codebase
- Domain-specific terminology

**Proposed solution**: Create `.hodge/review-context.yaml` with compressed guidance:

```yaml
semantic_naming:
  project_conventions:
    - pattern: "Services end in 'Service' (BuildSystemService, DiagnosticsService)"
    - pattern: "Commands match CLI names (HardenCommand, ExploreCommand)"
    - pattern: "Avoid generic names (handler, manager, util, helper)"

  good_examples:
    - "ProfileCompositionService" # Clear purpose
    - "CriticalFileSelector" # Describes what it selects
    - "ReviewManifestGenerator" # Action + output type

  bad_examples:
    - "handler" # Too generic
    - "processStuff" # "stuff" reveals unclear thinking
    - "doWork" # Meaningless verb
```

**Token cost**: ~100 tokens (vs. generic guidance already in review profiles)

**CLI responsibility**: Identify that `.hodge/review-context.yaml` exists, include in review manifest
**AI responsibility**: Read YAML, apply patterns to code being reviewed, suggest better names with project-specific rationale

### 2. Lessons-Learned Violations

**What AI checks**: Are we repeating mistakes from previous features?

**Required context**:
- `.hodge/lessons/*.md` files documenting what we learned
- Anti-patterns specific to this project
- References to feature IDs where lessons were learned

**Current approach works** (follows HODGE-334 pattern):

```typescript
// CLI builds manifest with lesson file paths
interface ReviewManifest {
  lessons: Array<{
    path: string;  // .hodge/lessons/HODGE-317.1-eliminate-hung-test-processes.md
    feature: string;
    precedence: number;
  }>;
}
```

**AI reads lessons naturally during review, cites them when relevant**:
- "⚠️  This spawns subprocess in test - violates lesson HODGE-317.1 (zombie processes)"
- "✅ Follows HODGE-334 pattern: CLI identifies files, AI interprets content"

**Token cost**: ~2K tokens (AI reads 5-10 most relevant lessons based on code being reviewed)

**Optional optimization**: Add lessons index to review-context.yaml:

```yaml
lessons_index:
  - id: HODGE-317.1
    anti_pattern: "Never spawn subprocesses in tests"
    reason: "Creates zombie processes that hang indefinitely"
    full_lesson: ".hodge/lessons/HODGE-317.1-eliminate-hung-test-processes.md"

  - id: HODGE-334
    pattern: "CLI identifies files, AI interprets content"
    reason: "Separation of concerns - CLI structure, AI content"
    full_lesson: ".hodge/lessons/HODGE-334-cli-ai-separation-of-concerns.md"
```

**Recommendation**: Start without index (simpler), add if lesson count becomes unwieldy (>50 lessons)

### 3. Architectural Intent (Alignment with Principles)

**What AI checks**: Does this code align with project principles?

**Required context**:
- `.hodge/principles.md` (philosophy, 2,500+ tokens - too verbose)
- `.hodge/standards.md` (enforcement rules)
- Architectural patterns established in this project

**Proposed solution**: Compress principles to YAML in review-context.yaml:

```yaml
architectural_principles:
  - principle: "Progressive Enhancement"
    check: "Is this code respecting the current development phase?"
    examples:
      - "Explore: any types OK"
      - "Ship: strict types required"
    reference: ".hodge/principles.md#progressive-enhancement"

  - principle: "CLI/AI Separation"
    check: "Is CLI doing content interpretation (wrong) or structure discovery (right)?"
    examples:
      - "❌ CLI parsing markdown and extracting sections"
      - "✅ CLI building file manifest with paths and metadata"
    reference: "HODGE-334 lesson"

  - principle: "Test Behavior Not Implementation"
    check: "Are tests checking user-visible outcomes or internal mock calls?"
    examples:
      - "❌ expect(mockLogger.info).toHaveBeenCalled()"
      - "✅ expect(outputFile).toContain('success message')"
    reference: ".hodge/standards.md#testing"
```

**Token cost**: ~300 tokens (vs. 2,500+ for full principles.md)

**CLI responsibility**: Load principles.md and review-context.yaml paths in manifest
**AI responsibility**: Read compressed principles, check code alignment, reference full principles.md if deeper context needed

### 4. Business Logic Correctness

**What AI checks**: Does this code solve the right problem? Does it match requirements?

**Required context**:
- Feature's `exploration.md` (problem statement, requirements)
- Feature's `decisions.md` (chosen approach, constraints)
- Feature's `build-plan.md` (implementation plan)

**Current approach works** (ReviewManifestGenerator already does this):

```typescript
interface ReviewManifest {
  feature_context: {
    exploration: string;  // .hodge/features/HODGE-341/explore/exploration.md
    decisions: string;    // .hodge/features/HODGE-341/decisions.md
    buildPlan?: string;   // .hodge/features/HODGE-341/build/build-plan.md
  };
}
```

**AI reads exploration/decisions to understand requirements, checks if code solves the right problem**:
- "⚠️  Exploration says 'delegate to build systems' but this hardcodes npm commands"
- "✅ Implementation matches Decision #3: fallback to direct tool execution"

**Token cost**: ~3K tokens (exploration + decisions for current feature)

**No changes needed** - already follows HODGE-334 pattern

### 5. Cross-File Patterns

**What AI checks**: Is this code in the right place? Should logic be extracted/moved?

**Required context**:
- Module boundary rules (commands orchestrate, services contain logic)
- When to extract shared utilities (3+ duplications)
- Feature envy detection (excessive access to other modules)

**Proposed solution**: Add module boundaries to review-context.yaml:

```yaml
module_boundaries:
  - boundary: "src/commands/ → src/lib/"
    rule: "Commands orchestrate, services contain logic"
    violation: "Business logic in command class"
    example: "Command should call service.method(), not implement algorithm"

  - boundary: "src/lib/core/ → src/lib/"
    rule: "Core never depends on non-core"
    violation: "Core importing feature-specific code"

  - boundary: "src/test/ → anywhere"
    rule: "Test utilities can be used anywhere"
    violation: "Production code importing test utils"

cross_file_patterns:
  - pattern: "Duplicate logic across multiple files"
    check: "Should this be extracted to shared utility?"
    threshold: "Same logic in 3+ places"
    action: "Extract to src/lib/utils/ or shared service"

  - pattern: "Feature envy"
    check: "Does this file access internals of another module excessively?"
    suggest: "Move method to the class it's accessing"
    example: "If FileA calls 10 methods on FileB, consider moving logic to FileB"
```

**Token cost**: ~200 tokens

**CLI responsibility**: Include review-context.yaml in manifest
**AI responsibility**: Check module boundaries, detect cross-file duplication, suggest extractions

**Note**: Tools like `dependency-cruiser` catch structural violations (circular deps, forbidden imports), but AI checks semantic appropriateness ("this code would be better in ServiceX")

### Complete Review Context Stack

**Files AI loads during review** (following HODGE-334 pattern):

```typescript
interface ReviewManifest {
  // Tool diagnostics (aggregated)
  diagnostics: DiagnosticReport;  // ~2K tokens

  // Critical files to review
  critical_files: string[];  // Paths to top 10 files, ~10K tokens when read

  // Compressed project-specific context
  project_context: {
    review_context: string;  // .hodge/review-context.yaml (~500-800 tokens)
    lessons: string[];       // Paths to .hodge/lessons/*.md (~2K tokens for 5-10 lessons)
    patterns: string[];      // Paths to .hodge/patterns/*.md (loaded on-demand)
  };

  // Feature context (current work)
  feature_context: {
    exploration: string;  // .hodge/features/HODGE-341/explore/exploration.md
    decisions: string;    // .hodge/features/HODGE-341/decisions.md
    buildPlan?: string;   // .hodge/features/HODGE-341/build/build-plan.md
  };  // ~3K tokens

  // Compressed review profiles (cross-project standards)
  review_profiles: Array<{
    path: string;  // .hodge/review-profiles/languages/typescript-5.x.yaml
    type: string;  // 'language' | 'framework' | 'testing' | 'database'
    precedence: number;
  }>;  // ~800 tokens for 4 compressed profiles
}
```

**Total token budget**: ~15.8K tokens (78% reduction from current 73K)

**Breakdown**:
- Tool diagnostics: ~2K
- Critical files (10): ~10K
- Review context YAML: ~800
- Lessons (5-10): ~2K
- Feature context: ~3K (exploration + decisions)
- Compressed profiles (4): ~800
- AI analysis: ~3K

### Proposed New File: `.hodge/review-context.yaml`

**Purpose**: Compressed, AI-optimized guidance for judgment-based reviews

**Contents**:
1. **Semantic naming conventions** (~100 tokens)
   - Project-specific patterns
   - Good/bad examples

2. **Architectural principles** (~300 tokens)
   - Compressed from principles.md
   - Key checks with examples

3. **Module boundaries** (~200 tokens)
   - Where code should/shouldn't live
   - Extraction thresholds

4. **Lessons index** (~200 tokens, optional)
   - Quick reference to anti-patterns
   - Links to full lessons/*.md files

**Total size**: ~500-800 tokens (vs. 2,500+ for full principles.md)

**Benefits**:
- Faster AI reviews (less context to load)
- Project-specific guidance (not just generic patterns)
- Follows HODGE-334 pattern (CLI loads path, AI reads and interprets)
- Human-editable (YAML is readable, not code-generated)

**Template for `hodge init`**:
```yaml
# .hodge/review-context.yaml
# AI-optimized guidance for judgment-based code reviews
version: "1.0.0"

semantic_naming:
  project_conventions:
    - "Services end in 'Service'"
    - "Commands match CLI command names"
    - "Avoid generic names: handler, manager, util, helper"
  good_examples: []
  bad_examples: []

architectural_principles:
  - principle: "Add your key principles here"
    check: "What should AI verify?"
    examples: []

module_boundaries:
  - boundary: "Define your module rules"
    rule: "What's allowed/forbidden?"
    violation: "What to flag?"

cross_file_patterns:
  - pattern: "Duplication threshold"
    threshold: "3+ occurrences"
    action: "Extract to shared utility"
```

**Human documentation remains**:
- `.hodge/principles.md` - Full philosophy (human reference)
- `.hodge/standards.md` - Enforcement rules (human reference)
- `.hodge/lessons/*.md` - Detailed narratives (AI reads selectively)

## Architecture Summary

### Complete Review Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Step 0: Build System Detection (0 AI tokens, <1 sec)       │
├─────────────────────────────────────────────────────────────┤
│ • Detect build system (package.json → npm)                  │
│ • Check for standard targets (typecheck, lint, test, build)│
│ • Load optional .hodge/toolchain.yaml if present            │
│                                                              │
│ Output: BuildSystemConfig (targets to execute)              │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 1: Execute Quality Checks (0 AI tokens, <20 sec)      │
├─────────────────────────────────────────────────────────────┤
│ Via Build System (preferred):                               │
│ • npm run typecheck → TypeScript compiler                   │
│ • npm run lint → ESLint + sonarjs plugin                    │
│ • npm test → Vitest with coverage                           │
│ • npm run build → Build process                             │
│                                                              │
│ Additional CLI Tools (direct execution):                    │
│ • jscpd (duplication detection)                             │
│ • dependency-cruiser (architecture violations)              │
│ • Semgrep auto + custom rules (security, framework patterns)│
│                                                              │
│ Output: DiagnosticReport (aggregated findings)              │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 2: AI Review (15.8K tokens, focused)                   │
├─────────────────────────────────────────────────────────────┤
│ Load Context:                                                │
│ • Aggregated diagnostics summary (~2K tokens)               │
│ • Review context YAML (~800 tokens) - project-specific      │
│ • Lessons files (~2K tokens) - 5-10 relevant lessons        │
│ • Feature context (~3K tokens) - exploration + decisions    │
│ • Compressed review profiles (~800 tokens)                  │
│ • Critical files only (~10K tokens)                         │
│                                                              │
│ AI Judgment-Based Checks:                                    │
│ • Semantic naming quality (using project conventions)       │
│ • Lessons-learned violations (citing specific lessons)      │
│ • Architectural alignment (checking principles)             │
│ • Business logic correctness (comparing to requirements)    │
│ • Cross-file patterns (module boundaries, duplication)      │
│                                                              │
│ Output: Review report with AI insights (~3K tokens)         │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 3: Combined Report                                     │
├─────────────────────────────────────────────────────────────┤
│ Tool Findings:                                               │
│ • 150 type errors (TypeScript)                              │
│ • 42 complexity violations (eslint-sonarjs)                 │
│ • 8 duplicate code blocks (jscpd)                           │
│ • 3 N+1 queries (Semgrep custom rules)                      │
│                                                              │
│ AI Findings (judgment-based):                                │
│ • 12 naming improvements (project conventions)              │
│ • 2 architectural concerns (violates lesson HODGE-334)      │
│ • 1 business logic issue (doesn't match exploration)        │
│ • 3 cross-file patterns (extract duplicate logic)           │
│                                                              │
│ Developer sees: Single unified report with all findings     │
└─────────────────────────────────────────────────────────────┘
```

### Key Innovation

**Before**: AI manually reads every file and checks every rule
- 73K tokens for 32 files
- Impossible for 100+ files
- AI wastes time on patterns tools catch better

**After**: Tools handle patterns (0 tokens), AI handles judgment (15.8K tokens)
- 78% token reduction
- Scales to 1000+ files
- AI focuses on what it's uniquely good at

### Framework-Specific Quality

**Problem Solved**: Framework anti-patterns (Prisma N+1, React hooks issues) aren't caught by general tools.

**Solution**: Semgrep custom rules + compressed AI profiles
- Semgrep catches 40-50% of framework patterns (0 tokens)
- AI reviews framework idioms with compressed profiles (minimal tokens)

### Multi-Language Support via Build Systems

Same architecture works across languages by leveraging their native build systems:

**TypeScript/JavaScript Project**:
```bash
# Hodge detects package.json, runs:
npm run typecheck  # → tsc --noEmit
npm run lint       # → eslint . (with sonarjs plugin)
npm test           # → vitest run --coverage
```

**Python Project**:
```bash
# Hodge detects pyproject.toml, runs:
poetry run typecheck  # → mypy .
poetry run lint       # → pylint src/
poetry run test       # → pytest --cov
```

**Go Project**:
```bash
# Hodge detects go.mod, runs via Makefile or direct:
make lint    # → golangci-lint run
make test    # → go test ./...
make build   # → go build
```

**Kotlin Project**:
```bash
# Hodge detects build.gradle.kts, runs:
./gradlew check  # → ktlint + detekt
./gradlew test   # → JUnit tests
./gradlew build  # → compilation
```

**Rust Project**:
```bash
# Hodge detects Cargo.toml, runs:
cargo check    # → type checking
cargo clippy   # → linting
cargo test     # → tests
cargo build    # → compilation
```

All build systems delegate to CLI-native tools with permissive licenses - no servers, commercial-safe.

## Proposed Implementation Phases (Sub-Issues)

This epic combines multiple concerns and should be broken into sub-issues using `/plan`:

### Phase 1: Build System Infrastructure
**HODGE-341.1: Build System Detection and Delegation** ✅ Decided
- Implement BuildSystem interface and detection logic
- Add NpmBuildSystem, GradleBuildSystem, MakeBuildSystem
- Standard target execution (typecheck, lint, test, build)
- Optional `.hodge/toolchain.yaml` configuration
- Fallback to direct tool execution when targets missing

**Decisions Made (2025-10-10)**:
- Tool version detection: Detect versions in Phase 1, return in DetectedTool interface (defer persistence to Phase 5)
- Command templates: Support `${files}` placeholder for flexible file scoping
- Pass rate calculation: Simple binary pass/fail in Phase 1 (defer severity weighting to Phase 3)
- TypeScript file scoping: Run full project, filter diagnostics to uncommitted files

**Deferred to Later Phases**:
- Persisting tool versions to toolchain.yaml → HODGE-341.5 (Phase 5)
- Version-based profile matching → HODGE-341.5 (Phase 5)
- Severity-weighted pass rate calculation → HODGE-341.3 (Phase 3)

### Phase 2: TypeScript/JS Tool Integration
**HODGE-341.2: CLI-Native Tool Integration (TypeScript/JS)**
- Integrate eslint-plugin-sonarjs (complexity, code smells)
- Integrate jscpd (duplication detection)
- Integrate dependency-cruiser (architecture validation)
- Integrate Semgrep (security patterns)
- Implement DiagnosticAggregator for universal format

### Phase 3: AI Review Enhancement
**HODGE-341.3: Critical File Selection Algorithm**
- Implement CriticalFileSelector with scoring algorithm
- Integrate with tier classifier
- Cap at top 10 files for token budget
- Add --files flag for user override
- **Dependency from Phase 1**: Enhance pass rate calculation with severity weighting (blocker > critical > major)

**HODGE-341.4: AI Review Profile Compression**
- Convert profiles from verbose .md to compressed YAML
- 87% token reduction (1,500 → 200 tokens per profile)
- Keep .md files for human documentation
- A/B test AI performance with compressed profiles

### Phase 5: Multi-Language Support
**HODGE-341.5: Multi-Language Toolchain Support**
- Add PoetryBuildSystem (Python)
- Add CargoBuildSystem (Rust)
- Add language-specific tool examples (radon, clippy, golangci-lint)
- Monorepo support (.hodge/toolchain.yaml per-directory configs)
- **Dependency from Phase 1**: Persist tool versions to toolchain.yaml, implement version-based profile matching

### Phase 5: Framework-Specific Patterns
**HODGE-341.6: Semgrep Custom Rules**
- Ship default rules for Prisma, React, GraphQL
- Allow user rules in `.hodge/semgrep-rules/`
- Rule versioning and maintenance strategy
- Integration with review profiles

### Phase 6: Tool Findings → Fix Workflow
**HODGE-341.7: Auto-Fix and AI-Assisted Fixes**
- Phase 1 auto-fix (eslint --fix, prettier --write)
- Phase 2 AI review of diagnostics
- Phase 3 AI fixes via Edit tool
- Clear communication flow: Tools → CLI → AI → User

### Phase 7: Project-Specific Review Context
**HODGE-341.8: Review Context Optimization**
- Create `.hodge/review-context.yaml` template structure
- Extract semantic naming conventions from Hodge codebase
- Compress architectural principles from principles.md to YAML (~300 tokens)
- Define module boundary rules (commands → services, core isolation)
- Add cross-file pattern guidance (duplication threshold, feature envy)
- Integrate with ReviewManifestGenerator to load review-context.yaml
- Update slash command templates to include project context
- Optional: Add lessons index to review-context.yaml
- Update `hodge init` to generate template review-context.yaml

## Next Steps
- [ ] Review exploration findings
- [ ] Use `/decide` to make implementation decisions
- [ ] Use `/plan HODGE-341` to create sub-issues (HODGE-341.1 through HODGE-341.8)
- [ ] Archive/supersede HODGE-342 (integrated into this epic)

---
*Template created: 2025-10-09T19:07:29.042Z*
*AI exploration to follow*
