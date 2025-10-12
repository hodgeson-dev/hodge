# Codify - Add Rules to Project

## Purpose

Universal command for adding any type of rule to the project. AI analyzes your input and recommends whether it belongs as a standard, principle, decision, pattern, or profile.

## Usage

```bash
/codify "Your rule or practice here"
```

## Examples

```bash
/codify "Always use discriminated unions for state machines"
/codify "Review profiles should be compressed YAML"
/codify "We decided to use Prisma over TypeORM"
/codify "Never use console.log in production code"
/codify "Use React hooks over class components"
```

## Workflow

### Step 1: Analyze Input

Read the user's input and determine which rule type fits best:

**Standard** (`.hodge/standards.md`):
- Applies to application code
- Prescriptive practice or requirement
- Ongoing enforcement (not one-time decision)
- Example: "Never use console.log in production code"

**Principle** (`.hodge/principles.md`):
- Project philosophy or values
- "Why" behind standards
- Guides decision-making
- Example: "Favor composition over inheritance"

**Decision** (`.hodge/decisions.md` or feature-specific):
- One-time architectural choice
- Has alternatives that were rejected
- Context about why this was chosen
- Example: "Use Prisma over TypeORM for better type safety"

**Pattern** (`.hodge/patterns/*.md`):
- Template or guide for common task
- Shows "how to" do something
- Reusable across features
- Example: "How to structure integration tests"

**Profile** (`.hodge/review-profiles/**/*.yaml`):
- Language or framework-specific rule
- Part of code review process
- Tied to specific technology version
- Example: "Use React hooks over class components (React 18+)"

### Step 2: Load Relevant Context

Based on your determination, load the appropriate authoring guidelines:

**For Standards**:
```bash
cat .hodge/standards.md | head -100  # See current format and structure
```

**For Principles**:
```bash
cat .hodge/principles.md | head -100
```

**For Decisions**:
```bash
cat .hodge/decisions.md | head -50  # See decision format
# Check if this is feature-specific
ls -la .hodge/features/*/decisions.md 2>/dev/null | tail -5
```

**For Patterns**:
```bash
ls -la .hodge/patterns/  # See existing patterns
cat .hodge/patterns/test-pattern.md  # Example pattern format
```

**For Profiles**:
```bash
cat .hodge/patterns/review-profile-pattern.md  # Load compression standards
ls -la .hodge/review-profiles/  # See profile organization
# Check which profile to update
find .hodge/review-profiles/ -name "*.yaml" | head -10
```

### Step 3: Present Recommendation

Show your analysis:

```
I recommend this as a **[TYPE]** in `[FILE PATH]`

Rationale:
- [Why this type and not others]
- [How it fits into existing structure]
- [Benefits of this placement]

Proposed content:
[Show what you would add, following the format for that type]

Approve? Or would you prefer:
a) Store as [alternative type] instead
b) Different wording/structure
c) Ask me clarifying questions first
```

### Step 4: Handle User Response

**If approved**: Use Write or Edit tool to add the rule to the appropriate file

**If user suggests different type**: Reload context for that type and present new proposal

**If user wants different wording**: Revise and present again

**If user asks questions**: Answer, then refine proposal

### Step 5: Confirm Completion

After writing the rule:

```
✅ Added to [file path]

The rule is now part of the project's [standards/principles/decisions/patterns/profiles].

Next steps:
- Standards/Principles: Will be loaded during code review automatically
- Decisions: Recorded for future context
- Patterns: Load with `cat .hodge/patterns/[name].md` when needed
- Profiles: Will be loaded during code review when relevant
```

## Decision Guidelines

### When Input is Ambiguous

If the user's input could fit multiple types, present options:

```
Your input could be either:

**Option A: Standard** - "Never use any in production code"
- Prescriptive, applies to all TypeScript code
- Would add to .hodge/standards.md TypeScript section

**Option B: Profile Rule** - Add to typescript-5.x.yaml
- More nuanced (allowed in explore phase)
- Part of code review workflow

Which placement do you prefer?
```

### When User Disagrees

If user says "actually, this should be a [different type]":

```
Good point! Let me reconsider this as a [different type].

[Load new context]
[Present new proposal]
```

Don't argue - adapt to user's intent.

## Edge Cases

### Feature-Specific Decisions

If decision relates to specific feature, ask: "Should this go in `.hodge/decisions.md` (project-wide) or `.hodge/features/[feature]/decisions.md` (feature-specific)?"

### Cross-Type Rules

Some rules might belong in multiple places (e.g., principle + standard). Ask user: "Should I add this to both, or just one?"

### Updating Existing Rules

If rule already exists in different form, mention it: "Note: Similar rule exists in [location]. Should I update that one or add a new entry?"

### Profile Updates

When adding to profiles:
- Determine which profile(s) apply (language/framework/version)
- Load the review-profile-pattern.md for compression standards
- Follow the compressed YAML format
- Ask if rule should be in multiple profiles (e.g., TypeScript + React)

## Profile-Specific Workflow

When recommending a **Profile** placement:

