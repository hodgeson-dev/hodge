# Harden Command Optimization Exploration

## Feature: harden-command-optimization

### Current Performance Analysis
The `/harden` command currently runs 4-5 external processes sequentially, taking 5-15 seconds on average. Key bottlenecks:
- Sequential execution of npm test, lint, typecheck, and build
- Each command spawns new shell process
- No caching of validation results
- Full validation even for unchanged code

### Approach 1: Parallel Validation Execution
**Implementation**: Run independent validation commands concurrently using Promise.all().

**Sketch**:
```javascript
const [testResult, lintResult, typeResult] = await Promise.all([
  this.runTests(),
  this.runLinting(),
  this.runTypeCheck(),
]);
// Build runs after (depends on TypeScript)
const buildResult = await this.runBuild();
```

**Pros**:
- 50-70% performance improvement
- Simple implementation (2-3 hours)
- No external dependencies
- Better CPU utilization

**Cons**:
- Higher memory usage
- Interleaved console output
- Harder to debug failures
- Still runs everything every time

**Compatibility**: ✅ Drop-in replacement

### Approach 2: Incremental Validation with Change Detection
**Implementation**: Cache validation results and only re-run for changed files using checksums.

**Sketch**:
```javascript
const currentChecksum = await this.calculateProjectChecksum();
const cachedResults = await this.cache.get(`harden:${feature}:${currentChecksum}`);

if (cachedResults && !options.force) {
  return this.displayResults(cachedResults); // Instant!
}
```

**Pros**:
- Instant for unchanged code (100% faster)
- 60-80% faster average case
- Intelligent change detection
- Git-aware tracking

**Cons**:
- Complex implementation (4-6 hours)
- Cache management overhead
- May miss external changes
- Git dependency

**Compatibility**: ✅ Same interface with --force option

### Approach 3: Streaming Results with Real-time Feedback
**Implementation**: Stream validation results with progress indicators and parallel execution.

**Sketch**:
```javascript
validationStream.on('test:progress', (data) => {
  spinner.text = `Tests: ${data.current}/${data.total}`;
});

await Promise.allSettled([
  this.streamTests(),
  this.streamLinting(),
  this.streamTypeCheck(),
]);
```

**Pros**:
- Best user experience
- Real-time progress updates
- Lower memory usage (streaming)
- Early failure detection

**Cons**:
- Most complex (6-8 hours)
- External dependency (ora)
- Harder to test
- Console complexity

**Compatibility**: ✅ Enhanced but compatible

## Recommendation

**Recommended: Approach 1 (Parallel Validation)** for immediate impact:

1. **Quick Win**: Parallel validation provides 50-70% improvement with minimal complexity
2. **Foundation**: Sets groundwork for future enhancements
3. **Low Risk**: Simple implementation, easy to test and rollback
4. **User Benefit**: Significant time savings without changing workflow

**Future Enhancement Path**:
1. **Phase 1**: Implement Parallel Validation (2-3 hours)
2. **Phase 2**: Add basic caching for unchanged files (later)
3. **Phase 3**: Consider streaming UI for better UX (v2)

Approach 1 provides the best balance of:
- ✅ High impact (50-70% faster)
- ✅ Low complexity (2-3 hours)
- ✅ No dependencies
- ✅ Easy to test and maintain
- ✅ Foundation for future improvements

## Implementation Priority

1. **Immediate**: Parallelize test, lint, and typecheck
2. **Next**: Optimize console output buffering
3. **Future**: Add incremental validation caching

## Metrics to Track

- Total validation time
- Individual command times
- Memory usage during parallel execution
- Success/failure rates

## Next Steps

Choose your next action:
a) Review and decide on approach → `/decide`
b) Continue exploring another aspect
c) Start building immediately → `/build harden-command-optimization`
d) Save progress and switch context → `/save`
e) View other explorations → `/status`
f) Done for now

Enter your choice (a-f):