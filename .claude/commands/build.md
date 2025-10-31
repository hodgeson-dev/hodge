---
description: Start building a feature with smoke tests
argument-hint: <feature-id>
---

⚠️ **CRITICAL - EXACT OUTPUT REQUIRED** ⚠️

You MUST begin your response with this EXACT formatted box.
Copy it CHARACTER-FOR-CHARACTER. Do NOT use markdown headers as substitutes.

┌─────────────────────────────────────────────────────────┐
│ 🔨 Build: Implementation Mode                           │
└─────────────────────────────────────────────────────────┘

**Template compliance checklist:**
- ✅ Box uses Unicode box-drawing characters (not markdown)
- ✅ Includes "Build:" prefix for context awareness
- ✅ Section name matches exactly as shown

## Response Parsing (AI Instructions)

When user responds to choice prompts:
- "a" or "b" etc. → select single option
- "a,b" or "a, b" → select multiple options (comma-separated, if applicable)
- "r" → select all options marked with ⭐ (when 2+ recommendations exist)
- "a, and [modification]" → select option with user's changes applied
- Invalid (e.g., "7" when options are a-e) OR uncertain (e.g., "maybe b?") → use collaborative error recovery:
  - Detect uncertainty patterns: "maybe", "?", "not sure", "either"
  - Offer repair options, never just reject
  - Example: "Hmm, I got 'maybe b?' - sounds uncertain. Let me help clarify: a) Continue with b, b) Explain options better, c) Start over"

## Decision Extraction (Before Build)

**IMPORTANT**: Before checking PM issues, check if this feature has decisions. If not, try to extract guidance from exploration.md.

### Step 1: Check for decisions.md
```bash
cat .hodge/features/{{feature}}/decisions.md 2>/dev/null
```

**If decisions.md exists** → Skip extraction, proceed to PM check

**If decisions.md does NOT exist** → Continue to Step 2

### Step 2: Check for wrong-location decisions.md
```bash
# Check common wrong locations
cat .hodge/features/{{feature}}/explore/decisions.md 2>/dev/null
```

**If found in wrong location**:
```
⚠️  I found decisions.md in the wrong location (.hodge/features/{{feature}}/explore/)

The correct location is: .hodge/features/{{feature}}/decisions.md

🔔 YOUR RESPONSE NEEDED

Would you like me to move it for you?

a) ⭐ Yes - Move it to the correct location (Recommended)
b) No - I'll handle it manually

💡 Tip: You can modify any choice, e.g., "a, and also check for other misplaced files"

👉 Your choice [a/b]:
```

**If user chooses (a)**:
```bash
mv .hodge/features/{{feature}}/explore/decisions.md .hodge/features/{{feature}}/decisions.md
```
Then confirm: "✓ Moved decisions.md to correct location. Proceeding with build..."
Proceed to PM check.

**If user chooses (b)** or file not in wrong location:
Continue to Step 3

### Step 3: Extract from exploration.md
```bash
cat .hodge/features/{{feature}}/explore/exploration.md 2>/dev/null
```

**If exploration.md exists**, parse for:
- **Recommendation section**: Look for `## Recommendation` followed by text starting with `**Use ` or `**`
- **Decisions Needed section**: Look for `## Decisions Needed` followed by `### Decision N:` entries

**Extraction Pattern**:
1. Find `## Recommendation` section
2. Extract the paragraph after it (usually starts with `**Use Approach...`)
3. Find `## Decisions Needed` section
4. Extract all `### Decision N: [title]` entries (just the titles)

### Step 4: Handle Extraction Results

**IMPORTANT**: Check if "Decisions Needed" section has content before showing prompts.

**Empty Check Logic**:
- Treat whitespace-only content (spaces, newlines) as empty
- Use regex pattern to check: `/##\s*Decisions Needed\s*(?:###|\n|$)/` (section header followed immediately by next section or end)
- If section contains actual decision entries (`### Decision N:`), it's NOT empty

**Case A: Recommendation Found + Decisions Needed is EMPTY**

**Action**: Proceed silently with build (no prompt needed)
```bash
# User implicitly accepted recommendation by running /build without /decide
hodge build {{feature}}
```

**Case B: Recommendation Found + Decisions Needed HAS items**

