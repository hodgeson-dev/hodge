# Exploration: HODGE-333.3

## Title
Reusable Profile Library with Comprehensive Best Practices

## Problem Statement

After HODGE-333.1 migrated review profiles from YAML to markdown with frontmatter and HODGE-333.2 added auto-detection during `hodge init`, the placeholder profiles created need actual review criteria content. Currently, profiles like `languages/typescript.md`, `frameworks/react.md`, and `testing/vitest.md` contain only frontmatter with placeholder text. To provide out-of-the-box value for diverse tech stacks, we need a rich library of 18 profiles (7 with comprehensive content for latest stable versions, 11 with frontmatter placeholders documenting agreed version ranges) covering languages, frameworks, testing tools, API styles, and UI libraries.

## Conversation Summary

### Scope and Strategy

The exploration confirmed the need for a comprehensive profile library that ships with the Hodge framework. Rather than starting small and expanding later, we committed to shipping 18 profiles in HODGE-333.3 to establish Hodge as production-ready for diverse tech stacks from day one.

**Key Strategic Decisions**:
- **Breadth over incremental growth**: Ship all 18 profiles at once (7 full, 11 placeholders)
- **Latest stable versions get full content**: Focus implementation effort on current best practices
- **Older versions documented as placeholders**: Frontmatter defines version ranges for future implementation
- **Comprehensive but not exhaustive**: Rich guidance that users can extend via `.hodge/standards.md`

### Version Range Analysis

Analyzed current version landscapes for each technology and defined practical semver ranges:

**Languages**:
- TypeScript: `5.x` (full), `4.x` (placeholder)
- JavaScript: `ES2020+` (full), `ES2015-2019` (placeholder), `ES5/legacy` (placeholder)
- Python: `3.12+` (placeholder), `3.9-3.11` (placeholder), `3.6-3.8` (placeholder)

**Frameworks**:
- React: `18.x` (full), `17.x` (placeholder), `16.8+` (placeholder)
- Vue: `3.x` (placeholder), `2.x` (placeholder)
- NestJS: `10.x` (placeholder), `9.x` (placeholder), `8.x` (placeholder)

**Testing**:
- Vitest: `1.x` (full), `0.34+` (placeholder)
- Jest: `29.x` (full), `27.x-28.x` (placeholder)
- Playwright: `1.40+` (placeholder), `1.20-1.39` (placeholder)
- Cypress: `13.x` (placeholder), `10.x-12.x` (placeholder)

**API Styles**:
- GraphQL: Universal or `16.x` (placeholder), `15.x` (placeholder)
- REST: Framework-specific (Express `4.x`/`5.x`, Fastify `4.x`/`3.x`) (placeholder)

**UI Libraries**:
- MUI: `5.x` (placeholder), `4.x` (placeholder)
- Tailwind: `3.x` (placeholder), `2.x` (placeholder)
- Ant Design: `5.x` (placeholder), `4.x` (placeholder)

### Content Philosophy

Discussed content depth and enforcement levels, establishing these principles:

**Comprehensive Depth**: Each full profile should cover 6-10 key areas with specific guidance. Not a complete style guide (exhaustive), but substantial enough to catch real issues (comprehensive). Examples:
- TypeScript: strict mode, avoid `any`, type inference, discriminated unions, async patterns, utility types, generics, error handling
- React: component style, hooks best practices, state management, performance, composition, error boundaries, concurrent features
- Testing frameworks: organization, assertions, mocking, framework-specific features, lifecycle, coverage

**Enforcement Philosophy**: Most rules are **SUGGESTED/WARNING** (best practices that improve code quality), only critical violations are **MANDATORY/BLOCKER** (strict mode, test isolation, subprocess ban). This respects that profiles are reusable guidelines, not project-specific requirements.

**Always-Included Universal Profiles**: Enhanced `general-coding-standards.md` with 5 additional sections beyond existing SRP/DRY/Coupling/Complexity/Naming/Error Handling:
- Code Documentation (when/how to comment)
- Magic Numbers and Constants
- Code Duplication Detection
- Performance Considerations (premature vs necessary optimization)
- Security Basics (input validation, sanitization)

Created new `testing/general-test-standards.md` covering universal testing principles:
- Test Isolation (mandatory/blocker - no shared state, temp directories for file operations)
- Test Organization and Naming
- Assertion Quality
- Test Data Management
- Mocking Strategy
- Test Coverage Philosophy
- Test Performance

