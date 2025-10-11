# Exploration: HODGE-342

**⚠️ SUPERSEDED BY HODGE-341**

This feature has been integrated into HODGE-341 as the "Build System Integration Strategy" component. The build system delegation approach described here is now part of the larger "Hybrid AI + Toolchain Code Review System" epic.

See HODGE-341 exploration for the complete unified architecture.

---

## Feature Overview
**PM Issue**: HODGE-342
**Type**: general
**Created**: 2025-10-09T19:07:37.086Z
**Status**: SUPERSEDED (integrated into HODGE-341)

## Problem Statement (User-Provided)

Create configurable multi-language toolchain for quality checks - consider leveraging native build tools like package.json scripts and gradle tasks

## Context
- **Standards**: Loaded (suggested only)
- **Available Patterns**: 12

- **Similar Features**: HODGE-327.2, hodge-branding, HODGE-001
- **Relevant Patterns**: None identified

## Background (from HODGE-337 learnings)

HODGE-341 addresses integrating automated tools into the review process. This feature (HODGE-342) focuses on making that toolchain configurable across different technology stacks.

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

### Key Insight from Discussion

**User's guidance**: "Consider leveraging native build tools like package.json scripts and gradle tasks"

Instead of reinventing tool execution, delegate to existing build system:
- `package.json` already has `test`, `lint`, `typecheck` scripts
- `build.gradle` already has `test`, `check`, `build` tasks
- `Makefile` already has quality targets
- `pyproject.toml` has tool configurations

## Implementation Approaches

### Approach 1: Build System Delegation (User's Suggestion)

**Concept**: Hodge looks for standard targets in native build tools

```typescript
// Auto-detect build system and run standard targets
const buildSystem = await detectBuildSystem(); // package.json, build.gradle, Makefile, etc.

const results = await buildSystem.run([
  'typecheck',  // Maps to: npm run typecheck, ./gradlew check, make typecheck
  'lint',       // Maps to: npm run lint, ./gradlew ktlintCheck, make lint
  'test',       // Maps to: npm test, ./gradlew test, make test
  'build'       // Maps to: npm run build, ./gradlew build, make build
]);
```

**Benefits**:
- **Zero Configuration**: Works with existing project setup
- **Developer Control**: Developers define what "lint" means in their build scripts
- **Battle-Tested**: Relies on mature build tools (npm, gradle, maven, make)
- **Consistent Interface**: Hodge always calls same targets, build system handles mapping

**Configuration** (optional `.hodge/toolchain.yaml`):
```yaml
build_system: npm  # or gradle, make, cargo, etc.
quality_targets:
  typecheck: typecheck
  lint: lint
  test: test
  build: build
custom_targets:
  security: "npm audit --audit-level=moderate"
```

### Approach 2: Tool Auto-Detection with Built-in Parsers

**Concept**: Hodge detects language, discovers tools, runs them directly

```yaml
# .hodge/toolchain.yaml
language: typescript
version: "5.3.3"

tools:
  type_checker:
    tool: tsc
    args: [--noEmit, --strict]
    parser: typescript-diagnostic

  linter:
    tool: eslint
    args: [., --format=json]
    parser: eslint-json

  test_runner:
    tool: vitest
    args: [run, --reporter=json]
    parser: vitest-json
```

**Auto-detection**:
```typescript
// Hodge scans for:
- package.json + tsconfig.json → TypeScript
- setup.py + mypy.ini → Python with mypy
- go.mod → Go
- build.gradle.kts → Kotlin
```

**Benefits**:
- **Fine-grained Control**: Specify exact tool flags
- **Consistent Parsing**: Hodge knows how to parse each tool's output
- **Multi-tool Support**: Can run tsc + biome + vitest for same language

**Challenges**:
- **Parser Maintenance**: Hodge must maintain parsers for 20+ tools
- **Breaking Changes**: Tool output formats change between versions
- **Configuration Complexity**: Users must configure every tool

### Approach 3: Hybrid - Convention over Configuration

**Concept**: Prefer build system delegation, fallback to auto-detection

