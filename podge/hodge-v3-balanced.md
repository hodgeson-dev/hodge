# Hodge v3: Standards-Aware Exploration, Streamlined Workflow

## Core Insight: Standards Always Apply, Enforcement Varies

The problem with v2 was throwing out standards during exploration. The real insight:
- **Standards should ALWAYS guide AI output**
- **Decisions should ALWAYS inform new work**  
- **But enforcement and strictness should vary by mode**

## The Revised Two-Mode System

### Explore Mode: "Standards as Guidelines"
```bash
hodge explore "payment processing"

# AI knows:
# - Your React patterns (suggests them, doesn't require them)
# - Your database is PostgreSQL (uses it in examples)
# - Your auth is Clerk (integrates with it)
# - Your API style (follows it loosely)

# But allows:
# - Trying alternative approaches
# - Breaking patterns to learn
# - Quick hacks to test ideas
```

### Ship Mode: "Standards as Requirements"
```bash
hodge ship "payment processing"

# AI enforces:
# - MUST use established React patterns
# - MUST follow API conventions exactly
# - MUST include error handling
# - MUST write tests
# - MUST meet performance budgets
```

## The Smart Context System

```
.hodge/
├── context.md          # Auto-maintained project context
├── standards.md        # Your detected/defined standards
├── decisions.md        # Important decisions (still one-liners)
├── patterns/           # Learned patterns from your code
│   ├── api/           # API patterns you've used
│   ├── components/    # React patterns you've used
│   └── tests/         # Testing patterns you've used
└── explore/           # Recent explorations (auto-cleaned)
```

## Standards: Detected, Documented, and Enforced

### Automatic Detection + Manual Refinement
```bash
# Hodge detects your standards from existing code
hodge learn --standards

Output:
✓ Detected: Functional React components only
✓ Detected: API routes return { data, error } format
✓ Detected: Tests use React Testing Library
✓ Detected: Error boundaries wrap features
Save as project standards? [Y/n]

# You can refine them
hodge standards edit

# Add specific rules like:
- "All forms must use react-hook-form with zod validation"
- "API routes must have rate limiting"
- "Components must be under 200 lines"
```

### Standards in AI Context

When you run ANY Hodge command, the AI receives:

```markdown
## Project Standards (MUST follow in ship mode, SHOULD follow in explore mode)

### React Patterns
- Use functional components with hooks
- Props must have TypeScript interfaces  
- Use UserCard pattern for user displays (see patterns/components/UserCard)

### API Patterns
- Return format: { data?, error? }
- Status codes: 200, 400, 401, 403, 404, 500 only
- All routes need authentication except /api/public/*

### Testing Requirements
- Ship mode: Tests required (>80% coverage)
- Explore mode: Tests optional but encouraged
- Use existing test utilities from lib/test-utils

### Performance Budgets
- API responses < 200ms (p95)
- Page load < 3s
- Bundle size < 300kb
```

## Decisions: Lightweight but Present

### One-Line Decisions That Matter
```markdown
# .hodge/decisions.md

## Architecture
- 2024-11-01: PostgreSQL over MongoDB - Relational data, team expertise
- 2024-11-05: Clerk over NextAuth - Better DX, webhook support
- 2024-11-10: Vercel deployment - Simplicity, auto-scaling

## Patterns  
- 2024-11-07: API versioning via /api/v1 prefix - Future flexibility
- 2024-11-12: Zustand for client state - Simpler than Redux
- 2024-11-14: React Query for server state - Cache management

## Constraints
- 2024-11-08: No client-side sensitive operations - Security
- 2024-11-13: Max 3 database queries per API route - Performance
```

These are ALWAYS loaded into AI context, ensuring explorations build on past decisions.

## Pattern Learning: Your Code Becomes the Standard

### Automatic Pattern Extraction
```bash
hodge learn

# Analyzes your recent successful code and extracts patterns:
Analyzing: src/app/api/users/route.ts
✓ Extracted API pattern: Authenticated REST endpoint
✓ Pattern includes: auth check, validation, error handling, logging

Save as reusable pattern? [Y/n]
```