### Architecture Simplification

Clarified the CLI/AI separation of concerns and eliminated unnecessary complexity:

**No Cross-Referencing Needed**: Originally considered `requires:` field in frontmatter for profile dependencies (e.g., React requiring JavaScript). Determined this is unnecessary because:
- Always-included profiles (`general-coding-standards.md`, `testing/general-test-standards.md`) are automatically present
- Conditional profiles are independently detected (if React and TypeScript both match, both load)
- AI receives merged context and synthesizes guidance naturally

**CLI Role is Simple**:
1. Discover which profile files to load (based on auto-detection)
2. Read markdown content from those files
3. Concatenate into one string
4. Pass to AI in review prompt

**No Processing by CLI**: The CLI does NOT parse, interpret, or modify profile content. Only the frontmatter parser extracts metadata (name, version, criteria count) for display purposes. The markdown content passes through untouched to the AI for interpretation.

### Profile Structure and Versioning

Confirmed all profiles need version numbers in filenames to support multiple version ranges:
- `languages/typescript-5.x.md` (not `typescript.md`)
- `frameworks/react-18.x.md` (not `react.md`)
- `testing/vitest-1.x.md` (not `vitest.md`)

Frontmatter detection uses semver ranges:
```yaml
detection:
  dependencies: ["typescript"]
  version_range: ">=5.0.0 <6.0.0"
```

## Implementation Approaches

### Approach 1: Phased Content Creation with Parallel Profile Development (Recommended)

**Description**: Create all 18 profiles upfront (file structure + frontmatter), then develop full content for 7 profiles in parallel groups based on category (languages, frameworks, testing). Enables parallel work while maintaining consistency within categories.

**Workflow**:

**Phase 1: Structure Creation** (1-2 hours)
- Create all 18 profile files with complete frontmatter
- Full profiles get placeholder content section
- Placeholder profiles get "Profile content coming in future version" message
- Validates frontmatter schema across all profiles
- Establishes complete directory structure

**Phase 2: Universal Profiles** (2-3 hours)
- Enhance `general-coding-standards.md` (5 new sections)
- Create `testing/general-test-standards.md` (7 sections)
- These are foundational for all other profiles
- Test with existing `/review file` command

**Phase 3: Language Profiles** (3-4 hours, parallel)
- `languages/typescript-5.x.md` (8 sections)
- `languages/javascript-es2020+.md` (7 sections)
- Language profiles are independent, can be developed in parallel
- Both reference universal `general-coding-standards.md`

**Phase 4: Framework & Testing Profiles** (4-5 hours, parallel)
- `frameworks/react-18.x.md` (7 sections)
- `testing/vitest-1.x.md` (6 sections)
- `testing/jest-29.x.md` (6 sections)
- These can be developed in parallel (different authors or timeslots)

**Phase 5: Validation & Polish** (1-2 hours)
- Test auto-detection with all profiles
- Verify version range detection
- Test `/review file` with merged profile context
- Ensure enforcement markers are consistent
- Verify frontmatter schemas

**Pros**:
- Parallel work within phases reduces total time
- Category grouping ensures consistency (language profiles feel similar, testing profiles feel similar)
- Universal profiles first establishes foundation
- Complete structure upfront enables auto-detection testing early
- Clear completion criteria per phase
- Can ship placeholder profiles immediately, add content incrementally

**Cons**:
- Requires discipline to maintain consistency across parallel work
- Need to review cross-category integration (e.g., React + TypeScript interaction)
- Phase dependencies create some serialization

**When to use**: When developing 7 full profiles efficiently while maintaining quality and consistency.

---

### Approach 2: Sequential Profile Development

**Description**: Develop all 18 profile structures upfront, then create full content for the 7 profiles one at a time in dependency order (universal → languages → frameworks/testing).

**Workflow**:

1. Create all 18 file structures + frontmatter
2. `general-coding-standards.md` (enhanced)
3. `testing/general-test-standards.md` (new)
4. `languages/typescript-5.x.md`
5. `languages/javascript-es2020+.md`
6. `frameworks/react-18.x.md`
7. `testing/vitest-1.x.md`
8. `testing/jest-29.x.md`
9. Validation & testing

**Pros**:
- Simple, linear workflow
- Easy to track progress
- No parallelization complexity
- Each profile complete before moving to next
- Natural dependency order (universal → specific)

