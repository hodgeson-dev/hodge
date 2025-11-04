# Exploration: Workflow Refinement - Split Exploration and Implementation Details (/decide → /refine)

**Created**: 2025-11-03
**Status**: Exploring

## Problem Statement

Current workflow forces "big upfront design" by requiring developers and POs to drill into implementation details during exploration. This creates inefficient meetings where POs wait through technical discussions, and developers make premature choices before understanding the full problem space. Teams need a way to align on the big picture (what + high-level how) during exploration, then drill into implementation details (library choices, code organization, edge cases) separately when development begins.

## Context

**Project Type**: Framework Enhancement (Team Collaboration - Workflow Refinement)

**Parent Feature**: HODGE-377 - Team Development with Feature Branches & Workflow Refinement

This is the sixth sub-feature of the HODGE-377 epic. It builds on HODGE-377.1's team mode detection, HODGE-377.2's PM-required feature creation, HODGE-377.3's gitignore/regeneration, HODGE-377.4's PM comment foundation, and HODGE-377.5's sub-feature adapter methods by implementing the workflow refinement identified in the parent exploration: separating exploration (what + high-level how) from implementation details (specific how).

## Related Features

- HODGE-377 - Parent epic (Team Development)
- HODGE-377.1 - Team Mode Detection & Configuration (shipped)
- HODGE-377.2 - PM-Required Feature Creation (shipped)
- HODGE-377.3 - Auto-Generated File Management (shipped)
- HODGE-377.4 - PM Comment Synchronization Foundation (shipped)
- HODGE-377.5 - PM Adapter Sub-Feature Methods (shipped)
- HODGE-002 - PM integration foundation
- HODGE-004 - Context management

## High-Level Architecture

**Three-Phase Workflow:**
```
/explore → exploration.md (what + high-level how + questions)
    ↓
/refine → refinements.md (implementation details + resolved questions)
    ↓
/build → implementation (based on refinements.md)
```

**Key Architectural Changes:**
1. **Command rename**: `/decide` → `/refine` (no backward compatibility, clean cutover)
2. **File rename**: `decisions.md` → `refinements.md` (not gitignored, human-authored)
3. **exploration.md template updates**:
   - "Decisions Needed" → "Questions for Refinement"
   - Add "High-Level Architecture" section
   - Remove test-intentions.md file creation (redundant)
4. **Command updates**: /build, /harden, /ship load refinements.md instead of decisions.md
5. **Status updates**: /status shows "Refinement ✓" instead of "Decisions ✓"
6. **Context loading**: /context includes refinements.md in feature_context manifest

**Decision Tree After /explore:**
```
exploration.md has questions for refinement?
├─ Yes + substantial work → recommend /plan (break into sub-features)
├─ Yes + normal scope → recommend /refine (drill into details)
└─ No questions → recommend /build (ready to implement)
```

**Exploration vs Refinement Boundaries:**

**/explore (stays in exploration.md):**
- Problem statement & requirements (what)
- High-level approach options (REST vs GraphQL, batch vs real-time)
- Recommended approach with rationale
- Architecture choices that affect capabilities
- Test intentions (behavioral expectations)
- Questions identified that need answering

**/refine (goes in refinements.md):**
- Library/framework choices (which GraphQL library, which validation library)
- Code organization patterns (folder structure, module boundaries)
- Error handling strategies (error codes, message formats)
- Caching/performance optimizations
- Naming conventions and style details
- Edge case handling discovered during investigation
- Integration patterns with existing code
- Data migration strategies

## Conversation Summary

We explored how to restructure the workflow to separate high-level exploration from implementation details. The key insight: current workflow creates inefficiency by mixing "what should it do?" with "which library should we use?" in the same conversation, forcing POs and developers to wade through premature technical details before the problem is fully understood.

The conversation clarified that exploration should stop after identifying the big picture (what + high-level approach) and listing questions that need answering. This enables efficient collaboration where POs and developers align on requirements and overall approach without getting bogged down in technical minutiae. When a developer picks up the work, they run `/refine` to drill into implementation specifics in a structured way.

For the `/refine` command workflow, we determined a two-phase conversation: (1) address known questions from exploration.md in a structured Q&A (current `/decide` style), then (2) engage in open implementation drill-down to discover additional decisions beyond the known questions (current `/explore` style, but focused on "how"). This ensures both identified questions get answered AND unexpected implementation details get surfaced.

