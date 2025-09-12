# Hodge v3 Bootstrap Guide: Zero to Production Starter

## Overview: Building Your Foundation in 5 Days

When starting from scratch, you need to establish your tech stack, patterns, and standards before building features. With Hodge v3's simplified approach, this is faster and more natural.

```
Day 1: Explore & Decide Core Stack
Day 2: Ship Minimal Foundation
Day 3: Learn Initial Patterns
Day 4: Ship Core Features
Day 5: Production Readiness
```

## Prerequisites

```bash
# Install Hodge globally
npm install -g @agileexplorations/hodge

# Verify installation
hodge --version
# Should show: 3.0.0 or higher
```

## Day 1: Explore & Decide Core Stack

### Morning: Initialize and Explore

```bash
# Create project directory
mkdir my-app && cd my-app

# Initialize Hodge (one question!)
hodge init
> What are you building? A SaaS platform for team collaboration

# Explore tech stack options
hodge explore "tech stack for team collaboration SaaS"
```

#### What Happens During Tech Stack Exploration

The AI will suggest 3 approaches based on your description. For example:

1. **Modern Jamstack**: Next.js + Supabase + Vercel
2. **Traditional Full-Stack**: Django + PostgreSQL + React
3. **Enterprise**: .NET Core + SQL Server + Angular

Try each approach:
```bash
# Create quick prototypes in exploration branches
cd .hodge/explore/tech-stack-*

# Install and test approach 1
npx create-next-app@latest . --typescript --tailwind --app
npm install @supabase/supabase-js

# Build a tiny proof of concept
# See what feels right
```

### Afternoon: Make Core Decisions

After exploration, record your decisions:

```bash
# Tech stack decisions (one-liners!)
hodge decide "Next.js 14 with App Router - best DX, good performance"
hodge decide "PostgreSQL with Prisma - type safety, migrations"
hodge decide "Clerk for auth - faster than building our own"
hodge decide "Vercel for hosting - seamless Next.js integration"

# Architecture decisions
hodge decide "Monorepo structure - simpler to start"
hodge decide "Server Components by default - better performance"
hodge decide "TailwindCSS for styling - rapid development"
```

### End of Day 1 Checklist
- ✅ Hodge initialized
- ✅ Tech stack explored (3+ options tried)
- ✅ Core decisions recorded (5-10 one-liners)
- ✅ Basic project structure created

## Day 2: Ship Minimal Foundation

### Morning: Ship the Core Setup

```bash
# Now ship your first real code with standards
hodge ship "project foundation"
```

When shipping, provide this to the AI:
```
Create the foundational setup:
1. Next.js 14 with TypeScript and App Router
2. Prisma with PostgreSQL connection
3. Clerk authentication integrated
4. Basic layout with navigation
5. Home and dashboard pages (placeholder)
6. Environment variable configuration
```

The AI will generate production-quality code following detected standards:
- TypeScript strict mode
- Proper error handling
- Environment validation
- Clean project structure

### Afternoon: Ship Basic Database Schema

```bash
hodge ship "database schema"
```

Task for AI:
```
Create Prisma schema for team collaboration:
- User model (synced with Clerk)
- Team model (many users)
- Project model (belongs to team)
- Task model (belongs to project)
- Comment model (polymorphic)
Include proper indexes and relations
```

Run the migration:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

### End of Day 2 Checklist
- ✅ Next.js app running locally
- ✅ Database connected and migrated
- ✅ Authentication working
- ✅ Basic routing structure
- ✅ First code shipped (not just explored)

## Day 3: Learn Initial Patterns

### Morning: Ship a Complete Feature

Build something real to establish patterns:

```bash
hodge ship "team CRUD operations"
```

Task:
```
Build complete team management:
1. API routes for team CRUD (app/api/teams/*)
2. Team creation form with validation
3. Team list with pagination
4. Team settings page
5. Error handling and loading states
6. Tests for critical paths
```

### Afternoon: Learn From What You Built

```bash
# Extract patterns from your shipped code
hodge learn

# Hodge will detect patterns like:
✓ API Route Pattern with Error Handling (found 4 times)
✓ Form Component with Validation (found 2 times)
✓ Data Fetching with React Query (found 3 times)
✓ Page Layout Pattern (found 4 times)

# Save the ones you want to reuse
```

Now update your standards based on what worked:

```bash
hodge standards edit

# Add specific standards you discovered:
- All API routes return { data?, error? } format
- Forms use react-hook-form with zod validation
- Data fetching uses React Query with 5min cache
- Components use function declarations, not arrows
- Tests focus on user behavior, not implementation
```

### End of Day 3 Checklist
- ✅ One complete feature shipped
- ✅ Patterns extracted and saved (3-5 patterns)
- ✅ Standards updated with your preferences
- ✅ Tests written and passing

## Day 4: Ship Core Features

### Morning: Rapid Feature Development

Now that patterns are established, development accelerates:

```bash
# Ship project management using team pattern
hodge ship "project management" --like "team CRUD"

# Ship task management using same patterns
hodge ship "task management" --like "team CRUD"
```

The AI now knows your patterns and will follow them exactly.

### Afternoon: Ship Real-Time Features

```bash
# Explore real-time options
hodge explore "real-time updates"

# Try different approaches in explore mode
# Then decide
hodge decide "Pusher for real-time - simpler than WebSockets"

# Ship it with your patterns
hodge ship "real-time notifications"
```

### End of Day 4 Checklist
- ✅ 3-4 core features shipped
- ✅ All following established patterns
- ✅ Real-time functionality working
- ✅ Additional patterns learned

## Day 5: Production Readiness

### Morning: Production Configuration

```bash
hodge ship "production configuration"
```

Task:
```
Make the app production-ready:
1. Environment validation with zod
2. Error tracking with Sentry
3. Analytics with Vercel Analytics
4. Rate limiting on API routes
5. Security headers
6. Database connection pooling
7. Sitemap and robots.txt
8. OpenGraph meta tags
```

### Afternoon: CI/CD and Deployment

```bash
hodge ship "CI/CD pipeline"
```

Task:
```
Create GitHub Actions workflow:
1. Type checking and linting
2. Run all tests
3. Build verification
4. Automatic deployment to Vercel
5. Database migration checks
6. Performance budget checks
```

Deploy to production:
```bash
# Connect to Vercel
vercel

# Set up environment variables
vercel env add DATABASE_URL
vercel env add CLERK_SECRET_KEY

# Deploy
vercel --prod
```

### End of Day 5 Checklist
- ✅ Production configuration complete
- ✅ CI/CD pipeline running
- ✅ Deployed to production
- ✅ Monitoring and analytics configured
- ✅ Security hardened

## Your Completed Starter

After 5 days, you have:

### 1. Established Foundation
```
my-app/
├── .hodge/
│   ├── context.md       # Project context
│   ├── decisions.md     # 15-20 one-line decisions
│   ├── standards.md     # Your coding standards
│   └── patterns/        # 5-10 reusable patterns
├── app/                 # Next.js app directory
├── prisma/             # Database schema
├── components/         # Reusable components
├── lib/                # Utilities
└── tests/              # Test suite
```

### 2. Recorded Decisions
```markdown
# .hodge/decisions.md

## Architecture
- 2024-11-15: Next.js 14 with App Router - best DX, good performance
- 2024-11-15: PostgreSQL with Prisma - type safety, migrations
- 2024-11-15: Clerk for auth - faster than building our own
- 2024-11-15: Vercel for hosting - seamless Next.js integration
- 2024-11-16: Server Components by default - better performance
- 2024-11-16: React Query for server state - caching, optimistic updates
- 2024-11-17: Pusher for real-time - simpler than WebSockets

## Patterns
- 2024-11-16: API routes return { data?, error? } format
- 2024-11-16: Forms use react-hook-form with zod
- 2024-11-17: Pagination with cursor-based approach

## Constraints
- 2024-11-16: Max 3 database queries per API route
- 2024-11-17: Bundle size under 300KB
- 2024-11-18: LCP under 2.5s required
```

### 3. Learned Patterns

Your patterns are now real code files that get reused:

```typescript
// .hodge/patterns/api-route-pattern.ts
export async function handler(req: Request) {
  try {
    // Auth check
    const user = await authenticateUser(req);
    if (!user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    // Validation
    const body = await req.json();
    const data = schema.parse(body);

    // Business logic
    const result = await businessLogic(data);

    // Success response
    return NextResponse.json({ data: result });
  } catch (error) {
    return handleError(error);
  }
}
```

### 4. Production Features

