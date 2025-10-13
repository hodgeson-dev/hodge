# Exploration: HODGE-341.5

## Feature Overview
**Title**: Multi-Language Toolchain Support (Python, Kotlin, Java)
**PM Issue**: HODGE-341.5
**Type**: sub-feature (child of HODGE-341)
**Created**: 2025-10-12T12:55:06.606Z

## Problem Statement

Extend Hodge's hybrid tool+AI quality review system from TypeScript/JavaScript to Python, Kotlin, and Java with full parity (basic + advanced tools including complexity, duplication, security, architecture). Support monorepo projects where multiple languages coexist, with automatic language detection and unified quality check execution. Developers should get the same comprehensive quality checks regardless of which languages they use.

## Context
- **Standards**: Loaded (suggested only)
- **Available Patterns**: 13
- **Parent Feature**: HODGE-341 (Hybrid Code Quality Review System)
- **Shipped Siblings**: HODGE-341.2 (Tool Integration), HODGE-341.3 (Critical File Selection), HODGE-341.4 (Profile Compression)
- **Similar Features**: HODGE-327.2, hodge-branding, HODGE-002

## Conversation Summary

### Language Scope & Requirements

**Target Languages**: Python, Kotlin, Java

**Full Parity Requirement**: Each language must support the same quality check categories as TypeScript:
- Type checking
- Linting
- Testing
- Formatting
- Complexity analysis
- Duplication detection
- Security patterns
- Architecture validation

**Monorepo Support**: Critical requirement. Projects may contain multiple languages with different build systems in a single repository.

### Tool Selection Strategy

Following "most common tool per language" principle established in conversation:

**Python**:
- Type checking: `mypy`
- Linting: `ruff` (modern, fast - default when neither ruff nor pylint installed)
- Testing: `pytest`
- Formatting: `black`
- Complexity: `radon cc` (includes maintainability index)
- Duplication: `jscpd` (universal)
- Security: `semgrep` (universal)
- Architecture: `import-linter`
- Package manager: Detect poetry vs pip, use whichever is present

**Kotlin**:
- Type checking: `kotlinc` (built-in)
- Linting: `detekt` (comprehensive)
- Testing: `gradle test` (JUnit/Kotest)
- Formatting: `ktlint`
- Complexity: `detekt` (includes complexity checks)
- Duplication: `jscpd`
- Security: `semgrep`
- Architecture: `dependency-analysis-gradle-plugin`
- Build system: Prefer Gradle over Maven when both present

**Java**:
- Type checking: `javac` (built-in)
- Linting: `checkstyle` + `pmd`
- Testing: `gradle test` or `mvn test`
- Formatting: `google-java-format`
- Complexity: `pmd` (includes complexity rules)
- Duplication: `pmd cpd` (copy-paste detector)
- Security: `semgrep`
- Architecture: `dependency-analysis-gradle-plugin` or `jdepend`
- Build system: Prefer Gradle over Maven when both present

### Monorepo Architecture

**Structure**: Single `.hodge/toolchain.yaml` with `language: multi` and `projects` array.

**Detection Strategy**:
- Scan for language indicators (pyproject.toml, build.gradle.kts, pom.xml)
- Auto-detect project roots by build file presence
- Allow optional explicit configuration in toolchain.yaml for edge cases

**Example structure**:
```yaml
version: "1.0"
language: multi

# Global settings
max_critical_files: 10
critical_paths:
  - services/api/auth/
  - libs/shared/

projects:
  - path: services/api
    language: python
    commands:
      mypy: { command: "mypy ${files}" }
      ruff: { command: "ruff check ${files}" }
      pytest: { command: "pytest" }
    quality_checks:
      type_checking: [mypy]
      linting: [ruff]
      testing: [pytest]

  - path: services/auth
    language: kotlin
    commands:
      kotlinc: { command: "kotlinc -d /dev/null ${files}" }
      detekt: { command: "detekt --input ${files}" }
    quality_checks:
      type_checking: [kotlinc]
      linting: [detekt]
```

### Execution Strategy

**Scoping**: Run quality checks only for projects containing changed files, one project at a time. This simplifies implementation and reduces execution time.

