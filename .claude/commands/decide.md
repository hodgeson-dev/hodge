# Hodge Decide - Decision Management

## ⚠️ DEFAULT BEHAVIOR: Interactive Decision Mode

**IMPORTANT**: Unless the user explicitly provides a pre-made decision, ALWAYS use Interactive Decision Mode (see below). Do NOT jump directly to recording a decision without presenting options first.

### ❌ WRONG: Jumping to recording
```
User: /decide
AI: *immediately executes hodge decide "Some decision"*
```

### ✅ RIGHT: Present options first
```
User: /decide
AI: *presents decision options with pros/cons*
User: chooses option 'a'
AI: *then executes hodge decide with chosen option*
```

## Interactive Decision Mode (DEFAULT)
When `/decide` is invoked, follow this process:

1. **Review Guiding Principles**:
   ```bash
   cat .hodge/principles.md | head -20
   ```
   Consider how principles might guide the decision.

2. **Gather pending decisions using Decision Categories Framework**:

   **PRIMARY SOURCE - Current Exploration**:
   ```bash
   # Check for decisions documented during exploration
   cat .hodge/features/{{current_feature}}/explore/exploration.md | grep -A 5 "Decisions Needed"
   ```

   **SECONDARY SOURCES - Always check these categories**:
   - **Implementation Approach**: Which approach from exploration to use?
   - **Scope Decisions**: What's in/out of scope for this feature?
   - **Technical Choices**: Libraries, patterns, architecture decisions
   - **Naming Conventions**: Feature names, function names, file structure
   - **Testing Strategy**: What and how to test?
   - **TODO Resolution**: Which TODOs to address now vs later?

   **TERTIARY SOURCES**:
   - Code comments (TODO, FIXME, QUESTION) - `grep -r "TODO\|FIXME" src/`
   - Uncommitted changes - `git status --short`
   - Open questions in conversation

   **IMPORTANT**: Try to find at least 2-3 decisions. If fewer exist, that's okay, but always check all categories.

3. **Present each decision with Principle Alignment**:
   ```
   ## Decision {{number}} of {{total}}

   **Topic**: {{decision_topic}}
   **Context**: {{brief_context}}

   **Principle Consideration**:
   [Note if decision aligns with or conflicts with any principles]

   **Options:**

   **a) {{option_1}}** (Recommended)
      - Pros: {{pros}}
      - Cons: {{cons}}
      - Alignment: [Aligns with "Progressive Enhancement" principle]

   **b) {{option_2}}**
      - Pros: {{pros}}
      - Cons: {{cons}}
      - Alignment: [May conflict with "Behavior-Focused Testing"]

   **c) {{option_3}}** (if applicable)
      - Pros: {{pros}}
      - Cons: {{cons}}
      - Alignment: [Describe alignment]

   **d) Skip for now**
   **e) Need more exploration**

   Your choice:
   ```

   **REQUIREMENT**: Always mark one option as "(Recommended)" based on your analysis.

4. **For each decision made**:
   ```bash
   hodge decide "{{chosen_option_description}}" --feature {{feature}}
   ```

## Recording the Decision (ONLY after user chooses)

### For Single Decision
After the user has chosen an option (a, b, c, etc.), execute:
```bash
hodge decide "{{decision}}"
```

With feature association:
```bash
hodge decide "{{decision}}" --feature {{feature}}
```

**WARNING**: Never execute this command until the user has explicitly chosen from presented options.

## Decision Format
Decisions follow a structured format with date, status, context, rationale, and consequences.

## PM Integration
Decisions about features are synchronized with project management tools when configured.

## Feature Extraction from Decisions
After making decisions, review them to identify potential features:

### Extraction Process
1. **Review recent decisions** (last 5-10):
   - Look for related technical choices
   - Identify coherent work boundaries
   - Find natural feature groupings

