# Hodge Review - AI-Driven Code Quality Analysis

## Purpose
The `/review` command performs AI-driven architectural code review to identify quality issues that automated tools cannot detect: coupling violations, single responsibility problems, DRY violations across files, naming inconsistencies, complexity hotspots, and lessons-learned violations.

## Command Usage

```bash
/review file <path>              # Review single file
/review directory <path>         # Review directory (future: HODGE-327.3)
/review pattern <glob>           # Review by pattern (future: HODGE-327.3)
/review recent --last N          # Review recent changes (future: HODGE-327.3)
```

**For HODGE-327.1**: Only `/review file <path>` is supported.

## What This Command Does

### 1. Load Project Context (Automatic Merge)
The review engine ALWAYS loads these project files regardless of profile:

**Standards** (Layer 1 - Highest Priority):
```bash
cat .hodge/standards.md
```
Project-specific enforceable rules that MUST be followed. These override profile recommendations.

**Principles** (Layer 1):
```bash
cat .hodge/principles.md
```
Project philosophy and values that guide interpretation of quality criteria.

**Patterns** (Layer 1):
```bash
ls .hodge/patterns/*.md
# Load each pattern file for reference
```
Project-specific solutions and expected implementation patterns.

**Lessons** (Layer 1):
```bash
ls .hodge/lessons/*.md
# Load ALL lesson files for violation checking
```
Hard-won knowledge from past mistakes. Violations are BLOCKERS.

### 2. Load Review Profile
```bash
cat .hodge/review-profiles/default.yml
```

The profile provides Layer 2 criteria (domain defaults) and Layer 3 criteria (universal baseline).

### 3. Analyze Target File
Read the file to review:
```bash
cat {{file_path}}
```

### 4. Perform Layered Analysis

**IMPORTANT**: Apply review criteria in layered priority order:

**Layer 1: Project-Specific (Overrides Everything)**
1. Check if code violates `.hodge/standards.md` → BLOCKER
2. Check if code violates `.hodge/lessons/` → BLOCKER
3. Check if code follows `.hodge/patterns/` → WARNING if violated
4. Use `.hodge/principles.md` to guide interpretation

**Layer 2: Profile Domain Defaults**
5. Apply profile criteria patterns
6. Use profile custom_instructions for analysis guidance

**Layer 3: Universal Baseline**
7. Check basic code quality (coupling, SRP, DRY, complexity, naming)

**Conflict Resolution**:
If a profile criterion conflicts with a standard, the STANDARD wins. For example:
- Profile says "Use functional components" (warning)
- Standard says "This project uses class components for legacy compatibility"
- Result: Do NOT flag class components (standard overrides profile)

### 5. Generate Report

**Output Format**: Grouped findings with medium verbosity (blocker/warning/suggestion)

For each finding, include:
- **Severity**: blocker | warning | suggestion
- **Criteria**: Which criteria triggered this finding
- **Description**: What's the issue
- **Location**: file:line (if line number can be determined)
- **Rationale**: Why this matters (reference standard/lesson/pattern if applicable)
- **Suggested Action**: `/explore "{{feature_description}}"` command to fix

**Report Structure**:
```markdown
# Code Review Report: {{file_path}}

**Profile**: {{profile_name}}
**Reviewed**: {{timestamp}}

## Blockers ({{count}})

### 1. Lessons Learned Violation: Subprocess Spawning
- **Location**: src/example.ts:45
- **Description**: Uses `execSync()` to spawn subprocess
- **Rationale**: Violates HODGE-317.1 - subprocess spawning creates hung processes
- **Suggested Action**: `/explore "Refactor subprocess spawning to direct function calls in src/example.ts"`

## Warnings ({{count}})

### 1. Single Responsibility Violation
- **Location**: src/example.ts:23-67
- **Description**: `UserService` class handles authentication, validation, and database operations
- **Rationale**: Class should have one reason to change (SRP principle)
- **Suggested Action**: `/explore "Extract authentication and validation logic from UserService"`

## Suggestions ({{count}})

### 1. DRY Violation
- **Location**: src/example.ts:12, src/another.ts:34
- **Description**: Validation logic duplicated across files
- **Rationale**: Repeated code makes maintenance harder
- **Suggested Action**: `/explore "Extract shared validation logic into ValidationService"`

---

**Summary**: {{total}} findings ({{blockers}} blockers, {{warnings}} warnings, {{suggestions}} suggestions)
```

## AI Analysis Guidelines

### What to Look For (Based on Profile Criteria)

The profile defines criteria with:
- **name**: Criteria being checked (e.g., "Single Responsibility Principle")
- **severity**: blocker | warning | suggestion
- **patterns**: Natural language descriptions of what to check
- **reference**: Optional path to project files (e.g., ".hodge/lessons/")
- **custom_instructions**: Optional analysis guidance

**Example Profile Criteria**:
```yaml
criteria:
  - name: "Lessons Learned Violations"
    severity: blocker
    reference: ".hodge/lessons/"
    patterns:
      - "Check for subprocess spawning in tests (HODGE-317.1)"
      - "Verify test isolation - no .hodge modification (HODGE-308)"
```

For each criteria:
1. Read the patterns (simple strings, interpret naturally)
2. If `reference` exists, cross-check against referenced files
3. If `custom_instructions` exist, use as analysis guidance
4. Check the target file for violations
5. Report findings with specified severity