**Mixed Language Changes**: Single `hodge harden` call executes all relevant language tools on their respective files. Results grouped by project/language for clarity.

**Build File Changes**: Changes to configuration files (pyproject.toml, build.gradle.kts, pubspec.yaml) trigger full validation for that project since configuration affects everything.

**Test Scoping Challenge**: Gradle-based projects (Kotlin/Java) cannot scope tests to specific files via command line. Decision: Always run all tests in that project. Trade-off accepted for correctness (integration tests may depend on changed code indirectly).

### Import Fan-In Analysis (from HODGE-341.3)

**Scope**: Limit analysis to within each project boundary. Cross-language imports don't exist at code level (services communicate via HTTP/RPC which is beyond scope).

**Implementation**: Simple regex-based import extraction per language:
- Python: `import X`, `from X import Y`
- Kotlin/Java: `import com.example.X`

**Trade-off**: Simple heuristics may miss 10-15% of complex imports (relative imports with complex resolution, dynamic imports). This is acceptable - goal is to identify *most* high-impact files, not achieve 100% precision. Cost of full path resolution across all languages outweighs benefit.

### Semgrep Framework Rules

Following HODGE-341.2 pattern of focused, high-value rules:

**Scope**: 2-3 rules per language (6-9 total)
- Python: Django/Flask anti-patterns, SQL injection, async/await issues
- Kotlin: Coroutine patterns, null safety violations, Jetpack Compose issues
- Java: Stream API misuse, Spring Security patterns, concurrency issues

**Framework Detection**: Apply rules based on detected frameworks (check dependencies for `django`, `spring-boot-starter`, etc.). Prevents noise from irrelevant warnings.

### Package Manager & Build System Detection

**Python**: Detect poetry (pyproject.toml with [tool.poetry]) vs pip (requirements.txt). Use detected package manager for installation commands.

**Kotlin/Java**: Detect Gradle (build.gradle.kts, gradlew) vs Maven (pom.xml, mvnw). Prefer Gradle when both present.

### Tool Version Handling

**Detection**: Record tool versions for context (helps with review profile matching in HODGE-341.4).

**Environment Management**: Assume user's environment handles version switching (virtualenvs for Python, SDKMAN for Java/Kotlin, etc.). Hodge doesn't try to manage or enforce versions.

**Virtual Environments**: User activates correct environment before running hodge commands. This is standard practice and avoids complexity of auto-detecting venv paths.

### Edge Cases & Design Decisions

**Tool Installation**: `hodge init` offers to install missing tools for ALL detected languages. Users can accept (one-command setup) or decline (manual installation).

**Shared Commands**: Keep tool commands explicit per-project rather than DRY with shared section. Clarity and self-documentation over avoiding duplication.

**Global Settings**: `max_critical_files` and `critical_paths` apply to all projects. No per-project overrides (keeps config simpler).

**Gradle Wrapper**: Detect `./gradlew` vs global `gradle` command and use wrapper when present.

**Maven Multi-Module**: Projects may have nested pom.xml files. Detection handles this by identifying top-level build file.

## Implementation Approaches

### Approach 1: Tool Registry Extension with Monorepo Detection (Recommended)

**Description**: Extend the existing two-layer tool configuration architecture from HODGE-341.2 to support Python, Kotlin, and Java. Enhance `hodge init` to detect multiple languages and generate appropriate monorepo structure.

**Core Components**:

**1. Extend Tool Registry** (`src/bundled-config/tool-registry.yaml`):

Add detection rules, commands, and quality check mappings for each new language:

