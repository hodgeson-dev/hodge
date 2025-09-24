# Test Intentions: LocalPMAdapter Architecture Unification

## Core Behavior Tests

### LocalPMAdapter as BasePMAdapter
- [ ] LocalPMAdapter should extend BasePMAdapter
- [ ] LocalPMAdapter should implement all abstract methods
- [ ] LocalPMAdapter should preserve existing special methods (init, updatePhaseProgress)
- [ ] LocalPMAdapter should work through PMHooks.callPMAdapter when needed

### Issue-to-Feature Mapping
- [ ] getIssue should return local feature as PMIssue
- [ ] updateIssueState should map to updateFeatureStatus
- [ ] searchIssues should search in project_management.md
- [ ] createIssue should create feature in local file
- [ ] fetchStates should return Hodge workflow states

### Special Behaviors Preserved
- [ ] LocalPMAdapter should always be created in PMHooks constructor
- [ ] LocalPMAdapter.init should always be called regardless of config
- [ ] LocalPMAdapter operations should never fail silently
- [ ] LocalPMAdapter should maintain file serialization queue

### Backward Compatibility
- [ ] Existing PMHooks methods should work unchanged
- [ ] project_management.md format should remain the same
- [ ] Feature tracking should continue to work
- [ ] Phase progress updates should still function

## Integration Tests

### PMHooks Integration
- [ ] PMHooks should initialize LocalPMAdapter in constructor
- [ ] PMHooks should always call LocalPMAdapter methods
- [ ] PMHooks can optionally route LocalPMAdapter through callPMAdapter
- [ ] External adapter failures should not affect LocalPMAdapter

### Unified Adapter Interface
- [ ] All adapters (Local, Linear, GitHub) should share interface
- [ ] Adapters should be swappable for testing
- [ ] Mock adapters should be easy to create
- [ ] Type safety should be maintained

### Configuration Tests
- [ ] 'local' should be a valid PMTool type
- [ ] LocalPMAdapter should not require API keys
- [ ] LocalPMAdapter should work without network
- [ ] LocalPMAdapter should handle missing .hodge directory

## Edge Cases

### File Operations
- [ ] Concurrent updates should be serialized
- [ ] File corruption should be handled gracefully
- [ ] Missing project_management.md should trigger init
- [ ] Large files should not cause performance issues

### State Mapping
- [ ] Hodge states should map to StateType correctly
- [ ] Unknown states should have sensible defaults
- [ ] State transitions should be validated
- [ ] Invalid states should produce clear errors

## Performance Tests

### Caching Behavior
- [ ] LocalPMAdapter can leverage BasePMAdapter caching
- [ ] File reads should be minimized
- [ ] State cache should improve performance
- [ ] Cache invalidation should work correctly

### Operation Queue
- [ ] File writes should be serialized
- [ ] Queue should handle errors gracefully
- [ ] Long operations should not block
- [ ] Queue should maintain order

## Migration Tests

### Existing Projects
- [ ] Existing project_management.md files should work
- [ ] No data loss during migration
- [ ] Features should retain their status
- [ ] Project plan should be preserved

### Rollback Safety
- [ ] Can rollback to old LocalPMAdapter if needed
- [ ] File format remains compatible
- [ ] No breaking changes to public API
- [ ] Tests should catch regressions