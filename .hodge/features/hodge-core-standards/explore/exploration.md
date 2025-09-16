# Hodge Core Standards Exploration

## Problem Statement
Hodge should provide foundational standards, patterns, principles, and strategies that are part of its core value proposition. These should be:
- Built into Hodge itself (not project-specific)
- Available as defaults when initializing any project
- Customizable/overridable per project
- Representing "The Hodge Way" of development

Examples include:
- Progressive Test Strategy ("Vibe testing for vibe coding")
- Progressive Type Safety (explore → build → harden → ship)
- Behavior-focused testing (not implementation)
- Freedom to explore, discipline to ship

## Current State Analysis
Currently, standards are:
- Created per-project in `.hodge/standards.md`
- Detected from existing code patterns
- Not portable between projects
- Mixed with project-specific requirements
- No clear separation between Hodge philosophy and project needs

## Three Approaches to Implement Core Standards

### Approach 1: Embedded Templates with Override System 📦

Create a two-tier standards system with Hodge core standards embedded in the tool itself.

**Implementation Structure:**
```
hodge/
├── src/
│   └── core-standards/           # Built into Hodge
│       ├── principles.yaml       # Core Hodge principles
│       ├── testing.yaml          # Progressive test strategy
│       ├── types.yaml            # Progressive type safety
│       ├── quality.yaml          # Code quality standards
│       └── workflow.yaml         # Explore→Build→Harden→Ship
│
project/
└── .hodge/
    ├── standards.md              # Project-specific (extends core)
    ├── overrides.yaml            # Override core standards
    └── extensions.yaml           # Add project-specific standards
```

**Implementation Details:**
```typescript
// src/lib/standards-manager.ts
class StandardsManager {
  private coreStandards: Standards;
  private projectStandards: Standards;

  async initialize(projectPath: string) {
    // Load core standards from Hodge itself
    this.coreStandards = await this.loadCoreStandards();

    // Load project overrides if they exist
    const overrides = await this.loadProjectOverrides(projectPath);

    // Merge with precedence: project > core
    this.projectStandards = this.mergeStandards(
      this.coreStandards,
      overrides
    );
  }

  getCoreStandard(key: string): Standard {
    return this.coreStandards[key];
  }

  getEffectiveStandard(key: string): Standard {
    return this.projectStandards[key] || this.coreStandards[key];
  }
}
```

**Core Standards Content:**
```yaml
# core-standards/testing.yaml
progressive-testing:
  name: "Progressive Test Strategy"
  principle: "Vibe testing for vibe coding - Test behavior, not implementation"
  phases:
    explore:
      required: false
      focus: "Test intentions only"
    build:
      required: true
      focus: "Smoke tests for happy path"
      time_limit: "100ms per test"
    harden:
      required: true
      focus: "Integration and edge cases"
      time_limit: "500ms per test"
    ship:
      required: true
      focus: "Full behavioral coverage"
      coverage_target: 80

  rules:
    - "Never test console.log calls"
    - "Never test mock interactions"
    - "Focus on user-visible behavior"
    - "Test the contract, not the implementation"
```

**Project Override Example:**
```yaml
# .hodge/overrides.yaml
testing:
  coverage_target: 90  # Override default 80%
  time_limits:
    build: "200ms"     # More lenient for this project
```

**Pros:**
- ✅ Clear separation between core and project standards
- ✅ Portable - core standards travel with Hodge
- ✅ Versionable - standards evolve with Hodge versions
- ✅ Discoverable - users can browse core standards
- ✅ Configurable - projects can customize as needed

**Cons:**
- ❌ More complex initialization
- ❌ Potential version conflicts
- ❌ Need migration strategy for standard changes

### Approach 2: Plugin-Based Standards System 🔌

Treat standards as plugins that can be installed, configured, and extended.

**Implementation Structure:**
```
hodge/
├── src/
│   └── standards/
│       └── loader.ts              # Plugin loader
│
├── packages/                      # Separate packages
│   ├── @hodge/core-standards/    # Core standards package
│   ├── @hodge/test-standards/    # Testing standards
│   └── @hodge/type-standards/    # Type safety standards
│
project/
├── .hodge/
│   └── config.yaml               # Standards configuration
└── package.json                  # Can add custom standard packages
```

