# Hodge Review - Intelligent Checkpoint

Execute a comprehensive review of the current work session.

## Review Scope: {{type || "all"}}

## Review Process

### 1. Analyze Current Context
- Check `.hodge/context.md` for session state
- Scan `.hodge/features/*/` for active work
- Review recent file modifications

### 2. Decision Analysis
Review `.hodge/decisions.md` and categorize:

#### Decisions Made ✓
- List all decisions recorded in this session
- Group by category (architecture, patterns, tools)
- Note impact on current work

#### Pending Decisions ⏳
Scan conversation history and code for:
- Questions raised but not answered
- "Should we..." statements without resolution
- Alternative approaches mentioned but not chosen
- TODOs and FIXMEs in code

#### Gaps Detected 🔍
Proactively identify what hasn't been discussed:
- Missing error handling strategies
- Unaddressed performance considerations
- Security measures not yet considered
- Testing approaches not defined
- Deployment strategy gaps
- Monitoring/observability needs
- Documentation requirements
- Team collaboration aspects

### 3. Feature Progress
For each feature in `.hodge/features/`:
- Current mode (explore/build/harden)
- Completion percentage
- Blockers identified
- Next recommended actions

### 4. Standards & Patterns Status
- New patterns detected (candidates for `hodge learn`)
- Standards violations found
- Consistency issues across features

## Output Format
```
# Hodge Review Report

## Session Summary
- Active Feature: {{current_feature}}
- Mode: {{current_mode}}
- Session Duration: {{time}}
- Files Modified: {{count}}

## Decisions Tracker

### ✓ Decisions Made ({{count}})
1. Architecture: [Decision] - [Rationale]
2. Patterns: [Decision] - [Rationale]
...

### ⏳ Pending Decisions ({{count}})
1. **[Topic]**: [Question/Choice needed]
   - Option A: [Pros/Cons]
   - Option B: [Pros/Cons]
   - Recommendation: [If any]

2. **[Topic]**: [Question/Choice needed]
...

**Quick Decide**: Run `/decide` to address these

### 🔍 Gaps Identified ({{count}})
1. **[Area]**: [What's missing]
   - Why it matters: [Impact]
   - Suggested action: [Next step]

2. **[Area]**: [What's missing]
...

## Feature Status
### {{feature_name}}
- Mode: {{mode}}
- Progress: {{progress_bar}} {{percentage}}%
- Next: {{recommended_action}}

## Recommendations
1. **Immediate**: [Most pressing action]
2. **Next Session**: [What to tackle next]
3. **Future Consideration**: [Long-term items]

## Quick Actions
- Address pending decisions: `/decide`
- Continue current feature: `/build`
- Save session: `/save`
```

Remember: Review is about providing clarity on where you are, what's been decided, what needs deciding, and what you haven't thought about yet.