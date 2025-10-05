# Exploration: HODGE-327.1

## Title
Core review engine with profile system and layered quality criteria

## Problem Statement

This story delivers the foundational `/review file` command that enables AI-driven architectural code review. It must load YAML review profiles, analyze code using a layered quality criteria system (project standards > profile defaults > universal baseline), and generate actionable markdown reports with blocker/warning/suggestion severity levels. This is the core infrastructure that all other review functionality (scope expansion, additional profiles, harden integration) builds upon.

## Conversation Summary

### Scope Confirmation

The minimum viable scope for this story to be shippable was confirmed as:
- `/review file src/example.ts` command works end-to-end
- Loads `default.yml` profile from `.hodge/review-profiles/`
- Analyzes the file for basic code quality (coupling, SRP, DRY, complexity)
- Generates markdown report with blocker/warning/suggestion findings
- Each finding includes file:line reference and suggested `/explore` command

This scope delivers a complete, testable feature that provides immediate value.

### YAML Profile Schema Design

The profile schema is foundational to the entire review system. Key decisions:

**Pattern Format**: Simple strings that AI interprets freely, rather than structured regex or AST rules. This keeps profiles human-readable and flexible while leveraging AI's natural language understanding.

Example:
```yaml
patterns:
  - "Check for subprocess spawning in tests"
  - "Look for duplicated validation logic across files"
```

**Lessons Integration**: Profiles can reference lessons learned via a `reference` field. When a criteria references `.hodge/lessons/`, the review engine loads ALL lessons at review start to check for violations. This simple approach prioritizes correctness over optimization (can optimize later if context size becomes an issue).

**Custom Instructions Field**: Included in story 327.1 to support analysis context and philosophy guidance beyond simple pattern detection. This enables profiles to provide domain-specific evaluation guidance.

Example:
```yaml
custom_instructions: |
  When reviewing API endpoints, consider this project uses REST conventions.
  Check that authentication patterns are uniform across all endpoints.
  Flag inconsistent error response formats.
```

### Architectural Layer System

A critical architectural insight emerged: review profiles must integrate with Hodge's existing quality system (standards, principles, patterns, lessons) rather than duplicate or conflict with it.

**Layered Review Architecture**:

**Layer 1: Project-Specific (Highest Priority)**
- `.hodge/standards.md` - Enforceable rules that MUST be true (overrides everything)
- `.hodge/principles.md` - Project philosophy and values (guides interpretation)
- `.hodge/patterns/` - Project-specific solutions and expected patterns
- `.hodge/lessons/` - Hard-won knowledge from past mistakes (violations are blockers)

**Layer 2: Profile Domain Defaults**
- `.hodge/review-profiles/react-components.yml` - React best practices
- `.hodge/review-profiles/api-design.yml` - REST/GraphQL conventions
- Provide default criteria but can be overridden by Layer 1

**Layer 3: Universal Baseline**
- `.hodge/review-profiles/default.yml` - Language-agnostic code quality
- Coupling, SRP, DRY, complexity, naming

**Automatic Merge Strategy**: Standards, principles, patterns, and lessons are ALWAYS loaded into review context automatically, regardless of which profile is used. Profiles add domain-specific criteria on top of this foundation. Project-specific rules in standards.md override profile domain defaults when conflicts occur.

**Example Conflict Resolution**:
If `react-components.yml` recommends "Use functional components" but `.hodge/standards.md` says "This project uses class components for legacy compatibility," the standard overrides the profile and AI should not flag class components.

### Test Behavioral Expectations

Eight core behaviors were identified for this story:

1. **Profile Loading**: Can load and parse `default.yml` profile from `.hodge/review-profiles/`
2. **File Analysis**: Can analyze a single TypeScript/JavaScript file for code quality issues
3. **Lessons Integration**: Loads all lessons from `.hodge/lessons/` and checks for violations
4. **Severity Categorization**: Reports findings in 3 groups (blocker/warning/suggestion)
5. **Actionable Output**: Each finding includes file:line reference and suggested `/explore` command
6. **Custom Instructions**: Profile's custom_instructions field guides AI analysis approach
7. **Report Generation**: Produces markdown report with grouped findings (medium verbosity)
8. **Graceful Failures**: Handles missing profile, missing file, malformed YAML gracefully with clear error messages

## Implementation Approaches

### Approach 1: Template-Driven AI Review (Recommended)

