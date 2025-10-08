# Lessons Learned: HODGE-333.4

## Feature: Profile Composition System and Harden Integration for AI Code Review

### The Problem

After HODGE-333.1-333.3 shipped the review profile infrastructure (frontmatter format, auto-detection during init, and 39 comprehensive profiles), the system had all the pieces but was missing the integration layer. Developers had profiles but no way to use them together, and the `/harden` command ran validation tests without any code review step. The gap: **no composition system to load multiple profiles with project context, and no integration into the development workflow.**

### Approach Taken

We followed **Approach 1: Service-First with Incremental Integration**, breaking the feature into 4 sequential phases:

1. **Phase 1**: Built ProfileCompositionService as a separate service (not extending ContextAggregator)
   - Loads profiles from `.hodge/review-config.md` with fallback to defaults
   - Concatenates project context (standards, principles, decisions, patterns) + profiles
   - Implements precedence rules via explicit instruction blocks
   - 5 smoke tests validating core composition logic

2. **Phase 2**: Updated `/review file` command to use ProfileCompositionService
   - Replaced hardcoded `general-coding-standards` with full composition
   - Proved the composition system worked end-to-end
   - Fixed 8 smoke tests to match new output format

3. **Phase 3**: Integrated review into `/harden` workflow
   - Added `--review` flag to load context before validation
   - Implemented `handleReviewMode()` to get changed files and compose context
   - Added Step 5 to `.claude/commands/harden.md` for AI to generate review-report.md
   - Creates persistent review reports documenting AI findings

4. **Phase 4**: Expanded review scopes beyond single files
   - `/review directory <path>` - recursive file scanning with .gitignore filtering
   - `/review recent --last N` - reviews files from last N commits
   - Registered review command in CLI with proper options

**Key Architectural Decision**: Created ProfileCompositionService as a **separate service** from ContextAggregator to follow Single Responsibility Principle. ContextAggregator loads project context, ProfileCompositionService loads and composes profiles - clean separation of concerns.

### Key Learnings

#### 1. Conversational Flexibility Within Structured Frameworks

**Discovery**: The feature started with a clear plan (4 phases, specific deliverables), but during implementation we discovered missing functionality through natural conversation. For example:
- During harden testing, we realized review-report.md generation was specified but not implemented
- Through dialogue, we added Step 5 to harden.md template for AI to generate the report
- This "back and forth" felt natural and productive, not like a deviation from the plan

**User Insight**: *"It's nice that what we're building is a structure with standards and procedural components, but that we can still just have a conversation and get things done that way."*

**Solution**: The framework provides structure (standards.md, progressive phases, test requirements) while allowing conversational flexibility for discovery and iteration. The structure guides without constraining.

**Pattern**: Structure + Conversation = Flexible Discipline
- Structure provides guardrails (standards, phases, test gates)
- Conversation enables discovery and course correction
- Neither alone is sufficient - you need both

#### 2. CLI/AI Separation Requires Constant Vigilance

**Discovery**: We encountered CLI/AI boundary confusion **again** during this feature. Initially considered having HardenCommand generate review-report.md, but this violated the established pattern:
- CLI discovers structure and provides manifests (paths to files)
- AI reads content and generates reports (interpretation and synthesis)

**User Insight**: *"We once again struggled with being clear about the core concern of the CLI vs AI. We had to go another round on that."*

**Solution**: Reinforced the pattern in `.claude/commands/harden.md` - the CLI runs `hodge harden --review` to prepare context files, then the AI reads those files and generates review-report.md using the Write tool. The CLI never writes content that requires interpretation.

**Recurring Pattern**: This is the **third time** we've had to clarify this boundary:
1. HODGE-327.1: Established that AI writes exploration.md, decisions.md, and review reports
2. HODGE-334: Added explicit standard about CLI/AI separation of concerns
3. HODGE-333.4: Applied pattern again but still needed discussion to get it right

**Why This Keeps Happening**: The boundary is conceptually clear but practically fuzzy. When implementing a new feature, it's tempting to add "just one more file write" to the CLI because it feels simpler. The discipline requires actively resisting that temptation.

**Mitigation**: Updated standards.md with HODGE-334 principle - CLI provides file manifests, AI interprets content. Every new feature that involves file creation should reference this standard explicitly.

#### 3. Test Maintenance Is Feature Work

**Discovery**: Each phase required updating existing tests to match new behavior:
- Phase 2: Fixed review.integration.test.ts (3 tests) for new output format
- Phase 2: Updated review.smoke.test.ts (2 tests) for ProfileCompositionService
- Phase 3: Fixed standards-enforcement.smoke.test.ts for new harden.md template
- Phase 3: Added harden.md template content validation