```yaml
# Python tools
tools:
  mypy:
    languages: [python]
    detection:
      config_files: [mypy.ini, .mypy.ini, pyproject.toml]
      dependencies: [mypy]
      path: [mypy]
    install:
      pip: "pip install mypy"
      poetry: "poetry add --group dev mypy"
    command_template: "mypy ${files}"
    version_command: "mypy --version"
    provides: [type_checking]

  ruff:
    languages: [python]
    detection:
      config_files: [ruff.toml, .ruff.toml, pyproject.toml]
      dependencies: [ruff]
      path: [ruff]
    install:
      pip: "pip install ruff"
      poetry: "poetry add --group dev ruff"
    command_template: "ruff check ${files}"
    version_command: "ruff --version"
    provides: [linting, formatting]

  # ... (similar entries for pytest, black, radon, import-linter)

# Kotlin tools
  detekt:
    languages: [kotlin]
    detection:
      config_files: [detekt.yml, .detekt.yml]
      dependencies: [io.gitlab.arturbosch.detekt]
      path: [detekt]
    install:
      gradle: "implementation 'io.gitlab.arturbosch.detekt:detekt-gradle-plugin:1.23.0'"
    command_template: "detekt --input ${files}"
    version_command: "detekt --version"
    provides: [linting, complexity, code_smells]

  # ... (similar entries for kotlinc, ktlint, gradle test, dependency-analysis)

# Java tools
  checkstyle:
    languages: [java]
    detection:
      config_files: [checkstyle.xml, .checkstyle.xml]
      dependencies: [com.puppycrawl.tools:checkstyle]
      path: [checkstyle]
    install:
      gradle: "checkstyle 'com.puppycrawl.tools:checkstyle:10.12.0'"
      maven: "<dependency><groupId>com.puppycrawl.tools</groupId><artifactId>checkstyle</artifactId></dependency>"
    command_template: "checkstyle -c checkstyle.xml ${files}"
    version_command: "checkstyle --version"
    provides: [linting]

  # ... (similar entries for pmd, javac, google-java-format, jdepend)
```

**2. Language Detectors** (`src/lib/toolchain-service.ts`):

```typescript
interface LanguageDetector {
  detect(projectRoot: string): boolean;
  getLanguage(): string;
  getBuildFiles(): string[];
}

class PythonDetector implements LanguageDetector {
  detect(projectRoot: string): boolean {
    return exists('pyproject.toml') ||
           exists('requirements.txt') ||
           exists('Pipfile');
  }

  getLanguage(): string {
    return 'python';
  }

  getBuildFiles(): string[] {
    return ['pyproject.toml', 'requirements.txt', 'Pipfile'];
  }
}

class KotlinDetector implements LanguageDetector {
  detect(projectRoot: string): boolean {
    return exists('build.gradle.kts') ||
           (exists('pom.xml') && containsKotlinPlugin('pom.xml'));
  }

  getLanguage(): string {
    return 'kotlin';
  }

  getBuildFiles(): string[] {
    return ['build.gradle.kts', 'pom.xml'];
  }
}

// Similar for Java
```

**3. Monorepo Detection** (`src/lib/monorepo-detector.ts`):

```typescript
interface ProjectInfo {
  path: string;
  language: string;
  buildFile: string;
}

export class MonorepoDetector {
  async detectProjects(repoRoot: string): Promise<ProjectInfo[]> {
    const projects: ProjectInfo[] = [];

    // Scan for build files across repo
    const buildFiles = await this.findBuildFiles(repoRoot);

    for (const buildFile of buildFiles) {
      const projectPath = path.dirname(buildFile);
      const language = this.detectLanguageFromBuildFile(buildFile);

      projects.push({
        path: projectPath,
        language,
        buildFile: path.basename(buildFile)
      });
    }

    return projects;
  }

  private async findBuildFiles(root: string): Promise<string[]> {
    const patterns = [
      '**/pyproject.toml',
      '**/requirements.txt',
      '**/build.gradle.kts',
      '**/pom.xml'
    ];

    const files: string[] = [];
    for (const pattern of patterns) {
      const matches = await glob(pattern, {
        cwd: root,
        ignore: ['**/node_modules/**', '**/venv/**', '**/build/**', '**/dist/**']
      });
      files.push(...matches);
    }

    return files;
  }

  private detectLanguageFromBuildFile(file: string): string {
    const basename = path.basename(file);

    if (basename === 'pyproject.toml' || basename === 'requirements.txt') {
      return 'python';
    }
    if (basename === 'build.gradle.kts') {
      return 'kotlin'; // Or Java - need to check file content
    }
    if (basename === 'pom.xml') {
      return this.detectJavaOrKotlin(file);
    }

    return 'unknown';
  }

  private detectJavaOrKotlin(pomFile: string): string {
    const content = fs.readFileSync(pomFile, 'utf-8');
    return content.includes('kotlin-maven-plugin') ? 'kotlin' : 'java';
  }
}
```