**Description**: The review engine loads the profile and project context (standards/principles/patterns/lessons), then passes everything to AI via an enhanced slash command template. The AI performs the analysis and generates the report based on template instructions. No complex CLI logic for analysis - just context loading and report formatting.

**Architecture**:
```
CLI (hodge review):
1. Load profile YAML (.hodge/review-profiles/default.yml)
2. Load project context (standards.md, principles.md, patterns/, lessons/)
3. Read target file
4. Pass to AI via .claude/commands/review.md template
5. AI analyzes and generates report
6. CLI formats and outputs report
```

**Profile Schema**:
```yaml
name: "Default Code Quality"
description: "Universal code quality checks for any language"
applies_to:
  - "glob: **/*.ts"
  - "glob: **/*.js"
  - "glob: **/*.py"

criteria:
  - name: "Single Responsibility Principle"
    severity: warning
    patterns:
      - "Check if classes/functions do multiple unrelated things"
      - "Look for god objects or utility classes with disparate responsibilities"

  - name: "Lessons Learned Violations"
    severity: blocker
    reference: ".hodge/lessons/"
    patterns:
      - "Check for subprocess spawning in tests (HODGE-317.1)"
      - "Verify test isolation - no .hodge modification (HODGE-308)"
      - "Ensure ESM compatibility - no CommonJS patterns (HODGE-318)"

  - name: "DRY Violations"
    severity: suggestion
    patterns:
      - "Look for duplicated logic across functions"
      - "Check for repeated validation patterns"
    custom_instructions: |
      Focus on substantive duplication, not incidental similarity.
      Flag when same business logic appears in 3+ places.

  - name: "Complexity Hotspots"
    severity: warning
    patterns:
      - "Flag functions with 4+ levels of nesting"
      - "Identify functions longer than 50 lines"
    custom_instructions: |
      Consider cognitive load - would this confuse a new team member?
      Suggest extraction of complex logic into well-named helpers.
```

**Slash Command Template** (`.claude/commands/review.md`):
```markdown
# Review Command

## Scope: {{scope}}

### Step 1: Load Project Context
- Standards: {{standards_content}}
- Principles: {{principles_content}}
- Patterns: {{patterns_list}}
- Lessons: {{lessons_content}}

### Step 2: Load Profile
Profile: {{profile_name}}
Criteria: {{profile_criteria}}

### Step 3: Analyze File
File: {{file_path}}
Content: {{file_content}}

Apply layered review:
1. Check project standards (MUST be enforced)
2. Check lessons learned violations (blockers)
3. Apply profile criteria
4. Consider principles for interpretation

### Step 4: Generate Report
For each finding:
- Severity: blocker/warning/suggestion
- Description: What's the issue
- Location: file:line
- Rationale: Why this matters (reference standard/lesson/pattern if applicable)
- Suggested action: /explore "{{feature_description}}"

Output format: Grouped findings with medium verbosity
```

**Pros**:
- Leverages AI's strength - natural language understanding of quality criteria
- Simple implementation - CLI just loads context, AI does analysis
- Flexible - easy to add new criteria types without code changes
- Profiles remain human-readable and writable
- AI can provide nuanced, context-aware analysis

**Cons**:
- Analysis quality depends on AI prompt engineering
- No deterministic guarantees (same file might get slightly different reports)
- Harder to unit test analysis logic (testing AI output)

**When to use**: This approach is ideal for a framework that prioritizes AI-driven workflows and values flexibility over determinism. Aligns with Hodge's "AI analyzes, backend executes" principle.

---

### Approach 2: Hybrid Rule Engine + AI Review

**Description**: Build a rule engine that parses profile criteria into structured checks (regex patterns, AST queries, metric thresholds). The engine performs deterministic checks and flags potential issues. AI is then invoked to interpret findings, provide context, and generate the human-readable report.

**Architecture**:
```
CLI (hodge review):
1. Load profile and compile criteria into rules
2. Run rule engine against file
   - Pattern matching (regex)
   - AST analysis (complexity metrics)
   - Cross-reference checks (lessons violations)
3. Collect findings (location + matched rule)
4. Pass findings to AI for interpretation
5. AI generates contextual report with rationale
```

**Profile Schema** (extended with structured rules):
```yaml
criteria:
  - name: "Subprocess Spawning Ban"
    severity: blocker
    rules:
      - type: "regex"
        pattern: "execSync|spawn|exec\\("
        message: "Subprocess spawning detected"
      - type: "ast"
        query: "CallExpression[callee.name=/exec/]"
    reference: ".hodge/lessons/HODGE-317.1"
```