2. **For each potential feature, present for review**:
   ```
   ## Proposed Feature {{number}} of {{total}}

   **Feature Name**: {{feature_name}}
   **Description**: {{brief_description}}

   **Related Decisions**:
   - {{decision_1}}
   - {{decision_2}}
   - {{decision_3}}

   **Scope**: {{what_it_includes}}
   **Out of Scope**: {{what_it_excludes}}
   **Dependencies**: {{any_dependencies}}
   **Estimated Effort**: {{small/medium/large}}

   Options:
   a) Accept as-is
   b) Modify (you'll specify changes)
   c) Split into smaller features
   d) Merge with another feature
   e) Skip (not ready for feature)

   Your choice:
   ```

3. **After user approval/modification**:

   First, create the feature specification file:
   ```yaml
   # .hodge/tmp/feature-extraction/{{timestamp}}-{{feature_name}}.yaml
   version: "1.0"
   metadata:
     extracted_at: "{{current_iso_timestamp}}"
     extracted_by: "Claude"

   feature:
     name: "{{approved_feature_name}}"
     description: "{{feature_description}}"

     decisions:
       - text: "{{decision_1}}"
         date: "{{decision_1_date}}"
       - text: "{{decision_2}}"
         date: "{{decision_2_date}}"

     rationale: |
       {{why_these_decisions_form_coherent_feature}}

     scope:
       included:
         - "{{included_item_1}}"
         - "{{included_item_2}}"
       excluded:
         - "{{excluded_item_1}}"

     dependencies:
       - "{{dependency_1}}"

     effort: "{{effort_estimate}}"
     priority: {{priority_number}}

     exploration_areas:
       - area: "{{exploration_area_1}}"
         questions:
           - "{{question_1}}"
           - "{{question_2}}"
   ```

   Save this to: `.hodge/tmp/feature-extraction/{{timestamp}}-{{feature_name}}.yaml`

   Then create the feature from the specification:
   ```bash
   hodge explore "{{approved_feature_name}}" --from-spec .hodge/tmp/feature-extraction/{{timestamp}}-{{feature_name}}.yaml
   ```

   The feature is now created and ready for exploration. The specification file is preserved for reference.

### Feature Identification Guidelines
- **Cohesive**: Feature should have a single clear purpose
- **Loosely-coupled**: Minimize dependencies on other features
- **Testable**: Clear success criteria from decisions
- **Valuable**: Delivers concrete user or developer value
- **Right-sized**: Can be built in 1-3 days

### Example Feature Extraction Flow
```
From decisions:
- "Use TypeScript decorators for command metadata"
- "Implement command registry pattern"
- "Add runtime validation for command options"

Proposed Feature:
Name: command-metadata-system
Description: Decorator-based command registration with validation
Scope: Decorators, registry, runtime validation
Dependencies: None (foundational)
Effort: Medium (2 days)

User chooses: b) Modify
User specifies: "Rename to 'command-decorators' and reduce scope to just decorators"

Updated Feature:
Name: command-decorators
Description: TypeScript decorators for command metadata
Scope: Decorator implementation only
Dependencies: None
Effort: Small (1 day)

# Save specification:
cat > .hodge/tmp/feature-extraction/$(date +%Y%m%d-%H%M%S)-command-decorators.yaml << 'EOF'
version: "1.0"
feature:
  name: "command-decorators"
  description: "TypeScript decorators for command metadata"
  decisions:
    - text: "Use TypeScript decorators for command metadata"
  scope:
    included: ["Decorator implementation only"]
  effort: "1 day"
EOF

# Create feature from spec:
hodge explore "command-decorators" --from-spec .hodge/tmp/feature-extraction/[filename].yaml

Result: Feature created with full context, spec file preserved
```

### PM Integration
Features extracted from decisions will be tracked in project management.

## Next Steps Menu
After decisions are recorded and features reviewed:
```
### Next Steps
Choose your next action:
a) Start exploring extracted feature → `/explore {{feature}}`
b) Start building existing feature → `/build {{feature}}`
c) Review all decisions → `/status`
d) View project roadmap → `hodge status`
e) Continue development
f) Done for now

Enter your choice (a-f):
```

Remember: The CLI handles decision recording and PM updates. Focus on making thoughtful technical choices and organizing work into manageable features.