Display to user:
```
📋 No decisions.md found, but I found this recommendation from exploration:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Full verbatim text of Recommendation section]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  Unresolved decisions still need attention:
  1. [Decision 1 title]
  2. [Decision 2 title]
  ...

🔔 YOUR RESPONSE NEEDED

What would you like to do?

a) ⭐ Use this recommendation and proceed with /build (Recommended)
b) Go to /decide to formalize decisions first
c) Skip and build without guidance

💡 Tip: You can modify any choice, e.g., "a, and also review test intentions"

👉 Your choice [a/b/c]:
```

**User Response Handling**:
- **(a)** → Call `hodge build {{feature}}` and proceed with implementation
- **(b)** → Exit with message: "Please run `/decide` to formalize your decisions, then return to `/build {{feature}}`"
- **(c)** → Call `hodge build {{feature}} --skip-checks` and proceed

**Case B: Multiple Recommendations Found**

Display to user:
```
📋 No decisions.md found, but I found multiple recommendations from exploration:

1. [First recommendation text excerpt - first 100 chars...]
2. [Second recommendation text excerpt - first 100 chars...]
3. [Third recommendation text excerpt - first 100 chars...]

🔔 YOUR RESPONSE NEEDED

Which recommendation would you like to use?

a) Use recommendation 1
b) Use recommendation 2
c) Use recommendation 3
d) Go to /decide to formalize decisions
e) Skip and build without guidance

💡 Tip: You can modify any choice, e.g., "a, and combine ideas from option 2"

👉 Your choice [a/b/c/d/e]:
```

After user selects a recommendation (a/b/c), show full text:
```
You selected:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Full verbatim text of selected Recommendation]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔔 YOUR RESPONSE NEEDED

Proceed with /build using this guidance?

a) ⭐ Yes, proceed (Recommended)
b) No, go to /decide instead

💡 Tip: You can modify any choice, e.g., "a, and create detailed task breakdown"

👉 Your choice [a/b]:
```

**Case C: No Recommendation Found**

Display to user:
```
⚠️  No decisions.md found and exploration.md has no recommendation section.

I can't proceed with `/build` without guidance. Here are your options:

• `/decide` - Make and record decisions first (Recommended)
• `/build {{feature}} --skip-checks` - Build anyway without guidance (not recommended)

Please run one of these commands to continue.
```

**Case D: exploration.md Missing**

Fall back to current behavior (proceed to PM check, CLI will show warning).

**Case E: exploration.md Malformed (Cannot Parse)**

If exploration.md exists but parsing fails (e.g., unexpected format, corrupted markdown):

Display warning and proceed:
```
⚠️  Warning: Could not parse exploration.md (file may be malformed)
   Proceeding with build without decision guidance.

   You can:
   - Fix exploration.md format manually
   - Run /decide to create decisions.md
   - Continue with build as-is

Proceeding with build...
```

Then call `hodge build {{feature}}` to proceed.

## PM Issue Check (Before Build)

**IMPORTANT**: Before executing `hodge build`, check if this feature has a PM issue mapping.

### Check for PM Issue Mapping
```bash
# Read the id-mappings file to check if feature has externalID (actual PM issue created)
cat .hodge/id-mappings.json | grep -A 2 "\"{{feature}}\"" | grep "externalID"
```

**Interpreting the result:**
- **Empty output (no lines returned)** = Feature is NOT mapped to PM issue
- **Output contains "externalID: ..."** = Feature IS mapped to PM issue

### If Feature is NOT Mapped
If the grep returns **empty/no output**, the feature has no PM issue. Ask the user:

```
I notice this feature ({{feature}}) doesn't have a PM issue tracking it yet.

🔔 YOUR RESPONSE NEEDED

Would you like to create a PM issue for this work?

a) ⭐ Yes - Create a PM issue (Recommended for production features)
b) No - Continue without PM tracking (good for quick experiments)

💡 Tip: You can modify any choice, e.g., "a, and link it to epic HODGE-XXX"

👉 Your choice [a/b]:
```

**If user chooses (a) - Yes**:
Guide them to use the `/plan` command to create a single issue:
```
Let me help you create a PM issue for tracking this work.

I'll generate a minimal plan with a single issue.
```
Then execute `/plan {{feature}}` with AI generating a single-issue plan (no epic breakdown needed).

**If user chooses (b) - No, or doesn't respond**:
Proceed with build anyway (non-blocking). This respects user agency and the "freedom to explore" principle.

### If Feature IS Already Mapped
If the grep returns **output containing "externalID: ..."**, the feature already has a PM issue. Skip the prompt and proceed directly to build command.

## Command Execution
Execute the portable Hodge CLI command:
```bash
hodge build {{feature}}
```

If you need to skip exploration/decision checks:
```bash
hodge build {{feature}} --skip-checks
```

