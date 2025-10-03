# AI Template Extraction Pattern

## Overview

This pattern documents when and how to use AI-based extraction in slash command templates versus CLI regex extraction. The key insight: **AI template extraction is superior for user-facing workflows** because it preserves context, handles edge cases, and enables interactive prompting.

## Pattern Decision Tree

### Use AI Template Extraction When:
- ✅ **User needs to see full context** - Show complete recommendation text, not just titles
- ✅ **Interactive prompting required** - Need to ask user for decisions/approval
- ✅ **Edge cases matter** - Multiple recommendations, malformed content, missing sections
- ✅ **Flexible parsing needed** - Format variations should be handled gracefully
- ✅ **User-facing workflow** - Slash commands that guide users through decisions

### Use CLI Regex Extraction When:
- ✅ **Internal analysis only** - Just need decision titles for logic/routing
- ✅ **No user interaction** - CLI runs non-interactively from slash commands
- ✅ **Structured data** - Working with well-defined formats that rarely change
- ✅ **Performance critical** - Regex faster than AI parsing for simple cases

## Implementation Examples

### Example 1: /build Template (AI Extraction) ✅

**Use Case**: When /decide is skipped, extract Recommendation from exploration.md and present to user

**Why AI Template**:
- Shows full recommendation text (not just title)
- Handles 4 fallback cases (single rec, multiple recs, no rec, missing file)
- Prompts user interactively for next action
- Flexible parsing (works with format variations)

**Implementation** (`.claude/commands/build.md`):
```markdown
### Step 3: Extract from exploration.md
cat .hodge/features/{{feature}}/explore/exploration.md 2>/dev/null

**If exploration.md exists**, parse for:
- **Recommendation section**: Look for `## Recommendation` followed by text
- **Decisions Needed section**: Look for `## Decisions Needed` entries

### Step 4: Handle Extraction Results

**Case A: Single Recommendation Found**
Display to user:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Full verbatim text of Recommendation section]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

What would you like to do?
  a) ✅ Use this recommendation and proceed
  b) 🔄 Go to /decide to formalize decisions first
  c) ⏭️  Skip and build without guidance
```

**What AI Gets** (via cat command):
```markdown
## Recommendation

**Use Approach 2: Incremental Optimization**

This approach is recommended because:
1. Quick value delivery - users see fixes within days
2. Risk mitigation - small changes easier to validate
3. Production system - can't afford big bang breakage
```

**What User Sees**:
Full context with rationale, then prompted for decision.

---

### Example 2: /plan CLI (Regex Extraction) ✅

**Use Case**: Analyze decisions to determine if feature needs epic/story breakdown

**Why CLI Regex**:
- Just needs decision titles for counting/logic
- No user interaction (runs from slash command)
- Decision.md format is well-defined
- Speed matters for internal analysis

**Implementation** (`src/commands/plan.ts`):
```typescript
private async extractFromExploration(feature: string): Promise<string[]> {
  const content = await fs.readFile(explorationFile, 'utf-8');
  const decisions: string[] = [];

  // Extract Recommendation (just title)
  const recommendationMatch = content.match(/## Recommendation\s*\n\n\*\*(.+?)\*\*/);
  if (recommendationMatch && recommendationMatch[1]) {
    decisions.push(recommendationMatch[1].trim());
  }

  // Extract Decision titles
  const decisionTitles = decisionsNeededMatch[1].match(/### Decision \d+: (.+)/g);
  if (decisionTitles) {
    decisionTitles.forEach((title) => {
      const match = title.match(/### Decision \d+: (.+)/);
      if (match && match[1]) decisions.push(match[1].trim());
    });
  }

  return decisions; // ["Use Approach 2", "Decision title 1", "Decision title 2"]
}
```

**What CLI Gets**:
`["Use Approach 2: Incremental Optimization", "Confirm simplified scope", "Update parent decisions"]`

**What Happens**:
CLI counts decisions (3), determines feature needs epic breakdown, returns to slash command which presents plan to user.

---

## Key Differences Comparison

| Aspect | AI Template Extraction | CLI Regex Extraction |
|--------|----------------------|---------------------|
| **Context Preservation** | ✅ Full text with rationale | ❌ Titles only |
| **User Interaction** | ✅ Can prompt/ask questions | ❌ No interaction capability |
| **Edge Case Handling** | ✅ Multiple recs, malformed content | ❌ Fails silently or errors |
| **Format Flexibility** | ✅ Understands variations | ❌ Brittle pattern matching |
| **Use Case** | User-facing workflows | Internal analysis |
| **Examples** | /build, /ship | /plan (internal) |

## Anti-Pattern: Moving /build Extraction to CLI ❌

**Why This Would Be Wrong**:

1. **Loses Context**:
   - Regex: `["Use Approach 2: Incremental Optimization"]`
   - User needs: Full recommendation text with "why" explanation

2. **No Interaction**:
   - CLI can't prompt user from within slash command execution
   - Would need to pass data back to template anyway

3. **Worse Maintainability**:
   - Template: AI understands "show user the recommendation"
   - CLI: Complex regex + edge case handling + data serialization

4. **Downgrades UX**:
   - Current: User sees full context, makes informed decision
   - CLI approach: Strip context, show title, user confused

## Pattern Guidelines

### When Designing Slash Commands:

**Step 1**: Identify if workflow is user-facing or internal
- User-facing → AI template extraction
- Internal analysis → CLI regex extraction

**Step 2**: Ask "What does user need to see?"
- Full context → AI template
- Just facts → CLI regex

**Step 3**: Ask "Do I need to prompt user?"
- Yes → MUST use AI template
- No → Can use CLI regex

**Step 4**: Document extraction in template
```markdown
### Extraction Logic

**What to extract**: [Describe sections/data]
**How to extract**: [AI parsing instructions or bash commands]
**What to show user**: [Full text vs summary]
**User interaction**: [Prompt options and handling]
```

## Related Patterns

- **Cascading Extraction**: Check primary → secondary → tertiary sources
- **Graceful Degradation**: Handle missing files/sections with clear fallbacks
- **User Agency**: Always offer choices (use extracted data / refine / skip)

## Historical Context

- **HODGE-315**: Introduced cascading extraction in /plan (CLI regex)
- **HODGE-319.3**: Added smart extraction to /build (AI template)
- **HODGE-319.4**: Decided NOT to create WorkflowDataExtractor utility (would downgrade UX by moving template logic to CLI)

## Decision Record

**Question**: Should we create reusable WorkflowDataExtractor to centralize extraction in CLI?

**Answer**: No. Analysis revealed AI template extraction is objectively superior for user-facing workflows because:
- Preserves full context (vs regex title extraction)
- Enables interactive prompting (CLI can't prompt)
- Handles edge cases gracefully (vs brittle regex)
- Flexible format parsing (vs strict pattern matching)

Moving extraction to CLI would downgrade UX. Keep pattern in templates, document well.

---

*Pattern established: 2025-10-03*
*Decision: HODGE-319.4*
