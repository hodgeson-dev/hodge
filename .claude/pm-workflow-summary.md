# PM Integration Workflow Summary

## Key Concept: Exploration vs Decision

- **Exploration** is temporary, local, and uncommitted
- **Decision** is the commitment point that updates PM

## The Label: `hodge-decided`

Only one label is used: `hodge-decided`
- Added when a decision is made via `/decide`
- Indicates the issue has a chosen approach and is ready for implementation
- NOT added during exploration (exploration is just research)

## Standard Workflow

### 1. `/explore <feature>`
- **With existing PM issue**: 
  - Uses issue context for exploration
  - Does NOT update the issue
  - Saves exploration locally
- **Without PM issue**:
  - Pure local exploration
  - No PM interaction

### 2. `/decide`
- Reviews exploration results
- User chooses an approach
- **With existing PM issue**:
  - Adds `hodge-decided` label
  - Adds decision comment with chosen approach
- **Without PM issue**:
  - Asks if user wants to create one
  - If yes, creates with `hodge-decided` label and decision details

### 3. `/build <feature>`
- Checks for `hodge-decided` label
- If not decided, suggests exploring and deciding first
- Transitions issue to "In Progress"

### 4. `/harden <feature>`
- Transitions to "In Review"
- Validates quality standards

### 5. `/ship <feature>`
- Transitions to "Done"
- Closes the loop

## Why This Flow?

1. **Exploration is non-committal**: You can explore many ideas without cluttering PM
2. **Decision is the commitment**: PM only gets updated when you've chosen a path
3. **Clear signal**: `hodge-decided` label clearly indicates "ready to build"
4. **Audit trail**: Decision comment shows what was chosen and why

## PM Comments Added

### After `/decide` (existing issue):
```
## ✅ Hodge Decision Made
- Date: 2024-01-13
- Chosen approach: Event-driven architecture
- Rationale: Better scalability and decoupling
- Next step: Ready for /build
```

### When creating issue via `/decide`:
```
## Issue Created from Hodge Exploration

### Exploration Summary
- 3 approaches considered
- Chosen: Event-driven architecture

### Decision
- Rationale: Better scalability and decoupling
- Trade-offs considered: Added complexity vs flexibility

### Next Steps
Ready for /build
```

## Guards and Prompts

- **Re-exploration**: "A decision has already been made on this issue. Would you like to re-explore it?"
- **Build without decision**: "No decision has been made on this issue. Would you like to explore and decide first?"
- **Create PM issue**: "Would you like to create a PM issue for '<feature>'?" (only asked in `/decide`)

## Benefits

- PM issues only created/updated when there's commitment
- Clear progression: undecided → decided → in progress → done
- Exploration remains flexible and local
- Decision point captures the "why" not just the "what"