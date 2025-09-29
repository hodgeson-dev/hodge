# Exploration: HODGE-297

## Feature Overview
**PM Issue**: HODGE-297
**Type**: Context Loading Verification and Enhancement
**Created**: 2025-09-29T18:34:46.759Z

**Problem Statement:**
The `/hodge` and `/load` commands currently only load a minimal subset of context files:
- `.hodge/HODGE.md` (session state)
- `.hodge/standards.md` (project standards)
- `.hodge/decisions.md` (all decisions)
- `.hodge/patterns/` (list only, not content)

However, there are many more files that provide critical context:
- Root `.hodge/` files (12 total including principles, AI-CONTEXT, id-mappings, etc.)
- Feature-specific files across multiple phases (explore, build, harden, ship)
- Each phase can have multiple files with varying names

**Goal:** Ensure comprehensive context loading for AI assistance while avoiding overwhelming the context window.

## Context Analysis

### Current Root .hodge Files (12 files)
1. `AI-CONTEXT.md` - **Should load**: Explains what should be loaded and when
2. `CONTEXT-SCALING.md` - **Conditional**: Only when discussing context strategy
3. `context.json` - **Should load**: Current session state
4. `decisions.md` - **Already loaded**: All decisions ✓
5. `DEVELOPMENT.md` - **Conditional**: Only for contributors/setup
6. `HODGE.md` - **Already loaded**: Current session info ✓
7. `id-counter.json` - **No**: Internal bookkeeping
8. `id-mappings.json` - **Maybe**: PM issue tracking (useful for context)
9. `principles.md` - **Should load**: Core philosophy and guidance
10. `project_management.md` - **Conditional**: Only when discussing PM integration
11. `project-meta.json` - **Should load**: Project metadata
12. `standards.md` - **Already loaded**: Project standards ✓

### Feature Files Structure (per feature)
Each feature can have:
- Root: `HODGE.md`, `decision.md`, `issue-id.txt`
- `/explore/`: `exploration.md`, `test-intentions.md`, `context.json`, plus custom files
- `/build/`: `build-plan.md`, `context.json`, plus implementation files
- `/harden/`: `harden-report.md`, `validation-results.json`, `context.json`
- `/ship/`: `release-notes.md`, `ship-record.json`, `lessons-draft.md`

### AI-CONTEXT.md Guidance
According to `.hodge/AI-CONTEXT.md`:
- **Always Loaded**: `standards.md`, current slash command
- **On-Demand**: Patterns (loaded by trigger phrases or explicit reference)
- **Strategy**: Progressive loading based on phase

## Implementation Approaches

### Approach 1: Smart Selective Loading (Recommended)
**Description**: Load core context files always, phase-specific files conditionally, and heavy files on-demand.

**Loading Strategy:**
```
Always Load (Core - ~300 lines):
- .hodge/HODGE.md (session state)
- .hodge/standards.md (project standards)
- .hodge/principles.md (development philosophy)
- .hodge/AI-CONTEXT.md (loading strategy guide)
- .hodge/context.json (current state)
- .hodge/project-meta.json (project info)

Feature-Specific Load (~400-800 lines):
- .hodge/features/{feature}/HODGE.md
- .hodge/features/{feature}/decision.md
- Phase files based on current mode:
  - explore mode: exploration.md, test-intentions.md
  - build mode: build-plan.md, exploration.md (summary)
  - harden mode: harden-report.md, validation-results.json
  - ship mode: release-notes.md, ship-record.json

Conditional Load (on-request):
- .hodge/decisions.md (full history - 1100+ lines, maybe summarize recent)
- .hodge/id-mappings.json (when discussing PM issues)
- .hodge/DEVELOPMENT.md (when setting up)
- Pattern files (when triggered by context)
```

**Pros**:
- Balances comprehensive context with performance
- Follows AI-CONTEXT.md guidance
- Avoids overwhelming context window
- Most relevant information always available
- Heavy files loaded only when needed

**Cons**:
- Requires phase detection logic
- More complex to implement
- May miss relevant context if heuristics fail

**When to use**: This is the balanced approach that provides comprehensive context without overload. Best for production use.

---

### Approach 2: Load Everything (Maximal Context)
**Description**: Load all root `.hodge/` files and all feature files for the current feature, regardless of phase.