**Pros**:
- Deterministic - same file always produces same findings
- Testable - can unit test rule engine independently
- Fast - no AI calls for detection, only interpretation
- Precise - regex/AST patterns catch specific violations

**Cons**:
- Complex implementation - requires rule compiler, AST parser
- Profiles become less human-readable (need to learn rule syntax)
- Rigid - adding new rule types requires code changes
- Misses nuanced issues that AI would catch ("this is too complex" vs "nesting > 4")

**When to use**: When deterministic, repeatable analysis is critical, or when dealing with very large codebases where AI cost becomes prohibitive.

---

### Approach 3: Pure Template (No CLI Review Command)

**Description**: Skip the `hodge review` CLI command entirely for story 327.1. Just enhance the `.claude/commands/review.md` slash command template to load profiles manually and have AI perform analysis directly. The CLI comes in later stories when scope expansion requires orchestration.

**Architecture**:
```
User runs: /review file src/example.ts

Slash command template:
1. cat .hodge/review-profiles/default.yml
2. cat .hodge/standards.md
3. cat .hodge/lessons/*.md
4. cat src/example.ts
5. AI analyzes based on template instructions
6. AI outputs markdown report
```

**Pros**:
- Minimal implementation - just template enhancement
- Fastest path to working review
- Zero CLI code needed for story 327.1
- Pure AI-driven (maximum flexibility)

**Cons**:
- No structured profile system (just cat files)
- No standardized report format
- Hard to test
- Doesn't deliver reusable CLI command for other stories
- Not shippable as a "core engine" (too minimal)

**When to use**: For rapid prototyping to validate AI review quality before building infrastructure. Not appropriate for story 327.1 which requires a proper foundation.

## Recommendation

**Use Approach 1: Template-Driven AI Review**

This approach best aligns with story 327.1's requirements and Hodge's architecture:

1. **Delivers Core Infrastructure**: Provides reusable CLI command, profile system, and report generation that other stories build on
2. **AI-First Architecture**: Matches Hodge's "AI analyzes, backend executes" principle - CLI loads context, AI performs analysis
3. **Flexible & Extensible**: Simple string patterns enable sophisticated analysis without rigid rule syntax
4. **Human-Readable Profiles**: YAML with natural language criteria is accessible to all developers
5. **Shippable Value**: Working `/review file` command provides immediate utility even before scope expansion
6. **Layered Quality System**: Automatic merge of standards/principles/patterns/lessons creates comprehensive review without duplication

**Implementation Priority**:
1. Profile loader (YAML parser, schema validation)
2. Context aggregator (load standards/principles/patterns/lessons)
3. Slash command template (.claude/commands/review.md)
4. CLI command (orchestrates loading, calls template, formats output)
5. Report generator (markdown with blocker/warning/suggestion groups)
6. Error handling (missing files, malformed YAML)

## Decisions Decided During Exploration

1. ✓ **Load all lessons at review start** - Simple approach loads entire `.hodge/lessons/` directory when profile references lessons, optimizing later if context size becomes an issue
2. ✓ **Include custom_instructions field in profile schema** - Enables analysis guidance beyond pattern matching from story 327.1 onward
3. ✓ **Automatic merge of project context** - Standards, principles, patterns, and lessons automatically loaded into every review regardless of profile
4. ✓ **Project-specific criteria override profile defaults** - Layered system where `.hodge/standards.md` rules override profile domain recommendations
5. ✓ **Simple string patterns in YAML** - Patterns are natural language that AI interprets, not regex or AST queries

## Decisions Needed

**No Decisions Needed**

All technical decisions were resolved during conversational exploration.

## Test Intentions

**Profile System**:
- Can load and parse YAML profile from `.hodge/review-profiles/default.yml`
- Validates profile schema (required fields: name, criteria with severity/patterns)
- Handles malformed YAML gracefully with clear error message

**Context Loading**:
- Automatically loads `.hodge/standards.md` content
- Automatically loads `.hodge/principles.md` content
- Automatically loads all files from `.hodge/patterns/` directory
- Automatically loads all files from `.hodge/lessons/` directory
- Handles missing files gracefully (warn but continue if non-critical)

**File Analysis**:
- Can analyze a single TypeScript file for code quality issues
- Can analyze a single JavaScript file for code quality issues
- Applies profile criteria patterns to detect issues
- Uses custom_instructions to guide analysis approach
- References standards/principles/lessons during analysis