### Quality Analysis Framework

**Coupling & Cohesion**:
- Are modules/classes dependent on internal details of other modules?
- Are unrelated responsibilities grouped together?

**Single Responsibility**:
- Does each class/function have one clear purpose?
- Would this need to change for multiple reasons?

**DRY Violations**:
- Is the same logic repeated in multiple places?
- Are there patterns that could be extracted?

**Naming**:
- Do names clearly convey intent?
- Are names consistent with project conventions?

**Complexity**:
- Are there deeply nested conditionals (4+ levels)?
- Are functions too long (>50 lines)?
- Is logic easy to understand?

**Maintainability**:
- Would this confuse a new team member?
- Is there "clever" code that sacrifices clarity?

## Error Handling

**Missing Profile**:
```
❌ Error: Profile not found at .hodge/review-profiles/default.yml

Please ensure the profile exists or specify a different profile.
```

**Missing File**:
```
❌ Error: File not found: {{file_path}}

Please check the file path and try again.
```

**Malformed Profile**:
```
❌ Error: Invalid profile syntax in default.yml: {{details}}

Please check the YAML syntax and required fields.
```

## Implementation Notes (HODGE-327.1)

**CLI Command** (`hodge review`):
1. Parse arguments (file <path>)
2. Load profile using ProfileLoader
3. Load context using ContextAggregator
4. Read target file
5. Output context and file to this slash command template
6. Capture AI-generated report
7. Display report to user

**Slash Command** (this template):
1. Receive context and file from CLI
2. Perform layered analysis
3. Generate markdown report
4. Return to CLI for output

## Step 6: Save Review Report (Optional)

After displaying the review report, prompt the user:

```
Would you like to save this review report? (s/d)
  s) Save report to .hodge/reviews/
  d) Discard (exit without saving)

Your choice:
```

### If user chooses 's' (Save):

1. **Generate filename** from file path and timestamp:
```bash
# Convert file path to slug (replace slashes and special chars with dashes)
FILE_SLUG=$(echo "{{file_path}}" | sed 's|^\./||' | sed 's|/|-|g' | sed 's|\\|-|g' | sed 's|[^a-zA-Z0-9._-]|-|g' | sed 's|-\+|-|g' | sed 's|^-||' | sed 's|-$||')

# Generate ISO timestamp for filename (replace colons with dashes)
TIMESTAMP=$(date -u +"%Y-%m-%dT%H-%M-%S")

# Construct filename (omit "file-" prefix for file scope)
FILENAME="${FILE_SLUG}-${TIMESTAMP}.md"

echo "Saving to: .hodge/reviews/${FILENAME}"
```

2. **Detect feature context** (optional, best-effort):
```bash
# Attempt to detect HODGE-XXX feature from git blame
FEATURE=$(git blame --line-porcelain "{{file_path}}" 2>/dev/null | grep "^summary" | grep -oE "HODGE-[0-9]+(\.[0-9]+)?" | sort | uniq -c | sort -rn | head -1 | awk '{print $2}')

# If no feature detected, leave empty
if [ -z "$FEATURE" ]; then
  FEATURE_LINE=""
else
  FEATURE_LINE="feature: $FEATURE"
fi
```

3. **Extract finding counts** from generated report:
```bash
# Count findings by severity from the markdown report
BLOCKERS=$(echo "$REPORT" | grep -oE "## Blockers \(([0-9]+)\)" | grep -oE "[0-9]+")
WARNINGS=$(echo "$REPORT" | grep -oE "## Warnings \(([0-9]+)\)" | grep -oE "[0-9]+")
SUGGESTIONS=$(echo "$REPORT" | grep -oE "## Suggestions \(([0-9]+)\)" | grep -oE "[0-9]+")

# Default to 0 if not found
BLOCKERS=${BLOCKERS:-0}
WARNINGS=${WARNINGS:-0}
SUGGESTIONS=${SUGGESTIONS:-0}
```

4. **Use Write tool to save report** with YAML frontmatter:

Create the full report content with metadata header, then use the Write tool:

**File path**: `.hodge/reviews/{{filename}}`

**Content structure**:
```markdown
---
reviewed_at: {{iso_timestamp}}
scope: file
target: {{file_path}}
profile: default.yml
{{feature_line}}
findings:
  blockers: {{blocker_count}}
  warnings: {{warning_count}}
  suggestions: {{suggestion_count}}
---

{{full_report_content}}
```

After writing, confirm to user:
```
✅ Review saved to: .hodge/reviews/{{filename}}
```

### If user chooses 'd' (Discard):

Exit silently with no output. User can regenerate the review if needed later.

## Next Steps

After review complete (whether saved or discarded):
```
Review complete. You can now:
- Fix issues using suggested `/explore` commands from the report
- Review another file with `/review file <path>`
- Continue development
```

## Future Enhancements (Later Stories)

- **HODGE-327.3**: Support directory, pattern, and recent scopes
- **HODGE-327.4**: Additional profiles (React, API, test quality)
- **HODGE-327.5**: Integration with `/harden` command
- **HODGE-327.6**: Comprehensive documentation

---

Remember: Review is advisory, not blocking. Users decide which findings to act on.

ARGUMENTS: {{file_path}}
