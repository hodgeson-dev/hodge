# Exploration: HODGE-286

## Feature Overview
**PM Issue**: HODGE-286
**Type**: Lessons Learned System Improvement
**Created**: 2025-09-22T13:52:06.587Z
**Problem**: Lessons learned are documented in ship.md slash command but not actually being created since HODGE-003

## Context
- **Standards**: Loaded (suggested only)
- **Available Patterns**: 9
- **Similar Features**: hodge-branding, HODGE-001, HODGE-002
- **Relevant Patterns**: None identified

## Problem Analysis

After investigating the current implementation:

1. **Missing Implementation**: The ship command (`ship.ts`) has NO code for creating lessons learned files
2. **Documentation Gap**: Step 5 in `.claude/commands/ship.md` describes creating lessons but it's never executed
3. **Lost Knowledge**: We've shipped 282+ features but only captured lessons from HODGE-003
4. **Manual Process**: Current lessons creation is entirely manual with no automation or prompts

The disconnect exists because:
- The slash command documentation describes an ideal workflow
- The CLI implementation doesn't execute that workflow
- There's no reminder or prompt to create lessons
- The process requires manual reflection that's easy to skip

## Implementation Approaches

### Approach 1: Automated Lessons Extraction
**Description**: Add lessons generation directly to the ship command, automatically creating a lessons file based on git diff, test results, and patterns learned.

**Implementation**:
- Add `generateLessons()` method to ship.ts
- Analyze git diff to identify what changed
- Extract patterns from the pattern learner
- Create structured lessons file automatically
- Include metrics (time taken, test count, coverage)

**Pros**:
- Fully automated - never miss capturing lessons
- Consistent format across all features
- Captures objective metrics automatically
- No additional user effort required

**Cons**:
- May miss subjective insights and "aha" moments
- Could generate generic/unhelpful lessons
- Lacks human reflection and wisdom
- May create noise if lessons aren't meaningful

### Approach 2: Interactive Reflection Prompts
**Description**: Add an interactive step to the ship workflow that prompts for reflection before committing, similar to how we handle commit messages.

**Implementation**:
- After quality gates pass, prompt for lessons
- Provide structured questions (What worked? What was challenging? What would you do differently?)
- Save responses to lessons file
- Make it optional but encouraged

**Pros**:
- Captures human insights and wisdom
- Encourages reflection at the right moment
- Flexible - can skip if nothing notable
- Builds a culture of continuous improvement

**Cons**:
- Adds friction to ship process
- Violates non-interactive CLI principle
- Requires discipline to write good lessons
- May be skipped when in a hurry

### Approach 3: Hybrid with AI-Assisted Reflection
**Description**: Combine automated extraction with AI-assisted reflection through the slash command, separating CLI and AI responsibilities.

**Implementation**:
- Ship command creates draft lessons from objective data
- Saves to `.hodge/features/{feature}/lessons-draft.md`
- `/ship` slash command Step 5 prompts AI to enhance with insights
- AI reviews the changes and adds reflective analysis
- Final lessons saved after AI enhancement

**Pros**:
- Best of both worlds - automation + intelligence
- Maintains CLI/AI separation of concerns
- Never loses objective data
- AI can identify patterns humans might miss
- Consistent quality of reflection

**Cons**:
- More complex implementation
- Requires coordination between CLI and slash command
- Still requires manual trigger from slash command
- May create duplicate work if not well integrated

## Recommendation

**Hybrid with AI-Assisted Reflection (Approach 3)** appears most suitable because:
- Aligns with our newly established CLI/AI separation pattern from HODGE-285
- Ensures lessons are always captured (even if basic)
- Leverages AI for meaningful reflection and pattern recognition
- Doesn't violate non-interactive CLI principles
- Creates a sustainable, low-friction process

The implementation would follow the same pattern we just established:
- CLI creates structure and captures objective data
- AI adds intelligence, insights, and reflection

## Decisions Needed

1. **Lesson Creation Timing**: When should lessons be captured?
   - During ship (automatic draft)
   - After ship (manual reflection)
   - Both (draft + enhancement)

2. **Lesson Scope**: What should be included?
   - Technical changes only
   - Process improvements
   - Team/collaboration insights
   - All of the above

3. **Storage Strategy**: How should lessons be organized?
   - One file per feature
   - Chronological journal
   - Category-based organization
   - Searchable database

4. **Enforcement Level**: How strict should the process be?
   - Required before ship completes
   - Optional but encouraged
   - Automatic draft, optional enhancement
   - Fully automated

## Next Steps
- [ ] Review exploration findings
- [ ] Use `/decide` to make implementation decisions
- [ ] Proceed to `/build HODGE-286`

---
*Template created: 2025-09-22T13:52:06.587Z*
*AI exploration to follow*
