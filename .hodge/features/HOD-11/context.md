# HOD-11: Set up local testing with npm link

## Decision Made
- **Chosen Approach**: Watch Mode with Auto-linking
- **Date**: 2025-09-13
- **Rationale**: Optimal developer experience with automatic rebuilds and TypeScript integration

## Implementation Plan
1. Add npm scripts for dev mode with watch
2. Create test workspace generator script
3. Integrate TypeScript watch mode
4. Document the local testing process
5. Update contributing guidelines

## Key Features
- Automatic rebuild on source changes
- Dedicated test workspace creation
- npm link automation
- TypeScript --watch integration
- Clean testing environment

## Technical Details
```json
{
  "scripts": {
    "dev": "npm run build:watch & npm link",
    "build:watch": "tsc --watch",
    "link:local": "npm run build && npm link",
    "test:local": "node scripts/create-test-workspace.js"
  }
}
```

## Files to Create/Modify
- `package.json` - Add dev and watch scripts
- `scripts/create-test-workspace.js` - Test environment setup
- `docs/local-testing.md` - Developer documentation
- `CONTRIBUTING.md` - Add local testing section

## Next Steps
Ready for `/build HOD-11` to implement the watch mode solution