1. **Identify applicable profile(s)**:
   - Language: TypeScript, JavaScript, Python, etc.
   - Framework: React, Vue, Express, etc.
   - Version-specific: Does rule apply to specific version?

2. **Load compression standards**:
   ```bash
   cat .hodge/patterns/review-profile-pattern.md
   ```

3. **Load target profile**:
   ```bash
   cat .hodge/review-profiles/[category]/[profile-name].yaml
   ```

4. **Propose rule in compressed format**:
   ```yaml
   - id: rule-identifier
     name: "Human Readable Rule Name"
     enforcement: MANDATORY | SUGGESTED
     severity: BLOCKER | WARNING | SUGGESTION
     desc: "One sentence description (max 20 words)"
     guidance: "Optional 1-2 sentence context"  # If needed
     example: "optional minimal code pattern"    # If needed
     xref: "optional/cross/reference"            # If needed
   ```

5. **Validate against compression standards**:
   - Required fields present?
   - Description max 20 words?
   - Guidance max 2 sentences (or omitted)?
   - Example inline format (or omitted)?

## Important Notes

- This is an AI-only workflow command (no `hodge codify` CLI command)
- Always load context before proposing placement
- Present rationale, don't just write blindly
- Respect user's intent if they disagree with your recommendation
- For profiles, automatically load review-profile-pattern.md for compression standards
- Use Edit tool when adding to existing files
- Use Write tool only when creating new pattern files

## Examples of Good Recommendations

### Example 1: Standard

```
User: /codify "Always validate user input before processing"

AI: I recommend this as a **Standard** in `.hodge/standards.md`

Rationale:
- Applies to all application code (not philosophy)
- Prescriptive security practice (not one-time decision)
- Ongoing enforcement across project (not task template)

Would add to Security section:
"Validate all user input before processing to prevent injection attacks
and ensure data integrity."

Approve? Or would you prefer:
a) Store as principle instead
b) Different wording
c) Add to specific profile
```

### Example 2: Principle

```
User: /codify "Prefer explicit over implicit"

AI: I recommend this as a **Principle** in `.hodge/principles.md`

Rationale:
- Project philosophy (not specific practice)
- Guides decision-making (not enforced rule)
- "Why" behind many standards (explicit types, explicit returns, etc.)

Would add:
"## Prefer Explicit Over Implicit

Make intentions clear through explicit declarations rather than relying on
implicit behavior. Explicit code is easier to understand, debug, and maintain.

Examples:
- Explicit function return types over inference
- Explicit error handling over silent failures
- Explicit dependencies over global state"

Approve? Or would you prefer:
a) Store as standard instead
b) Simpler wording
```

### Example 3: Decision

```
User: /codify "Use Vitest instead of Jest for faster test execution"

AI: I recommend this as a **Decision** in `.hodge/decisions.md`

Rationale:
- One-time architectural choice (not ongoing practice)
- Has alternatives that were considered (Jest)
- Explains why this was chosen (performance)

Would add:
"### 2025-10-12 - Use Vitest instead of Jest

**Status**: Accepted

**Context**: Need faster test execution for CI/CD pipeline

**Decision**: Adopt Vitest as test framework, replacing Jest

**Rationale**:
- 10x faster test execution (ESM native, no transpilation)
- Compatible with Jest API (minimal migration)
- Better Vite integration for our build setup

**Consequences**:
- Migrate existing Jest tests to Vitest
- Update CI/CD configuration
- Team needs to learn minor API differences"

Approve? Or would you prefer:
a) Store as standard instead
b) Different rationale
```

### Example 4: Pattern

```
User: /codify "How to structure CLI commands with proper separation of concerns"

AI: I recommend this as a **Pattern** in `.hodge/patterns/cli-command-pattern.md`

Rationale:
- Template for reusable task (not single rule)
- Shows "how to" structure (not what/why)
- Reusable across multiple commands

Would create new pattern file with:
- Command class structure
- Service extraction pattern
- Error handling template
- Testing approach
- Example implementation

This is a larger template. Should I create the full pattern file?

a) Yes, create full pattern
b) Add to existing structure-pattern.md instead
c) Make it a standard instead
```

### Example 5: Profile

```
User: /codify "Always specify dependency arrays in useEffect hooks"

AI: I recommend this as a **Profile Rule** in `.hodge/review-profiles/frameworks/react-18.x.yaml`

Rationale:
- React-specific rule (not general coding practice)
- Part of code review process (not one-time decision)
- Tied to React version (hooks are React 16.8+)

Loading compression standards from review-profile-pattern.md...

Would add to react-18.x.yaml rules array:
```yaml
- id: useeffect-deps
  name: "UseEffect Dependency Arrays"
  enforcement: SUGGESTED
  severity: WARNING
  desc: "Always specify dependency arrays in useEffect to prevent stale closures"
  guidance: "Empty array [] = run once. Omit array = run every render. Include all dependencies."
```

Approve? Or would you prefer:
a) Store as standard instead
b) Different wording
c) Change enforcement to MANDATORY
```

---

*Command created: 2025-10-12*
*Part of HODGE-341.4: AI Review Profile Compression*
