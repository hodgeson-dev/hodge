# Review Profile Pattern

This pattern defines how to write compressed YAML review profiles for AI consumption during code review.

## Purpose

Review profiles contain language and framework-specific rules that AI applies during code review. Compressed YAML format achieves 75-80% token reduction compared to verbose markdown, enabling AI to load multiple profiles without exhausting token budget.

## Compression Standards

### Required Fields (All Rules Must Have)

- `id`: Kebab-case identifier (e.g., `strict-mode`, `avoid-any`)
- `name`: Human-readable rule name
- `enforcement`: `MANDATORY` | `SUGGESTED`
- `severity`: `BLOCKER` | `WARNING` | `SUGGESTION`
- `desc`: 1 sentence description (max 20 words), includes WHAT and WHY

### Conditional Fields (Include When Needed)

- `guidance`: Max 2 sentences, only for non-obvious exceptions or phase-specific treatment
- `example`: Minimal syntax, inline format, only for non-obvious patterns
- `xref`: Short path to related standard/principle (e.g., `standards/error-handling`)

### Field Quality Guidelines

#### Description (`desc`)

- Single sentence covering WHAT and WHY
- Max 20 words
- Must be actionable
- Example: "Enable strict:true in tsconfig.json for all strict type-checking options"
- Counter-example: "Strict mode is good" (too vague, no action)

#### Guidance (when needed)

- Max 2 sentences
- Focus on: exceptions, edge cases, phase-specific treatment
- Avoid repeating description
- Example: "Explore phase: ok. Ship phase: use `unknown` or justify with comment."
- Counter-example: "The any type defeats TypeScript's purpose..." (repeats description)

**When to include guidance**:
- Rule has phase-specific behavior (explore vs ship)
- Rule has non-obvious exceptions
- Rule needs context that isn't clear from description

**When to skip guidance**:
- Description is self-explanatory
- Rule is straightforward application of principle
- Adding guidance would just repeat description

#### Example (when needed)

- Only for non-obvious patterns (not basic syntax)
- Inline format, no markdown code blocks
- Minimal syntax, no comments
- Example: `"type Result<T> = {type:'loading'} | {type:'success',data:T} | {type:'error',err:Error}"`
- Counter-example: Long multi-line code block with comments

**When to include example**:
- Pattern is non-obvious (discriminated unions, complex hooks)
- Syntax is unfamiliar to typical developers
- Showing the pattern clarifies the rule better than words

**When to skip example**:
- Basic syntax AI already knows
- Rule is about avoiding something (no need to show the bad pattern)
- Description is sufficient

#### Cross-Reference (when needed)

- Short path format: `standards/error-handling`
- Not: "Reference general coding standards for error handling patterns"
- Only when rule depends on external standard

## File Structure

```yaml
meta:
  version: "1.0.0"
  language: typescript  # or framework: react
  version_range: ">=5.0.0 <6.0.0"
  detection:
    files: ["tsconfig.json"]
    deps: ["typescript"]
  applies_to:
    - "**/*.ts"
    - "**/*.tsx"

rules:
  - id: rule-identifier
    name: "Human Readable Rule Name"
    enforcement: MANDATORY
    severity: BLOCKER
    desc: "Short description of what and why"
    guidance: "Optional phase-specific or exception context"
    example: "optional minimal code pattern"
    xref: "optional/cross/reference"
```

## Example: Markdown vs Compressed YAML

### Before (Markdown - ~1,000 tokens)

```markdown
---
frontmatter_version: "1.0.0"
scope: reusable
type: language
language: typescript
applies_to:
  - "**/*.ts"
  - "**/*.tsx"
version: "1.0.0"
maintained_by: hodge-framework
detection:
  files: ["tsconfig.json"]
  dependencies: ["typescript"]
  version_range: ">=5.0.0 <6.0.0"
---

# TypeScript 5.x Best Practices

Modern TypeScript best practices for version 5.x, focusing on type safety...

---

## Avoid `any` Type
**Enforcement: SUGGESTED** | **Severity: WARNING**

The `any` type defeats TypeScript's purpose and hides bugs. Use `unknown` for truly unknown types, use proper types or generics for known shapes, and reserve `any` only for rapid prototyping or interfacing with untyped libraries.

**Guidance**: `any` is allowed in explore phase but should be removed by ship phase. When type is unknown, prefer `unknown` which forces type checking before use. Flag `any` in production code unless justified with comment explaining why proper typing is infeasible. Consider type assertions (`as Type`) over `any` when confident about runtime shape.

---
```