**4. Package Manager Detection** (`src/lib/package-manager-detector.ts`):

```typescript
export class PackageManagerDetector {
  detectPython(projectPath: string): 'poetry' | 'pip' | 'pipenv' {
    // Check for poetry indicators
    const pyproject = path.join(projectPath, 'pyproject.toml');
    if (exists(pyproject)) {
      const content = fs.readFileSync(pyproject, 'utf-8');
      if (content.includes('[tool.poetry]')) {
        return 'poetry';
      }
    }

    // Check for pipenv
    if (exists(path.join(projectPath, 'Pipfile'))) {
      return 'pipenv';
    }

    // Default to pip
    return 'pip';
  }

  detectJavaKotlin(projectPath: string): 'gradle' | 'maven' {
    // Prefer Gradle
    if (exists(path.join(projectPath, 'build.gradle.kts')) ||
        exists(path.join(projectPath, 'build.gradle'))) {
      return 'gradle';
    }

    if (exists(path.join(projectPath, 'pom.xml'))) {
      return 'maven';
    }

    return 'gradle'; // Default
  }
}
```

**5. Enhanced InitCommand** (`src/commands/init.ts`):

```typescript
export class InitCommand {
  async execute(): Promise<void> {
    // Detect languages
    const monorepoDetector = new MonorepoDetector();
    const projects = await monorepoDetector.detectProjects(process.cwd());

    if (projects.length === 0) {
      throw new Error('No supported languages detected');
    }

    const isMonorepo = projects.length > 1 ||
                       new Set(projects.map(p => p.language)).size > 1;

    if (isMonorepo) {
      await this.initMonorepo(projects);
    } else {
      await this.initSingleLanguage(projects[0]);
    }
  }

  private async initMonorepo(projects: ProjectInfo[]): Promise<void> {
    this.logger.info('Detected monorepo with multiple languages/projects');

    const toolchainConfig: ToolchainConfig = {
      version: '1.0',
      language: 'multi',
      max_critical_files: 10,
      critical_paths: [],
      projects: []
    };

    for (const project of projects) {
      this.logger.info(`Setting up ${project.language} project at ${project.path}`);

      // Detect tools for this project
      const tools = await this.detectToolsForLanguage(project.language, project.path);

      // Offer to install missing tools
      const missingTools = tools.filter(t => !t.detected);
      if (missingTools.length > 0) {
        const shouldInstall = await this.promptInstall(project.language, missingTools);
        if (shouldInstall) {
          await this.installTools(project.language, project.path, missingTools);
        }
      }

      // Generate project config
      const projectConfig = this.generateProjectConfig(project, tools);
      toolchainConfig.projects.push(projectConfig);
    }

    // Write toolchain.yaml
    await this.writeToolchainConfig(toolchainConfig);

    this.logger.success('✅ Monorepo initialized with multi-language support');
  }

  private async detectToolsForLanguage(
    language: string,
    projectPath: string
  ): Promise<DetectedTool[]> {
    const registry = await this.loadToolRegistry();
    const languageTools = registry.tools.filter(t => t.languages.includes(language));

    const detected: DetectedTool[] = [];

    for (const tool of languageTools) {
      const isDetected = await this.detectTool(tool, projectPath);
      detected.push({
        name: tool.name,
        detected: isDetected,
        tool: tool
      });
    }

    return detected;
  }
}
```

**6. Enhanced ToolchainService Execution**:

