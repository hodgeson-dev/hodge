# Test Intentions for HODGE-168: Save/Load Optimization

## Core Behaviors to Test

### Save Command Behavior
- [ ] `hodge save` creates a manifest file with session metadata
- [ ] `hodge save --minimal` completes in under 100ms
- [ ] `hodge save --incremental` only saves changes since last save
- [ ] Auto-save triggers on feature switch without blocking
- [ ] Save excludes generated files (node_modules, dist, coverage)
- [ ] Save includes references to feature files, not copies
- [ ] Save captures current git state (modified files, last commit)
- [ ] Save preserves decision history and task status

### Load Command Behavior
- [ ] `hodge load` restores session from manifest
- [ ] `hodge load --lazy` returns immediately with metadata only
- [ ] Load presents session summary without reading all files
- [ ] Load provides on-demand access to exploration/build documents
- [ ] Load correctly restores feature, phase, and context
- [ ] Load handles missing or corrupted saves gracefully
- [ ] Most recent save loads by default
- [ ] Load preserves current work with auto-save

### Integration Behavior
- [ ] `/save` command uses `hodge save` internally
- [ ] `/load` command uses `hodge load` internally
- [ ] `/hodge` command uses optimized loading
- [ ] Auto-save uses incremental saves
- [ ] Context manager uses lazy loading
- [ ] Save/load cycle preserves all necessary state

### Performance Requirements
- [ ] Manifest-only save: <100ms
- [ ] Incremental save: <500ms
- [ ] Full save: <1 second
- [ ] Lazy load: <100ms
- [ ] Full load: <500ms
- [ ] Auto-save doesn't interrupt workflow

### Data Integrity
- [ ] No data loss during save/load cycle
- [ ] Incremental saves capture all changes
- [ ] Manifest version compatibility is checked
- [ ] File references remain valid
- [ ] Git state is accurately captured
- [ ] Decision and task lists are complete

### User Experience
- [ ] Clear feedback on save completion and location
- [ ] Informative load summary with next steps
- [ ] Helpful error messages for failures
- [ ] List of available saves is discoverable
- [ ] Auto-save notifications are non-intrusive
- [ ] Load shows what changed since save

## Edge Cases to Handle

### Error Scenarios
- [ ] Save with no active feature
- [ ] Load non-existent save
- [ ] Corrupted manifest file
- [ ] Missing referenced files
- [ ] Disk space issues
- [ ] Permission errors
- [ ] Git repository errors

### Concurrent Operations
- [ ] Multiple saves in quick succession
- [ ] Save during active file operations
- [ ] Load while files are being modified
- [ ] Auto-save during manual save
- [ ] Feature switch during save

### Data Edge Cases
- [ ] Very large exploration documents
- [ ] Many modified files (100+)
- [ ] Long-running sessions (days)
- [ ] Deeply nested feature directories
- [ ] Binary files in project
- [ ] Symbolic links in paths

## Integration Points

### With Existing Commands
- [ ] `hodge explore` triggers auto-save
- [ ] `hodge build` triggers auto-save
- [ ] `hodge ship` includes save in completion
- [ ] `hodge context` uses optimized loading
- [ ] `hodge status` reads from manifest when available

### With PM System
- [ ] Save includes PM issue status
- [ ] Load shows PM issue context
- [ ] Feature linking is preserved
- [ ] PM updates are tracked in manifest

### With Git
- [ ] Save captures uncommitted changes
- [ ] Load shows git status comparison
- [ ] Branch information is preserved
- [ ] Commit history is referenced

## Success Metrics

### Performance
- 10x faster saves (<100ms minimal)
- 10x faster loads (<100ms lazy)
- 50% reduction in disk usage
- Zero workflow interruption

### Completeness
- 100% state preservation
- Full session resumption
- No manual context reconstruction
- Complete feature history

### Usability
- Instant feedback
- Clear next steps
- Seamless integration
- Intuitive commands