### After (YAML - ~250 tokens)

```yaml
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
  - id: avoid-any
    name: "Avoid any Type"
    enforcement: SUGGESTED
    severity: WARNING
    desc: "Use unknown for truly unknown types, proper types/generics for known shapes"
    guidance: "Explore phase: ok. Ship phase: use unknown or justify with comment."
```

**Token savings**: ~750 tokens (75% reduction)

## Common Gotchas

1. **Don't duplicate description in guidance** - guidance adds context, not repetition
2. **Keep examples minimal** - show the pattern, not full implementation
3. **Use inline format for examples** - no markdown code blocks, JSON-like syntax
4. **Cross-reference sparingly** - only when rule depends on external standard
5. **Enforcement vs severity** - enforcement = apply or not, severity = how urgent
6. **Meta section placement** - always at the top, before rules array
7. **Consistent ID format** - use kebab-case, not camelCase or snake_case

## Migration Checklist

When compressing an existing markdown profile:

- [ ] Extract metadata to `meta:` section
- [ ] Convert each rule section to YAML object in `rules:` array
- [ ] Compress description to 1 sentence (max 20 words)
- [ ] Compress guidance to 1-2 sentences (or remove if obvious)
- [ ] Compress examples to inline format (or remove if basic)
- [ ] Convert cross-references to short path format
- [ ] Verify all required fields present (id, name, enforcement, severity, desc)
- [ ] Check token count (should be 70-80% reduction)
- [ ] Validate YAML syntax (use `yamllint` or similar)
- [ ] Test that profile loads correctly

## Enforcement Levels Explained

### Enforcement Field

- **MANDATORY**: AI must flag violations, blocking for ship phase
- **SUGGESTED**: AI should flag violations, but user can choose to accept

### Severity Field

- **BLOCKER**: Must be fixed before shipping (ship phase)
- **WARNING**: Should be fixed, but not blocking
- **SUGGESTION**: Nice-to-have improvement

### Typical Combinations

- `MANDATORY` + `BLOCKER`: Core requirement (e.g., strict mode enabled)
- `SUGGESTED` + `WARNING`: Best practice (e.g., avoid `any` type)
- `SUGGESTED` + `SUGGESTION`: Code improvement (e.g., use utility types)

## Profile Organization

Profiles are organized by type in `.hodge/review-profiles/`:

```
.hodge/review-profiles/
├── languages/
│   ├── typescript-5.x.yaml
│   ├── javascript-es2023.yaml
│   └── python-3.x.yaml
├── frameworks/
│   ├── react-18.x.yaml
│   ├── vue-3.x.yaml
│   └── express-4.x.yaml
├── databases/
│   ├── prisma-5.x.yaml
│   └── mongodb-6.x.yaml
├── testing/
│   ├── vitest-1.x.yaml
│   └── jest-29.x.yaml
└── ui-libraries/
    ├── tailwind-3.x.yaml
    └── shadcn-ui.yaml
```

## Version Matching

Profile filenames should include major version when rules are version-specific:

- `typescript-5.x.yaml` - TypeScript 5.x specific rules
- `react-18.x.yaml` - React 18+ features (concurrent, suspense)
- `prisma-5.x.yaml` - Prisma 5+ patterns

Universal profiles (rules work across versions) can omit version:

- `eslint.yaml` - General ESLint rules
- `git.yaml` - Git workflow rules

## Testing Compressed Profiles

When creating or updating profiles:

1. **Validate YAML syntax**: Use `yamllint` or JS YAML parser
2. **Check token count**: Should be 70-80% less than markdown
3. **Load in AI session**: Verify AI can parse and understand rules
4. **Apply to sample code**: Test that rules actually catch violations
5. **Compare with markdown**: Ensure no critical guidance was lost

## Related Patterns

- **Test Pattern** (`.hodge/patterns/test-pattern.md`) - Testing philosophy
- **Error Boundary Pattern** (`.hodge/patterns/error-boundary.md`) - Error handling
- **Structure Pattern** (`.hodge/patterns/structure-pattern.md`) - Project organization

---

*Pattern created: 2025-10-12*
*Part of HODGE-341.4: AI Review Profile Compression*
