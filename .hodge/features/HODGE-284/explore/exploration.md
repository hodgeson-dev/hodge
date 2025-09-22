# Exploration: HODGE-284 - Fix /decide Command to Gather Multiple Decisions

## Feature Analysis
**Type**: Bug fix / Enhancement for /decide slash command
**Purpose**: Restore the ability for /decide to gather and present multiple decisions, not just one
**PM Issue**: HODGE-284

## Problem Statement
The `/decide` command is currently only presenting one decision when executed, even when there are multiple pending decisions from various sources. Previously, users would sometimes get 3-4 decisions to make. The command instructions say to gather from:
- Code comments (TODO, FIXME, QUESTION)
- Previous exploration notes
- Uncommitted changes
- Open questions in conversation

But in practice, only one decision (typically "which approach to use") is being presented.

## Root Cause Analysis

### Issue Identified
The decide.md instructions are clear about gathering multiple decisions, but AI assistants are likely:
1. Only focusing on the most recent exploration's main decision
2. Not actively searching for TODOs, FIXMEs, or other decision points
3. Not extracting implicit decisions from exploration notes
4. Not considering cross-cutting concerns as separate decisions

### Evidence
- Found 8+ TODOs in codebase that could be decisions
- Recent explorations have multiple approach choices but present as single decision
- No explicit implementation guidance for finding multiple decisions

## Recommended Approaches

### Approach 1: Enhanced Decision Discovery Instructions
**Description**: Add explicit instructions and examples for discovering multiple decisions

**Implementation**:
- Add specific grep/search commands to find TODOs
- Include examples of extracting decisions from exploration notes
- Provide templates for common decision types (architecture, naming, scope)
- Add a minimum decisions threshold (e.g., "always try to find at least 2-3 decisions")

**Pros**:
- Clear guidance for AI assistants
- No code changes needed
- Immediate improvement in decision gathering
- Better coverage of pending decisions

**Cons**:
- Relies on AI following more complex instructions
- May generate irrelevant decisions if forced
- Could slow down the decide process

### Approach 2: Automated Decision Collection
**Description**: Create a helper script that pre-collects potential decisions

**Implementation**:
```bash
hodge collect-decisions --feature {{feature}}
# Outputs JSON with:
# - TODOs from code
# - Questions from exploration notes
# - Uncommitted change decisions
# - Architecture choices from exploration
```

**Pros**:
- Consistent decision gathering
- Could be integrated into decide command
- Reduces AI interpretation variance
- Faster and more thorough

**Cons**:
- Requires new CLI command implementation
- May collect too many trivial decisions
- Needs maintenance as patterns change

### Approach 3: Decision Categories Framework (Recommended)
**Description**: Define specific decision categories that should always be checked

**Implementation**:
Update decide.md to always check these categories:
1. **Implementation Approach** - Which approach from exploration?
2. **Scope Decisions** - What's in/out of scope?
3. **Technical Choices** - Libraries, patterns, architecture
4. **Naming Conventions** - Feature names, function names, file structure
5. **Testing Strategy** - What and how to test?
6. **TODO Resolution** - Which TODOs to address now vs later?

Each category should be checked even if no decision needed (mark as "No decision needed")

**Pros**:
- Ensures comprehensive decision coverage
- Creates consistent decision-making process
- Makes implicit decisions explicit
- Educational for understanding project needs

**Cons**:
- May feel repetitive if many categories are N/A
- Requires updating decide.md template
- Could make simple decisions feel heavy

## Test Intentions
- [ ] /decide should present multiple decisions when available
- [ ] Should find and present TODOs as decisions
- [ ] Should extract scope decisions from explorations
- [ ] Should identify technical choices as separate decisions
- [ ] Should handle case when truly only one decision exists
- [ ] Should not force artificial decisions when none exist

## Recommendation
I recommend **Approach 3: Decision Categories Framework** because:
1. It provides structure without requiring code changes
2. Makes the decision-gathering process explicit and repeatable
3. Helps identify decisions that might otherwise be implicit
4. Educates users and AI about types of decisions needed
5. Can be implemented immediately in decide.md

## Next Steps
- [ ] Review the three approaches
- [ ] Use `/decide` to choose an approach (and test if multiple decisions appear!)
- [ ] Proceed to `/build HODGE-284` with chosen approach

---
*Generated with AI-enhanced exploration (2025-09-22T06:26:58.270Z)*
