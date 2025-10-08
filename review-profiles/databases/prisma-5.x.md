---
frontmatter_version: "1.0.0"
scope: reusable
type: database
database: prisma
applies_to:
  - "**/prisma/schema.prisma"
  - "**/*.prisma"
  - "**/*prisma*.ts"
  - "**/*prisma*.js"
version: "1.0.0"
maintained_by: hodge-framework
detection:
  dependencies: ["@prisma/client", "prisma"]
  version_range: ">=5.0.0 <6.0.0"
---

# Prisma 5.x Best Practices

Modern Prisma ORM best practices for version 5.x, focusing on schema design, query optimization, type safety, and migration management.

---

## Schema Design
**Enforcement: SUGGESTED** | **Severity: WARNING**

Design schemas with clear relationships and appropriate field types. Use explicit relation names for clarity, choose appropriate field types (String vs Text, Int vs BigInt), define proper indexes for query performance, and use enums for constrained values.

**Guidance**: Prisma schema is the source of truth - invest time in good design. Explicit `@relation` names prevent ambiguity with multiple relations. `String` has length limits (often 191-255), `Text` for longer content. Add `@@index` on fields used in WHERE clauses. Enums are type-safe and prevent invalid values. Consider soft deletes vs hard deletes early.

---

## Type Safety with Generated Client
**Enforcement: SUGGESTED** | **Severity: SUGGESTION**

Leverage Prisma's generated TypeScript client for full type safety. Use generated types for function parameters/returns, avoid `any` when working with Prisma models, and regenerate client after schema changes with `prisma generate`.

**Guidance**: Prisma Client provides compile-time safety for database operations. `Prisma.UserCreateInput` is better than manual typing. Always run `prisma generate` after schema changes - stale client causes type mismatches. Use `select` to narrow return types when you don't need all fields. Reference TypeScript standards for `any` avoidance.

---

## Query Optimization
**Enforcement: SUGGESTED** | **Severity: WARNING**

Write efficient queries to avoid N+1 problems and unnecessary data fetching. Use `include` or `select` to fetch only needed data, batch related queries with `include` to prevent N+1, avoid `findMany()` without limits on large tables, and use pagination (cursor or offset) for large result sets.

**Guidance**: N+1 queries are the most common Prisma performance issue. `include` fetches related data in single query, not N separate queries. Always limit results from unbounded queries. Cursor-based pagination is more efficient for large datasets. Use Prisma's query engine metrics to identify slow queries. Reference performance standards for optimization philosophy.

---

## Transaction Management
**Enforcement: SUGGESTED** | **Severity: WARNING**

Use transactions for operations that must succeed or fail together. Use `$transaction` for multiple operations that need atomicity, keep transactions short (lock duration), and handle transaction rollbacks properly with try/catch.

**Guidance**: Transactions ensure data consistency - critical for operations like transferring funds, creating related records. Interactive transactions (`prisma.$transaction(async (tx) => ...)`) are more flexible than sequential transactions. Don't hold transactions open during external API calls. Always handle errors to avoid partial commits.

---

## Migration Strategy
**Enforcement: SUGGESTED** | **Severity: WARNING**

Manage database schema changes through Prisma Migrate. Use `prisma migrate dev` in development for iterative changes, `prisma migrate deploy` in production, never edit migrations after they're applied, and test migrations on staging before production.

**Guidance**: Prisma Migrate tracks schema evolution through migration files. Editing applied migrations breaks migration history. Use descriptive migration names. Always review generated SQL before applying. Have rollback plan for production migrations. Seed data goes in `prisma/seed.ts`, not migrations.

---

## Error Handling
**Enforcement: SUGGESTED** | **Severity: WARNING**

Handle Prisma-specific errors appropriately. Catch `PrismaClientKnownRequestError` for constraint violations, check error codes (P2002 = unique constraint, P2025 = record not found), provide user-friendly error messages, and log detailed errors for debugging.

**Guidance**: Prisma throws specific error types with codes. P2002 is unique constraint violation (e.g., duplicate email). P2025 is record not found. P2003 is foreign key constraint. Don't expose raw Prisma errors to users - translate to friendly messages. Log full error details for debugging. Reference general error handling standards.

---

## Connection Management
**Enforcement: SUGGESTED** | **Severity: WARNING**

Manage database connections properly to avoid connection pool exhaustion. Reuse single PrismaClient instance across application (singleton pattern), call `$disconnect()` in application shutdown, configure connection pool size based on database limits, and don't create new PrismaClient per request.

**Guidance**: PrismaClient manages connection pool internally. Creating multiple instances exhausts database connections. Use singleton pattern - instantiate once, reuse everywhere. In serverless, connection pooling services (PgBouncer, Prisma Data Proxy) prevent connection limits. Configure pool size in `datasource` block. Always disconnect gracefully on shutdown.

---
