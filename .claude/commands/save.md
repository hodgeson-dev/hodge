# 💾 Hodge Save - Optimized Session Management

## Purpose
Save your current work context for fast resumption later.

**NEW: Saves are now 5-10x faster using manifest-based incremental saves!**

## Usage
```
/save                     # Quick save with auto-generated name
/save {{name}}           # Save with custom name
/save {{name}} --minimal # Ultra-fast manifest-only save (<100ms)
```

## What Gets Saved (AI Context Only)

### Essential Context (Always Saved)
- 📝 **Your understanding** of the problem
- 🎯 **Decisions made** and their rationale
- 💡 **Key insights** discovered
- 🛤️ **Approach** being taken
- ⏭️ **Next steps** planned
- 📊 **Current progress** state

### References (Not Copied)
- 🔗 Links to exploration files
- 🔗 Links to build plans
- 🔗 Links to test results
- 🔗 Git commit references

## What Does NOT Get Saved

### Never Saved (Regeneratable)
- ❌ File contents (git has those)
- ❌ Test outputs (can re-run)
- ❌ Build artifacts (can rebuild)
- ❌ Generated documentation
- ❌ node_modules or dependencies
- ❌ Coverage reports
- ❌ Log files

### Why This Is Faster
Instead of copying entire directories, we now:
1. Create a lightweight manifest (instant)
2. Store only changed references (fast)
3. Use incremental saves when possible
4. Defer file loading until needed

## Save Types

### Minimal Save (Recommended)
```bash
hodge save {{name}} --minimal
```
- **Speed**: <100ms
- **Size**: ~5KB
- **Contains**: Manifest only with references
- **Use when**: Quick checkpoint needed

### Incremental Save (Default for auto-save)
```bash
hodge save {{name}} --incremental
```
- **Speed**: <500ms
- **Size**: ~10-50KB
- **Contains**: Manifest + changes since last save
- **Use when**: Regular progress saves

### Full Save (Rarely needed)
```bash
hodge save {{name}} --full
```
- **Speed**: 1-2s
- **Size**: Variable
- **Contains**: Complete context snapshot
- **Use when**: Major milestone or before risky changes

## Examples

### Quick checkpoint
```
/save
```
Creates: `checkpoint-HODGE-123-2025-09-20`

### Named save
```
/save before-refactor
```
Creates: `before-refactor`

### Ultra-fast save
```
/save quick --minimal
```
Creates: `quick` (manifest only, <100ms)

## Loading Saves

### Fast Load (Manifest + Summary)
```
/hodge --recent           # Load most recent (fast)
/hodge {{feature}}        # Load specific feature (fast)
```

### Full Load (When needed)
```
/hodge {{save}} --full    # Load everything
```

## Auto-Save Behavior

Auto-saves now use incremental saves:
- First save: Full snapshot
- Subsequent saves: Incremental (within 30 min)
- After 30 minutes: New full snapshot
- Performance: 50-100ms for incremental

## Command Execution

{{#if name}}
### Saving with name: {{name}}

```bash
# Execute optimized save
hodge save "{{name}}" {{#if minimal}}--minimal{{/if}} {{#if incremental}}--incremental{{/if}} {{#if full}}--full{{/if}}
```

{{else}}
### Creating auto-save

```bash
# Generate timestamp-based name
SAVE_NAME="save-$(date +%Y%m%d-%H%M%S)"
hodge save "$SAVE_NAME" --minimal
```

{{/if}}

After the save completes, provide:
1. Save location and size
2. Time taken
3. What was preserved (based on manifest)
4. How to load it later

## Integration with Hodge CLI

The `/save` command works with `hodge save`:

**Claude Code (`/save`)** saves:
- AI context and understanding
- Decision rationale
- Problem-solving approach

**Hodge CLI (`hodge save`)** saves:
- File modification state
- Git status
- Technical markers

Both use the same optimized manifest system.

## Performance Comparison

| Operation | Old System | New System | Improvement |
|-----------|------------|------------|-------------|
| Auto-save | 2-3s | 50-100ms | 20-60x faster |
| Manual save | 2-3s | <500ms | 4-6x faster |
| Minimal save | N/A | <100ms | New feature |
| Load manifest | 2-3s | <100ms | 20-30x faster |
| Full load | 2-3s | 500ms-1s | 2-3x faster |

## Tips

1. **Use minimal saves** for quick checkpoints during exploration
2. **Let auto-save handle** incremental progress tracking
3. **Full saves only** before major changes or at milestones
4. **Load lazily** - start with manifest, load files as needed
5. **Trust git** for file contents, save only context

## Advanced Options

```bash
# Skip generated files (default behavior)
hodge save {{name}} --no-generated

# Include everything (slow, not recommended)
hodge save {{name}} --include-all

# Clean old auto-saves
hodge save --clean-auto --older-than 7d
```

## Troubleshooting

**Save too slow?**
- Use `--minimal` for quick saves
- Check if you're accidentally including generated files

**Save too large?**
- Review excluded patterns in manifest
- Use incremental saves more often

**Can't resume properly?**
- Check manifest references are valid
- Ensure git status is clean

---
*Remember: Saves are for context, not backups. Use git for version control.*