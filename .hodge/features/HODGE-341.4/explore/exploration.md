# Exploration: HODGE-341.4

## Feature Overview
**Title**: AI Review Profile Compression with /codify Command
**PM Issue**: HODGE-341.4
**Type**: sub-feature (child of HODGE-341)
**Created**: 2025-10-12T10:04:54.567Z

## Problem Statement

Review profiles are verbose markdown files (~1,000 tokens each). When AI loads 4 profiles during review, that's ~4,000 tokens just for profiles. We need to compress these to YAML format (~200 tokens each) for an 87% token reduction while maintaining AI effectiveness. Additionally, we need a streamlined workflow for adding any type of rule to the project (standards, principles, decisions, patterns, or profiles).

## Context
- **Standards**: Loaded (suggested only in explore mode)
- **Available Patterns**: 12
- **Parent Feature**: HODGE-341 (Hybrid Code Quality Review System)
- **Shipped Siblings**: HODGE-341.1, HODGE-341.2, HODGE-341.3
- **Current State**: 43 review profiles in markdown format, ~800 words each

## Conversation Summary

### Token Optimization Analysis

**Current State**:
- 43 review profiles in markdown format
- Average profile: ~800 words = ~1,040 tokens
- Loading 4 profiles during review: ~4,160 tokens
- Profiles contain: YAML frontmatter + markdown body with rules (title, enforcement, severity, description, guidance, examples)

**Target State**:
- Single YAML format (no dual .md/.yaml maintenance)
- Compressed to ~200 tokens per profile
- Loading 4 profiles: ~800 tokens
- **Savings: ~3,360 tokens (80% reduction)**

### Single Format Decision

User clarified that maintaining both .md (human) and .yaml (AI) versions is unnecessary overhead since:
- AI will be updating the profiles
- User can read YAML format when needed
- No external users to consider

**Decision**: Single compressed YAML format, replace markdown entirely.

### Compression Strategy

Through discussion, we determined what AI actually needs to apply rules effectively:

**1. Enforcement Levels - Keep Both Fields**
- `enforcement`: MANDATORY/SUGGESTED (whether to apply)
- `severity`: BLOCKER/WARNING/SUGGESTION (how urgent)
- Both are essential for AI prioritization during harden phase
- Adds only ~2 tokens per rule

**2. Guidance - Compress Heavily**
- Current guidance is verbose (3-5 sentences explaining context, edge cases, examples)
- AI needs: exceptions, gotchas, phase-specific treatment only
- Compress from 3-5 sentences to 1-2 sentences
- Example compression:
  - Before: "any is allowed in explore phase but should be removed by ship phase. When type is unknown, prefer unknown which forces type checking before use. Flag any in production code unless justified with comment..."
  - After: "Explore phase: ok. Ship phase: use `unknown` or justify with comment."

**3. Examples - Include Sparingly, Make Compact**
- Keep examples for non-obvious patterns (discriminated unions, complex hooks)
- Remove examples for basic syntax (AI already knows)
- Compress kept examples to inline format (no markdown code blocks)
- Example: `example: "type Result<T> = {type:'loading'} | {type:'success',data:T} | {type:'error',err:Error}"`

**4. Cross-References - Keep Them Short**
- Already compact, provide important context
- Compress further: "Reference general coding standards" → "See: standards/error-handling"

### Compression Standards

To ensure consistent compression quality, we defined standards for well-crafted compressed profiles:

**Required Fields** (no omissions):
- `id`, `name`, `enforcement`, `severity`, `desc`

**Conditional Fields**:
- `guidance`: Only if rule has non-obvious exceptions or phase-specific treatment
- `example`: Only for non-obvious patterns (not basic syntax)
- `xref`: Only if rule depends on external standard

**Quality Criteria**:
- **Description**: 1 sentence, includes WHAT and WHY, max 20 words
- **Guidance** (when needed): Max 2 sentences, focus on exceptions/edge cases/phase-specific treatment
- **Example** (when needed): Minimal syntax, no comments, inline format
- **Cross-Reference**: Short path format (e.g., `standards/error-handling`)

