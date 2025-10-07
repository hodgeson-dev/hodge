# Exploration: HODGE-327.2

## Title
Hodge Self-Review Profile for Architectural Compliance

## Problem Statement

While HODGE-327.1 provides the core review engine and default.yml for universal code quality, Hodge has unique architectural patterns that generic profiles cannot detect - slash command template structure, CLI-template coordination, AI vs CLI responsibility boundaries, logging strategies, and critical lessons learned from past regressions. We need a specialized profile that enforces these Hodge-specific patterns to prevent issues like the subprocess spawning antipattern that proliferated across 15+ files despite being "fixed."

## Conversation Summary

### Scope Confirmation

The `hodge-self-review.yml` profile must cover all Hodge-specific architectural concerns:
- Slash command template quality (structure, completeness, sync with TypeScript)
- CLI-template coordination (signature matching, state file creation, output formats)
- UX consistency across templates (option styles, instruction verbs, emoji/symbol usage)
- Prompt engineering quality (emphasis markers, XML structure, clarity)
- CLI architecture patterns (AI/CLI responsibility boundaries, Service extraction)
- Logging standards compliance (dual logging, direct console usage, error patterns)
- Lessons learned violations (subprocess spawning, test isolation, Write tool usage)

This profile is used by both maintainers reviewing contributions AND AI during the `/harden` phase (integrated in story 327.5).

### Lessons Integration Strategy

**Hybrid Approach**:
1. **Generic criteria**: "Lessons Learned Violations" that loads all lessons from `.hodge/lessons/` (10 files, ~10,400 words - manageable context)
2. **Explicit critical patterns**: Separate criteria for most dangerous/frequent violations

**Why hybrid?**
- Generic catch-all ensures nothing is missed as new lessons are added
- Explicit critical criteria give AI stronger signal on most important patterns
- AI can reference specific lesson files in findings
- Explicit patterns serve as examples that improve AI's interpretation of other lessons

**Critical lessons to explicitly enumerate**:
- HODGE-317.1: Subprocess spawning ban in tests
- HODGE-308: Test isolation - no `.hodge/` modification in tests
- HODGE-319.2: Use Write tool, not bash heredoc for temp files
- HODGE-320: Subprocess elimination patterns

### Standards vs Profile Separation

**Key Insight**: Standards are authoritative rules and context. Profiles are detection patterns for review.

**standards.md** = "These are the rules" (enforcement)
- "Logging Standards: Commands MUST use dual logging"
- "CLI Architecture: Commands MUST be non-interactive"
- What IS required, enforcement levels, rationale

**hodge-self-review.yml** = "Check if code follows the rules" (detection patterns)
- Pattern: "Verify commands use createCommandLogger with enableConsole"
- Pattern: "Check for interactive prompts in AI-orchestrated commands"
- How to verify compliance, severity mappings, detection instructions

**Analogy**: Standards are the law, profiles are the audit checklist.

This separation avoids duplication while maintaining clarity. The profile references standards.md sections and provides specific detection patterns.

### UX Consistency Requirements

**Current State Analysis**:
- Mixed option styles across commands (some use letters a/b/c, some use bullets •)
- Inconsistent instruction verbs ("Choose your next action" vs "Type one of these commands")
- 56 existing emphasis markers (IMPORTANT/MUST/etc.) but usage may not follow prompt engineering best practices

