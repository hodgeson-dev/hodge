# Epic/Story Breakdown for PM Integration

## Overview
This document explains how Hodge handles epic and story breakdown for project management tool integration, particularly how the AI communicates proposed structures to the `hodge decide` command.

## Workflow

### 1. AI Proposes Structure (During `/decide`)

When the AI analyzes decisions and proposes feature structure, it should:

1. **Analyze complexity** to determine if the work should be:
   - A single story (1-3 days of work)
   - An epic with sub-issues (larger features requiring breakdown)

2. **Present the proposal** to the user:
   ```
   ## Proposed Structure for FEATURE-001

   **Type**: Epic with 3 sub-tasks

   **Sub-tasks**:
   1. FEATURE-001.1: Authentication API
   2. FEATURE-001.2: Frontend UI Components
   3. FEATURE-001.3: Integration Tests

   Options:
   a) Accept as epic structure
   b) Modify structure
   c) Treat as single story
   ```

### 2. User Approves/Modifies

The user reviews and approves the structure. The AI should then communicate this to `hodge decide`.

### 3. AI Calls `hodge decide` with Structure

The AI should use the `DecideCommand.processAIProposedStructure()` method:

```typescript
// For epic with sub-tasks:
await decideCommand.processAIProposedStructure(
  'FEATURE-001',
  'epic',
  ['Authentication API', 'Frontend UI Components', 'Integration Tests']
);

// For single story:
await decideCommand.processAIProposedStructure(
  'FEATURE-002',
  'single'
);
```

### 4. PM Tool Integration

The decide command will:
1. Record the structure decision in `.hodge/decisions.md`
2. Create the appropriate issues in the configured PM tool (Linear, GitHub, etc.)
3. Map IDs in `.hodge/id-mappings.json`

## Decision Format

Epic decisions are recorded with clear structure:

```markdown
### 2025-01-01 - FEATURE-001 will be implemented as an epic

**Status**: Accepted
**Context**: Feature: FEATURE-001

**Decision**:
FEATURE-001 will be implemented as an epic with 3 sub-issues:
- Authentication API (FEATURE-001.1)
- Frontend UI Components (FEATURE-001.2)
- Integration Tests (FEATURE-001.3)
```

## PM Tool Issue Creation

When creating issues in PM tools:

### Linear
- Creates a parent issue for the epic
- Creates linked sub-issues
- Sets appropriate states based on workflow phase

### GitHub
- Creates a parent issue with checklist
- Creates linked issues with references
- Uses labels to indicate epic/story relationship

### Local PM
- Creates hierarchical structure in `.hodge/pm/`
- Maintains parent/child relationships

## ID Management

The ID mapping system tracks relationships:

```json
{
  "FEATURE-001": {
    "localID": "FEATURE-001",
    "externalID": "LIN-123",
    "pmTool": "linear",
    "isEpic": true,
    "childIDs": ["FEATURE-001.1", "FEATURE-001.2", "FEATURE-001.3"]
  },
  "FEATURE-001.1": {
    "localID": "FEATURE-001.1",
    "externalID": "LIN-124",
    "pmTool": "linear",
    "parentID": "FEATURE-001"
  }
}
```

## Best Practices for AI

1. **Analyze scope carefully** - Consider complexity, dependencies, and effort
2. **Propose reasonable breakdowns** - 3-7 sub-tasks is typical for an epic
3. **Use clear sub-task names** - Each should represent a deliverable
4. **Consider dependencies** - Order sub-tasks logically
5. **Communicate structure clearly** - Use the provided methods and formats

## Example AI Interaction

```typescript
// AI analyzes the feature requirements
const isComplex = analyzeComplexity(feature);

if (isComplex) {
  // Propose epic structure
  const subTasks = [
    'Database schema design',
    'API endpoint implementation',
    'Frontend components',
    'Integration testing'
  ];

  // After user approval
  await decideCommand.processAIProposedStructure(
    feature,
    'epic',
    subTasks
  );
} else {
  // Single story
  await decideCommand.processAIProposedStructure(
    feature,
    'single'
  );
}
```

## Error Handling

The system handles various failure scenarios:
- PM tool unavailable → Queues for later creation
- Partial epic creation failure → Rolls back and queues
- Network issues → Silent failure with local tracking

## Testing

Run integration tests to verify epic/story breakdown:
```bash
npm run test:integration -- test/pm-integration.integration.test.ts
```