## What This Does
1. Checks for existing exploration and decisions
2. Creates build directory: `.hodge/features/{{feature}}/build/`
3. Displays AI context for build mode
4. Shows available patterns to use
5. Creates build plan template
6. Links PM issue and updates status to "In Progress"

## After Command Execution
The CLI will output:
- AI context guidelines for build mode
- PM issue status update
- Available patterns list
- Build guidelines (SHOULD follow standards)
- Created files location

## Check for Relevant Lessons

Before starting implementation, check if there are lessons from past features that might be relevant:

```bash
# Check for lessons related to the files you'll be modifying
# Example: if modifying command execution code
hodge lessons --match "subprocess,command,execution" --files "src/commands/build.ts"
```

**If lessons are found, display them based on confidence and severity:**

**High confidence + Critical severity → Proactive (interrupt with choice):**
```
🔔 YOUR RESPONSE NEEDED

💡 Pattern from {{lesson.feature}}: {{lesson.relevance}}

Should I check for {{lesson.title}} before we start building?

a) ⭐ Yes, check now (~30s) (Recommended)
b) Skip, I know it's safe
c) Tell me more about the pattern

💡 Tip: You can modify any choice, e.g., "a, and also check for related patterns"

👉 Your choice [a/b/c]:
```

**Medium confidence OR Warning severity → Reactive (callout box):**
```
┌─────────────────────────────────────────────────────────┐
│ 💡 Relevant Pattern: {{lesson.title}}                  │
├─────────────────────────────────────────────────────────┤
│ {{lesson.excerpt}}                                      │
│                                                          │
│ Consider: {{lesson.suggestion}}                         │
│ Pattern: .hodge/lessons/{{lesson.feature}}.md         │
└─────────────────────────────────────────────────────────┘
```

**Low confidence → Inline mention:**
```
💡 Related: See .hodge/lessons/{{lesson.feature}}.md for {{lesson.topic}}
```

**If no relevant lessons found:**
Continue with implementation (no interruption).

## Your Tasks After CLI Command
1. Review the build plan at `.hodge/features/{{feature}}/build/build-plan.md`
2. Implement the feature following:
   - **SHOULD** follow coding standards
   - **SHOULD** use established patterns
   - **SHOULD** include basic error handling
   - **MUST** write at least one smoke test
3. Write smoke tests (required):
   ```typescript
   import { smokeTest } from '../test/helpers';

   smokeTest('should not crash', async () => {
     await expect(command.execute()).resolves.not.toThrow();
   });
   ```
4. Update the build plan as you progress
5. Track files modified and decisions made
6. **Stage all your work** (REQUIRED - enables /harden review):
   ```bash
   git add .
   ```
   This stages all files you created/modified during build (implementation, tests, config) so they can be reviewed during `/harden`.

## Implementation Guidelines
- Use existing patterns where applicable
- Maintain consistency with project architecture
- Include helpful comments for complex logic
- Balance quality with development speed

## Testing Requirements (Progressive Model)
- **Build Phase**: Minimum 1 smoke test required
- **Test Type**: Quick sanity checks (<100ms)
- **Focus**: Does it work without crashing?
- **Run Command**: `npm run test:smoke`
- Use test utilities from `src/test/helpers.ts`

## What's Next?

After implementing, check feature status to provide smart suggestions:

```bash
hodge status {{feature}}
```

Based on the status output and implementation progress:

**If smoke tests haven't been run yet:**
```
### What's Next?

• `npm run test:smoke` - Run smoke tests to verify basic functionality (Recommended first step)
• `/harden {{feature}}` - Add integration tests and validate production readiness
• `/review` - Get code review feedback

💡 Tip: Run smoke tests first to catch basic issues before hardening.
```

**If smoke tests pass and implementation looks complete:**
```
### What's Next?

Great work! Your implementation is ready for the next phase.

• `/harden {{feature}}` - Add integration tests and validate production readiness (Recommended)
• `/review` - Get code review feedback
• `/status {{feature}}` - Check overall feature status

💡 Tip: Hardening adds integration tests and validates all quality gates.
```

**If still implementing or tests failing:**
```
### What's Next?

• Continue implementing - Fix failing tests or complete remaining work
• `npm run test:smoke` - Re-run smoke tests after changes
• `/build {{feature}}` - Review build plan or continue implementation

💡 Tip: Get smoke tests passing before moving to harden phase.
```

Remember: The CLI handles all file management and PM integration. Focus on implementing quality code that follows project conventions.