```typescript
// 1. Try build system targets (package.json scripts, gradle tasks)
if (await exists('package.json') && await hasScript('lint')) {
  await run('npm run lint');
}
// 2. Fallback to tool auto-detection
else if (await exists('tsconfig.json')) {
  await run('npx tsc --noEmit');
}
```

**Benefits**:
- **Zero config for 80% of projects** (those using standard build systems)
- **Flexibility for 20%** (custom toolchains, experimental setups)
- **Graceful degradation**: Works even if build scripts incomplete

## Recommendation

**Approach 1 (Build System Delegation)** is recommended because:

1. **User's Guidance**: Explicitly suggested leveraging native build tools
2. **Zero Configuration**: Works out-of-box for 90% of projects
3. **Developer Control**: Teams already define quality standards in build scripts
4. **Maintainability**: Hodge doesn't maintain 20+ tool parsers
5. **Proven Pattern**: CI/CD systems work this way (Travis, GitHub Actions just run scripts)

**Fallback to Approach 3**: If build system doesn't have target, auto-detect and run tools directly

## Implementation Details

### Build System Detection

```typescript
interface BuildSystem {
  detect(): Promise<boolean>;
  run(target: string): Promise<DiagnosticResult>;
  availableTargets(): Promise<string[]>;
}

class NpmBuildSystem implements BuildSystem {
  async detect(): Promise<boolean> {
    return await exists('package.json');
  }

  async run(target: string): Promise<DiagnosticResult> {
    const hasScript = await this.hasScript(target);
    if (!hasScript) return { skipped: true, reason: `No ${target} script` };

    return await exec(`npm run ${target}`, { capture: 'both' });
  }

  async availableTargets(): Promise<string[]> {
    const pkg = await readJson('package.json');
    return Object.keys(pkg.scripts || {});
  }
}

// Similar implementations for: GradleBuildSystem, MakeBuildSystem, CargoBuildSystem
```

### Standard Target Names

Hodge expects these standard targets:
- `typecheck` - Type checking (tsc, mypy, etc.)
- `lint` - Code linting (eslint, pylint, etc.)
- `test` - Run tests (vitest, pytest, etc.)
- `build` - Build/compile (tsc, cargo build, etc.)
- `format:check` - Check formatting (prettier, black, etc.)

### Multi-Language Projects

```yaml
# .hodge/toolchain.yaml for monorepo
languages:
  - path: packages/frontend
    build_system: npm
    targets: [typecheck, lint, test]

  - path: services/api
    build_system: gradle
    targets: [check, test, build]

  - path: scripts
    build_system: make
    targets: [lint, test]
```

## Decisions Needed

1. **Standard Target Names**
   - Should we mandate specific names (typecheck, lint, test)?
   - Or allow customization (.hodge/toolchain.yaml maps hodge:lint → npm run quality)?
   - What happens if project uses different names (npm run check instead of lint)?

2. **Fallback Behavior**
   - If build system lacks a target, run tools directly or skip?
   - Should we suggest adding missing scripts to package.json?
   - How verbose should fallback logging be?

3. **Multi-Language Support**
   - One `.hodge/toolchain.yaml` with per-directory configs?
   - Or detect automatically based on file locations?
   - How do we handle polyglot files (TypeScript + Python in same directory)?

4. **Diagnostic Aggregation**
   - How do we normalize output from different tools (tsc JSON vs eslint JSON vs go test)?
   - Should we create a universal DiagnosticResult format?
   - What information must be preserved (file, line, severity, message)?

5. **Tool Versioning**
   - Do we validate tool versions match review profiles?
   - Should we warn if eslint version incompatible with rules?
   - How do we handle version drift in monorepos?

6. **Integration with HODGE-341**
   - Does HODGE-341 consume toolchain results directly?
   - Or is there an intermediate DiagnosticsService?
   - What's the contract between toolchain and review system?

## Next Steps
- [ ] Review exploration findings
- [ ] Use `/decide` to make implementation decisions
- [ ] Proceed to `/build HODGE-342`

---
*Template created: 2025-10-09T19:07:37.086Z*
*AI exploration to follow*
