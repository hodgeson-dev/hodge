# Basic Usage

This guide covers common Hodge workflows and slash commands for Claude Code.

## Overview

Hodge provides slash commands that integrate seamlessly with Claude Code. Each command moves your feature through a progressive development workflow.

## Core Commands

### `/explore <feature>`

Start exploring a feature idea.

**Purpose:**
- Understand the problem space
- Consider different approaches
- Create test intentions
- Make initial decisions

**Example:**
```
/explore user-authentication
```

**What happens:**
- Creates `.hodge/features/user-authentication/explore/`
- Saves exploration conversation
- Records test intentions (what should it do?)
- Optionally creates PM issue

**When to use:** Beginning of any new feature or investigation

---

### `/build <feature>`

Implement the feature with recommended standards.

**Purpose:**
- Write implementation code
- Create smoke tests
- Follow project patterns
- Track files modified

**Example:**
```
/build user-authentication
```

**What happens:**
- Creates `.hodge/features/user-authentication/build/`
- Implements feature following standards
- Writes minimum 1 smoke test
- Updates PM issue status to "In Progress"

**When to use:** After exploration is complete and you're ready to code

---

### `/harden <feature>`

Add integration tests and validate production readiness.

**Purpose:**
- Write integration tests
- Run quality gates
- Fix standards violations
- Ensure production readiness

**Example:**
```
/harden user-authentication
```

**What happens:**
- Creates `.hodge/features/user-authentication/harden/`
- Adds integration tests
- Runs linting, type checking, full test suite
- Validates against project standards
- Generates harden report

**When to use:** After build phase when feature works and needs validation

---

### `/ship <feature>`

Create commit and ship to production.

**Purpose:**
- Run final quality checks
- Create well-formatted commit
- Update PM issue
- Record lessons learned

**Example:**
```
/ship user-authentication
```

**What happens:**
- Runs full test suite
- Creates commit with detailed message
- Updates PM issue to "Done"
- Saves lessons learned to `.hodge/lessons/`

**When to use:** After harden phase when all quality gates pass

---

## Supporting Commands

### `/decide [decision]`

Record architectural or implementation decisions.

**Example:**
```
/decide "Use JWT for authentication tokens"
```

**What happens:**
- Adds decision to `.hodge/features/<feature>/decisions.md`
- Records context, rationale, and consequences
- Links decision to current feature

---

### `/status [feature]`

Check feature progress and next steps.

**Example:**
```
/status user-authentication
```

**What happens:**
- Shows progress through workflow phases
- Displays PM integration status
- Suggests next command

---

### `/hodge [feature]`

Load project context or feature context.

**Example:**
```
/hodge user-authentication
```

**What happens:**
- Loads feature-specific context
- Shows current state
- Displays available actions

---

## Common Workflows

### Quick Feature (Simple Change)

For straightforward features:

```
/explore quick-fix
/build quick-fix
/ship quick-fix
```

Skip `/harden` if the feature is simple and smoke tests provide sufficient coverage.

---

### Standard Feature (Most Common)

For typical features:

```
/explore user-dashboard
/decide "Use React hooks for state management"
/build user-dashboard
/harden user-dashboard
/ship user-dashboard
```

---

### Complex Feature (Requires Deep Exploration)

For complex features requiring multiple decisions:

```
/explore payment-integration
/decide "Use Stripe API for payment processing"
/decide "Store payment records in separate microservice"
/build payment-integration
/harden payment-integration
/review
/ship payment-integration
```

---

## Testing Commands

Run tests at various stages:

```bash
# During build - smoke tests
npm run test:smoke

# During harden - integration tests
npm run test:integration

# Before ship - full suite
npm test

# All quality checks
npm run quality
```

## Best Practices

1. **Always Explore First** - Even for "quick" features, spend 5 minutes exploring
2. **Make Decisions Explicit** - Use `/decide` to record important choices
3. **Test Progressively** - Smoke tests in build, integration in harden, full coverage at ship
4. **Stage Your Work** - Run `git add .` before `/harden` to enable proper review
5. **Review Lessons** - Check `.hodge/lessons/` for patterns from past features

## Next Steps

- **[Advanced Topics](./advanced/)** - Deep dives into Hodge features
- **[TEST-STRATEGY.md](../TEST-STRATEGY.md)** - Testing philosophy
- **[Getting Started](./getting-started.md)** - Installation guide

---

**Questions?** See [GitHub Discussions](https://github.com/hodgeson-dev/hodge/discussions)
