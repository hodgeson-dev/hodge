# Exploration: HODGE-291

## Feature Overview
**PM Issue**: HODGE-291
**Type**: general
**Created**: 2025-09-27T14:27:46.887Z

## Context
- **Standards**: Loaded (suggested only)
- **Available Patterns**: 9

- **Similar Features**: hodge-branding, HODGE-002, HODGE-001
- **Relevant Patterns**: None identified

## Problem Analysis

The current Hodge codebase has **859 console.log occurrences** across 46 files, but:
- Console output is **practically invisible** when commands run inside Claude Code slash commands
- No persistent logging for debugging after execution
- No log levels (info, warn, error) for filtering
- No size management or log rotation
- Critical failure example: The `HODGE-291-persistent-logging` vs `persistent-logging` issue would have been debuggable with proper logs

## Implementation Approaches

### Approach 1: Winston-Based Structured Logging
**Description**: Use Winston, the most popular Node.js logging library, for comprehensive logging.

**Implementation**:
```typescript
// src/lib/logger.ts
import winston from 'winston';
import path from 'path';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join('.hodge', 'logs', 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join('.hodge', 'logs', 'combined.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 10,
    })
  ]
});
```

**Pros**:
- Industry-standard with extensive features
- Built-in log rotation and size management
- Multiple transport options (file, console, HTTP)
- Structured logging with metadata support
- Excellent ecosystem integration

**Cons**:
- Additional dependency (14KB minified)
- More complex configuration
- Might be overkill for CLI tool
- Learning curve for advanced features

### Approach 2: Lightweight Custom Logger
**Description**: Build a minimal, purpose-built logger tailored to Hodge's needs.

**Implementation**:
```typescript
// src/lib/logger.ts
export class HodgeLogger {
  private logPath: string;
  private maxSize: number;
  private level: LogLevel;

  constructor(config: LogConfig) {
    this.logPath = path.join('.hodge', 'logs', 'hodge.log');
    this.maxSize = config.maxSize || 10 * 1024 * 1024; // 10MB
    this.level = config.level || 'info';
  }

  private write(level: string, message: string, meta?: any) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...meta
    };

    // Rotate if needed
    if (this.shouldRotate()) {
      this.rotate();
    }

    fs.appendFileSync(this.logPath, JSON.stringify(entry) + '\n');
  }

  info(message: string, meta?: any) {
    if (this.shouldLog('info')) {
      this.write('info', message, meta);
    }
  }
}
```

**Pros**:
- Zero dependencies
- Full control over implementation
- Minimal overhead
- Tailored to Hodge's specific needs
- Easy to understand and modify

**Cons**:
- Need to implement rotation, formatting ourselves
- No ecosystem support
- More maintenance burden
- Risk of reinventing the wheel poorly

### Approach 3: Pino High-Performance Logger (Recommended)
**Description**: Use Pino, an extremely fast JSON logger optimized for Node.js applications.

**Implementation**:
```typescript
// src/lib/logger.ts
import pino from 'pino';
import { multistream } from 'pino-multi-stream';
import fs from 'fs-extra';
import path from 'path';

// Ensure log directory exists
const logDir = path.join('.hodge', 'logs');
fs.ensureDirSync(logDir);

// Create rotating file stream
const streams = [
  {
    level: 'error',
    stream: pino.destination({
      dest: path.join(logDir, 'error.log'),
      sync: false,
      mkdir: true,
    })
  },
  {
    level: process.env.LOG_LEVEL || 'info',
    stream: pino.destination({
      dest: path.join(logDir, 'hodge.log'),
      sync: false,
      mkdir: true,
    })
  }
];

// Add console output for init command
if (process.argv.includes('init')) {
  streams.push({
    level: 'info',
    stream: process.stdout
  });
}

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label }),
  },
  base: {
    pid: process.pid,
    hostname: undefined, // Remove hostname for privacy
  }
}, multistream(streams));

// Helper for child loggers per command
export function createCommandLogger(command: string) {
  return logger.child({ command });
}
```

**Integration Pattern**:
```typescript
// src/commands/explore.ts
import { createCommandLogger } from '../lib/logger';

export class ExploreCommand {
  private logger = createCommandLogger('explore');

  async execute(feature: string, options: ExploreOptions) {
    this.logger.info('Starting exploration', { feature, options });

    if (feature.startsWith('HODGE-')) {
      this.logger.debug('Detected HODGE ID pattern', { feature });
      const exists = await this.checkFeature(feature);
      if (!exists) {
        this.logger.error('Feature not found', { feature });
        console.log(chalk.red(`❌ Feature ${feature} not found`));
        return;
      }
    }
    // ... rest of implementation
  }
}
```

**Pros**:
- **10-20x faster** than Winston (important for CLI performance)
- Minimal overhead (7KB core)
- JSON structured logging by default
- Automatic log rotation with pino-roll
- Child loggers for command context
- Excellent TypeScript support
- Production-proven (used by Fastify, Next.js)

**Cons**:
- JSON-only output (needs pretty-printing for dev)
- Requires separate rotation module (pino-roll)
- Less built-in formatters than Winston

## Recommendation

**Recommended Approach: Pino High-Performance Logger (Approach 3)**

This approach best balances Hodge's requirements:
1. **Performance**: Minimal impact on CLI response times (<500ms requirement)
2. **Visibility**: Persistent logs for debugging slash command executions
3. **Flexibility**: Easy log level configuration via environment variables
4. **Size Management**: Automatic rotation with pino-roll
5. **Developer Experience**: Child loggers provide context per command
6. **Production Ready**: Battle-tested in high-traffic applications

## Decisions Needed

1. **Log Rotation Strategy**
   - Option A: Size-based rotation (10MB per file, keep 5 files)
   - Option B: Time-based rotation (daily logs, keep 7 days)
   - Option C: **Hybrid rotation (size + time limits)** ✓ RECOMMENDED

2. **Log Format**
   - Option A: JSON for structured querying
   - Option B: Human-readable text format
   - Option C: **JSON with pretty-print tool for dev** ✓ RECOMMENDED

3. **Default Log Level**
   - Option A: Error only (minimal logging)
   - Option B: **Info level (balanced)** ✓ RECOMMENDED
   - Option C: Debug level (verbose)

4. **Log Location**
   - Option A: **.hodge/logs/ (project-specific)** ✓ RECOMMENDED
   - Option B: ~/.hodge/logs/ (user-global)
   - Option C: System temp directory

5. **Console Output Strategy**
   - Option A: Never log to console (pure file logging)
   - Option B: **Only for init command (user-facing)** ✓ RECOMMENDED
   - Option C: Always dual-output (file + console)

## Next Steps
- [ ] Review exploration findings
- [ ] Use `/decide` to make implementation decisions
- [ ] Proceed to `/build HODGE-291`

---
*Template created: 2025-09-27T14:27:46.887Z*
*AI exploration to follow*