**Configuration Example:**
```yaml
# .hodge/config.yaml
standards:
  presets:
    - "@hodge/core-standards"     # Built-in defaults
    - "@hodge/progressive-testing" # Progressive test strategy
    - "@company/standards"         # Company-specific standards

  overrides:
    testing:
      coverage: 90
    types:
      strict_mode: false

  custom:
    - ./standards/project-specific.js
```

**Plugin Implementation:**
```typescript
// @hodge/progressive-testing/index.ts
export class ProgressiveTestingStandard implements HodgeStandard {
  readonly name = "Progressive Testing";
  readonly version = "1.0.0";

  getPhaseRequirements(phase: Phase): Requirements {
    switch(phase) {
      case 'explore':
        return { tests: 'optional', focus: 'intentions' };
      case 'build':
        return { tests: 'smoke', timeLimit: 100 };
      case 'harden':
        return { tests: 'integration', timeLimit: 500 };
      case 'ship':
        return { tests: 'full', coverage: 80 };
    }
  }

  validate(code: string, phase: Phase): ValidationResult {
    // Validate code against standard for current phase
  }
}
```

**Pros:**
- ✅ Highly modular and extensible
- ✅ Community can contribute standards
- ✅ Version management through npm
- ✅ Easy to share between teams/projects
- ✅ Clear upgrade path

**Cons:**
- ❌ More complex architecture
- ❌ Dependency management overhead
- ❌ Potential for conflicting standards
- ❌ Requires plugin API design

### Approach 3: Convention + Configuration Cascade 🏔️

Use a convention-based approach with configuration cascade similar to ESLint/Prettier.

**Implementation Structure:**
```
hodge/
├── src/
│   └── defaults/
│       └── .hodgerc.default.json  # Built-in defaults
│
project/
├── .hodgerc.json                  # Project config (extends defaults)
├── .hodgerc.local.json            # Local overrides (gitignored)
└── .hodge/
    └── standards/                  # Generated/learned standards
```

**Default Configuration:**
```json
// Built into Hodge: .hodgerc.default.json
{
  "extends": "@hodge/recommended",
  "principles": {
    "testing": "progressive",
    "types": "progressive",
    "workflow": "explore-build-harden-ship"
  },
  "standards": {
    "testing": {
      "strategy": "behavior-focused",
      "motto": "Vibe testing for vibe coding",
      "phases": {
        "explore": { "required": false },
        "build": { "required": "smoke", "timeLimit": 100 },
        "harden": { "required": "integration", "timeLimit": 500 },
        "ship": { "required": "full", "coverage": 80 }
      }
    },
    "types": {
      "strategy": "progressive",
      "rules": {
        "no-explicit-any": {
          "explore": "off",
          "build": "warn",
          "harden": "error"
        }
      }
    },
    "quality": {
      "linting": true,
      "formatting": true,
      "documentation": {
        "public-api": "required",
        "internal": "encouraged"
      }
    }
  }
}
```

**Project Configuration:**
```json
// Project's .hodgerc.json
{
  "extends": "@hodge/recommended",
  "standards": {
    "testing": {
      "phases": {
        "ship": { "coverage": 95 }  // Override coverage
      }
    },
    "custom": {
      "security": {
        "scan": true,
        "audit": true
      }
    }
  }
}
```

**Configuration Resolution:**
```typescript
// src/lib/config-resolver.ts
class ConfigResolver {
  resolve(): Config {
    // Priority (highest to lowest):
    // 1. CLI flags
    // 2. Environment variables
    // 3. .hodgerc.local.json
    // 4. .hodgerc.json
    // 5. Parent directories' .hodgerc.json
    // 6. @hodge/recommended (built-in)
    // 7. .hodgerc.default.json (built-in)

    return deepMerge(
      this.loadDefaults(),
      this.loadRecommended(),
      this.loadProjectConfig(),
      this.loadLocalConfig(),
      this.loadEnvConfig(),
      this.loadCliConfig()
    );
  }
}
```