### Pattern Storage
```typescript
// .hodge/patterns/api/authenticated-endpoint.ts
export const pattern = {
  name: "Authenticated REST Endpoint",
  template: `
export async function {{METHOD}}(request: Request) {
  try {
    // Auth check
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validation
    const body = await request.json();
    const validated = {{SCHEMA}}.parse(body);
    
    // Business logic
    const result = await {{LOGIC}}
    
    // Return
    return NextResponse.json({ data: result });
  } catch (error) {
    // Error handling
    logger.error('{{ENDPOINT}} error:', error);
    return handleApiError(error);
  }
}`,
  learned: "2024-11-15",
  usageCount: 5
}
```

### Pattern Reuse
```bash
hodge ship "create order endpoint"

# AI automatically uses your authenticated endpoint pattern
# Fills in the ORDER-specific logic
# Maintains YOUR error handling style
```

## The Workflow: Informed Exploration → Standards-Based Shipping

### Example: Adding Payments

#### 1. Explore with Context
```bash
hodge explore "payment processing"

# AI knows from decisions.md:
# - You're using PostgreSQL (designs schema accordingly)
# - You have Clerk auth (integrates with user system)
# - You prefer Zustand (uses it for payment state)

# AI suggests from standards.md:
# - Payment endpoints following your API pattern
# - React components using your patterns
# - Tests in your style

# But allows exploration:
# - "Here are 3 payment providers to consider"
# - "You could try webhook vs polling approaches"
# - "Consider storing payment methods vs one-time tokens"
```

#### 2. Decide What Matters
```bash
# After exploration, if you made an important choice:
hodge decide "Stripe over PayPal - Better API, webhook support"

# This adds ONE line to decisions.md
# Future explorations will know you use Stripe
```

#### 3. Ship with Full Standards
```bash
hodge ship "payment processing"

# Now AI MUST:
# - Use your exact API patterns
# - Follow your React component structure  
# - Include comprehensive error handling
# - Write tests matching your style
# - Meet performance budgets
# - Use Stripe (from your decision)
```

## Bootstrap Revised: Standards-First Development

### Day 1: Explore and Decide Core Stack
```bash
hodge explore "tech stack for SaaS"
hodge explore "authentication options"
hodge explore "database choices"

# Make decisions
hodge decide "Next.js 14 with App Router"
hodge decide "PostgreSQL with Prisma"
hodge decide "Clerk for auth"
```

### Day 2: Build and Learn Patterns
```bash
# Ship something basic to establish patterns
hodge ship "user authentication"
hodge ship "basic CRUD API"

# Extract your patterns as standards
hodge learn --standards
hodge learn --patterns
```

### Day 3: Explore with Your Standards
```bash
# Now exploration uses YOUR patterns
hodge explore "admin dashboard"
# AI suggests approaches using your React patterns

hodge explore "email notifications"  
# AI knows your API patterns and database choice
```

## Configuration: Minimal but Explicit

```javascript
// hodge.json
{
  "version": 3,
  "modes": {
    "explore": {
      "standards": "suggest",      // AI suggests but doesn't require
      "patterns": "prefer",         // Prefers your patterns but allows alternatives
      "decisions": "inform",        // Uses decisions to guide exploration
      "cleanup": "7 days"          // Auto-cleanup old explorations
    },
    "ship": {
      "standards": "enforce",       // Must follow standards
      "patterns": "require",         // Must use established patterns
      "decisions": "follow",         // Must align with decisions
      "tests": "required",          // Must include tests
      "review": "automated"         // Run automated checks
    }
  },
  "learn": {
    "from": ["src/", "app/"],      // Where to learn patterns from
    "ignore": ["*.test.ts"],       // Don't learn from tests
    "threshold": 2                  // Pattern must appear 2+ times
  }
}
```

## Standards Enforcement: Gradual but Consistent

