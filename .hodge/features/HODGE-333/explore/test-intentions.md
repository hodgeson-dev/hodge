# Test Intentions: HODGE-333

## Frontmatter Parsing and Validation
- ✓ Can parse YAML frontmatter from markdown files
- ✓ Validates required fields per file type (standards, principles, patterns, lessons, profiles)
- ✓ Handles malformed frontmatter gracefully with clear error messages
- ✓ Supports all frontmatter schemas (project files + reusable profiles)

## Explicit Enforcement Detection
- ✓ Reads section-level enforcement markers (`**Enforcement: MANDATORY**`)
- ✓ Reads section-level severity markers (`**Severity: BLOCKER**`)
- ✓ Correctly categorizes violations by severity (blocker/warning/suggestion)
- ✓ No implicit inheritance tracking required

## YAML to Markdown Migration
- ✓ Converts existing default.yml to markdown format(s)
- ✓ Maintains semantic equivalence (same rules, same behavior)
- ✓ Profile content maps correctly (criteria → sections)
- ✓ Custom instructions preserved in markdown

## Backward Compatibility
- ✓ `/review file` continues working after migration
- ✓ Report format and persistence unchanged
- ✓ Existing review reports remain readable
- ✓ No breaking changes for HODGE-327.1 users

## Auto-Detection (hodge init)
- ✓ Detects TypeScript (tsconfig.json present)
- ✓ Detects JavaScript (package.json without tsconfig)
- ✓ Detects React (package.json dependencies contain "react")
- ✓ Detects Vue (package.json dependencies contain "vue")
- ✓ Detects testing tools (vitest, jest, pytest in devDependencies)
- ✓ Detects UI libraries (MUI, chakra-ui, tailwind)
- ✓ Generates review-config.md with detected profiles
- ✓ Preserves manual edits to review-config.md

## Profile Composition with Precedence
- ✓ Loads project .hodge/standards.md, principles.md, patterns/*, lessons/*
- ✓ Loads reusable profiles from review-config.md
- ✓ Resolves profile dependencies (requires: field)
- ✓ Merges with correct precedence (project standards override profiles)
- ✓ Project standards override profile recommendations (conflict resolution)
- ✓ AI receives merged context for review

## Reusable Profile Library Creation
- ✓ Creates general-coding-standards.md (SRP, DRY, coupling, naming, complexity)
- ✓ Creates languages/typescript.md (type safety, strict mode, inference)
- ✓ Creates languages/javascript.md (JS idioms, common pitfalls)
- ✓ Creates tech-stacks/react.md (hooks, components, performance)
- ✓ Creates tech-stacks/test-quality.md (test architecture, isolation)
- ✓ Ships profiles with Hodge framework (npm package includes them)
- ✓ Profile frontmatter schemas validated

## Future-Readiness for Scope Expansion
- ✓ Architecture supports directory scope (`/review directory <path>`)
- ✓ Architecture supports pattern scope (`/review pattern <glob>`)
- ✓ Architecture supports recent scope (`/review recent --last N`)
- ✓ Architecture supports all scope (`/review all`)
- ✓ No blockers for adding scope expansion in future stories

---

*8 behavioral categories covering frontmatter, enforcement, migration, compatibility, auto-detection, composition, library, and future-readiness*
