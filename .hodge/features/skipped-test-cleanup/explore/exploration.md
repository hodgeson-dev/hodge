# Skipped Test Cleanup Exploration

## Context
We currently have 47 skipped tests in our codebase. These were strategically skipped as part of implementing our progressive testing strategy because they test implementation details rather than behavior.

## Current Situation Analysis
- **Total skipped tests**: 47
- **Reason for skipping**: Tests focused on implementation details (mocks, console output, internal state)
- **Current strategy**: "Test behavior, not implementation"
- **Pass rate**: 100% of behavioral tests (265 tests)

## Approach 1: Complete Deletion
**Implementation**: Remove all skipped tests entirely from the codebase

### Pros:
- Cleaner codebase with less dead code
- Reduces file size and complexity
- No confusion about why tests are skipped
- Aligns with "if it's not valuable, delete it" philosophy
- Reduces maintenance burden

### Cons:
- Loses historical context about what was tested
- Cannot easily revert if we change testing philosophy
- Some skipped tests might contain useful test setup code
- Harder to demonstrate what we consciously decided NOT to test

### Compatibility:
- ✅ Works with current testing infrastructure
- ✅ Aligns with progressive testing strategy
- ✅ Supports rapid iteration

## Approach 2: Convert to Documentation
**Implementation**: Transform skipped tests into markdown documentation explaining what we're NOT testing and why

### Pros:
- Preserves intent and reasoning
- Educational for new developers
- Shows deliberate design decisions
- Could live in TEST-STRATEGY.md as examples

### Cons:
- Requires effort to convert
- Documentation can get out of sync
- Not executable, so can't verify if still relevant

### Compatibility:
- ✅ Aligns with our documentation-first approach
- ✅ Supports knowledge sharing
- ⚠️ Adds maintenance burden

## Approach 3: Keep as Learning Artifacts
**Implementation**: Keep the skipped tests but add clear comments explaining why they're skipped

### Pros:
- Preserves complete history
- Easy to re-enable if needed
- Shows evolution of testing philosophy
- Can serve as negative examples ("what not to test")
- No immediate action required

### Cons:
- Clutters test files
- May confuse new developers
- Skipped tests still parsed by test runner
- Looks like technical debt

### Compatibility:
- ✅ No changes needed
- ⚠️ May send mixed signals about testing standards
- ✅ Preserves optionality

## Analysis of Skipped Test Categories

### 1. Console Output Tests (~40%)
```typescript
it.skip('should log correct message - tests console output')
```
These verify specific console.log calls - pure implementation detail.

### 2. Mock Verification Tests (~35%)
```typescript
it.skip('should call fs.writeFile with correct params - tests mocks')
```
These check if mocks were called with specific arguments.

### 3. Internal State Tests (~15%)
```typescript
it.skip('should update internal cache - tests implementation')
```
These verify internal data structures not exposed to users.

### 4. Performance Tests (~10%)
```typescript
it.skip('should complete in under 100ms - performance test')
```
These are environment-dependent and flaky.

## Recommendation
Based on exploration, **Approach 1: Complete Deletion** seems best because:

1. **Aligns with our philosophy**: We've committed to behavior-driven testing. Keeping implementation tests, even skipped, sends mixed messages.

2. **Reduces cognitive load**: Developers won't wonder "should I unskip this?" or "why is this here?"

3. **Git preserves history**: If we ever need to reference these tests, they're in git history.

4. **Clean slate**: Makes it easier to write new, valuable tests without old patterns as reference.

5. **Confidence in decision**: We've already validated that our 265 behavioral tests provide adequate coverage.

## Migration Path
If we proceed with deletion:
1. Create a final commit documenting what we're removing and why
2. Optionally extract any useful test utilities/helpers first
3. Delete in batches by category for easier review
4. Update TEST-STRATEGY.md with examples of what NOT to test

## Next Steps
Choose your next action:
a) Review and decide on approach → `/decide`
b) Analyze specific test categories in more detail
c) Start cleanup immediately → `/build skipped-test-cleanup`
d) Create a preservation strategy first
e) View test coverage metrics → `/status`
f) Done for now

Enter your choice (a-f):