### In Exploration
```typescript
// AI generates this during exploration:
export async function POST(request: Request) {
  const body = await request.json();
  
  // Quick hack to test the idea
  const payment = await stripe.charges.create({
    amount: body.amount,
    currency: 'usd',
    source: body.token
  });
  
  return Response.json({ payment });
}

// AI notes: "This is a quick prototype. In ship mode, I would add:
// - Authentication check
// - Input validation  
// - Error handling
// - Logging
// - Rate limiting"
```

### In Ship Mode
```typescript
// AI MUST generate this when shipping:
export async function POST(request: Request) {
  try {
    // Required: Auth check (from standards)
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' }},
        { status: 401 }
      );
    }

    // Required: Validation (from standards)
    const body = await request.json();
    const validated = PaymentSchema.parse(body);
    
    // Required: Rate limiting (from standards)
    const rateLimitOk = await checkRateLimit(session.userId);
    if (!rateLimitOk) {
      return NextResponse.json(
        { error: { code: 'RATE_LIMITED', message: 'Too many requests' }},
        { status: 429 }
      );
    }
    
    // Business logic with proper error handling
    const payment = await createPayment(validated);
    
    // Required: Logging (from standards)
    logger.info('Payment created', { 
      userId: session.userId, 
      paymentId: payment.id 
    });
    
    // Required: Standard response format
    return NextResponse.json({ data: payment });
    
  } catch (error) {
    // Required: Error handling pattern
    return handleApiError(error);
  }
}
```

## The Key Balance Points

### 1. Standards Always Present, Enforcement Varies
- Explore: "Here's how you usually do it, but feel free to experiment"
- Ship: "You must follow the established patterns"

### 2. Decisions Always Inform, Never Restrict Exploration  
- Explore: "Since you chose PostgreSQL, I'll use that in examples"
- Ship: "Using PostgreSQL as decided in architecture decisions"

### 3. Patterns Emerge and Solidify
- First use: Just code
- Second use: Potential pattern
- Third use: Established pattern
- Ship mode: Required pattern

### 4. Documentation Minimal but Meaningful
- No lengthy documents
- One-line decisions
- Pattern files are actual code
- Standards are bullet points

## Why This Version Works

### For Standards Advocates
- Standards are always enforced when shipping
- Patterns are learned and reused
- Code quality is guaranteed in production
- Technical decisions are respected

### for Exploration Advocates
- Can still experiment freely
- Standards guide but don't restrict
- Learn from experiments
- Quick prototypes allowed

### For Teams
- Shared standards automatically
- Decisions visible to all
- Patterns emerge from actual code
- Onboarding sees real examples

### For AI Effectiveness
- Always has context
- Knows your preferences
- Learns from your code
- Adapts to your style

## The Test: Can It Handle Real Development?

### Scenario: Adding Real-Time Features

```bash
# Monday: Explore possibilities
hodge explore "real-time updates"

# AI knows your stack (Next.js, PostgreSQL, Clerk)
# Suggests: "Given your architecture, consider:
# 1. Polling with React Query (fits your patterns)
# 2. WebSockets with Socket.io  
# 3. Server-Sent Events
# 4. Pusher/Ably (managed service)"

# You try option 2
cd explore/real-time-updates
npm install socket.io
# Build prototype...

# Tuesday: Make decision
hodge decide "Pusher for real-time - Simpler than WebSockets, good DX"

# Wednesday: Ship it properly
hodge ship "real-time notifications"

# AI now:
# - Uses Pusher (your decision)
# - Follows your API patterns exactly
# - Uses your React component patterns
# - Includes your standard error handling
# - Writes tests in your style
```

The exploration was informed by your stack, the shipping followed your standards, and future work knows about Pusher.

## This Version's Philosophy

**"Freedom to explore, discipline to ship, wisdom to know the difference"**

- Standards are guardrails, not prison walls
- Decisions are memory, not law
- Patterns are preferences, not rules (until shipping)
- Learn from what works, enforce what matters

This balances the need for quality and consistency with the reality of exploratory development. You get both innovation and reliability.