### Pattern File Location

Need to store compression standards somewhere AI can reference when authoring/updating profiles. Discussed several options:

- `.hodge/standards.md` - wrong type (not code standards)
- `.hodge/review-profiles/README.md` - not part of established patterns system
- `src/bundled-config/profile-schema.yaml` - too engineering-focused
- ✅ **`.hodge/patterns/review-profile-pattern.md`** - follows established pattern system (test-pattern.md, structure-pattern.md, error-pattern.md)

### Automatic Pattern Loading Challenge

User raised concern: "I don't want to remember to tell AI to load the pattern file."

Explored several solutions:
1. Document in CLAUDE.md Pattern Loading section
2. Add to `/explore` or `/build` command templates
3. Create dedicated `/profile` command
4. Put standards as comments in each profile file
5. Hybrid with auto-detection

Led to breakthrough idea from user: **Instead of a profile-specific command, create a universal command for adding ANY type of rule to the project.**

### The `/codify` Command

User proposed: "Could we have a command where I can type the thing I'd like to add to our project rules? You make a recommendation about whether it's more appropriate as a standard, principle, decision, pattern, or profile."

**Command name**: `/codify` - suggests "codifying" knowledge into project rules

**Workflow**:
1. User types: `/codify "Review profiles should use compressed YAML format"`
2. AI analyzes input and determines best fit
3. AI loads relevant authoring guidelines based on rule type
4. AI proposes placement with rationale
5. User approves or suggests different placement
6. AI writes to appropriate file

**Example interaction**:
```
You: /codify "Always use discriminated unions for state machines"

AI: I recommend this as a **Standard** in `.hodge/standards.md`

Rationale:
- Applies to application code (not meta/process)
- Prescriptive practice (not philosophical principle)
- Ongoing practice (not one-time decision)
- Not a pattern (too simple for template)
- Not a profile rule (already covered there)

Would add to TypeScript section:
"Use discriminated unions for state machines and result types.
Enables exhaustive type checking with never type."

Approve? Or would you prefer:
a) Store as principle instead
b) Store in review profile
c) Different wording
```

**Rule Types `/codify` Handles**:
- **Standard**: Code quality rules (`.hodge/standards.md`)
- **Principle**: Project philosophy (`.hodge/principles.md`)
- **Decision**: One-time architectural choices (`.hodge/decisions.md`)
- **Pattern**: Templates/guides for common tasks (`.hodge/patterns/*.md`)
- **Profile**: Framework/language-specific review rules (`.hodge/review-profiles/**/*.yaml`)

**Key Insight**: `/codify` is an AI-only workflow command (like `/explore`, `/build`, `/ship`). No `hodge codify` CLI command needed - AI handles the entire workflow.

**Integration**: When AI recommends "Profile" as the rule type, it automatically loads `.hodge/patterns/review-profile-pattern.md`, solving the original problem of remembering to load compression standards.

### Scope Clarification

