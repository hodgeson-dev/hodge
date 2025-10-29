# Test Intentions for HODGE-359.1

## Purpose
Document what we intend to test when this feature moves to build mode.
These are not actual tests, but a checklist of behaviors to verify.

## Regex Extraction - Core Functionality
- [ ] **Regex extraction for eslint errors**: Given eslint compact output with errors, when error_pattern is applied, then errors[] contains all error lines and errorCount matches array length
- [ ] **Regex extraction for typescript errors**: Given typescript output with errors, when error_pattern is applied, then errors[] contains all error lines and errorCount matches array length
- [ ] **Regex extraction for vitest failures**: Given vitest output with failures, when error_pattern is applied, then errors[] contains all failure lines and errorCount matches array length
- [ ] **Regex extraction for warnings**: Given tool output with warnings, when warning_pattern is applied, then warnings[] contains all warning lines and warningCount matches array length
- [ ] **Empty output handling**: Given tool output with no errors/warnings, when patterns are applied, then errorCount=0, warningCount=0, and arrays are empty

## JSON Structure Enhancement
- [ ] **Enhanced JSON structure**: When ToolchainService processes tool results, then validation-results.json includes errorCount, warningCount, errors[], warnings[], exitCode, stdout, stderr for each tool
- [ ] **Deprecated field removal**: When ToolchainService processes tool results, then validation-results.json does NOT include the deprecated `success` field

## Tool Coverage
- [ ] **Comprehensive pattern coverage**: Given all 7 configured tools (typescript, eslint, vitest, prettier, jscpd, dependency-cruiser, semgrep), when patterns are defined, then each tool has both error_pattern and warning_pattern in tool-registry.yaml

## Edge Cases
- [ ] **ANSI code handling**: Given tool output with ANSI codes stripped, when patterns are applied, then errors/warnings are correctly extracted
- [ ] **Multiline error handling**: Given multiline error output, when pattern matches only first line, then extracted error is the complete first line

## Testing Strategy Notes

**CRITICAL**: Tests must use mocked stdout strings, NOT real tool execution.
- HODGE-357.1 ban: No toolchain execution in tests (no real eslint, tsc, vitest, etc.)
- HODGE-317.1 ban: No subprocess spawning in tests
- Pattern: Capture real tool output samples, use as mock strings in tests

**Example Test Pattern**:
```typescript
smokeTest('should extract eslint errors from stdout', () => {
  const mockStdout = `
    /path/to/file.ts:23:5: error  'foo' is never used  @typescript-eslint/no-unused-vars
    /path/to/file.ts:45:12: error  Missing return type  @typescript-eslint/explicit-function-return-type
  `;

  const pattern = /^.+:\d+:\d+:\s+error\s+.+$/gm;
  const matches = mockStdout.match(pattern);

  expect(matches).toHaveLength(2);
  expect(matches[0]).toContain('foo is never used');
});
```

---
*Generated during exploration phase. Convert to actual tests during build phase.*