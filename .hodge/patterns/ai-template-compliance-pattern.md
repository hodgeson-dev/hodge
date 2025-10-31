# AI Template Compliance Pattern

**Feature**: HODGE-373
**Created**: 2025-10-31
**Status**: Active

## Problem

AI frequently substitutes UX formatting elements in slash command templates, specifically:
- Replacing Unicode box-drawing characters with markdown headers
- Dropping command prefixes (e.g., "Explore:", "Build:")
- Changing section names
- Modifying exact wording and structure

This results in inconsistent user experience and lost context awareness.

## Solution: Combined Visual + Textual Emphasis Pattern

Place this pattern **immediately before each formatted box** in slash command templates:

```markdown
⚠️ **CRITICAL - EXACT OUTPUT REQUIRED** ⚠️

You MUST begin your response with this EXACT formatted box.
Copy it CHARACTER-FOR-CHARACTER. Do NOT use markdown headers as substitutes.

┌─────────────────────────────────────────────────────────┐
│ 🔍 [Command]: [Section Name]                            │
└─────────────────────────────────────────────────────────┘

**Template compliance checklist:**
- ✅ Box uses Unicode box-drawing characters (not markdown)
- ✅ Includes "[Command]:" prefix for context awareness
- ✅ Section name matches exactly as shown
```

## Pattern Components

### 1. Visual Warning Banner
```markdown
⚠️ **CRITICAL - EXACT OUTPUT REQUIRED** ⚠️
```
- **Purpose**: Catches AI attention immediately
- **Why it works**: High-contrast visual + strong keywords

### 2. Explicit Instructions
```markdown
You MUST begin your response with this EXACT formatted box.
Copy it CHARACTER-FOR-CHARACTER. Do NOT use markdown headers as substitutes.
```
- **Purpose**: Makes requirement unmistakably clear
- **Why it works**:
  - "MUST" establishes imperative
  - "CHARACTER-FOR-CHARACTER" makes it actionable
  - Explicit prohibition addresses the specific failure mode

### 3. Template Box
```markdown
┌─────────────────────────────────────────────────────────┐
│ 🔍 [Command]: [Section Name]                            │
└─────────────────────────────────────────────────────────┘
```
- **Purpose**: Shows exact format to reproduce
- **Why it works**: AI sees what to output

### 4. Verification Checklist
```markdown
**Template compliance checklist:**
- ✅ Box uses Unicode box-drawing characters (not markdown)
- ✅ Includes "[Command]:" prefix for context awareness
- ✅ Section name matches exactly as shown
```
- **Purpose**: Enables AI self-verification
- **Why it works**: Creates explicit success criteria

## Usage Guidelines

### When to Use
Use this pattern for **every formatted box** that AI should output directly:
- Main command headers
- Section transitions
- Step indicators
- Decision prompts

### When NOT to Use
Do NOT use for boxes that are:
- Inside code fences (```) - these are examples
- In documentation explaining the pattern
- Showing template structure (not for direct output)

### Application Rules

1. **Place immediately before the box** - not at file start, before each box
2. **Customize the command name** - "Explore:", "Build:", "Harden:", etc.
3. **Match section name exactly** - what appears in the box
4. **Apply to all boxes** - multiple boxes need multiple patterns

## Examples

### Single Box Command

```markdown
---
description: Save progress
---

⚠️ **CRITICAL - EXACT OUTPUT REQUIRED** ⚠️

You MUST begin your response with this EXACT formatted box.
Copy it CHARACTER-FOR-CHARACTER. Do NOT use markdown headers as substitutes.

┌─────────────────────────────────────────────────────────┐
│ 💾 Checkpoint: Save Progress & Context                  │
└─────────────────────────────────────────────────────────┘

**Template compliance checklist:**
- ✅ Box uses Unicode box-drawing characters (not markdown)
- ✅ Includes "Checkpoint:" prefix for context awareness
- ✅ Section name matches exactly as shown

## Command execution...
```

### Multiple Box Command

```markdown
---
description: Explore a feature
---

⚠️ **CRITICAL - EXACT OUTPUT REQUIRED** ⚠️

You MUST begin your response with this EXACT formatted box.
Copy it CHARACTER-FOR-CHARACTER. Do NOT use markdown headers as substitutes.

┌─────────────────────────────────────────────────────────┐
│ 🔍 Explore: Feature Discovery                           │
└─────────────────────────────────────────────────────────┘

**Template compliance checklist:**
- ✅ Box uses Unicode box-drawing characters (not markdown)
- ✅ Includes "Explore:" prefix for context awareness
- ✅ Section name matches exactly as shown

## Step 1: Initial Discovery
...

## Step 2: Conversational Discovery

⚠️ **CRITICAL - EXACT OUTPUT REQUIRED** ⚠️

You MUST output this EXACT formatted box at this step.
Copy it CHARACTER-FOR-CHARACTER. Do NOT use markdown headers as substitutes.

┌─────────────────────────────────────────────────────────┐
│ 🔍 Explore: Conversational Discovery                    │
└─────────────────────────────────────────────────────────┘

**Template compliance checklist:**
- ✅ Box uses Unicode box-drawing characters (not markdown)
- ✅ Includes "Explore:" prefix for context awareness
- ✅ Section name matches exactly as shown

...
```

## Validation

Test compliance with:
```bash
npm run test:smoke -- template-compliance
```

This runs `src/commands/template-compliance.smoke.test.ts` which verifies:
- ✅ All command files have compliance patterns
- ✅ All boxes use Unicode characters
- ✅ All boxes have command prefixes
- ✅ Patterns appear before boxes
- ✅ Checklists are present

## Implementation Status

Applied to all 11 slash command files:
- ✅ explore.md (2 boxes)
- ✅ build.md (1 box + examples)
- ✅ checkpoint.md (1 box)
- ✅ codify.md (2 boxes)
- ✅ decide.md (2 boxes)
- ✅ harden.md (1 box)
- ✅ hodge.md (2 boxes)
- ✅ plan.md (2 boxes)
- ✅ review.md (1 box)
- ✅ ship.md (1 box + examples)
- ✅ status.md (1 box)

**Total**: 19 protected boxes across 11 command files

## Related

- **Feature Exploration**: `.hodge/features/HODGE-373/explore/exploration.md`
- **Build Plan**: `.hodge/features/HODGE-373/build/build-plan.md`
- **Test Intentions**: `.hodge/features/HODGE-373/explore/test-intentions.md`
- **Smoke Tests**: `src/commands/template-compliance.smoke.test.ts`

## Future Enhancements

Potential improvements for consideration:
- Pattern extraction tool to add compliance markers automatically
- Linter rule to detect missing patterns
- Template validator in CI/CD
- Pattern versioning for future adjustments
