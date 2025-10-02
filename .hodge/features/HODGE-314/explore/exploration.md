# Exploration: HODGE-314

**Title**: Interactive conversational exploration for /explore slash command

## Feature Overview
**PM Issue**: HODGE-314
**Type**: Enhancement
**Created**: 2025-10-02T07:10:04.967Z

## Context
- **Standards**: Loaded (suggested only)
- **Available Patterns**: 10
- **Similar Features**: hodge-branding, HODGE-001, HODGE-002
- **Relevant Patterns**: None identified

## Problem Statement

The current `/explore` command generates exploration files with a template that the AI fills in with implementation approaches. While this works, it lacks depth of understanding and doesn't ensure the AI truly grasps the what, why, and how of the feature before documenting it. This can lead to incomplete explorations, missed edge cases, and surprises during the build phase.

The goal is to transform `/explore` into an interactive, conversational experience where the AI asks clarifying questions to deeply understand the feature before generating any documentation. This conversational approach should scale to feature complexity, reference past patterns and lessons, surface potential gotchas, and result in higher-quality exploration documents that lead to better implementations.

## Conversation Summary

### Initial Context & Understanding

The feature request centers on making the `/explore` slash command more interactive and dialogue-driven. Instead of immediately generating a template, the AI should engage in a natural conversation to understand the feature thoroughly before documenting it.

### Conversation Flow & Depth

The conversation should begin after the AI has loaded all relevant context (patterns, lessons, similar features). The number of questions should scale to the complexity of the feature - simple features might need only 1-2 quick questions, while complex features may require extensive discussion. The conversation ends when either the AI feels satisfied that it has enough information, or when the user explicitly indicates to proceed.

The conversation style should be natural dialogue rather than a structured interview, with the AI providing periodic summaries of what it has learned to ensure mutual understanding.

### Question Focus Areas

The conversation should focus on three key areas:

**What & Why (Requirements and Context)**: The AI should seek high-level understanding of the feature, probing business value, user impact, and technical necessity. Specific behaviors and implementation details are intentionally deferred to the `/decide` command, keeping exploration focused on the problem space rather than solution space.

**Gotchas and Considerations**: After understanding the requirements, the AI should proactively identify potential issues including technical debt, edge cases, integration challenges, and testing complexity. The AI should reference past lessons, similar features, and established patterns during this phase.

**Test Intentions**: The AI should propose test intentions based on the conversation and solicit feedback, with these being finalized during the exploration conversation rather than deferred.

### Workflow Integration

The workflow changes significantly from the current approach:

1. **Before Conversation**: Call `hodge explore {{feature}}` to create directory structure and initial files
2. **During Conversation**: AI asks questions, references context, probes for gotchas, proposes test intentions
3. **After Conversation**: AI shows preview of exploration.md for approval, then updates the file with conversation synthesis

The conversation itself should be synthesized into prose format and included in exploration.md, along with structured sections for Problem Statement, Implementation Approaches, Test Intentions, and Decisions Needed.

### Title Generation

The title for the feature should be generated based on the text the user provides to the `/explore` command, keeping it concise (under 100 characters) and descriptive.

### Relationship with /decide Command

The exploration.md file will contain everything needed for `/decide`, including the full conversation context, problem statement, list of potential approaches, and decisions needed. The `/decide` command will present implementation options based on this exploration context, without asking additional questions.

Importantly, exploration.md will still retain the "Approaches" section listing 2-3 potential implementation approaches, even though detailed implementation decisions are deferred to `/decide`.

### Edge Cases & User Experience

For very simple features, the AI should ask 1-2 quick questions then proceed, still probing for potential gotchas even if the feature seems straightforward. If the user is unsure about answers, the AI should present options as part of the questions to help guide thinking.

When the AI notices a feature might affect other areas or relate to existing functionality, it should explicitly ask about scope and boundaries.

The conversation ends with the AI showing a preview of the complete exploration.md document and requesting approval before writing it.

## Implementation Approaches