**Severity Categorization**:
- Groups findings into 3 categories: blocker/warning/suggestion
- Correctly maps profile severity values to categories
- Prioritizes blockers first, then warnings, then suggestions in report

**Report Generation**:
- Produces markdown output with grouped findings (medium verbosity)
- Each finding includes file:line reference
- Each finding includes rationale (why it matters)
- Each finding includes suggested `/explore` command text
- Report groups similar issues together (DRY violations, complexity issues, etc.)

**Graceful Failure Modes**:
- Handles missing profile file (error: "Profile not found at {path}")
- Handles missing target file (error: "File not found: {path}")
- Handles malformed YAML (error: "Invalid profile syntax: {details}")
- Handles missing project context files (warn but continue)

**Custom Instructions**:
- Profile's custom_instructions field is included in AI context
- AI analysis reflects custom_instructions guidance
- Can verify custom instructions affect analysis output (testable via examples)

**Layered Priority System**:
- Standards violations are reported as blockers regardless of profile severity
- Lessons violations are reported as blockers
- Profile criteria can be overridden by standards (no false positives when standard allows pattern)

---

*Exploration completed: 2025-10-04T23:15:00.000Z*
*AI exploration: Claude Code (Conversational Mode)*

---

# Exploration: HODGE-327.1 (Revisited - Review Persistence)

## Title
Save review reports with user choice and contextual metadata

## Problem Statement

The `/review` command currently displays analysis reports but they vanish after the user responds to the menu. This creates friction - users must manually copy findings or lose valuable architectural insights. We need persistent review storage in `.hodge/reviews/` with metadata (timestamp, scope, profile, feature context) so users can reference findings when fixing issues.

## Conversation Summary

### Scope Confirmation

This enhancement modifies the existing HODGE-327.1 `/review file` command to add persistence:
- After generating the review report, prompt user: "Save report (s)" or "Discard (d)"
- If saved, write to `.hodge/reviews/{file-path-slug}-{timestamp}.md` with metadata header
- If discarded, exit silently (no files created, user can regenerate if needed)
- Both choices implicitly mean "done for now" and "continue development"

### Simplified User Choice Model

The original 5-option menu (a: fix blockers, b: review another file, c: create feature, d: continue, e: done) is replaced with 2 simple choices:

**Why This Works**:
- Users follow report suggestions directly (fix blockers → use `/explore` command from report)
- Multiple file reviews = multiple separate `/review` executions (no session state)
- The saved report itself is the complete artifact (no complex tracking needed)
- Streamlined UX - binary choice instead of 5 options that overlap

### Naming Convention Design

**Current Scope** (file review):
```
.hodge/reviews/src-commands-review-ts-2025-10-04T23-05-10.md
```

**Future Scope Expansion** (directory/pattern/recent/all from stories 327.3+):
```
.hodge/reviews/directory-src-commands-2025-10-04T23-05-10.md
.hodge/reviews/pattern-src-**-test-ts-2025-10-04T23-05-10.md
.hodge/reviews/recent-last-5-commits-2025-10-04T23-05-10.md
.hodge/reviews/all-2025-10-04T23-05-10.md
```

This naming pattern:
- Starts with scope type (file/directory/pattern/recent/all) for future expansion
- For file scope, omits redundant "file-" prefix (just use file path slug)
- Includes slugified path or pattern for discoverability
- Ends with ISO timestamp for uniqueness and chronological sorting

### Metadata Header Format

Saved reports include YAML frontmatter with review context:

```markdown
---
reviewed_at: 2025-10-04T23:05:10.000Z
scope: file
target: src/commands/review.ts
profile: default.yml
feature: HODGE-327.1 (if detected)
findings:
  blockers: 0
  warnings: 3
  suggestions: 2
---

# Code Review Report: src/commands/review.ts
...rest of report...
```

**Feature Detection** (optional):
AI attempts to identify which feature work (HODGE-XXX) most significantly impacted the reviewed file by:
- Checking git blame for recent commits with HODGE-XXX references
- Checking `.hodge/features/` for feature directories with matching file references
- Including in `feature:` field only if confidence is high

### Integration Points

**Review Command Flow**:
1. `hodge review file src/example.ts` (existing logic)
2. Generate report via slash command template (existing)
3. Display report to user (existing)
4. **NEW**: Prompt "Save report (s) or Discard (d)?"
5. **NEW**: If save → write to `.hodge/reviews/` with metadata header
6. **NEW**: If discard → exit silently