```typescript
export class ToolchainService {
  async runQualityChecks(
    feature: string,
    files?: string[]
  ): Promise<QualityCheckResults> {
    const config = await this.loadToolchainConfig();

    if (config.language === 'multi') {
      return await this.runMonorepoChecks(config, files);
    } else {
      return await this.runSingleLanguageChecks(config, files);
    }
  }

  private async runMonorepoChecks(
    config: ToolchainConfig,
    files?: string[]
  ): Promise<QualityCheckResults> {
    const results: QualityCheckResults = {
      timestamp: new Date().toISOString(),
      projects: []
    };

    // Determine which projects contain changed files
    const affectedProjects = this.getAffectedProjects(config.projects, files);

    for (const project of affectedProjects) {
      this.logger.info(`Running checks for ${project.language} project at ${project.path}`);

      // Filter files to this project's scope
      const projectFiles = files?.filter(f => f.startsWith(project.path));

      // Run quality checks for this project
      const projectResults = await this.runProjectChecks(project, projectFiles);

      results.projects.push({
        path: project.path,
        language: project.language,
        results: projectResults
      });
    }

    return results;
  }

  private getAffectedProjects(
    projects: ProjectConfig[],
    files?: string[]
  ): ProjectConfig[] {
    if (!files || files.length === 0) {
      return projects; // No scope, check all projects
    }

    return projects.filter(project =>
      files.some(file => file.startsWith(project.path))
    );
  }

  private async runProjectChecks(
    project: ProjectConfig,
    files?: string[]
  ): Promise<ToolResult[]> {
    const results: ToolResult[] = [];

    // Check if build file changed (triggers full project validation)
    const buildFileChanged = files?.some(f =>
      f.includes('pyproject.toml') ||
      f.includes('build.gradle.kts') ||
      f.includes('pom.xml')
    );

    if (buildFileChanged) {
      this.logger.info('Build file changed - running full project validation');
      files = undefined; // Clear file scope
    }

    // Run each quality check category
    for (const [checkType, tools] of Object.entries(project.quality_checks)) {
      for (const toolName of tools) {
        const result = await this.runTool(toolName, project, files);
        results.push(result);
      }
    }

    return results;
  }
}
```

**7. Import Analysis Per Language** (`src/lib/import-analyzer.ts`):