The refinements.md structure mirrors exploration.md to enable efficient `/build` consumption. It includes Implementation Summary, Detailed Implementation Plan, Known Questions Resolved, Additional Decisions Made, Test Strategy (how to test given implementation choices), Migration/Rollout Plan (if needed), Edge Cases & Gotchas, and Implementation Validations (things that can only be verified hands-on during building).

For test planning, we separated behavioral expectations (exploration.md test intentions: what the feature should DO) from implementation testing strategy (refinements.md test strategy: how to test it given the chosen approach - specific test types, mocking strategy, fixtures, coverage requirements). This eliminates the redundant test-intentions.md file.

PM integration follows the pattern from HODGE-377.4: when `/refine` completes, post a PM comment with the refinements.md summary (e.g., "📋 Refinement Complete: Implementation plan finalized, ready to build"). PM issue creation timing stays unchanged from HODGE-377.2 (created after exploration approval).

Sub-feature context loading (from HODGE-377.5) extends to refinements: when refining a sub-feature like HODGE-377.6, load parent HODGE-377 refinements.md and sibling refinements.md files (377.1-5) to ensure consistency in implementation decisions across the epic. This prevents architectural drift and enables reuse of patterns established by siblings.

For migration, we confirmed clean cutover with no backward compatibility: no existing in-flight features have decisions.md files, so `/decide` command disappears entirely, and all commands switch to refinements.md only. The "Questions for Refinement" section in exploration.md stays for reference after `/refine` completes (not removed or marked as moved).

Error handling and flags: `/refine` requires exploration.md to exist (error if run before `/explore`), supports `--rerun` flag for re-doing refinement (overwrites existing refinements.md), and requires completion in one session (nothing written until preview approved, use `/checkpoint` for partial work).

## Implementation Approaches

### Approach 1: Command Rename with Broadened Scope (Recommended)

**Description**:

Rename `/decide` → `/refine` and broaden the scope from "answer exploration questions" to "full implementation drill-down." Create refinements.md with structured sections mirroring exploration.md. Update all commands (/build, /harden, /ship, /status, /context) to reference refinements.md. Update exploration.md template to separate "what/high-level how" from "implementation how."