**Cons**:
- Slower total time (fully sequential)
- Potential for inconsistency across profiles (first vs last)
- Context switching between categories
- Can't leverage parallel development

**When to use**: When solo developer prefers simple linear workflow over speed.

---

### Approach 3: Content-First with Minimal Placeholders

**Description**: Only create the 7 full profiles (no placeholders for older versions/unused techs). Ship minimal but complete library, add version-specific profiles as user demand emerges.

**Workflow**:

1. Create only 9 profiles:
   - `general-coding-standards.md` (enhanced)
   - `testing/general-test-standards.md` (new)
   - `languages/typescript-5.x.md`
   - `languages/javascript-es2020+.md`
   - `frameworks/react-18.x.md`
   - `testing/vitest-1.x.md`
   - `testing/jest-29.x.md`
2. No placeholders for Python, Vue, NestJS, GraphQL, REST, Playwright, Cypress, UI libraries
3. No placeholders for older version ranges (TS 4.x, React 17.x, etc.)
4. Add additional profiles in future stories based on user requests

**Pros**:
- Minimal scope for HODGE-333.3
- Faster to ship
- YAGNI principle (don't build what's not needed yet)
- Less maintenance burden
- Still provides comprehensive coverage for primary use case (TypeScript/React/Vitest stack)

**Cons**:
- No documentation of agreed version ranges in code
- Users with Python/Vue/other stacks get no profiles
- Version range decisions lost (not captured in frontmatter)
- Harder to communicate Hodge's breadth of support
- Future additions require reopening version range discussions

**When to use**: When shipping quickly is priority over comprehensive documentation.

## Recommendation

**Use Approach 1: Phased Content Creation with Parallel Profile Development**

This approach best balances HODGE-333.3's requirements:

1. **Rich Out-of-Box Experience**: Ships all 18 profiles, demonstrating Hodge supports diverse tech stacks
2. **Documents Agreed Version Ranges**: Placeholder frontmatter captures version range decisions from this exploration (TS 4.x vs 5.x, React 16.8+ vs 17.x vs 18.x, etc.)
3. **Efficient Development**: Parallel work within phases reduces total time from ~15 hours (sequential) to ~10-12 hours
4. **Quality Through Consistency**: Category grouping ensures language profiles feel consistent, testing profiles feel consistent
5. **Early Testing**: Complete structure in Phase 1 enables auto-detection testing before content creation
6. **Clear Progress Tracking**: 5 phases with concrete deliverables
7. **Foundation First**: Universal profiles in Phase 2 establish baseline that other profiles can reference

**Implementation Priority**:
- Phase 1: Structure (all 18 files + frontmatter)
- Phase 2: Universal profiles (foundation)
- Phase 3: Language profiles (can parallelize)
- Phase 4: Framework & testing profiles (can parallelize)
- Phase 5: Validation (integration testing)

This approach aligns with the parent epic's vision of a "rich profile library" while documenting version ranges for future expansion.

## Decisions Decided During Exploration

1. ✓ **Use versioned filenames** - All technology profiles include version in filename (e.g., `typescript-5.x.md`, `react-18.x.md`, not generic `typescript.md`)
2. ✓ **Ship all 18 profiles in HODGE-333.3** - 7 with full content (latest stable versions), 11 with frontmatter placeholders (older versions, less common stacks)
3. ✓ **Version ranges agreed** - Defined semver ranges for all technologies: TS (4.x, 5.x), JS (ES2020+, ES2015-2019, legacy), React (16.8+, 17.x, 18.x), Python (3.6-3.8, 3.9-3.11, 3.12+), Vue (2.x, 3.x), NestJS (8.x, 9.x, 10.x), testing tools, API styles, UI libraries
4. ✓ **Use semver ranges in frontmatter** - Detection rules include `version_range: ">=5.0.0 <6.0.0"` for precise matching
5. ✓ **Enhance general-coding-standards.md** - Add 5 sections: Code Documentation, Magic Numbers, Code Duplication, Performance Considerations, Security Basics
6. ✓ **Create testing/general-test-standards.md** - New universal testing profile with 7 sections: Test Isolation (mandatory), Organization, Assertions, Test Data, Mocking, Coverage Philosophy, Performance
7. ✓ **Enforcement philosophy** - Most rules SUGGESTED/WARNING, only critical violations MANDATORY/BLOCKER (strict mode, test isolation, subprocess ban)
8. ✓ **Comprehensive content depth** - 6-10 sections per profile covering key areas, not exhaustive style guides but substantial guidance
9. ✓ **No cross-referencing needed** - Eliminated `requires:` field from frontmatter; profiles are independent, auto-detection loads all matches
10. ✓ **CLI concatenates, doesn't process** - CLI discovers files, reads content, concatenates into single string for AI; no parsing/interpretation of markdown content
11. ✓ **Always-included universal profiles** - `general-coding-standards.md` and `testing/general-test-standards.md` automatically loaded for all reviews