**Service Class Architecture**:
Following HODGE-322 pattern (Service class for business logic, thin CLI wrapper):
- `ReviewPersistenceService` handles report saving, filename generation, metadata extraction
- `ReviewCommand` delegates to service after report generation
- Testable without CLI orchestration

## Implementation Approaches

### Approach 1: Template Enhancement with Service-Based Persistence (Recommended)

**Description**: Enhance the existing `.claude/commands/review.md` slash command template to prompt for save/discard after generating the report. Add a `ReviewPersistenceService` class to handle filename generation, metadata extraction, and file writing. The CLI command remains thin - just orchestration.

**Architecture**:
```
Slash Command Template (.claude/commands/review.md):
1. Generate review report (existing logic)
2. Display report to user
3. Prompt: "Save report (s) or Discard (d)?"
4. If save: Call ReviewPersistenceService.save()
5. If discard: Exit

ReviewPersistenceService (src/lib/review-persistence-service.ts):
- generateFilename(scope, target, timestamp): string
  → Converts file path to slug, adds timestamp
- extractMetadata(scope, target, profile, findings): ReviewMetadata
  → Detects feature context, counts findings by severity
- saveReport(report, metadata, filename): void
  → Writes markdown with YAML frontmatter to .hodge/reviews/
- detectFeatureContext(target): string | null
  → Attempts git blame + feature directory detection (optional)

ReviewCommand (src/commands/review.ts):
- Thin wrapper, delegates to ReviewPersistenceService
- No business logic in CLI class
```

**Report Format**:
```markdown
---
reviewed_at: 2025-10-04T23:05:10.000Z
scope: file
target: src/commands/review.ts
profile: default.yml
feature: HODGE-327.1
findings:
  blockers: 0
  warnings: 3
  suggestions: 2
---

# Code Review Report: src/commands/review.ts

**Profile**: Default Code Quality
**Reviewed**: October 4, 2025

## Blockers (0)

No blocker-level issues found.

## Warnings (3)

### 1. Single Responsibility Violation
...
```

**Pros**:
- Follows established HODGE-322 Service pattern (testable business logic)
- Minimal changes to existing review.md template (just add prompt + save call)
- Service class can be unit tested independently (filename generation, metadata extraction)
- Feature detection is isolated and optional (can enhance later)
- Future-proof naming convention ready for directory/pattern/recent scopes

**Cons**:
- Adds new Service class (more code)
- Feature detection might not always be accurate (git blame could be ambiguous)
- Requires updating template sync script to include new prompt logic

**When to use**: This approach is ideal when following Hodge's established CLI architecture patterns and prioritizing testability.

---

### Approach 2: Pure Template Implementation (No Service Class)

**Description**: Handle all persistence logic directly in the slash command template using bash commands. No new TypeScript service class - just template enhancements with file operations.

**Architecture**:
```
Slash Command Template (.claude/commands/review.md):
1. Generate review report (existing logic)
2. Display report to user
3. Prompt: "Save report (s) or Discard (d)?"
4. If save:
   - Generate filename using bash: echo "src/commands/review.ts" | sed 's/\//-/g'
   - Create metadata header with bash template
   - Write to .hodge/reviews/ using cat or echo
5. If discard: Exit
```

**Pros**:
- Zero new TypeScript code (pure template)
- Faster implementation (no Service class to write/test)
- All logic visible in one template file

**Cons**:
- Complex bash scripting in template (harder to read/maintain)
- Not testable (bash logic embedded in template)
- Feature detection via git blame would be very complex in bash
- Violates HODGE-322 pattern (business logic should be in Service classes)
- Harder to extend for future scope types (directory/pattern/recent)

**When to use**: Only for rapid prototyping or if explicitly avoiding TypeScript changes.

---

### Approach 3: CLI-Driven Persistence (Inline in ReviewCommand)

**Description**: Add persistence logic directly in the `ReviewCommand.execute()` method. Prompt user after displaying report, handle file writing inline.

**Architecture**:
```
ReviewCommand.execute():
1. Load profile and context (existing)
2. Generate and display report (existing)
3. Prompt user: "Save report (s) or Discard (d)?"
4. If save:
   - Generate filename inline
   - Extract metadata inline
   - Write file inline
5. If discard: Exit
```

**Pros**:
- Self-contained in one file
- No new classes needed
- Simple to understand for small enhancements

