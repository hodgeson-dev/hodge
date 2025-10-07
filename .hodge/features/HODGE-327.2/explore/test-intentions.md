# Test Intentions: HODGE-327.2

## Profile Schema Validation

- ✓ Can load and parse hodge-self-review.yml from `.hodge/review-profiles/`
- ✓ Validates all required fields present (name, description, applies_to, criteria)
- ✓ Each criteria has required fields (name, severity, patterns)
- ✓ Handles malformed YAML gracefully with clear error message

## Slash Command Template Quality Detection

- ✓ Detects missing step numbering consistency
- ✓ Flags incomplete templates (missing error handling, next steps menu)
- ✓ Catches template sync issues (template changes not in claude-commands.ts)

## CLI-Template Coordination Detection

- ✓ Identifies command signature mismatches (wrong flags, arguments)
- ✓ Flags references to non-existent state files
- ✓ Catches output format mismatches (template expects JSON, CLI outputs text)

## UX Consistency Detection

- ✓ Flags mixed option styles (a/b/c vs bullets within same command)
- ✓ Detects inconsistent instruction verbs across templates
- ✓ Catches emoji/symbol inconsistencies
- ✓ Identifies non-standard header formatting

## Prompt Engineering Quality Detection

- ✓ Flags overuse of emphasis markers (too many IMPORTANT/MUST/REQUIRED)
- ✓ Suggests XML tags for complex sections
- ✓ Identifies missing step-by-step reasoning guidance
- ✓ Catches unclear output format specifications

## CLI Architecture Pattern Detection

- ✓ Flags interactive prompts in AI-orchestrated commands
- ✓ Detects missing Service class extraction (complex logic in CLI commands)
- ✓ Catches Service classes writing files for slash command workflows (violates Write tool pattern)

## Logging Standards Compliance Detection

- ✓ Identifies commands without dual logging (missing createCommandLogger with enableConsole: true)
- ✓ Flags libraries with console output enabled
- ✓ Detects direct console.log/warn/error usage outside exempted locations
- ✓ Catches error string interpolation instead of structured objects

## Lessons Learned Violations Detection (Generic)

- ✓ Loads all lessons from `.hodge/lessons/` directory
- ✓ Detects violations of any documented lesson
- ✓ References specific lesson files in findings

## Critical Lessons Violations Detection (Explicit)

- ✓ Detects subprocess spawning (execSync, spawn, exec) in test files
- ✓ Flags tests modifying `.hodge/` directory (test isolation violations)
- ✓ Catches bash heredoc usage instead of Write tool
- ✓ Identifies indirect subprocess spawning in test helpers

## Integration with Review Engine

- ✓ Profile works with existing `/review file` command from HODGE-327.1
- ✓ Automatic merge with standards/principles/patterns/lessons (layered system)
- ✓ Severity levels (blocker/warning/suggestion) correctly applied
- ✓ Report format includes file:line references and actionable suggestions
- ✓ Custom instructions guide AI analysis approach for each criteria

## Graceful Failures

- ✓ Handles missing profile file (error: "Profile not found")
- ✓ Handles missing standards.md or lessons/ (warn but continue)
- ✓ Handles partial profile (missing criteria sections work independently)

---

*12 behavioral categories covering schema validation, 7 detection domains, integration, and error handling*
