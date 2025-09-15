# Hodge Development Guide

This guide is for developers working on Hodge itself (dogfooding).

## Architecture

Hodge uses itself to develop itself. This creates some special considerations:

### PM Scripts Workflow

PM scripts are generated from templates during `hodge init`:
- **Templates**: `src/lib/pm-scripts-templates.ts` (source of truth)
- **Generated**: `.hodge/pm-scripts/` (project-specific)

When you modify the PM script templates while developing Hodge, you need to regenerate the scripts in `.hodge/pm-scripts/` to use the updated versions:

```bash
# After modifying pm-scripts-templates.ts
npm run update-pm-scripts
```

This command:
1. Rebuilds the project (compiles TypeScript)
2. Regenerates `.hodge/pm-scripts/` from the latest templates
3. Shows what scripts were updated

### Code Locations

- **Source**: `src/` - TypeScript source code
- **Compiled**: `dist/` - JavaScript output
- **Config**: `.hodge/` - Hodge configuration for this project

### Development Commands

```bash
# Build the project
npm run build

# Run tests
npm test

# Update PM scripts from templates
npm run update-pm-scripts

# Link for local testing
npm run link:local

# Run quality checks
npm run quality
```

### Dogfooding Workflow

1. Make changes to source code in `src/`
2. Build the project: `npm run build`
3. If you changed PM scripts templates: `npm run update-pm-scripts`
4. Test using the compiled version: `node dist/src/bin/hodge.js [command]`
5. Or use the linked version: `hodge [command]` (after `npm link`)

### Testing Changes

Always test your changes using Hodge itself:

```bash
# Use Hodge to explore a feature
hodge explore my-new-feature

# Use Hodge to build the implementation
hodge build

# Use Hodge to ship the changes
hodge ship
```

### Common Scenarios

#### Updating PM Script Templates

1. Edit `src/lib/pm-scripts-templates.ts`
2. Run `npm run update-pm-scripts`
3. Test the updated scripts in `.hodge/pm-scripts/`

#### Adding New Commands

1. Create new command in `src/commands/`
2. Register in `src/bin/hodge.ts`
3. Build and test: `npm run build && hodge [new-command]`

#### Modifying Standards

1. Edit standards in `.hodge/standards.md`
2. Test with `hodge harden`
3. Commit changes to track standard evolution

## Important Notes

- Always run `npm run build` before testing changes
- The `.hodge/` directory is version controlled for this project
- PM scripts in `.hodge/pm-scripts/` are generated, not manually edited
- Use `npm run update-pm-scripts` after changing templates

## Debugging

For debugging Hodge while developing:

```bash
# Run with debug output
DEBUG=hodge:* node dist/src/bin/hodge.js [command]

# Use VS Code debugger with launch.json configuration
# Or use Chrome DevTools
node --inspect dist/src/bin/hodge.js [command]
```