**Architecture**:
```typescript
// New RefineCommand (replaces DecideCommand)
class RefineCommand {
  async execute(featureId: string, options: { rerun?: boolean }): Promise<void> {
    // 1. Validate exploration.md exists
    const explorationPath = `.hodge/features/${featureId}/explore/exploration.md`;
    if (!fs.existsSync(explorationPath)) {
      throw new Error('Run /explore first - exploration.md not found');
    }

    // 2. Check for existing refinements.md (handle --rerun)
    const refinementPath = `.hodge/features/${featureId}/refine/refinements.md`;
    if (fs.existsSync(refinementPath) && !options.rerun) {
      throw new Error('refinements.md already exists. Use --rerun to regenerate.');
    }

    // 3. Load context
    const exploration = await this.loadExploration(featureId);
    const questionsForRefinement = this.extractQuestions(exploration);

    // 4. Load sub-feature context (from HODGE-377.5)
    const subFeatureContext = await this.loadSubFeatureContext(featureId);
    // Includes parent + sibling refinements.md files if this is a sub-feature

    // 5. Present context summary
    console.log(`Refining: ${exploration.title}`);
    console.log(`Recommended Approach: ${exploration.recommendation}`);
    console.log(`Questions for Refinement: ${questionsForRefinement.length}`);
    if (subFeatureContext.parent) {
      console.log(`Parent refinements: ${subFeatureContext.parent.refinements?.title}`);
    }

    // 6. Phase 1: Address known questions (structured Q&A)
    const resolvedQuestions = await this.addressKnownQuestions(questionsForRefinement);

    // 7. Phase 2: Open implementation drill-down
    const additionalDecisions = await this.openDrillDown(exploration, resolvedQuestions);

    // 8. Synthesize refinements.md content
    const refinements = await this.synthesizeRefinements({
      exploration,
      resolvedQuestions,
      additionalDecisions,
      subFeatureContext
    });

    // 9. Show preview for approval
    const approved = await this.showPreview(refinements);
    if (!approved) return;

    // 10. Write refinements.md
    await this.writeRefinements(featureId, refinements);

    // 11. Post PM comment (if team mode, from HODGE-377.4)
    if (this.teamModeService.isTeamMode()) {
      await this.pmCommentService.appendRefinementComment(
        featureId,
        this.generateRefinementSummary(refinements)
      );
    }

    // 12. Recommend /build
    console.log('\n✅ Refinement complete! Ready to build.');
    console.log('Next: /build ' + featureId);
  }

  private async loadSubFeatureContext(featureId: string) {
    // Uses adapter.getParentIssue() and adapter.getSubIssues() from HODGE-377.5
    const parentId = await this.adapter.getParentIssue(featureId);
    if (!parentId) return { parent: null, siblings: [] };

    const parentExploration = await this.loadExploration(parentId);
    const parentRefinements = await this.loadRefinements(parentId); // may not exist

    const siblings = await this.adapter.getSubIssues(parentId);
    const siblingRefinements = await Promise.all(
      siblings.map(s => this.loadRefinements(s.id))
    );

    return { parent: { exploration: parentExploration, refinements: parentRefinements }, siblings: siblingRefinements };
  }
}

// refinements.md template structure
interface RefinementsDocument {
  title: string;
  created: Date;
  status: 'refining' | 'complete';

  implementationSummary: string; // High-level overview, references exploration approach

  detailedImplementationPlan: {
    libraryChoices: string;
    codeOrganization: string;
    integrationPatterns: string;
    errorHandling: string;
    dataStructures?: string;
    snippets?: string[]; // Code examples if helpful
  };

  knownQuestionsResolved: Array<{
    question: string;
    answer: string;
    rationale: string;
  }>;

  additionalDecisionsMade: Array<{
    decision: string;
    rationale: string;
    alternatives?: string;
  }>;

  testStrategy: {
    unitTests: string;
    integrationTests: string;
    e2eTests?: string;
    mockingStrategy: string;
    fixturesNeeded: string;
    coverageRequirements: string;
  };

  migrationRolloutPlan?: {
    backwardCompatibility: string;
    migrationSteps: string;
    featureFlags?: string;
  };

  edgeCasesGotchas: string[];

  implementationValidations: Array<{
    validation: string;
    hypothesis: string;
    verificationMethod: string;
    status: 'pending' | 'verified' | 'failed';
  }>;
}

// Updated exploration.md template sections
interface ExplorationDocument {
  title: string;
  created: Date;
  status: string;

  problemStatement: string;
  context: { projectType: string; parentFeature?: string };
  relatedFeatures: string[];

  highLevelArchitecture: string; // NEW SECTION

  conversationSummary: string;
  implementationApproaches: Approach[];
  recommendation: string;

  testIntentions: string[]; // Behavioral expectations only

  questionsForRefinement: string[]; // RENAMED from "Decisions Needed"

  decisionsDecidedDuringExploration?: string[]; // If any resolved during /explore
}
```

**Updated Commands**:
```typescript
// BuildCommand - load refinements.md
class BuildCommand {
  async execute(featureId: string): Promise<void> {
    const refinements = await this.loadRefinements(featureId); // was decisions.md
    // Use refinements.detailedImplementationPlan for build guidance
  }
}

// StatusCommand - show "Refinement ✓"
class StatusCommand {
  async execute(featureId?: string): Promise<void> {
    const hasRefinements = fs.existsSync(`.hodge/features/${featureId}/refine/refinements.md`);
    console.log(`Refinement: ${hasRefinements ? '✓' : '○'}`); // was "Decisions"
  }
}

// ContextCommand - include refinements.md in manifest
class ContextCommand {
  async execute(featureId?: string): Promise<void> {
    if (featureId) {
      const refinementsPath = `.hodge/features/${featureId}/refine/refinements.md`;
      manifest.feature_context.push({
        path: refinementsPath,
        status: fs.existsSync(refinementsPath) ? 'available' : 'not_found'
      });
    }
  }
}
```

**Template Updates**:
```typescript
// ExploreService - update exploration.md template
class ExploreService {
  private generateTemplate(): string {
    return `# Exploration: {{title}}

## Problem Statement
{{problem}}

## Context
**Project Type**: {{projectType}}

## Related Features
{{relatedFeatures}}

## High-Level Architecture

<!-- NEW SECTION: Describe the what + high-level how -->

## Conversation Summary
{{summary}}

## Implementation Approaches
{{approaches}}

## Recommendation
{{recommendation}}

## Test Intentions
{{testIntentions}}

## Questions for Refinement

<!-- RENAMED from "Decisions Needed" -->

{{questions}}

## Decisions Decided During Exploration

<!-- If any decisions resolved during /explore conversation -->
`;
  }

  // Remove test-intentions.md file creation
  async createExploration(featureId: string): Promise<void> {
    // ... create exploration.md
    // DON'T create test-intentions.md (redundant)
  }
}
```

