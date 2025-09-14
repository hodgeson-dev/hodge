# Approach 1: Manual npm link Process

## Implementation Sketch

Add documentation and helper scripts for manual npm link workflow:

```bash
# In hodge repo:
npm link

# In test project:
npm link hodge
```

### Files to create:
1. `docs/local-testing.md` - Step-by-step guide
2. `scripts/link-local.sh` - Automation script
3. Update README with local testing section

### Example script:
```bash
#!/bin/bash
# scripts/link-local.sh

echo "🔗 Setting up local hodge link..."

# Build the package
npm run build

# Create global link
npm link

echo "✅ Hodge linked globally!"
echo ""
echo "To use in your project:"
echo "  cd your-project"
echo "  npm link hodge"
echo ""
echo "To unlink:"
echo "  npm unlink hodge"
```

## Pros
- Simple and standard approach
- No additional dependencies
- Works with npm's built-in features
- Developers already familiar with npm link

## Cons
- Manual process for each developer
- Can be forgotten/missed by new contributors
- Global npm pollution
- Potential version conflicts with global packages
- Need to rebuild manually after changes

## Compatibility with Current Stack
- ✅ Works with TypeScript build process
- ✅ Compatible with CommonJS output
- ✅ No changes to package.json needed
- ⚠️  Requires manual rebuild after changes