## Decisions Needed

**No Decisions Needed**

## Test Intentions

### Profile Structure and Frontmatter

- All 18 profile files exist in correct directory structure (languages/, frameworks/, testing/, api-styles/, ui-libraries/)
- All profiles have valid YAML frontmatter with required fields (scope, type, version, frontmatter_version, maintained_by)
- Version-specific profiles include detection rules with semver ranges
- Frontmatter parser validates all 18 profiles without errors
- Full content profiles have substantive markdown content after frontmatter
- Placeholder profiles have clear "coming in future version" message

### Content Quality for Full Profiles

- `general-coding-standards.md` contains 11 sections (6 existing + 5 new)
- `testing/general-test-standards.md` contains 7 sections with test isolation as MANDATORY/BLOCKER
- `languages/typescript-5.x.md` contains 8 sections covering strict mode, any avoidance, inference, unions, async, utilities, generics, error handling
- `languages/javascript-es2020+.md` contains 7 sections covering modern syntax, variables, functions, destructuring, async, modules, array methods
- `frameworks/react-18.x.md` contains 7 sections covering component style, hooks, state, performance, composition, error boundaries, concurrent features
- `testing/vitest-1.x.md` contains 6 sections covering organization, assertions, mocking, Vitest features, lifecycle, coverage
- `testing/jest-29.x.md` contains 6 sections covering organization, assertions, mocking, Jest features, lifecycle, coverage

### Enforcement Markers

- Each section in full profiles has explicit enforcement marker (`**Enforcement: MANDATORY**` or `**Enforcement: SUGGESTED**`)
- Each section has explicit severity marker (`**Severity: BLOCKER**`, `**SEVERITY: WARNING**`, or `**Severity: SUGGESTION**`)
- Critical violations use MANDATORY/BLOCKER (strict mode, test isolation, subprocess ban)
- Most rules use SUGGESTED/WARNING or SUGGESTED/SUGGESTION
- Enforcement markers are consistent within profile categories (all language profiles similar, all testing profiles similar)

### Auto-Detection Integration

- TypeScript 5.x detection matches `tsconfig.json` OR `"typescript": ">=5.0.0 <6.0.0"` in dependencies
- JavaScript ES2020+ detection matches `.js/.mjs/.cjs` files with modern `package.json` engines
- React 18.x detection matches `"react": ">=18.0.0 <19.0.0"` in dependencies
- Vitest 1.x detection matches `"vitest": ">=1.0.0 <2.0.0"` in devDependencies
- Jest 29.x detection matches `"jest": ">=29.0.0 <30.0.0"` in devDependencies
- Auto-detection service loads all matching profiles when multiple technologies detected
- Placeholder profiles with detection rules are recognized but return placeholder content

### Profile Composition and Loading

- CLI discovers all applicable profiles based on detection rules
- CLI reads markdown content from all matched profiles
- CLI concatenates profiles into single string (general-coding-standards + testing/general-test-standards + detected profiles)
- Concatenated string passed to AI in review prompt
- No processing/modification of markdown content by CLI (only frontmatter metadata extraction)
- AI receives complete merged context for review

### Integration with Review Command

- `/review file` command loads applicable profiles based on file extension and project detection
- Review reports include criteria from all loaded profiles
- Enforcement levels correctly categorize violations (blockers vs warnings vs suggestions)
- Multiple profiles work together (e.g., TypeScript + React for .tsx files)
- Universal profiles always included in review context

### Placeholder Profile Documentation

- All 11 placeholder profiles exist with complete frontmatter
- Frontmatter documents agreed version ranges from exploration
- Placeholder message clearly states "Profile content coming in future version"
- Version range information preserved for future implementation (TS 4.x, React 17.x, Python 3.12+, etc.)

---

*Template created: 2025-10-08T04:49:09.287Z*
*Exploration completed: 2025-10-08T05:15:00.000Z*
*AI exploration: Claude Code (Conversational Mode)*