### Approach 1: Template-Only Enhancement (Pure AI Instruction)

**Description**: Update the `.claude/commands/explore.md` template with detailed instructions for the AI to conduct a conversational exploration. No CLI changes required - all logic handled by AI following enhanced template instructions.

**Pros**:
- Zero backend code changes required
- Fastest to implement
- Easily iterable - just edit template
- Works within existing Hodge architecture (AI analyzes, backend executes)

**Cons**:
- Relies entirely on AI following instructions correctly
- No enforcement mechanism for conversation quality
- Harder to track conversation flow programmatically
- May have inconsistent behavior across different AI sessions

**When to use**: When rapid prototyping is needed, or when testing whether conversational exploration provides value before investing in backend changes.

### Approach 2: Hybrid Template + CLI Support

**Description**: Enhance the template for AI conversation logic, but add CLI support for conversation artifacts. The `hodge explore` command gains ability to accept `--conversation-summary` flag to append conversation details to exploration.md after the fact.

**Pros**:
- Template drives behavior (flexible, fast to change)
- CLI provides structure for conversation artifacts
- Conversation can be tracked and versioned
- Maintains separation: AI analyzes, CLI executes file operations

**Cons**:
- Requires backend changes to CLI
- More complex than pure template approach
- Still relies on AI to follow conversation flow correctly
- May need multiple CLI calls (initial create, then update)

**When to use**: When you want conversation tracking and versioning, but still want flexibility in how the AI conducts the conversation.

### Approach 3: Full CLI Orchestration with Interactive Mode

**Description**: Add `hodge explore --interactive` mode that uses a conversation loop with prompts and structured input/output. The CLI would drive the conversation flow, asking questions defined in configuration, and assembling the final exploration.md from structured responses.

**Pros**:
- Consistent conversation flow across all features
- Programmatic control over conversation quality
- Easy to add metrics (conversation length, question types, etc.)
- Can enforce minimum conversation requirements

**Cons**:
- Most backend code required
- Less flexible - changing conversation flow requires CLI changes
- May feel rigid compared to natural AI dialogue
- Conflicts with Hodge principle: "CLI commands are non-interactive"

**When to use**: When you need strict control over conversation quality and consistency, and are willing to invest in backend infrastructure.

## Recommendation

**Recommended Approach: Approach 1 (Template-Only Enhancement)**

For this exploration phase, the template-only approach aligns best with Hodge principles and provides the fastest path to validating whether conversational exploration delivers value.

**Rationale**:
1. **Aligns with "Freedom to explore"**: We can experiment with conversation patterns without committing to backend architecture
2. **Fast iteration**: We can refine the conversation flow based on real usage simply by editing the template
3. **Maintains architecture**: "AI analyzes, backend executes" - the AI conducts the conversation, CLI handles file operations
4. **Low risk**: If conversational exploration doesn't work well, minimal investment wasted
5. **Future-ready**: Can always add CLI support (Approach 2) or full orchestration (Approach 3) after validating the concept

**Path Forward**:
- Start with template-only implementation
- Use it for 5-10 features to gather lessons
- If conversation quality is high and valuable, consider adding CLI conversation tracking (Approach 2)
- Only pursue full orchestration (Approach 3) if strict consistency becomes critical

## Test Intentions

Based on our conversation, the `/explore` command with conversational exploration should exhibit these behaviors:

### Conversation Initiation
- [ ] AI loads existing context (patterns, lessons, similar features) before asking questions
- [ ] AI identifies feature complexity and scales conversation accordingly
- [ ] For simple features (e.g., "add --verbose flag"), AI asks 1-2 quick questions
- [ ] For complex features, AI asks multiple rounds of clarifying questions

### Question Quality & Coverage
- [ ] AI asks about "what" (requirements) at high-level, not specific implementation details
- [ ] AI asks about "why" (business value, user impact, technical necessity)
- [ ] AI defers "how" (implementation approaches) questions to /decide command
- [ ] AI proactively references relevant patterns from .hodge/patterns/
- [ ] AI proactively references relevant lessons from .hodge/lessons/
- [ ] AI identifies and asks about similar features