**UX Consistency Checks**:
- **Standardized option style** across ALL commands (pick one format, enforce everywhere)
- **No option markers on slash commands** (can't select by letter/number)
- **Consistent instruction verbs** for user actions
- **Emoji/symbol consistency** (✓/○ for progress, ✅/❌ for results)
- **Header formatting uniformity** (Step 1: vs step 1 vs 1.)
- **Prompt clarity** - user knows what input format is expected
- **Success/error messaging** - consistent symbols and language

### Prompt Engineering Quality

Based on Claude's prompt improver principles, the profile should check for:
- **Effective emphasis markers** (IMPORTANT, MUST, REQUIRED used strategically, not overused)
- **XML tag structure** for organizing complex sections
- **Step-by-step reasoning** guidance for complex tasks
- **Clear output format** specifications
- **Strategic examples** when needed for clarity
- **Chain-of-thought instructions** for sophisticated analysis

### CLI Architecture Patterns

Hodge-specific architectural requirements that must be enforced:

**AI-Orchestrated vs User-Facing**:
- AI-orchestrated commands (explore, decide, build, harden, ship, etc.) MUST be non-interactive
- Only init/logs can prompt for user input
- All parameters must come from arguments or environment variables

**Service Class Extraction**:
- Commands should be thin wrappers (orchestration only)
- Business logic extracted to testable Service classes
- Pattern established in HODGE-322

**File Creation Responsibility**:
- AI writes content files (exploration.md, decisions.md, lessons, reviews) via Write tool
- CLI creates structure (directories, PM integration, tracking)
- Service classes should NOT write files for slash command workflows

### Logging Standards Compliance

HODGE-330 established critical logging patterns:

**Command Logging** (src/commands/**):
- Dual output (console + pino) using `createCommandLogger('name', { enableConsole: true })`

**Library Logging** (src/lib/**):
- Pino-only using `createCommandLogger('name')` or `{ enableConsole: false }`

**Prohibited Patterns**:
- Direct console.log/warn/error except in exempted locations (tests, scripts, logger.ts)
- Error string interpolation instead of structured objects

**Required Patterns**:
- Instance logger pattern (no static logger classes)
- Structured error passing: `{ error: error as Error }`

### Test Behavioral Expectations

**Profile Schema Validation**:
- Can load and parse hodge-self-review.yml
- Validates all required fields present
- Handles malformed YAML gracefully

**Detection Accuracy** (each criteria category):
- Slash command template violations detected
- CLI-template coordination issues caught
- UX inconsistencies flagged
- Prompt engineering weaknesses identified
- CLI architecture violations reported
- Logging standard non-compliance detected
- Lessons learned violations caught (both generic and explicit critical patterns)

**Integration with Review Engine**:
- Profile works with existing HODGE-327.1 review command
- Automatic merge with standards/principles/patterns/lessons
- Severity levels (blocker/warning/suggestion) correctly applied
- Report format includes file:line references and actionable suggestions

## Implementation Approaches

### Approach 1: Comprehensive YAML Profile with Layered Criteria (Recommended)

**Description**: Create a complete hodge-self-review.yml profile with 7 major criteria sections, each targeting specific Hodge architectural patterns. Uses natural language detection patterns that AI interprets, with references to standards.md for authoritative rules. Includes both generic lessons loading and explicit critical pattern enumeration.

**Profile Structure**:
```yaml
name: "Hodge Self-Review"
description: "Architectural compliance for Hodge development framework"
applies_to:
  - "glob: .claude/commands/*.md"
  - "glob: src/commands/*.ts"
  - "glob: src/lib/*.ts"
  - "glob: src/**/*.test.ts"

criteria:
  # 1. Slash Command Template Quality
  - name: "Template Structural Consistency"
    severity: warning
    reference: ".hodge/standards.md"
    patterns:
      - "Check all templates use consistent step numbering (Step 1:, Step 2:)"
      - "Verify templates include error handling guidance"
      - "Ensure templates have next steps menu at end"
      - "Check template completeness (user prompts, context loading, command execution)"

  - name: "Template Sync Compliance"
    severity: blocker
    patterns:
      - "Verify changes to .claude/commands/*.md are reflected in src/lib/claude-commands.ts"
      - "Check template content matches TypeScript string constants"

  # 2. CLI-Template Coordination
  - name: "Command Signature Matching"
    severity: blocker
    patterns:
      - "Verify slash command template calls match actual CLI command signatures"
      - "Check that templates reference actual CLI flags (not invented ones)"
      - "Ensure state files referenced in templates are created by CLI"
      - "Verify output format expectations (JSON vs plain text) match CLI behavior"

  # 3. UX Consistency
  - name: "Option Style Standardization"
    severity: warning
    patterns:
      - "Check all templates use same option style (letters a/b/c OR bullets •)"
      - "Flag mixed option styles within same command"
      - "Ensure slash commands use bullet format, not selectable letters/numbers"
    custom_instructions: |
      Standardize on one option format across all templates.
      Slash commands cannot be selected by letter/number - use bullets.

  - name: "Instruction Verb Consistency"
    severity: suggestion
    patterns:
      - "Check for consistent instruction verbs (Choose vs Type vs Select)"
      - "Verify user knows what input format is expected"
      - "Flag ambiguous prompts"

  - name: "Symbol and Emoji Consistency"
    severity: suggestion
    patterns:
      - "Check progress indicators use same symbols (✓/○ vs ✅/❌)"
      - "Verify emoji usage is consistent across commands"
      - "Flag inconsistent header formatting (Step 1: vs step 1 vs 1.)"

  # 4. Prompt Engineering Quality
  - name: "Effective Emphasis Usage"
    severity: warning
    reference: "https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/prompt-improver"
    patterns:
      - "Check IMPORTANT/MUST/REQUIRED markers used strategically, not overused"
      - "Verify emphasis markers highlight truly critical instructions"
      - "Flag walls of emphasis that reduce signal-to-noise ratio"
    custom_instructions: |
      Based on Claude's prompt improver principles:
      - Emphasis should guide attention to critical sections
      - Overuse dilutes effectiveness
      - Strategic placement improves reliability

  - name: "Structural Clarity"
    severity: suggestion
    patterns:
      - "Check complex sections use XML tags for organization"
      - "Verify step-by-step reasoning guidance for complex tasks"
      - "Ensure clear output format specifications"
      - "Check for strategic examples when needed"

  # 5. CLI Architecture Patterns
  - name: "AI-Orchestrated Command Compliance"
    severity: blocker
    reference: ".hodge/standards.md#cli-architecture-standards"
    patterns:
      - "Check AI-orchestrated commands are non-interactive (no prompts)"
      - "Verify only init/logs commands use interactive prompts"
      - "Ensure parameters come from arguments or environment variables"
    custom_instructions: |
      AI-orchestrated commands: explore, decide, build, harden, ship, save, load, plan, status, link.
      These MUST NOT prompt for user input - AI cannot respond interactively.

  - name: "Service Class Extraction"
    severity: warning
    reference: ".hodge/patterns/test-pattern.md"
    patterns:
      - "Check commands are thin wrappers (orchestration only)"
      - "Verify business logic extracted to Service classes"
      - "Flag complex logic in CLI command execute() methods"
    custom_instructions: |
      HODGE-322 established this pattern for testability.
      Business logic in Service classes can be unit tested.
      CLI commands are AI-orchestrated and harder to test.

  - name: "File Creation Responsibility"
    severity: blocker
    reference: ".hodge/standards.md#slash-command-file-creation-pattern"
    patterns:
      - "Check AI writes content files (exploration.md, decisions.md) via Write tool"
      - "Verify CLI creates structure (directories, PM integration)"
      - "Flag Service classes writing files for slash command workflows"
    custom_instructions: |
      Clear separation: CLI = orchestration, AI = content generation.
      Write tool automatically handles parent directory creation.

  # 6. Logging Standards Compliance
  - name: "Command Logging Pattern"
    severity: blocker
    reference: ".hodge/standards.md#logging-standards"
    patterns:
      - "Check commands in src/commands/** use createCommandLogger"
      - "Verify enableConsole: true for command loggers"
      - "Flag commands using direct console.log/warn/error"
    custom_instructions: |
      Commands need dual logging (console + pino) for user feedback and debugging.

  - name: "Library Logging Pattern"
    severity: blocker
    reference: ".hodge/standards.md#logging-standards"
    patterns:
      - "Check libraries in src/lib/** use createCommandLogger"
      - "Verify enableConsole: false or flag omitted for library loggers"
      - "Flag libraries with console output enabled"
    custom_instructions: |
      Libraries are internal - console output creates noise.
      All logging captured in pino for debugging.

  - name: "Direct Console Usage"
    severity: blocker
    patterns:
      - "Flag console.log/warn/error outside exempted locations"
      - "Check exemptions: tests (*.test.ts), scripts (scripts/**), logger.ts"
      - "Verify logger methods used instead of direct console"

  - name: "Error Object Passing"
    severity: warning
    patterns:
      - "Check errors passed as structured objects: { error: error as Error }"
      - "Flag error string interpolation: logger.error(`Error: ${error}`)"
    custom_instructions: |
      Structured error logging preserves stack traces in pino JSON logs.
      Enables better debugging and log analysis.

  # 7. Lessons Learned Violations
  - name: "Lessons Learned Violations (Generic)"
    severity: blocker
    reference: ".hodge/lessons/"
    patterns:
      - "Load all lessons from .hodge/lessons/ directory"
      - "Check for violations of any documented lessons"
      - "Reference specific lesson files in findings (HODGE-XXX)"
    custom_instructions: |
      Review all lessons learned for potential violations.
      These represent hard-won knowledge from past mistakes.

  - name: "Subprocess Spawning Ban (HODGE-317.1)"
    severity: blocker
    reference: ".hodge/lessons/HODGE-317.1-eliminate-hung-test-processes.md"
    patterns:
      - "Check for execSync(), spawn(), exec() in test files"
      - "Flag any subprocess spawning in tests"
      - "Verify direct assertions used instead of subprocess execution"
    custom_instructions: |
      This is a CRITICAL mandatory standard.
      Subprocesses create zombie processes that hang indefinitely.
      Zero exceptions - if you think you need it, you're testing the wrong thing.

  - name: "Test Isolation (HODGE-308)"
    severity: blocker
    reference: ".hodge/lessons/HODGE-308-test-isolation-basepath.md"
    patterns:
      - "Check tests use temporary directories (os.tmpdir())"
      - "Flag tests modifying .hodge/ directory"
      - "Verify tests create isolated temp directories for .hodge structure"
    custom_instructions: |
      Tests modifying actual project .hodge/ can corrupt data and affect other tests.

  - name: "Write Tool Usage (HODGE-319.2)"
    severity: warning
    reference: ".hodge/lessons/HODGE-319.2-invisible-temp-file-creation.md"
    patterns:
      - "Check for bash heredoc in slash command templates"
      - "Verify Write tool used for file creation instead"
      - "Flag cat <<EOF or echo > patterns in templates"
    custom_instructions: |
      Write tool provides better visibility and error handling.
      Bash heredoc creates files invisibly in conversation.

  - name: "Subprocess Elimination (HODGE-320)"
    severity: blocker
    reference: ".hodge/lessons/HODGE-320-flaky-tests-subprocess-elimination.md"
    patterns:
      - "Check for indirect subprocess spawning in test helpers"
      - "Flag validation via subprocess execution"
      - "Verify artifact-based testing (read files, not run commands)"
```

**Pros**:
- Comprehensive coverage of all Hodge-specific patterns
- Clear separation from standards.md (references authoritative rules)
- Natural language patterns leverage AI's strengths
- Hybrid lessons approach balances coverage with emphasis
- Extensible - easy to add new criteria as patterns emerge
- Human-readable YAML accessible to all contributors
- Strategic use of custom_instructions guides AI interpretation

**Cons**:
- Large profile (~200+ lines) might be overwhelming initially
- Requires discipline to maintain as standards evolve
- Detection quality depends on AI prompt engineering
- Some patterns (template sync) might be hard to detect perfectly

**When to use**: This approach is ideal for a mature framework like Hodge that has established architectural patterns and wants comprehensive enforcement during review.

---

### Approach 2: Minimal Profile with Generic References

**Description**: Create a lightweight hodge-self-review.yml that primarily references standards.md and lessons/ with minimal explicit patterns. Relies heavily on AI's ability to infer detection patterns from reading standards.

**Profile Structure**:
```yaml
name: "Hodge Self-Review"
description: "Architectural compliance - see standards.md for rules"
applies_to:
  - "glob: .claude/commands/*.md"
  - "glob: src/commands/*.ts"
  - "glob: src/lib/*.ts"
  - "glob: src/**/*.test.ts"

criteria:
  - name: "Standards Compliance"
    severity: blocker
    reference: ".hodge/standards.md"
    patterns:
      - "Check for violations of any standards in standards.md"
    custom_instructions: |
      Read standards.md carefully and detect violations.
      Focus on CLI Architecture, Logging, Testing Requirements sections.

  - name: "Lessons Learned Violations"
    severity: blocker
    reference: ".hodge/lessons/"
    patterns:
      - "Check for violations of any lessons in .hodge/lessons/"

  - name: "Slash Command Quality"
    severity: warning
    patterns:
      - "Review .claude/commands/*.md for consistency and completeness"
      - "Check CLI-template coordination"
```

**Pros**:
- Minimal maintenance - just update standards.md
- Avoids duplication between standards and profile
- Simple and easy to understand
- Flexible - AI interprets standards contextually

**Cons**:
- Vague patterns may reduce detection accuracy
- No explicit emphasis on critical patterns (subprocess ban, etc.)
- Harder to test - unclear what AI should detect
- May miss nuanced violations without specific guidance
- No UX consistency or prompt engineering checks

**When to use**: For rapid prototyping or if you trust AI to infer patterns from standards alone. Not recommended for production use.

---

### Approach 3: Modular Profiles (Split by Domain)

**Description**: Instead of one large hodge-self-review.yml, create multiple focused profiles that can be used independently or together: hodge-templates.yml, hodge-cli.yml, hodge-logging.yml, hodge-lessons.yml.

**Profile Structure**:
```
.hodge/review-profiles/
├── default.yml                    # Universal code quality
├── hodge-templates.yml            # Slash command template quality
├── hodge-cli.yml                  # CLI architecture patterns
├── hodge-logging.yml              # Logging standards compliance
├── hodge-lessons.yml              # Lessons learned enforcement
└── hodge-self-review.yml          # Meta-profile that includes all above
```

**hodge-self-review.yml**:
```yaml
name: "Hodge Self-Review (Complete)"
description: "All Hodge-specific checks"
includes:
  - hodge-templates.yml
  - hodge-cli.yml
  - hodge-logging.yml
  - hodge-lessons.yml
```

**Pros**:
- Modular - can review just templates or just logging
- Easier to maintain (focused files)
- Reusable - other projects might use hodge-logging.yml
- Clearer organization by domain

**Cons**:
- Requires profile "include" mechanism (not yet built in HODGE-327.1)
- More complex file structure
- Harder to see complete picture
- Story 327.2 scope creep (building include system)

**When to use**: Future enhancement after basic profile system is proven. Not appropriate for story 327.2 which needs to deliver value quickly.

## Recommendation

**Use Approach 1: Comprehensive YAML Profile with Layered Criteria**

This approach best aligns with story 327.2 requirements and Hodge's maturity:

1. **Complete Coverage**: Addresses all Hodge-specific patterns identified in conversation (templates, CLI, UX, prompting, architecture, logging, lessons)
2. **Clear Separation**: Standards.md remains authoritative, profile provides detection patterns with references
3. **Hybrid Lessons Strategy**: Generic load-all + explicit critical patterns balances coverage with emphasis
4. **Production Ready**: Detailed enough for maintainers to review contributions and AI to use during /harden
5. **Extensible**: Easy to add new criteria as architectural patterns emerge
6. **Builds on 327.1**: Uses existing profile system without requiring new features
7. **Human Readable**: YAML with natural language patterns accessible to all contributors

**Implementation Priority**:
1. Create `.hodge/review-profiles/hodge-self-review.yml` with all 7 criteria sections
2. Write smoke tests validating profile schema correctness
3. Create integration tests with mock violations to verify detection accuracy
4. Document profile usage in `.hodge/patterns/` or README
5. Test with real Hodge codebase (review existing templates/commands)
6. Refine patterns based on false positives/negatives

## Decisions Decided During Exploration

1. ✓ **Hybrid lessons approach** - Generic "load all lessons" criteria + explicit critical patterns (subprocess ban, test isolation, Write tool usage, subprocess elimination) for stronger AI signal
2. ✓ **Standards separation** - Authoritative rules stay in standards.md, detection patterns in profile with references to standards
3. ✓ **UX consistency enforcement** - Standardize option styles, instruction verbs, emoji usage, header formatting across all templates
4. ✓ **Prompt engineering quality** - Incorporate Claude prompt improver principles (effective emphasis, XML structure, step-by-step reasoning, clear output specs)
5. ✓ **CLI architecture checks** - Verify AI/CLI responsibility boundaries (non-interactive commands), Service extraction pattern, file creation responsibility separation
6. ✓ **Logging compliance** - Detect dual logging violations (commands), pino-only violations (libraries), direct console usage, error object patterns
7. ✓ **Both audiences** - Profile used by maintainers reviewing contributions AND AI during /harden phase (story 327.5 integration)
8. ✓ **Comprehensive single profile** - One hodge-self-review.yml with 7 criteria sections, not modular split (modular is future enhancement)
9. ✓ **All Hodge-specific concerns** - Slash command quality, CLI-template coordination, UX consistency, prompt engineering, CLI architecture, logging standards, lessons violations

## Decisions Needed

**No Decisions Needed**

All technical decisions were resolved during conversational exploration.

## Test Intentions

**Profile Schema Validation**:
- Can load and parse hodge-self-review.yml from `.hodge/review-profiles/`
- Validates all required fields present (name, description, applies_to, criteria)
- Each criteria has required fields (name, severity, patterns)
- Handles malformed YAML gracefully with clear error message

**Slash Command Template Quality Detection**:
- Detects missing step numbering consistency
- Flags incomplete templates (missing error handling, next steps menu)
- Catches template sync issues (template changes not in claude-commands.ts)

**CLI-Template Coordination Detection**:
- Identifies command signature mismatches (wrong flags, arguments)
- Flags references to non-existent state files
- Catches output format mismatches (template expects JSON, CLI outputs text)

**UX Consistency Detection**:
- Flags mixed option styles (a/b/c vs bullets within same command)
- Detects inconsistent instruction verbs across templates
- Catches emoji/symbol inconsistencies
- Identifies non-standard header formatting

**Prompt Engineering Quality Detection**:
- Flags overuse of emphasis markers (too many IMPORTANT/MUST/REQUIRED)
- Suggests XML tags for complex sections
- Identifies missing step-by-step reasoning guidance
- Catches unclear output format specifications

**CLI Architecture Pattern Detection**:
- Flags interactive prompts in AI-orchestrated commands
- Detects missing Service class extraction (complex logic in CLI commands)
- Catches Service classes writing files for slash command workflows (violates Write tool pattern)

**Logging Standards Compliance Detection**:
- Identifies commands without dual logging (missing createCommandLogger with enableConsole: true)
- Flags libraries with console output enabled
- Detects direct console.log/warn/error usage outside exempted locations
- Catches error string interpolation instead of structured objects

**Lessons Learned Violations Detection (Generic)**:
- Loads all lessons from `.hodge/lessons/` directory
- Detects violations of any documented lesson
- References specific lesson files in findings

**Critical Lessons Violations Detection (Explicit)**:
- Detects subprocess spawning (execSync, spawn, exec) in test files
- Flags tests modifying `.hodge/` directory (test isolation violations)
- Catches bash heredoc usage instead of Write tool
- Identifies indirect subprocess spawning in test helpers

**Integration with Review Engine**:
- Profile works with existing `/review file` command from HODGE-327.1
- Automatic merge with standards/principles/patterns/lessons (layered system)
- Severity levels (blocker/warning/suggestion) correctly applied
- Report format includes file:line references and actionable suggestions
- Custom instructions guide AI analysis approach for each criteria

**Graceful Failures**:
- Handles missing profile file (error: "Profile not found")
- Handles missing standards.md or lessons/ (warn but continue)
- Handles partial profile (missing criteria sections work independently)

---

*Template created: 2025-10-05T06:47:00.000Z*
*Exploration completed: 2025-10-05T07:15:00.000Z*
*AI exploration: Claude Code (Conversational Mode)*