```typescript
export class ImportAnalyzer {
  analyzeFanIn(projectPath: string, language: string): Map<string, number> {
    const fanInMap = new Map<string, number>();

    // Get file extensions for this language
    const extensions = this.getExtensions(language);

    // Find all source files in project
    const files = glob.sync(`**/*.{${extensions.join(',')}}`, {
      cwd: projectPath,
      ignore: ['**/node_modules/**', '**/venv/**', '**/build/**', '**/dist/**']
    });

    for (const file of files) {
      const content = fs.readFileSync(path.join(projectPath, file), 'utf-8');

      // Extract imports using language-specific pattern
      const imports = this.extractImports(content, language);

      for (const importPath of imports) {
        const resolved = this.resolveImportPath(importPath, file, projectPath, language);

        if (resolved && this.isLocalImport(resolved, projectPath)) {
          fanInMap.set(resolved, (fanInMap.get(resolved) || 0) + 1);
        }
      }
    }

    return fanInMap;
  }

  private extractImports(content: string, language: string): string[] {
    switch (language) {
      case 'python':
        return this.extractPythonImports(content);
      case 'kotlin':
      case 'java':
        return this.extractJavaKotlinImports(content);
      default:
        return [];
    }
  }

  private extractPythonImports(content: string): string[] {
    const imports: string[] = [];

    // Match: import foo, from foo import bar, from .foo import bar
    const patterns = [
      /^import\s+([\w.]+)/gm,
      /^from\s+([\w.]+)\s+import/gm
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        imports.push(match[1]);
      }
    }

    return imports;
  }

  private extractJavaKotlinImports(content: string): string[] {
    const imports: string[] = [];

    // Match: import com.example.Foo
    const pattern = /^import\s+([\w.]+)/gm;
    let match;

    while ((match = pattern.exec(content)) !== null) {
      imports.push(match[1]);
    }

    return imports;
  }

  private getExtensions(language: string): string[] {
    switch (language) {
      case 'python':
        return ['py'];
      case 'kotlin':
        return ['kt', 'kts'];
      case 'java':
        return ['java'];
      default:
        return [];
    }
  }
}
```

**8. Framework Detection for Semgrep** (`src/lib/framework-detector.ts`):

```typescript
export class FrameworkDetector {
  async detectFrameworks(projectPath: string, language: string): Promise<string[]> {
    switch (language) {
      case 'python':
        return this.detectPythonFrameworks(projectPath);
      case 'kotlin':
        return this.detectKotlinFrameworks(projectPath);
      case 'java':
        return this.detectJavaFrameworks(projectPath);
      default:
        return [];
    }
  }

  private async detectPythonFrameworks(projectPath: string): Promise<string[]> {
    const frameworks: string[] = [];

    // Check pyproject.toml dependencies
    const pyproject = path.join(projectPath, 'pyproject.toml');
    if (exists(pyproject)) {
      const content = fs.readFileSync(pyproject, 'utf-8');
      if (content.includes('django')) frameworks.push('django');
      if (content.includes('flask')) frameworks.push('flask');
      if (content.includes('fastapi')) frameworks.push('fastapi');
    }

    // Check requirements.txt
    const requirements = path.join(projectPath, 'requirements.txt');
    if (exists(requirements)) {
      const content = fs.readFileSync(requirements, 'utf-8');
      if (content.includes('django')) frameworks.push('django');
      if (content.includes('flask')) frameworks.push('flask');
      if (content.includes('fastapi')) frameworks.push('fastapi');
    }

    return [...new Set(frameworks)]; // Deduplicate
  }

  private async detectKotlinFrameworks(projectPath: string): Promise<string[]> {
    const frameworks: string[] = [];

    // Check build.gradle.kts
    const buildFile = path.join(projectPath, 'build.gradle.kts');
    if (exists(buildFile)) {
      const content = fs.readFileSync(buildFile, 'utf-8');
      if (content.includes('spring-boot-starter')) frameworks.push('spring-boot');
      if (content.includes('ktor')) frameworks.push('ktor');
      if (content.includes('compose')) frameworks.push('jetpack-compose');
    }

    return frameworks;
  }

  private async detectJavaFrameworks(projectPath: string): Promise<string[]> {
    const frameworks: string[] = [];

    // Check build.gradle or pom.xml
    const gradleBuild = path.join(projectPath, 'build.gradle');
    const pomXml = path.join(projectPath, 'pom.xml');

    if (exists(gradleBuild)) {
      const content = fs.readFileSync(gradleBuild, 'utf-8');
      if (content.includes('spring-boot-starter')) frameworks.push('spring-boot');
      if (content.includes('spring-security')) frameworks.push('spring-security');
    }

    if (exists(pomXml)) {
      const content = fs.readFileSync(pomXml, 'utf-8');
      if (content.includes('spring-boot-starter')) frameworks.push('spring-boot');
      if (content.includes('spring-security')) frameworks.push('spring-security');
    }

    return frameworks;
  }
}
```

**9. Bundled Semgrep Rules** (`src/bundled-config/semgrep-rules/`):

```yaml
# python-anti-patterns.yaml
rules:
  - id: django-raw-sql
    pattern: cursor.execute($QUERY)
    message: "Raw SQL detected - use Django ORM to prevent SQL injection"
    severity: ERROR
    languages: [python]
    metadata:
      framework: django

  - id: flask-debug-enabled
    pattern: app.run(debug=True)
    message: "Flask debug mode should not be enabled in production"
    severity: WARNING
    languages: [python]
    metadata:
      framework: flask

# kotlin-anti-patterns.yaml
rules:
  - id: kotlin-global-scope-launch
    pattern: GlobalScope.launch { ... }
    message: "Avoid GlobalScope - use structured concurrency with coroutineScope"
    severity: WARNING
    languages: [kotlin]

  - id: kotlin-nullable-platform-type
    pattern: |
      val $VAR = $JAVA_CALL
    message: "Platform type from Java - add explicit nullability annotation"
    severity: WARNING
    languages: [kotlin]

# java-anti-patterns.yaml
rules:
  - id: java-stream-foreach-sideeffect
    pattern: |
      stream().forEach($VAR -> { $MUTATION })
    message: "Avoid side effects in forEach - use collectors instead"
    severity: WARNING
    languages: [java]

  - id: spring-security-permitall
    pattern: |
      .antMatchers($PATH).permitAll()
    message: "Review permitAll() usage - ensure intentional public endpoint"
    severity: WARNING
    languages: [java]
    metadata:
      framework: spring-security
```

**Pros**:
- **Full parity**: All four languages get same quality check categories as TypeScript
- **Leverages existing architecture**: Builds on HODGE-341.2's two-layer config system
- **Monorepo first-class**: Auto-detects multiple projects, generates appropriate config
- **Smart scoping**: Only runs checks for affected projects
- **Framework-aware**: Semgrep rules applied based on detected dependencies
- **Extensible**: Adding new languages follows same pattern (add to registry, add detector)
- **Simple import analysis**: Regex-based extraction (fast, good-enough accuracy)

**Cons**:
- **Large tool registry**: Adding 15+ tools increases bundled config size (acceptable, it's just YAML)
- **Test scoping limitation**: Gradle projects run all tests (can't scope by file)
- **Import resolution accuracy**: Simple heuristics miss 10-15% of complex imports (acceptable trade-off)

**When to use**: This is the recommended approach. It maintains architectural consistency with HODGE-341.2 while extending to multiple languages with full feature parity.

### Approach 2: Language-Specific Services (Not Recommended)

**Description**: Create separate service classes for each language (PythonToolchainService, KotlinToolchainService, etc.) with custom logic per language.

**Why rejected**:
- Violates DRY principle - duplicates execution logic across services
- Harder to maintain - changing execution behavior requires updating 4+ classes
- Doesn't leverage tool registry architecture established in HODGE-341.2
- Makes adding new languages more complex (full service class vs registry entry)

**When to use**: Only if language-specific execution logic diverges significantly. Current requirements don't warrant this complexity.

### Approach 3: Defer Monorepo Support (Not Recommended)

**Description**: Implement single-language support first, defer monorepo to follow-up phase.

**Why rejected**:
- Monorepo support was specified as required (not optional) in conversation
- Architecture decisions impact single-language design (can't retrofit easily)
- Real-world projects increasingly use monorepos - deferring reduces usefulness

**When to use**: Only if timeline pressure requires shipping minimal scope. Not recommended given "must have" requirement.

## Recommendation

**Approach 1: Tool Registry Extension with Monorepo Detection** is strongly recommended because:

1. **Maintains architectural consistency**: Builds naturally on HODGE-341.2's two-layer configuration
2. **Full feature parity**: All languages get same quality check categories as TypeScript
3. **Monorepo first-class**: Auto-detection and unified execution make multi-language projects seamless
4. **Framework-aware**: Semgrep rules applied intelligently based on detected dependencies
5. **Extensible pattern**: Adding future languages (Go, Rust, C#) follows same registry pattern
6. **Smart scoping**: Only runs checks for affected projects, handles build file changes appropriately
7. **Simple where possible**: Import analysis uses regex (not AST parsing), test scoping accepts Gradle limitation
8. **Leverages siblings**: Uses CriticalFileSelector from HODGE-341.3, compressed profiles from HODGE-341.4

The key insight: **Hodge's value isn't language-specific tool implementation - it's the hybrid tool+AI orchestration**. Adding languages is primarily configuration (tool registry entries) rather than code (language-specific services).

## Test Intentions

Behavioral expectations for HODGE-341.5:

1. **Multi-language detection**: `hodge init` detects Python, Kotlin, and Java projects by scanning for pyproject.toml, build.gradle.kts, pom.xml

2. **Monorepo structure**: Generates `language: multi` with projects array when multiple languages detected in repository

3. **Package manager detection**: Detects poetry vs pip for Python (checks for [tool.poetry] in pyproject.toml), Gradle vs Maven for Kotlin/Java (prefers Gradle when both present)

4. **Tool detection per language**: Follows "Config files > Dependencies > PATH" priority for each language's tools

5. **Default tool selection**: Uses ruff for Python linting when neither ruff nor pylint installed, detekt for Kotlin, checkstyle+pmd for Java

6. **Full parity tools**: Each language has type_checking, linting, testing, formatting, complexity, duplication, security, architecture quality checks

7. **Tool registry completeness**: Registry includes detection rules, install commands per package manager, command templates, version commands, and quality check mappings for all tools

8. **Scoped execution**: Runs quality checks only for projects containing changed files

9. **Build file triggers**: Changes to pyproject.toml, build.gradle.kts, or pom.xml trigger full project validation

10. **Mixed language support**: Single `hodge harden` call runs all relevant language tools on their respective files, results grouped by project

11. **Gradle test limitation**: Kotlin/Java projects run all tests (no file-level scoping due to Gradle limitation)

12. **Import fan-in per project**: Import analysis limited to within each project boundary (not cross-language)

13. **Simple import extraction**: Regex-based patterns for Python (`import X`, `from X import Y`), Kotlin/Java (`import com.example.X`)

14. **Framework detection**: Detects Django, Flask, FastAPI for Python; Spring Boot, Spring Security for Java/Kotlin; Jetpack Compose for Kotlin - loads corresponding Semgrep rules

15. **Semgrep rule bundling**: 2-3 rules per language bundled with Hodge, framework-specific rules applied only when framework detected

16. **Gradle wrapper detection**: Detects and uses `./gradlew` when present, falls back to global `gradle`

17. **Global settings**: `max_critical_files` and `critical_paths` in toolchain.yaml apply to all projects in monorepo

18. **Tool installation workflow**: `hodge init` offers to install missing tools for all detected languages, shows install commands per language's package manager

## Decisions Decided During Exploration

1. ✓ **Languages**: Python, Kotlin, Java (Dart removed from scope)

2. ✓ **Full parity required**: Basic + advanced tools for all languages (type checking, linting, testing, formatting, complexity, duplication, security, architecture)

3. ✓ **Monorepo support**: Required, single toolchain.yaml with `language: multi` and projects array

4. ✓ **Package managers**: Start with most common per language, detect which is in use (poetry vs pip, Gradle vs Maven)

5. ✓ **Build system preference**: Gradle over Maven when both present in project

6. ✓ **Python linter default**: Ruff (modern, fast) when neither ruff nor pylint installed

7. ✓ **Tool registry scope**: Include all tools upfront in bundled tool-registry.yaml

8. ✓ **Project detection**: Automatic by build file presence, with optional explicit override in toolchain.yaml

9. ✓ **Execution scope**: One project at a time, only projects with changed files

10. ✓ **Global settings**: `max_critical_files` and `critical_paths` apply to all projects (no per-project overrides)

11. ✓ **Test scoping**: Gradle projects run all tests (can't scope by file), accepted limitation

12. ✓ **Build file changes**: Run all checks for that project (configuration affects everything)

13. ✓ **Mixed language execution**: Single `hodge harden` call runs all relevant language tools

14. ✓ **Import fan-in scope**: Within project only (not cross-language boundaries)

15. ✓ **Import resolution**: Simple regex-based heuristics (85-90% accuracy acceptable)

16. ✓ **Semgrep rules**: 2-3 per language (6-9 total), framework-based loading

17. ✓ **Framework detection**: Apply Semgrep rules based on detected dependencies

18. ✓ **Tool versions**: Detect and record for context, user environment handles version switching

19. ✓ **Command duplication**: Keep explicit per-project (clarity over DRY)

20. ✓ **Virtual environments**: User activates before running hodge (don't auto-detect paths)

21. ✓ **Tool installation**: Offer for all detected languages during `hodge init`

## Decisions Needed

**No decisions needed** - all design decisions were resolved during exploration conversation.

## Next Steps
- [ ] Proceed to `/build HODGE-341.5` with Approach 1
- [ ] Extend tool-registry.yaml with Python, Kotlin, Java tools
- [ ] Implement language detectors and monorepo detection
- [ ] Enhance InitCommand for multi-language/monorepo setup
- [ ] Update ToolchainService for monorepo execution
- [ ] Add language-specific import extraction to ImportAnalyzer
- [ ] Create framework detector for Semgrep rule selection
- [ ] Bundle Semgrep rules for Python, Kotlin, Java (2-3 per language, 6-9 total)

---
*Exploration completed: 2025-10-12*
*AI exploration based on conversational discovery*
