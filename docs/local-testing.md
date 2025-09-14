# Local Testing Guide

This guide explains how to set up and test Hodge locally during development using npm link.

## Overview

Local testing allows you to:
- Test your changes immediately without publishing
- Debug issues in a real environment
- Validate new features before committing
- Use Hodge as a global command while developing

## Quick Start

1. **Link Hodge globally**:
   ```bash
   npm run link:local
   ```

2. **Create a test workspace**:
   ```bash
   npm run test:local
   ```

3. **Navigate to the test workspace** (path shown in output) and test:
   ```bash
   cd /path/to/test-workspace
   hodge init
   hodge explore
   hodge ship
   ```

4. **When done, unlink**:
   ```bash
   npm run unlink:local
   ```

## Available Scripts

### Development Scripts

- `npm run link:local` - Build and link Hodge globally
- `npm run unlink:local` - Remove global link
- `npm run dev:link` - Watch mode with auto-linking (experimental)
- `npm run test:local` - Create a fresh test workspace

### Core Build Scripts

- `npm run build` - One-time TypeScript build
- `npm run build:watch` - Watch mode for continuous building

## Step-by-Step Testing Process

### 1. Initial Setup

Before testing, make sure all dependencies are installed and the project builds successfully:

```bash
npm install
npm run build
npm test
```

### 2. Link for Global Testing

Build and link Hodge as a global command:

```bash
npm run link:local
```

This will:
- Build the TypeScript source to `dist/`
- Create a global symlink to your local development version
- Make `hodge` available as a command anywhere on your system

### 3. Create Test Environment

Generate a temporary test workspace with sample files:

```bash
npm run test:local
```

This creates a temporary directory with:
- `package.json` - Basic Node.js project
- `src/sample.js` - Sample JavaScript file
- `src/UserService.ts` - Sample TypeScript file
- `README.md` - Testing instructions
- `.gitignore` - Standard ignore patterns

### 4. Test Hodge Commands

Navigate to the test workspace and try various commands:

```bash
cd /path/to/test-workspace  # Use path from test:local output

# Basic commands
hodge --version
hodge --help

# Initialize Hodge
hodge init

# Test different modes
hodge explore
hodge ship

# Test specific features
hodge decide
hodge learn
hodge standards
```

### 5. Development Workflow

For active development, use this workflow:

```bash
# Terminal 1: Watch mode for automatic rebuilding
npm run build:watch

# Terminal 2: Test your changes
cd /path/to/test-workspace
hodge <command>  # Test your feature
```

The watch mode will automatically rebuild when you change source files, so you just need to rerun the command to test changes.

### 6. Clean Up

When finished testing:

```bash
# Remove global link
npm run unlink:local

# Clean up test workspaces
rm -rf /tmp/hodge-test-*
```

## Development Tips

### Testing Specific Features

Create focused test scenarios:

```bash
# Test initialization
hodge init
ls -la .hodge/

# Test mode switching
hodge explore
cat .hodge/state.json

hodge ship
cat .hodge/state.json

# Test decision tracking
hodge decide
cat .hodge/decisions/
```

### Debugging

Enable debug output:

```bash
# Set debug environment
export DEBUG=hodge:*
hodge <command>

# Or use Node.js inspect
node --inspect-brk $(which hodge) <command>
```

### Testing Error Scenarios

Test error handling:

```bash
# Test without initialization
hodge explore  # Should show error

# Test invalid commands
hodge invalid-command

# Test permission issues
chmod 000 .hodge/
hodge ship  # Should handle gracefully
chmod 755 .hodge/
```

### Multiple Test Workspaces

Create multiple workspaces for different scenarios:

```bash
npm run test:local  # Workspace 1
npm run test:local  # Workspace 2
npm run test:local  # Workspace 3
```

Each gets a unique timestamp-based name.

## Watch Mode (Experimental)

For rapid development, try the experimental watch + link mode:

```bash
npm run dev:link
```

This runs TypeScript in watch mode and attempts to maintain the npm link. Note: This is experimental and may require manual intervention if linking fails.

## Troubleshooting

### Common Issues

**Command not found after linking**:
```bash
# Check npm global bin directory
npm bin -g

# Ensure it's in your PATH
echo $PATH

# Re-link if needed
npm run unlink:local
npm run link:local
```

**TypeScript errors**:
```bash
# Check for type errors
npm run typecheck

# Clean build
rm -rf dist/
npm run build
```

**Permission errors**:
```bash
# Fix npm permissions (macOS/Linux)
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}
```

**Stale builds**:
```bash
# Force clean rebuild
rm -rf dist/
npm run build
npm run link:local
```

### Getting Help

- Check the main README.md for project overview
- Review source code in `src/` for implementation details
- Check existing tests in `tests/` for usage examples
- Create GitHub issues for bugs or feature requests

## Integration with Development Workflow

### Before Committing

Always test locally before committing:

```bash
# Build and test
npm run quality  # Runs typecheck, lint, and test
npm run link:local
npm run test:local
# Manual testing...
npm run unlink:local
```

### CI/CD Testing

The same patterns work in CI environments:

```bash
npm ci
npm run build
npm test
# Additional integration tests could use test:local
```

This local testing setup ensures you can confidently develop and test Hodge features in a realistic environment before sharing with others.