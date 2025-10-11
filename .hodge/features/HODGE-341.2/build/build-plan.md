# Build Plan: HODGE-341.2

## Feature Overview
**PM Issue**: HODGE-341.2 (linear)
**Status**: In Progress
**Architecture**: Two-Layer Configuration (Tool Registry + Project Toolchain)

## Implementation Checklist

### Phase 1: Tool Registry Infrastructure ✅
- [x] Create TypeScript types for tool registry
- [x] Create tool-registry.yaml with 8 tools
- [x] Create ToolRegistryLoader service

### Phase 2: Generic Detection ✅
- [x] Refactor ToolchainService.detectTools() to use registry
- [x] Implement generic detection rule execution
- [x] Add ESLint plugin detection helper
- [x] Add command existence check helper
- [x] Add package dependency detection helper

### Phase 3: Bundled Semgrep Rules ✅
- [x] Create Prisma anti-patterns rules (3 rules)
- [x] Create React anti-patterns rules (3 rules)
- [x] Create GraphQL anti-patterns rules (3 rules)
- [x] Store in src/bundled-config/semgrep-rules/

### Phase 4: InitCommand Integration
- [ ] Update InitCommand to use ToolRegistryLoader
- [ ] Implement package manager detection
- [ ] Implement tool installation offers
- [ ] Generate toolchain.yaml from detected tools
- [ ] Copy bundled Semgrep rules to .hodge/semgrep-rules/

### Phase 5: Testing
- [ ] Smoke tests for ToolRegistryLoader
- [ ] Smoke tests for registry-based detection
- [ ] Smoke tests for tool installation workflow
- [ ] Integration test for full init flow

## Files Created/Modified

### Created Files
- `src/types/toolchain.ts` - Added tool registry types (130 new lines)
- `src/bundled-config/tool-registry.yaml` - Tool registry with 8 tools
- `src/lib/tool-registry-loader.ts` - Registry loading service (103 lines)

### Files To Modify
- `src/lib/toolchain-service.ts` - Refactor to use registry for detection
- `src/commands/init.ts` - Update to use registry-based workflow
- `src/lib/diagnostics-service.ts` - Support new quality check types

## Decisions Made
- Two-layer configuration: Registry (Hodge knowledge) vs Toolchain (user config)
- Tool registry ships with package in src/bundled-config/
- Generic detection engine reads registry rules
- Package manager agnostic: npm, pip, poetry, gradle, maven support

## Testing Notes
- Test registry loading from bundled file
- Test detection rule execution for each type
- Test tool installation workflow
- Test toolchain.yaml generation

## Next Steps
After implementation:
1. Run tests with `npm test`
2. Check linting with `npm run lint`
3. Review changes
4. Proceed to `/harden HODGE-341.2` for production readiness