**Loading Strategy:**
```
All Root Files (~1500 lines):
- All 12 root .hodge/*.md and .hodge/*.json files

All Feature Files (~1000+ lines):
- All files in .hodge/features/{feature}/ recursively
- Including all phase subdirectories

Patterns (on-demand):
- Still load patterns only when referenced
```

**Pros**:
- No context missed
- Simple implementation (glob and load all)
- No need for phase detection
- Complete historical record available

**Cons**:
- Context window bloat (2500+ lines baseline)
- Decisions.md alone is 1100+ lines
- May include irrelevant information
- Performance impact on AI processing
- Could hit context limits on large projects

**When to use**: For debugging context issues or when working on a feature where all historical context is critical. Not recommended for regular use.

---

### Approach 3: Minimal Plus On-Demand (Conservative)
**Description**: Keep current minimal loading, improve on-demand pattern/file loading with better documentation.

**Loading Strategy:**
```
Core Only (~150 lines):
- .hodge/HODGE.md
- .hodge/standards.md (summary only, not full)
- .hodge/context.json

Feature Current Phase Only (~300 lines):
- .hodge/features/{feature}/HODGE.md
- Current phase primary file only:
  - explore: exploration.md
  - build: build-plan.md
  - harden: harden-report.md
  - ship: release-notes.md

Enhanced Documentation:
- Better prompts about what's available
- Clear instructions on loading additional context
- "Type '/context decisions' to load decision history"
- "Type '/context patterns' to see available patterns"
```

**Pros**:
- Minimal context overhead
- Fast loading
- User controls what's loaded
- Scales to very large projects

**Cons**:
- AI may lack important context
- Requires user intervention to load more
- Interrupts workflow for additional loads
- May miss connections between files

**When to use**: For very large projects where context limits are a concern, or when users prefer explicit control over what's loaded.

## Recommendation

**Use Approach 1: Smart Selective Loading**

**Rationale:**
1. **Aligns with AI-CONTEXT.md**: Follows the documented loading strategy of core + phase-specific + on-demand
2. **Balances comprehensiveness and performance**: Provides essential context (~700-1100 lines) without overwhelming
3. **Progressive by design**: Matches Hodge's progressive development philosophy
4. **Practical**: Most AI tools can handle 1000-1500 lines of context comfortably
5. **Extensible**: Easy to add conditional loading rules as needs evolve

**Key Enhancements:**
- Load `principles.md` - critical for understanding "The Hodge Way"
- Load `AI-CONTEXT.md` - self-documenting loading strategy
- Summarize `decisions.md` - show recent 10-20, not all 200+
- Load feature files based on phase, not all phases
- Keep patterns on-demand as designed

## Decisions Needed

1. **Decision: decisions.md Loading Strategy**
   - Options:
     - a) Load full file (1100+ lines, comprehensive but heavy)
     - b) Load recent N decisions (e.g., last 20, lighter but may miss important context)
     - c) Load decisions linked to current feature only (minimal but focused)
   - **Recommendation**: Option B - Recent 20 decisions provides good balance

2. **Decision: id-mappings.json Inclusion**
   - Options:
     - a) Always load (useful for PM context, currently 28KB)
     - b) Load only when feature has PM issue
     - c) Never load automatically (internal tracking only)
   - **Recommendation**: Option B - Load when feature has linked PM issue

3. **Decision: Pattern Loading Triggers**
   - Options:
     - a) Current behavior: Only on explicit reference or user request
     - b) Automatic: Scan command output for keywords ("test", "error", etc.)
     - c) Phase-based: Load relevant patterns based on current phase
   - **Recommendation**: Option A - Keep current, it works well per AI-CONTEXT.md

4. **Decision: Feature File Discovery**
   - Options:
     - a) Load all .md and .json files in current phase directory
     - b) Load only known standard files (exploration.md, build-plan.md, etc.)
     - c) Glob-based discovery with size limits
   - **Recommendation**: Option A - Handles custom files users may create

5. **Decision: Context Loading Command Updates**
   - Options:
     - a) Update `/hodge` command only
     - b) Update both `/hodge` and `/load` commands
     - c) Create new `/context` command for granular control
   - **Recommendation**: Option B - Both commands should provide consistent experience

## Next Steps
- [ ] Review exploration findings
- [ ] Use `/decide` to make implementation decisions
- [ ] Proceed to `/build HODGE-297`

---
*Template created: 2025-09-29T18:34:46.759Z*
*AI exploration to follow*