### Gotcha Identification
- [ ] After understanding requirements, AI surfaces potential technical debt concerns
- [ ] AI identifies potential edge cases
- [ ] AI flags potential integration challenges
- [ ] AI considers testing complexity and asks clarifying questions

### Test Intentions Discussion
- [ ] AI proposes test intentions based on conversation
- [ ] AI solicits feedback on proposed test intentions
- [ ] Test intentions are finalized during conversation (not deferred)

### Conversation Flow
- [ ] AI provides periodic summaries during conversation to confirm understanding
- [ ] AI uses natural dialogue style (not rigid interview format)
- [ ] AI presents options when user is unsure of answers
- [ ] AI asks about scope when feature might affect other areas
- [ ] Conversation ends when AI feels satisfied OR user says to proceed

### Artifact Generation
- [ ] After conversation, AI shows preview of exploration.md before writing
- [ ] User must approve preview before exploration.md is written
- [ ] Title is generated from user's /explore command text (under 100 chars)
- [ ] Conversation is synthesized into prose (not Q&A format)
- [ ] exploration.md includes: Title, Problem Statement, Conversation Summary, Approaches, Test Intentions, Decisions Needed
- [ ] exploration.md still contains "Approaches" section with 2-3 approaches
- [ ] Conversation synthesis captures all key points discussed

### Integration with Workflow
- [ ] `hodge explore {{feature}}` is called first to create directory structure
- [ ] Files are updated after conversation with synthesized content
- [ ] PM issue creation/linking follows current behavior (unchanged)
- [ ] /decide command receives full exploration.md content
- [ ] /decide presents options without asking additional questions

## Decisions Needed

The following decisions should be made before moving to the `/build` phase:

### 1. Template Structure Decision
- **Question**: How should the enhanced `.claude/commands/explore.md` template be structured?
- **Options**:
  - Detailed step-by-step instructions for AI (prescriptive)
  - General guidelines with examples (flexible)
  - Mix of required steps and flexible guidance
- **Impact**: Affects consistency vs. flexibility trade-off

### 2. Conversation Quality Metrics
- **Question**: Should we define measurable quality criteria for conversations?
- **Options**:
  - Define minimum number of questions based on complexity
  - Define required coverage areas (what/why/gotchas/tests)
  - No formal metrics, rely on AI judgment
- **Impact**: Affects consistency and ability to measure success

### 3. Preview Format
- **Question**: How should the exploration.md preview be presented to the user?
- **Options**:
  - Full markdown preview in conversation
  - Summary with key sections highlighted
  - Collapsible sections with option to expand
- **Impact**: Affects user experience and approval process

### 4. Backward Compatibility for Similar Features
- **Question**: Should this pattern be applied retroactively to other slash commands?
- **Considerations**:
  - /build could benefit from conversation about implementation approach
  - /decide already has interactive elements
  - /ship could have conversation about lessons learned
- **Impact**: Determines whether this is a one-off enhancement or a new pattern

### 5. Conversation Artifact Storage
- **Question**: Should the raw conversation be preserved anywhere?
- **Options**:
  - Store in exploration.md only (synthesized prose)
  - Also save raw Q&A in conversation.md or comments
  - No raw storage, prose synthesis only
- **Impact**: Affects debugging, analysis, and future template improvements

### 6. Error Handling
- **Question**: What happens if the conversation goes off track or AI fails to ask good questions?
- **Options**:
  - User can manually abort and restart
  - User can skip to direct template generation
  - AI has self-correction prompts built into template
- **Impact**: Affects user experience when things don't go as planned

## Next Steps
- [ ] Review exploration findings with stakeholder
- [ ] Use `/decide` to make implementation decisions (especially #1-6 above)
- [ ] Proceed to `/build HODGE-314` with chosen approach

---
*Template created: 2025-10-02T07:10:04.967Z*
*Conversation synthesized: 2025-10-02T07:11:30.000Z*