- ✅ Authentication with Clerk
- ✅ Team management
- ✅ Project management  
- ✅ Task management
- ✅ Real-time updates
- ✅ Responsive design
- ✅ Error tracking
- ✅ Analytics
- ✅ CI/CD pipeline
- ✅ Deployed to production

## Daily Time Investment

- **Day 1**: 6-8 hours (exploration is thorough)
- **Day 2**: 4-6 hours (shipping foundation)
- **Day 3**: 4-6 hours (feature + learning)
- **Day 4**: 6-8 hours (multiple features)
- **Day 5**: 4-6 hours (production setup)

**Total**: 24-34 hours for a production-ready starter

## Tips for Success

### 1. Explore Thoroughly on Day 1
Don't rush the exploration. Actually try different approaches:
```bash
# Bad: Just reading about options
hodge explore "tech stack"
# Never actually trying them

# Good: Building mini prototypes
hodge explore "tech stack"
# Actually install and test each option
# Build a tiny feature in each
# See what feels right
```

### 2. Keep Decisions Light
```bash
# Bad: Writing an essay
hodge decide "After extensive analysis considering multiple factors..."

# Good: One-liner with reason
hodge decide "Prisma over TypeORM - better TypeScript support"
```

### 3. Ship Something Real on Day 2
```bash
# Bad: Shipping boilerplate
hodge ship "initial setup"
# Just configuration files

# Good: Shipping working features
hodge ship "user authentication flow"
# Complete, working authentication
```

### 4. Learn From Actual Patterns
```bash
# Only run learn after shipping real features
hodge ship "feature 1"
hodge ship "feature 2"
hodge learn  # Now patterns emerge
```

### 5. Use Pattern Reuse
```bash
# Once you have patterns, use them
hodge ship "new feature" --like "existing feature"
# AI copies the pattern exactly
```

## Common Pitfalls to Avoid

### 1. Over-Exploring
- ❌ Spending 3 days exploring options
- ✅ Time-box exploration to 1 day maximum

### 2. Under-Shipping
- ❌ Only exploring, never shipping
- ✅ Ship something real by Day 2

### 3. Premature Patterns
- ❌ Defining patterns before writing code
- ✅ Extract patterns from shipped code

### 4. Over-Documenting
- ❌ Writing lengthy decision documents
- ✅ One-line decisions, bullet-point standards

### 5. Skipping Learning
- ❌ Not running `hodge learn`
- ✅ Learn patterns after each shipped feature

## What Makes This Different

### From Traditional Development
- **Traditional**: Plan → Design → Build → Test → Deploy (weeks)
- **Hodge v3**: Explore → Ship → Learn → Reuse (days)

### From Pure AI Coding
- **Pure AI**: No structure, inconsistent patterns, quality varies
- **Hodge v3**: Patterns emerge and solidify, quality guaranteed when shipping

### From Hodge v1
- **Hodge v1**: Heavy process, many documents, complex structure
- **Hodge v3**: Two modes, patterns from code, one-line decisions

## Next Steps After Bootstrap

Once your starter is complete:

### Week 2: Feature Development
```bash
# Every new feature follows the pattern
hodge explore "user invitations"
hodge ship "user invitations"
hodge learn  # Extract any new patterns
```

### Week 3: Refinement
```bash
# Improve what you've built
hodge ship "performance optimizations"
hodge ship "mobile responsiveness"
hodge ship "accessibility improvements"
```

### Week 4: Scale
```bash
# Add advanced features
hodge explore "payment integration"
hodge decide "Stripe for payments - best API"
hodge ship "subscription management"
```

## Success Metrics

You know your bootstrap succeeded when:

1. **Development Velocity**: New features take hours, not days
2. **Pattern Reuse**: 80% of new code follows existing patterns
3. **Decision Clarity**: No debates about already-decided issues
4. **Quality Consistency**: All shipped code meets same standards
5. **AI Effectiveness**: AI suggestions match your style exactly

## Conclusion

In 5 focused days, you go from zero to a production-ready starter with:
- Clear technical decisions
- Established patterns
- Enforced standards
- Deployed application
- Sustainable workflow

The key is balancing exploration freedom with shipping discipline. Explore thoroughly on Day 1, then ship consistently with increasing quality. Let patterns emerge from real code, not theoretical planning.

Your AI assistant learns your style as you build, making each subsequent feature faster and more consistent. By Day 5, you have not just an app, but a foundation that can scale with your team and your ambitions.