**Standard Presets:**
```typescript
// Presets users can choose from
const presets = {
  '@hodge/recommended': {
    // Balanced defaults for most projects
  },
  '@hodge/strict': {
    // Stricter standards for critical projects
  },
  '@hodge/rapid': {
    // Looser standards for prototyping
  },
  '@hodge/enterprise': {
    // Enterprise-grade standards
  }
};
```

**Pros:**
- ✅ Familiar pattern (like ESLint/Prettier)
- ✅ Simple and predictable
- ✅ Easy cascade/override system
- ✅ Multiple preset options
- ✅ Local overrides without git conflicts

**Cons:**
- ❌ Less flexible than plugins
- ❌ JSON configuration can get verbose
- ❌ No dynamic behavior

## Analysis: What Makes Hodge Standards Special?

### Core Hodge Principles (Non-negotiable)
1. **Progressive Enhancement**: Standards tighten as code matures
2. **Behavior-Focused**: Test what users see, not how it works
3. **Freedom→Discipline**: Loose in explore, strict in ship
4. **Learn from Success**: Extract patterns from shipped code
5. **Pragmatic Quality**: Quality gates that make sense

### Standards That Should Be Core
```yaml
core-standards:
  testing:
    - Progressive test strategy
    - Behavior-focused assertions
    - Time-boxed test execution
    - Coverage increases with maturity

  types:
    - Progressive type safety
    - Unknown over any
    - Inference over explicit
    - Safety without verbosity

  workflow:
    - Explore → Build → Harden → Ship
    - Standards enforcement by phase
    - Learn patterns from shipped code
    - Decision logging

  quality:
    - Linting as guidance, not blocker
    - Format on save, not on commit
    - Documentation for future self
    - Performance budgets
```

## Recommendation

**Choose Approach 3: Convention + Configuration Cascade** with these enhancements:

1. **Built-in Defaults**: Core Hodge standards ship with the tool
2. **Preset System**: Multiple starting points for different project types
3. **Simple Overrides**: JSON configuration that's familiar and easy
4. **Phase Awareness**: Standards automatically adjust based on current phase
5. **Learning Integration**: Learned patterns become project standards

### Implementation Plan

```typescript
// 1. Create default configuration
const HODGE_DEFAULTS = {
  version: "1.0.0",
  principles: {
    testing: "Vibe testing for vibe coding",
    workflow: "Freedom to explore, discipline to ship"
  },
  standards: { /* ... */ }
};

// 2. Update init command
async function initProject() {
  // Copy defaults to project
  if (!exists('.hodgerc.json')) {
    await writeFile('.hodgerc.json', {
      extends: '@hodge/recommended',
      project: {
        name: projectName,
        created: new Date()
      }
    });
  }

  // Initialize with core standards
  const standards = await loadEffectiveStandards();
  await writeFile('.hodge/standards.md', formatStandards(standards));
}

// 3. Phase-aware standard application
function getStandardsForPhase(phase: string) {
  const config = loadConfig();
  return config.standards[phase] || config.standards.default;
}

// 4. Make standards discoverable
hodge standards --list          # List all effective standards
hodge standards --core          # Show core Hodge standards
hodge standards --explain testing  # Explain a specific standard
```

## Why This Approach?

1. **Simplicity**: Configuration cascade is well-understood
2. **Flexibility**: Projects can override anything
3. **Portability**: Core standards ship with Hodge
4. **Discovery**: Users can explore and understand standards
5. **Evolution**: Standards can evolve with Hodge versions
6. **Community**: Presets can be shared as npm packages

## Migration Path

For existing projects:
```bash
hodge standards --migrate  # Convert existing standards to new format
hodge standards --adopt    # Adopt core standards (with option to override)
hodge standards --diff     # Show differences from core standards
```

## Next Steps

Choose your next action:
a) Review and decide on approach → `/decide`
b) Explore the configuration schema in detail
c) Start building with Convention + Configuration Cascade → `/build hodge-core-standards`
d) Create example presets (@hodge/strict, @hodge/rapid)
e) Design the standards discovery UI
f) Done for now

Enter your choice (a-f):

Note: Option (c) will use the recommended approach. Use option (a) to choose a different approach.