**Cons**:
- Violates CLI Architecture Standards (business logic in CLI command)
- Not testable (CLI commands are AI-orchestrated, can't test via subprocess)
- Mixed concerns (orchestration + business logic + presentation)
- HODGE-322 lesson explicitly discourages this pattern
- Hard to test filename generation and metadata extraction

**When to use**: Not recommended. This violates established standards and lessons learned.

## Recommendation

**Use Approach 1: Template Enhancement with Service-Based Persistence**

This approach best aligns with Hodge's architecture and lessons learned:

1. **Follows HODGE-322 Pattern**: Service class extracts testable business logic, CLI stays thin
2. **CLI Architecture Compliance**: Separates orchestration (CLI) from business logic (Service)
3. **Future-Proof**: Service methods easily extend to directory/pattern/recent scopes in stories 327.3+
4. **Testable**: Can unit test filename generation, metadata extraction, feature detection independently
5. **Maintainable**: Template remains readable, complex logic lives in typed TypeScript
6. **Minimal Template Changes**: Just add prompt and service call to review.md

**Implementation Priority**:
1. Create `ReviewPersistenceService` class with methods:
   - `generateFilename(scope, target, timestamp)`
   - `extractMetadata(scope, target, profile, findings)`
   - `detectFeatureContext(target)` (optional, best-effort)
   - `saveReport(report, metadata, filename)`
2. Add smoke tests for service methods (filename format, metadata structure)
3. Enhance `.claude/commands/review.md` template with save/discard prompt
4. Update CLI command to instantiate service (if needed)
5. Integration test: Generate review → save → verify file exists with correct format

## Decisions Decided During Exploration

1. ✓ **Two-choice menu** - "Save report (s)" or "Discard (d)" replaces original 5-option menu for simplicity
2. ✓ **File-path-based naming** - `src-commands-review-ts-2025-10-04T23-05-10.md` format without redundant "file-" prefix
3. ✓ **Future-proof naming convention** - Pattern extends to `directory-{path}`, `pattern-{glob}`, `recent-{desc}`, `all` for scope expansion
4. ✓ **Metadata header in saved reports** - YAML frontmatter includes timestamp, scope, target, profile, feature (if detected), findings counts
5. ✓ **Discard means exit silently** - No confirmation message, no files created, user can regenerate if needed
6. ✓ **Feature detection is optional** - AI attempts to identify related HODGE-XXX work via git blame and feature directories, includes only if high confidence

## Decisions Needed

**No Decisions Needed**

All technical decisions were resolved during conversational exploration.

## Test Intentions

**Filename Generation**:
- Can convert file path to slug format (e.g., `src/commands/review.ts` → `src-commands-review-ts`)
- Appends ISO timestamp for uniqueness
- Future scopes: Can generate `directory-{slug}-{timestamp}`, `pattern-{slug}-{timestamp}`, etc.

**Metadata Extraction**:
- Extracts reviewed_at timestamp (ISO format)
- Captures scope type (file/directory/pattern/recent/all)
- Records target path or pattern
- Identifies profile name used
- Counts findings by severity (blockers/warnings/suggestions)
- Optionally detects related feature (HODGE-XXX) if confident

**Report Saving**:
- Creates `.hodge/reviews/` directory if it doesn't exist
- Writes markdown file with YAML frontmatter
- Preserves full report content below metadata header
- File is valid markdown parseable by standard tools

**User Interaction**:
- Displays "Save report (s) or Discard (d)?" prompt after review
- Saves report when user chooses "s"
- Exits silently when user chooses "d" (no files created)
- Both choices implicitly mean "done for now"

**Feature Detection** (optional):
- Attempts git blame on reviewed file for HODGE-XXX commit references
- Checks `.hodge/features/HODGE-XXX/` directories for file references
- Includes feature in metadata only if detection confidence is high
- Gracefully omits feature field if detection fails or is ambiguous

**Service Architecture**:
- `ReviewPersistenceService` class handles all persistence logic
- Methods are testable without CLI orchestration
- Filename generation can be unit tested with various inputs
- Metadata extraction can be verified with mock findings

**Integration with Existing Flow**:
- Review generation and display remain unchanged
- Save/discard prompt added after report display
- No changes to profile loading, context aggregation, or analysis logic
- Backward compatible (can discard to preserve original behavior)

---

*Exploration revisited: 2025-10-04T23:35:00.000Z*
*AI exploration: Claude Code (Conversational Mode - Enhancement)*