**Learning**: Tests are not "set and forget" - they evolve with the codebase. Updating tests is not rework, it's an essential part of feature delivery. The tests validate behavior, and when behavior changes (even improvements), tests must change too.

**Time Impact**: Test updates took approximately 20% of total implementation time. This is normal and expected, not a sign of poor initial testing.

#### 4. Phased Delivery Validates Architecture Early

**Discovery**: By building ProfileCompositionService first (Phase 1) and proving it with `/review file` (Phase 2), we validated the architecture before tackling the complex `/harden` integration (Phase 3).

**Benefit**: When Phase 3 encountered challenges (like the CLI/AI boundary confusion), we knew the composition layer was solid. The problem space was isolated - we weren't debugging composition AND integration simultaneously.

**Contrast**: If we had used "Feature-Complete Big Bang" (Approach 2), discovering the CLI/AI boundary issue would have required untangling composition logic, review integration, and harden workflow all at once.

### Code Examples

#### ProfileCompositionService API

```typescript
// Clean separation: service composes, commands orchestrate
const compositionService = new ProfileCompositionService();
const result = compositionService.composeReviewContext();

// Result includes metadata for CLI to report
console.log(`Loaded ${result.profilesLoaded.length} profiles`);
console.log(`Missing: ${result.profilesMissing.join(', ')}`);

// Content ready for AI to use
const reviewContext = result.content; // Markdown with precedence rules
```

#### Harden Review Integration Pattern

```typescript
// CLI prepares context (--review mode)
if (options.review) {
  const changedFiles = await this.getChangedFiles();
  const compositionResult = compositionService.composeReviewContext();

  // Save files for AI to read
  await fs.writeFile(path.join(hardenDir, 'review-context.md'),
                     compositionResult.content);
  await fs.writeFile(path.join(hardenDir, 'changed-files.txt'),
                     changedFiles.join('\n'));

  // CLI stops here - AI takes over
  return;
}
```

#### AI Generates Review Report (Write Tool Pattern)

```markdown
# In .claude/commands/harden.md Step 5:
Use the Write tool to create `.hodge/features/{{feature}}/harden/review-report.md`

# AI reads context, analyzes files, generates structured report:
- 🚫 Blockers (must fix)
- ⚠️ Warnings (should address)
- 💡 Suggestions (optional)
```

### Impact

**Developer Experience**:
- `/harden` now runs AI code review before validation tests
- Review reports persist findings for future reference
- Multi-scope review support (file, directory, recent commits)

**Architecture Quality**:
- Clean separation: ProfileCompositionService vs ContextAggregator (SRP)
- CLI/AI boundary maintained (CLI = structure, AI = interpretation)
- 18 total tests across 3 test types (smoke, integration, command)

**Framework Evolution**:
- Completed HODGE-333 epic (4 sub-features shipped)
- Established reusable composition pattern for future profile-based features
- Demonstrated phased delivery approach works for complex integrations

### Related Decisions

From exploration.md:
1. Create ProfileCompositionService separate from ContextAggregator
2. Explicit instruction blocks for precedence (project context > profiles)
3. Fail fast on missing project files, warn on missing profiles
4. `/review directory` reviews recursively with .gitignore filtering
5. `/review recent --last N` uses git diff for changed files
6. `/harden` runs review before tests, blocks on BLOCKER severity
7. Structured review report format (Blocker/Warning/Suggestion)

From standards.md (added during feature):
- CLI/AI Separation of Concerns (HODGE-334): CLI provides file manifests, AI interprets content

### Takeaways for Future Features

1. **Embrace Conversational Discovery**: Don't treat deviation from the plan as failure - it's how we discover missing requirements. The plan guides, conversation refines.

2. **CLI/AI Boundary Needs Active Defense**: Every file-writing decision should explicitly ask: "Is this structure (CLI) or interpretation (AI)?" Default to AI for content that requires judgment.

3. **Budget for Test Maintenance**: When estimating features, include time for updating existing tests. It's 15-25% of implementation time for features that touch established commands.

4. **Phased Delivery Isolates Risk**: Build foundation first, prove it works, then integrate. When issues arise (and they will), the problem space is smaller.

5. **Lessons Are for Patterns, Not Just History**: This lesson itself follows a pattern - it will inform future lessons. The meta-lesson: document not just what happened, but **why patterns emerge and how to recognize them earlier next time.**

---
_Documented: 2025-10-08_
_Changes: 14 files modified, 562 additions, 183 deletions_
_Tests: 913 passing, 41 skipped_
_Phases: 4 (all completed)_