**Pros**:
- Clean separation of concerns: exploration (what) vs refinement (how)
- Enables efficient PO/developer collaboration (align on big picture, drill down later)
- Structured conversation in `/refine` ensures comprehensive implementation planning
- Mirrors exploration.md structure for easy `/build` consumption
- Leverages sub-feature context from HODGE-377.5 for consistency
- Follows PM integration patterns from HODGE-377.4
- Clean cutover (no migration complexity)
- Test planning separated: behavioral (exploration) vs implementation (refinement)

**Cons**:
- Adds another workflow step (could feel like more overhead)
- Developers must remember to run `/refine` before `/build`
- Requires updates to 6+ files (commands, templates, patterns, documentation)
- "Questions for Refinement" section in exploration.md stays forever (reference clutter)
- Risk of developers skipping `/refine` and going straight to `/build`

**When to use**:
When teams want to separate "alignment on requirements" from "implementation details," enabling efficient collaboration and preventing premature technical decisions.

---

### Approach 2: Optional Refinement Phase (Hybrid)

**Description**:

Keep both `/decide` (for simple questions) and `/refine` (for full drill-down). Let developers choose which one based on complexity. Update `/explore` to recommend `/decide` for simple cases and `/refine` for complex cases. Both create refinements.md, but `/decide` creates a minimal version.

**Architecture**:
```typescript
// Keep DecideCommand for simple questions
class DecideCommand {
  async execute(decision: string, featureId?: string): Promise<void> {
    // Simple decision recording (current behavior)
    // Creates minimal refinements.md with just the decision
  }
}

// Add RefineCommand for full drill-down
class RefineCommand {
  async execute(featureId: string): Promise<void> {
    // Full implementation planning (as described in Approach 1)
    // Creates comprehensive refinements.md
  }
}

// ExploreCommand recommends based on complexity
class ExploreCommand {
  recommendNextStep(exploration: Exploration): string {
    if (exploration.questionsForRefinement.length === 0) {
      return '/build';
    } else if (exploration.questionsForRefinement.length <= 2 && !exploration.hasComplexity) {
      return '/decide'; // Simple cases
    } else {
      return '/refine'; // Complex cases
    }
  }
}
```

**Pros**:
- Flexibility: developers choose based on need
- Gradual adoption: teams can ease into `/refine` workflow
- Backward compatible: `/decide` still works for simple cases
- Lower friction for simple features

**Cons**:
- Two ways to do the same thing (confusing)
- Inconsistent refinements.md format (minimal vs comprehensive)
- `/build` must handle both formats
- Cognitive overhead: "Should I use /decide or /refine?"
- Doesn't solve the core problem for complex features

**When to use**:
When you want gradual adoption or need backward compatibility, and are willing to maintain two commands that do similar things.

---

### Approach 3: Auto-Refinement During Build

**Description**:

Skip the explicit `/refine` command entirely. When developer runs `/build`, automatically prompt for refinement if exploration.md has questions. Embed refinement conversation directly in `/build` workflow.

**Architecture**:
```typescript
class BuildCommand {
  async execute(featureId: string): Promise<void> {
    const exploration = await this.loadExploration(featureId);

    // Check for refinements.md
    if (!fs.existsSync(refinementsPath)) {
      const hasQuestions = exploration.questionsForRefinement.length > 0;

      if (hasQuestions) {
        console.log('⚠️  Questions need refinement before building');
        const shouldRefine = await this.promptUser('Start refinement now?');

        if (shouldRefine) {
          await this.embeddedRefinement(exploration);
        } else {
          throw new Error('Cannot build without refinement');
        }
      }
    }

    // Continue with build...
  }

  private async embeddedRefinement(exploration: Exploration): Promise<void> {
    // Same refinement conversation as Approach 1, but embedded in /build
  }
}
```

**Pros**:
- One less command to remember
- Seamless workflow: just run `/build` and it guides you
- No risk of forgetting `/refine` step
- Simpler mental model

**Cons**:
- Conflates two distinct phases (refinement vs building)
- Makes `/build` complex and multi-purpose
- Can't refine without building (what if you want to plan first?)
- Harder to test and maintain
- Violates single responsibility principle
- Breaks existing `/build` expectations

**When to use**:
When you want the simplest possible workflow and are willing to combine refinement and building into one mega-command.

---

## Recommendation

**Approach 1 - Command Rename with Broadened Scope**

**Rationale**:

Approach 1 provides the cleanest separation of concerns and directly solves the stated problem: enabling efficient collaboration between POs and developers by separating "alignment on requirements" from "implementation details." The three-phase workflow (/explore → /refine → /build) creates clear mental models for each stage and prevents premature technical decisions.

The command rename (/decide → /refine) better reflects the broadened scope: not just answering exploration questions, but comprehensive implementation planning including library choices, code organization, edge cases, testing strategy, and migration plans. The name "refine" accurately describes the activity: taking the high-level approach from exploration and refining it into actionable implementation details.

The structured refinements.md format (mirroring exploration.md sections) ensures /build has all the context it needs to implement efficiently. Separating test intentions (behavioral expectations in exploration.md) from test strategy (implementation approach in refinements.md) creates clarity about what to test vs how to test it.

Sub-feature context loading (from HODGE-377.5) ensures consistency across the epic: when refining HODGE-377.6, the AI loads parent HODGE-377 and sibling 377.1-5 refinements to maintain architectural coherence. This prevents drift and enables pattern reuse.

PM integration (from HODGE-377.4) provides team visibility: when refinement completes, the PM issue gets a comment with the implementation summary, keeping team members informed without needing access to local files.

The clean cutover (no migration, /decide disappears entirely) avoids backward compatibility complexity. Since no in-flight features have decisions.md files, we can make a clean break and establish the new pattern clearly.

Approach 2's hybrid model creates confusion ("Should I use /decide or /refine?") and doesn't solve the core problem for complex features. Approach 3's auto-refinement conflates distinct phases and makes /build too complex.

The decision tree after /explore provides clear guidance: questions + substantial work → /plan, questions + normal scope → /refine, no questions → /build. This helps developers choose the right path without cognitive overhead.

## Test Intentions

### Core Behaviors

1. **RefineCommand created and DecideCommand removed**
   - `/refine` command exists and works
   - `/decide` command no longer exists (no alias)
   - Running `/decide` shows error: "Command not found. Use /refine instead."

2. **Refinement requires exploration**
   - Running `/refine FEAT-123` without exploration.md → error: "Run /explore first"
   - Running `/refine FEAT-123` with exploration.md → succeeds

3. **Refinement creates refine/ directory and refinements.md**
   - After `/refine` completes → `.hodge/features/FEAT-123/refine/` directory exists
   - refinements.md file created with structured sections
   - File not gitignored (committed to version control)

4. **Refinement --rerun flag works**
   - `/refine FEAT-123` when refinements.md exists → error: "Use --rerun to regenerate"
   - `/refine FEAT-123 --rerun` when refinements.md exists → overwrites file

5. **Refinement two-phase conversation**
   - Phase 1: AI addresses questions from exploration.md "Questions for Refinement" section
   - Phase 2: AI asks "Are there other implementation details we should work through?"
   - Both phases complete before showing preview

6. **refinements.md has correct structure**
   - Implementation Summary (references exploration.md approach)
   - Detailed Implementation Plan (libraries, code org, error handling, etc.)
   - Known Questions Resolved (from exploration.md)
   - Additional Decisions Made (discovered during refinement)
   - Test Strategy (unit/integration/e2e, mocking, fixtures)
   - Migration/Rollout Plan (if needed)
   - Edge Cases & Gotchas
   - Implementation Validations (things to verify during build)

7. **exploration.md template updated**
   - "Decisions Needed" section renamed to "Questions for Refinement"
   - "High-Level Architecture" section added
   - test-intentions.md file no longer created

8. **Commands load refinements.md instead of decisions.md**
   - BuildCommand loads refinements.md (not decisions.md)
   - HardenCommand loads refinements.md if it exists
   - ShipCommand loads refinements.md for commit message context
   - ContextCommand includes refinements.md in feature_context manifest

9. **/status shows "Refinement ✓"**
   - When refinements.md exists → status shows "Refinement: ✓"
   - When refinements.md missing → status shows "Refinement: ○"
   - "Decisions" label no longer appears

10. **PM comment posted on refinement completion**
    - In team mode: refinement completion posts PM comment
    - Comment format: "📋 Refinement Complete: [implementation summary]"
    - Comment includes refinements.md summary (not full file)

11. **Sub-feature context loading in /refine**
    - When refining HODGE-377.6 (sub-feature), load parent HODGE-377 refinements.md
    - Load sibling refinements.md files (377.1-5) if they exist
    - Present context summary showing parent/sibling implementation decisions
    - AI references parent/sibling patterns during refinement conversation