User confirmed: Include `/codify` in HODGE-341.4 (don't defer to HODGE-341.5). Get it all done.

## Implementation Approaches

### Approach 1: Compressed YAML with Pattern File + /codify Command (Recommended)

**Description**: Migrate all 43 profiles to compressed YAML format using defined compression standards, create pattern file with standards and examples, implement `/codify` command for universal rule management.

**Core Components**:

**1. Compressed YAML Format**:
```yaml
# .hodge/review-profiles/languages/typescript-5.x.yaml
meta:
  version: "1.0.0"
  language: typescript
  version_range: ">=5.0.0 <6.0.0"
  detection:
    files: ["tsconfig.json"]
    deps: ["typescript"]
  applies_to:
    - "**/*.ts"
    - "**/*.tsx"

rules:
  - id: strict-mode
    name: "Strict Mode Configuration"
    enforcement: MANDATORY
    severity: BLOCKER
    desc: "Enable strict:true in tsconfig.json for all strict type-checking options"
    guidance: "Non-negotiable for new code. Legacy code can migrate gradually."

  - id: avoid-any
    name: "Avoid any Type"
    enforcement: SUGGESTED
    severity: WARNING
    desc: "Use unknown for truly unknown types, proper types/generics for known shapes"
    guidance: "Explore phase: ok. Ship phase: use unknown or justify with comment."

  - id: type-inference
    name: "Prefer Type Inference"
    enforcement: SUGGESTED
    severity: SUGGESTION
    desc: "Let TypeScript infer types when obvious - reduces noise, improves maintainability"
    guidance: "Infer variables, explicit for function params/returns. Explicit types serve as docs."

  - id: discriminated-unions
    name: "Discriminated Unions for State"
    enforcement: SUGGESTED
    severity: SUGGESTION
    desc: "Use tagged unions for state machines, result types - enables exhaustive checking"
    example: "type Result<T> = {type:'loading'} | {type:'success',data:T} | {type:'error',err:Error}"
    guidance: "Prevents bugs via type system. Common in async ops, UI states, domain models."

  - id: async-await
    name: "Async/Await Best Practices"
    enforcement: SUGGESTED
    severity: WARNING
    desc: "Prefer async/await over raw promises. Always handle errors with try/catch."
    guidance: "Use Promise.all() for parallel ops, not sequential awaits."
    xref: "standards/error-handling"

  - id: utility-types
    name: "Utility Types Usage"
    enforcement: SUGGESTED
    severity: SUGGESTION
    desc: "Leverage built-in utility types to transform types rather than duplicating definitions"
    guidance: "Partial<T>, Pick, Omit, Required, Record, NonNullable. Use when they clarify intent."

  - id: generics
    name: "Generics Best Practices"
    enforcement: SUGGESTED
    severity: SUGGESTION
    desc: "Use generics for reusable type-safe code. Constrain when possible (<T extends BaseType>)."
    guidance: "Single-letter names (T,K,V) ok for simple. Descriptive for complex. Balance safety vs complexity."

  - id: error-handling
    name: "Type Safety in Error Handling"
    enforcement: SUGGESTED
    severity: WARNING
    desc: "Type catch blocks as unknown, use type guards before accessing properties"
    example: "catch(e:unknown){if(e instanceof Error)log(e.message)}"
    xref: "standards/error-handling"
```

**Token savings**: ~750 tokens per profile (75% reduction from ~1,000 to ~250)

**2. Pattern File** (`.hodge/patterns/review-profile-pattern.md`):
```markdown
# Review Profile Pattern

This pattern defines how to write compressed YAML review profiles for AI consumption.

## Compression Standards

### Required Fields (All Rules Must Have)
- `id`: Kebab-case identifier (e.g., `strict-mode`)
- `name`: Human-readable rule name
- `enforcement`: MANDATORY | SUGGESTED
- `severity`: BLOCKER | WARNING | SUGGESTION
- `desc`: 1 sentence description (max 20 words), includes WHAT and WHY

### Conditional Fields (Include When Needed)
- `guidance`: Max 2 sentences, only for non-obvious exceptions or phase-specific treatment
- `example`: Minimal syntax, inline format, only for non-obvious patterns
- `xref`: Short path to related standard/principle (e.g., `standards/error-handling`)

### Field Quality Guidelines

**Description (`desc`)**:
- Single sentence covering WHAT and WHY
- Max 20 words
- Example: "Enable strict:true in tsconfig.json for all strict type-checking options"

**Guidance (when needed)**:
- Max 2 sentences
- Focus on: exceptions, edge cases, phase-specific treatment
- Avoid repeating description
- Example: "Explore phase: ok. Ship phase: use unknown or justify with comment."

**Example (when needed)**:
- Only for non-obvious patterns (not basic syntax)
- Inline format, no markdown code blocks
- Minimal syntax, no comments
- Example: `"type Result<T> = {type:'loading'} | {type:'success',data:T} | {type:'error',err:Error}"`

**Cross-Reference (when needed)**:
- Short path format: `standards/error-handling`
- Not: "Reference general coding standards for error handling patterns"

## Example: Markdown vs Compressed YAML

### Before (Markdown - ~1,000 tokens)
\`\`\`markdown
---
frontmatter...
---

# TypeScript 5.x Best Practices

Modern TypeScript best practices for version 5.x...

---

## Avoid `any` Type
**Enforcement: SUGGESTED** | **Severity: WARNING**

The `any` type defeats TypeScript's purpose and hides bugs. Use `unknown` for truly unknown types, use proper types or generics for known shapes, and reserve `any` only for rapid prototyping or interfacing with untyped libraries.

**Guidance**: `any` is allowed in explore phase but should be removed by ship phase. When type is unknown, prefer `unknown` which forces type checking before use. Flag `any` in production code unless justified with comment explaining why proper typing is infeasible. Consider type assertions (`as Type`) over `any` when confident about runtime shape.

---
\`\`\`

### After (YAML - ~250 tokens)
\`\`\`yaml
meta:
  version: "1.0.0"
  language: typescript
  version_range: ">=5.0.0 <6.0.0"
  detection:
    files: ["tsconfig.json"]
    deps: ["typescript"]

rules:
  - id: avoid-any
    name: "Avoid any Type"
    enforcement: SUGGESTED
    severity: WARNING
    desc: "Use unknown for truly unknown types, proper types/generics for known shapes"
    guidance: "Explore phase: ok. Ship phase: use unknown or justify with comment."
\`\`\`

## When to Include Guidance

**Include guidance when**:
- Rule has phase-specific behavior (explore vs ship)
- Rule has non-obvious exceptions
- Rule needs context that isn't clear from description

**Skip guidance when**:
- Description is self-explanatory
- Rule is straightforward application of principle
- Adding guidance would just repeat description

## When to Include Examples

**Include example when**:
- Pattern is non-obvious (discriminated unions, complex hooks)
- Syntax is unfamiliar to typical developers
- Showing the pattern clarifies the rule better than words

**Skip example when**:
- Basic syntax AI already knows
- Rule is about avoiding something (no need to show the bad pattern)
- Description is sufficient

## Common Gotchas

1. **Don't duplicate description in guidance** - guidance adds context, not repetition
2. **Keep examples minimal** - show the pattern, not full implementation
3. **Use inline format for examples** - no markdown code blocks, JSON-like syntax
4. **Cross-reference sparingly** - only when rule depends on external standard
5. **Enforcement vs severity** - enforcement = apply or not, severity = how urgent

## Migration Checklist

When compressing an existing markdown profile:

- [ ] Extract metadata to `meta:` section
- [ ] Convert each rule section to YAML object
- [ ] Compress description to 1 sentence (max 20 words)
- [ ] Compress guidance to 1-2 sentences (or remove if obvious)
- [ ] Compress examples to inline format (or remove if basic)
- [ ] Convert cross-references to short path format
- [ ] Verify all required fields present (id, name, enforcement, severity, desc)
- [ ] Check token count (should be 70-80% reduction)
```

**3. `/codify` Command** (`.claude/commands/codify.md`):
```markdown
# Codify - Add Rules to Project

## Purpose
Universal command for adding any type of rule to the project. AI analyzes your input and recommends whether it belongs as a standard, principle, decision, pattern, or profile.

## Usage
\`\`\`
/codify "Your rule or practice here"
\`\`\`

## Examples
\`\`\`
/codify "Always use discriminated unions for state machines"
/codify "Review profiles should be compressed YAML"
/codify "We decided to use Prisma over TypeORM"
/codify "Never use console.log in production code"
\`\`\`

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
\`\`\`bash
cat .hodge/standards.md | head -100  # See current format and structure
\`\`\`

**For Principles**:
\`\`\`bash
cat .hodge/principles.md | head -100
\`\`\`

**For Decisions**:
\`\`\`bash
cat .hodge/decisions.md | head -50  # See decision format
# Check if this is feature-specific
ls -la .hodge/features/*/decisions.md 2>/dev/null | tail -5
\`\`\`

**For Patterns**:
\`\`\`bash
ls -la .hodge/patterns/  # See existing patterns
cat .hodge/patterns/test-pattern.md  # Example pattern format
\`\`\`

**For Profiles**:
\`\`\`bash
cat .hodge/patterns/review-profile-pattern.md  # Load compression standards
ls -la .hodge/review-profiles/  # See profile organization
\`\`\`

### Step 3: Present Recommendation

Show your analysis:

\`\`\`
I recommend this as a **[TYPE]** in \`[FILE PATH]\`

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
\`\`\`

### Step 4: Handle User Response

**If approved**: Use Write or Edit tool to add the rule to the appropriate file

**If user suggests different type**: Reload context for that type and present new proposal

**If user wants different wording**: Revise and present again

**If user asks questions**: Answer, then refine proposal

### Step 5: Confirm Completion

After writing the rule:

\`\`\`
✅ Added to [file path]

The rule is now part of the project's [standards/principles/decisions/patterns/profiles].

Next steps:
- Standards/Principles: Will be loaded during code review automatically
- Decisions: Recorded for future context
- Patterns: Load with \`cat .hodge/patterns/[name].md\` when needed
- Profiles: Will be loaded during code review when relevant
\`\`\`

## Decision Guidelines

### When Input is Ambiguous

If the user's input could fit multiple types, present options:

\`\`\`
Your input could be either:

**Option A: Standard** - "Never use any in production code"
- Prescriptive, applies to all TypeScript code
- Would add to .hodge/standards.md TypeScript section

**Option B: Profile Rule** - Add to typescript-5.x.yaml
- More nuanced (allowed in explore phase)
- Part of code review workflow

Which placement do you prefer?
\`\`\`

### When User Disagrees

If user says "actually, this should be a [different type]":

\`\`\`
Good point! Let me reconsider this as a [different type].

[Load new context]
[Present new proposal]
\`\`\`

Don't argue - adapt to user's intent.

## Edge Cases

**Feature-Specific Decisions**:
- If decision relates to specific feature, ask: "Should this go in .hodge/decisions.md (project-wide) or .hodge/features/[feature]/decisions.md (feature-specific)?"

**Cross-Type Rules**:
- Some rules might belong in multiple places (e.g., principle + standard)
- Ask user: "Should I add this to both, or just one?"

**Updating Existing Rules**:
- If rule already exists in different form, mention it: "Note: Similar rule exists in [location]. Should I update that one or add a new entry?"

## Important Notes

- This is an AI-only workflow command (no `hodge codify` CLI command)
- Always load context before proposing placement
- Present rationale, don't just write blindly
- Respect user's intent if they disagree with your recommendation
- For profiles, automatically load review-profile-pattern.md for compression standards
```

**4. Migration Script** (optional CLI helper, not required):
```typescript
// src/lib/profile-migrator.ts
export class ProfileMigrator {
  /**
   * Migrate markdown profile to compressed YAML
   * Can be run manually or via CLI command
   */
  async migrateProfile(markdownPath: string): Promise<string> {
    // Read markdown
    // Parse frontmatter and body
    // Extract rules from markdown sections
    // Apply compression standards
    // Generate YAML
    // Return or write to file
  }
}
```

**5. Profile Loading Update**:
```typescript
// Update wherever profiles are loaded (likely in HardenCommand or ReviewService)
import yaml from 'js-yaml';

async function loadProfile(profilePath: string): Promise<ReviewProfile> {
  const content = await fs.readFile(profilePath, 'utf-8');

  // Support both .md (legacy) and .yaml (compressed)
  if (profilePath.endsWith('.yaml') || profilePath.endsWith('.yml')) {
    return yaml.load(content) as ReviewProfile;
  } else {
    // Legacy markdown parsing (if needed during transition)
    return parseMarkdownProfile(content);
  }
}
```

**6. Update CLAUDE.md**:
```markdown
## Pattern Loading

When working on specific areas, load relevant patterns:
- Testing → `.hodge/patterns/test-pattern.md`
- Structure → `.hodge/patterns/structure-pattern.md`
- Errors → `.hodge/patterns/error-pattern.md`
- Review Profiles → `.hodge/patterns/review-profile-pattern.md`

## Codifying Knowledge

Use `/codify` to add any type of rule to the project:
- `/codify "Your practice or rule"`
- AI will recommend whether it's a standard, principle, decision, pattern, or profile
- Automatically loads relevant authoring guidelines
```

**Pros**:
- **Massive token savings**: 75-80% reduction per profile, ~3,360 tokens saved when loading 4 profiles
- **Single source of truth**: No dual .md/.yaml maintenance burden
- **Human readable**: YAML is still readable when needed
- **Comprehensive workflow**: `/codify` handles all rule types, not just profiles
- **Self-documenting**: Pattern file teaches compression standards
- **Automatic pattern loading**: `/codify` loads review-profile-pattern.md when recommending profile placement

**Cons**:
- **Migration effort**: 43 profiles to migrate (but can be done incrementally or scripted)
- **Learning curve**: Users need to understand YAML syntax (minimal - most can read it)
- **Breaking change**: Any external tools parsing markdown profiles would break (no external users per user)

**When to use**: This is the recommended approach. Solves the token budget problem, provides universal rule management, and maintains AI effectiveness.

### Approach 2: Keep Markdown, Extract Core Rules Only

**Description**: Instead of full migration, create a YAML "index" that contains just the core rule data (enforcement, severity, description) without guidance or examples. Keep full markdown for reference.

**Structure**:
```yaml
# .hodge/review-profiles/languages/typescript-5.x.index.yaml
rules:
  - id: strict-mode
    enforcement: MANDATORY
    severity: BLOCKER
    desc: "Enable strict:true in tsconfig.json"
  - id: avoid-any
    enforcement: SUGGESTED
    severity: WARNING
    desc: "Use unknown or proper types, not any"
```

**Workflow**:
- AI loads index.yaml (~150 tokens) for quick rule overview
- If AI needs details on specific rule, loads full markdown section

**Pros**:
- No migration needed (generate indexes from existing markdown)
- Keeps full context available
- Even better token savings (index only ~150 tokens)

**Cons**:
- **Two files per profile** - defeats "no dual maintenance" goal
- **Index can drift** - markdown updated but index not regenerated
- **Unclear when to load full markdown** - AI has to guess when it needs more context
- **Doesn't solve profile authoring** - still editing verbose markdown

**Why rejected**: This is the dual-format maintenance burden user explicitly wanted to avoid. Also doesn't provide the comprehensive `/codify` workflow.

### Approach 3: AI Prompt Engineering (No File Changes)

**Description**: Don't change profiles at all. Instead, train AI to mentally compress profiles during review by including system instructions like "When reading review profiles, focus only on enforcement, severity, and description. Ignore verbose guidance."

**Pros**:
- Zero migration effort
- No file format changes
- Immediately reversible

**Cons**:
- **Doesn't actually save tokens** - still loading full 1,000-token profiles into context
- **Relies on AI ignoring content** - AI still processes all tokens even if instructed to ignore
- **No workflow improvement** - doesn't help with profile authoring or rule management
- **Doesn't address the actual problem** - token budget is exhausted regardless of what AI "focuses" on

**Why rejected**: This doesn't solve the token budget problem at all. The tokens are consumed whether AI pays attention to them or not.

## Recommendation

**Approach 1: Compressed YAML with Pattern File + /codify Command** is strongly recommended because:

1. **Solves token budget problem**: 75-80% reduction per profile, saving ~3,360 tokens when loading 4 profiles
2. **No maintenance burden**: Single YAML format, no dual files to keep in sync
3. **Maintains AI effectiveness**: Keeps essential fields (enforcement, severity, description), compresses only the verbose parts
4. **Comprehensive workflow**: `/codify` provides universal rule management beyond just profiles
5. **Self-documenting**: Pattern file with compression standards and examples
6. **Automatic pattern loading**: `/codify` automatically loads relevant guidelines based on rule type
7. **Human readable**: YAML is readable when users need to check profiles
8. **Clean migration path**: 43 profiles can be migrated incrementally or scripted

The key insight from our conversation: **AI doesn't need essays, it needs clear signals** (enforcement/severity) and **minimal context** (1-sentence description, terse guidance, compact examples). Everything else is commentary that can be compressed without losing effectiveness.

## Test Intentions

Behavioral expectations for HODGE-341.4:

1. **YAML validation**: Review profiles are valid YAML with all required fields (id, name, enforcement, severity, desc)

2. **Token reduction**: Compressed profiles are 70-80% smaller than markdown equivalents (measure via word count or token estimator)

3. **Pattern file exists**: `.hodge/patterns/review-profile-pattern.md` contains compression standards, quality criteria, examples, and migration checklist

4. **Migration complete**: All 43 existing profiles migrated to compressed YAML format in same directory structure

5. **Profile loading**: Code that loads profiles handles YAML format correctly (likely in HardenCommand or ReviewService)

6. **Codify command exists**: `.claude/commands/codify.md` template exists with workflow for analyzing input and recommending rule type

7. **Codify rule detection**: When given input, AI correctly identifies whether it's a standard, principle, decision, pattern, or profile (test with examples)

8. **Codify context loading**: `/codify` loads appropriate authoring guidelines based on rule type determination (review-profile-pattern.md for profiles, etc.)

9. **Codify proposal**: AI presents recommendation with rationale before writing, handles user approval/revision

10. **CLAUDE.md updated**: Pattern Loading section includes review-profile-pattern.md, Codifying Knowledge section documents `/codify` command

11. **Backward compatibility** (optional): System gracefully handles both .yaml and legacy .md formats during transition period

## Decisions Decided During Exploration

1. ✓ **Single YAML format** - No dual .md/.yaml maintenance, YAML replaces markdown entirely

2. ✓ **Keep enforcement and severity fields** - Both are essential for AI prioritization during review

3. ✓ **Compress guidance heavily** - 1-2 sentence exceptions/gotchas only, remove verbose explanations

4. ✓ **Include examples sparingly** - Only non-obvious patterns, inline format, no markdown code blocks

5. ✓ **Keep cross-references short** - Compact pointer format (e.g., `standards/error-handling`)

6. ✓ **Create pattern file** - `.hodge/patterns/review-profile-pattern.md` with compression standards and examples

7. ✓ **Pattern file location** - Follows established pattern system (alongside test-pattern.md, structure-pattern.md, etc.)

8. ✓ **Add /codify command** - Universal command for adding any type of rule (standard/principle/decision/pattern/profile)

9. ✓ **Codify is AI-only** - No `hodge codify` CLI command, purely AI workflow command like `/explore`, `/build`

10. ✓ **Codify integration** - Automatically loads review-profile-pattern.md when recommending profile placement

11. ✓ **Include /codify in HODGE-341.4** - Don't defer to separate feature, get it done now

12. ✓ **Compression standards** - 6 quality criteria defined: required fields, conditional fields, description quality, guidance quality, example quality, cross-reference format

## Decisions Needed

**No decisions needed** - all design decisions were resolved during exploration conversation.

## Next Steps
- [ ] Proceed to `/build HODGE-341.4` with Approach 1
- [ ] Create `.hodge/patterns/review-profile-pattern.md` with compression standards
- [ ] Create `.claude/commands/codify.md` template
- [ ] Migrate profiles incrementally or create migration script
- [ ] Update profile loading code
- [ ] Update CLAUDE.md with pattern and `/codify` documentation

---
*Exploration completed: 2025-10-12*
*AI exploration based on conversational discovery*