12. **Decision tree recommendations work**
    - exploration.md with questions + normal scope → /explore recommends /refine
    - exploration.md with questions + substantial work → /explore recommends /plan
    - exploration.md with no questions → /explore recommends /build

13. **"Questions for Refinement" section stays for reference**
    - After /refine completes, exploration.md "Questions for Refinement" section unchanged
    - Not removed, not marked as moved, just left in place

### Edge Cases

14. **Handles missing exploration.md gracefully**
    - `/refine` checks for exploration.md before loading context
    - Clear error message if missing
    - No partial refinements.md created

15. **Handles partial refinement session**
    - Nothing written until preview approved
    - User can abort refinement (no files created)
    - Use `/checkpoint` to save partial work

16. **Template and pattern references updated**
    - `.claude/commands/explore.md` references updated from /decide → /refine
    - `.claude/commands/decide.md` removed or archived
    - `.hodge/patterns/` files updated to reference refinements.md
    - `.hodge/standards.md` updated to mention refinements.md instead of decisions.md

17. **Context manifest includes refinements.md**
    - `/context FEAT-123` includes refinements.md in feature_context section
    - Status shows "available" if file exists, "not_found" if missing
    - Same pattern as exploration.md loading

18. **Solo mode works without PM integration**
    - `/refine` works in solo mode (pm.enabled: false)
    - No PM comment posted (graceful degradation from HODGE-377.1)
    - refinements.md still created normally

19. **Refinement with no questions in exploration**
    - If exploration.md has empty "Questions for Refinement" section
    - `/refine` still runs (skips Phase 1, goes straight to Phase 2 drill-down)
    - Or shows message: "No questions identified. Consider /build instead."

20. **Slash command help text updated**
    - `/help` output includes `/refine` description
    - `/help` output does not mention `/decide`
    - Description: "Drill into implementation details after exploration"

## Questions for Refinement

1. **Context manifest loading**: Should `/context` load refinements.md in the feature_context section when it exists?
   - **Recommendation**: Yes. refinements.md should be in feature_context manifest with `status: available` when it exists (same pattern as exploration.md). This is critical because /build, /harden, /ship need refinements.md context, and it's the direct replacement for decisions.md.

2. **Sub-feature context integration**: How should `/refine` integrate with sub-feature context loading from HODGE-377.5?
   - **Recommendation**: /refine should load parent + sibling refinements.md files (if they exist) using the same sub-feature context pattern. When refining a sub-feature, check via adapter.getParentIssue(), then load parent exploration.md + refinements.md and sibling refinements.md files. Present context summary showing parent/sibling implementation decisions. This ensures consistency across sub-features and enables pattern reuse.

3. **Questions for Refinement section**: Should exploration.md "Questions for Refinement" section be removed after /refine completes, or left for reference?
   - **Decision**: Left for reference. The section stays in exploration.md unchanged after refinement completes.

## Decisions Decided During Exploration

1. ✓ **Test intentions separation**: Exploration.md has behavioral test intentions (what), refinements.md has test strategy (how to test given implementation)
2. ✓ **test-intentions.md removal**: Remove redundant test-intentions.md file, all test planning in exploration.md + refinements.md
3. ✓ **PM comment on completion**: /refine posts PM comment with refinements.md summary when complete (follows HODGE-377.4 pattern)
4. ✓ **PM issue creation timing**: Unchanged from HODGE-377.2 (created after exploration approval)
5. ✓ **refinements.md not gitignored**: File is human-authored and committed to version control
6. ✓ **Team mode integration**: /refine follows same team mode pattern as /build, /harden, /ship (graceful degradation from HODGE-377.1)
7. ✓ **Migration approach**: Clean cutover, no backward compatibility, no migration needed
8. ✓ **Error handling**: /refine requires exploration.md, supports --rerun flag, overwrites existing refinements.md
9. ✓ **Partial refinement**: Nothing written until preview approved, use /checkpoint for partial work
10. ✓ **Scope validation**: Done during /explore (not /refine) - /refine assumes scope is appropriate
11. ✓ **exploration.md template changes**: Add "High-Level Architecture" section, rename "Decisions Needed" to "Questions for Refinement"
12. ✓ **Command updates needed**: /build, /harden, /ship, /status, /context all updated to use refinements.md
13. ✓ **Template references**: .claude/commands/explore.md, patterns, standards.md all need /decide → /refine updates

## Next Steps

1. ✅ Exploration complete - 3 questions for refinement identified with recommendations
2. Ready for `/refine HODGE-377.6` to drill into implementation details
3. This completes the workflow refinement infrastructure for HODGE-377 epic
