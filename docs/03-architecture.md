# Architecture: Hub-and-Spoke Pattern

**Centralized framework + isolated sites = Maintainable at scale**

---

## Overview

DenoGenesis uses a hub-and-spoke architecture to prevent version drift, enable centralized updates, and maintain site isolation. This pattern follows Unix Philosophy by making each component focused and composable while avoiding duplication.

---

## Hub-and-Spoke Model

```
/home/admin/deno-genesis/               # Framework Hub
├── core/                               # Shared framework code
│   ├── middleware/                     # HTTP middleware (auth, logging, etc.)
│   ├── database/                       # Database connection and utilities
│   ├── config/                         # Environment and configuration management
│   ├── utils/                          # Utility functions and helpers
│   ├── types/                          # TypeScript type definitions
│   └── meta.ts                         # Framework integrity validation
│
├── sites/                              # Individual site instances (spokes)
│   ├── domtech/                        # Port 3000 - Tech solutions site
│   ├── heavenlyroofing/               # Port 3001 - Roofing business site
│   ├── okdevs/                        # Port 3002 - Developer community site
│   ├── pedromdominguez/               # Port 3003 - Personal portfolio site
│   └── efficientmovers/               # Port 3004 - Moving services site
│
├── shared-components/                  # Reusable UI components
├── scripts/                           # System automation scripts
├── config/                            # Infrastructure configuration
└── VERSION                            # Framework version tracking
```

### Why This Pattern?

**Traditional Approach Problems:**
```
site1/ (copy of framework v1.0)
site2/ (copy of framework v1.1)
site3/ (copy of framework v0.9)
site4/ (copy of framework v1.0, modified)
```
- Version drift between sites
- Security updates require updating ALL sites
- Bug fixes must be replicated everywhere
- No single source of truth

**Hub-and-Spoke Solution:**
```
core/ (framework v1.2)
  ↓
sites/ (all reference core/)
  ├── site1/ → core/
  ├── site2/ → core/
  ├── site3/ → core/
  └── site4/ → core/
```
- One framework version
- Security updates propagate automatically
- Bug fixes in one place
- Single source of truth

---

## Directory Structure

### Core Directory Organization

```
core/
├── types/                      # All TypeScript interfaces and types
│   ├── site.ts                # Site-specific type definitions
│   ├── database.ts            # Database-related types
│   └── framework.ts           # Framework-level types
│
├── utils/                      # Pure utility functions
│   ├── consoleStyler.ts       # Console output formatting
│   ├── validation.ts          # Data validation utilities
│   └── index.ts               # Barrel export for convenience
│
├── middleware/                 # HTTP middleware components
│   ├── auth.ts                # Authentication middleware
│   ├── logging.ts             # Request logging middleware
│   └── index.ts               # Middleware composition
│
├── database/                   # Database abstraction layer
│   ├── client.ts              # Database connection management
│   ├── migrations.ts          # Database migration utilities
│   └── queries.ts             # Common query builders
│
├── config/                     # Configuration management
│   ├── env.ts                 # Environment variable handling
│   ├── site.ts                # Site-specific configuration
│   └── database.ts            # Database configuration
│
└── meta.ts                     # Framework integrity and validation
```

### Site Directory Organization

```
sites/[site-name]/
├── mod.ts                      # Site entry point
├── site-config.ts             # Site-specific configuration
├── routes/                     # Site-specific routes
│   ├── api.ts                 # API routes
│   ├── pages.ts               # Page routes
│   └── mod.ts                 # Route composition
├── public/                     # Static assets
│   ├── css/
│   ├── js/
│   └── images/
└── middleware/                 # Site-specific middleware (if needed)
```

**Decision Criterion**: Where does this code belong?
- **core/**: Shared across ALL sites, framework-level functionality
- **sites/[site-name]/**: Site-specific logic and routes
- **shared-components/**: Reusable UI components (optional)

---

## Port Isolation Strategy

Each site runs on a unique port for complete isolation:

```typescript
// sites/domtech/site-config.ts
export const SITE_CONFIG = {
  port: 3000,
  siteName: "domtech",
  database: "domtech_db",
  features: ["auth", "monitoring", "api"]
};

// sites/okdevs/site-config.ts
export const SITE_CONFIG = {
  port: 3002,
  siteName: "okdevs",
  database: "okdevs_db",
  features: ["community", "events", "projects"]
};
```

**Port Allocation:**
- 3000: domtech (primary business site)
- 3001: heavenlyroofing (client site)
- 3002: okdevs (community site)
- 3003: pedromdominguez (portfolio)
- 3004: efficientmovers (client site)
- 3005-3099: Reserved for future sites

**Benefits:**
- No port conflicts
- Independent deployment
- Easy service identification
- Simple monitoring

---

## Architectural Decision Records (ADRs)

Every significant architectural decision must be documented.

### ADR Template

```markdown
# ADR-NNN: [Short Title]

## Status
[PROPOSED | ACCEPTED | DEPRECATED | SUPERSEDED]

## Context
What is the issue we're facing? What are the constraints?
What is the background that makes this decision necessary?

## Decision
What are we deciding to do?
Be specific and concrete.

## Rationale
Why is this the right decision?
What principles or goals does this support?

## Alternatives Considered
1. **Alternative 1**: Description and why it wasn't chosen
2. **Alternative 2**: Description and why it wasn't chosen

## Consequences

### Positive
- Benefit 1
- Benefit 2

### Negative
- Trade-off 1
- Trade-off 2

### Mitigation
- How to address negative consequences

## Related Patterns
- Link to implementation docs
- Link to related ADRs
- Link to code examples

## Review Date
When should this decision be reviewed?
```

### Example ADR

```markdown
# ADR-001: Use Unix Socket for Database Connections

## Status
ACCEPTED - Implemented across all sites

## Context
Database connections can use TCP (host:port) or Unix sockets (file path).
We needed to decide on the default connection method for production deployments.

## Decision
Use Unix socket connections (/var/run/mysqld/mysqld.sock) by default,
with TCP fallback for development environments.

## Rationale
1. **Security**: No network exposure, filesystem permissions control access
2. **Performance**: Eliminates TCP overhead, ~15% faster for local connections
3. **Simplicity**: No port management, no firewall rules needed
4. **Unix Philosophy**: Uses filesystem as interface (text-based, composable)

## Alternatives Considered
1. **TCP-only**: Standard approach, but unnecessary network exposure
2. **Mixed by default**: Confusing, leads to configuration errors

## Consequences

### Positive
- Enhanced security through filesystem permissions
- Better performance for local connections
- Simpler deployment (no port configuration)
- Follows Unix philosophy

### Negative
- Requires database to be on same machine
- Complicates remote development setup

### Mitigation
- Provide --tcp flag for remote development
- Document connection methods clearly
- Auto-detect socket availability

## Related Patterns
- See: docs/06-database.md
- See: core/database/client.ts
- Related: ADR-003 (Database pooling)

## Review Date
Quarterly - Next review: January 2026
```

### When to Create an ADR

Create an ADR when making decisions about:
- ✅ Architecture patterns (hub-and-spoke, microservices, etc.)
- ✅ Technology choices (database, framework, libraries)
- ✅ Security models (authentication, authorization)
- ✅ API design (REST, GraphQL, conventions)
- ✅ Data models (schema, multi-tenancy)
- ✅ Deployment strategies (containers, VMs, bare metal)

Don't create ADRs for:
- ❌ Implementation details (variable names, file organization within a module)
- ❌ Temporary workarounds (marked as TODO in code)
- ❌ Bug fixes (unless they reveal architectural issue)
- ❌ Documentation updates

**Decision Criterion**: Will this choice affect how other developers work or how the system behaves at scale?

---

## Decision Framework

### Decision Tree for New Features

```
Is this a new feature?
│
├─ YES → Does it fit existing patterns?
│        │
│        ├─ YES → Implement following established pattern
│        │        Document in pattern's example section
│        │
│        └─ NO → Is the existing pattern insufficient?
│                 │
│                 ├─ YES → Create Architectural Decision Record (ADR)
│                 │        Propose new pattern
│                 │        Get human review before implementing
│                 │
│                 └─ NO → Refactor feature to fit existing pattern
│
└─ NO → Is this a bug fix?
         │
         ├─ YES → Fix and add regression test
         │        Document root cause if architectural
         │
         └─ NO → Is this documentation/refactoring?
                  │
                  ├─ Documentation → Update affected docs
                  └─ Refactoring → Ensure no behavior changes
                                   Add tests to prove equivalence
```

### Architecture Review Checklist

Before implementing, verify:

#### Unix Philosophy Alignment
- [ ] Does each module have single responsibility?
- [ ] Are functions composable?
- [ ] Is configuration text-based?
- [ ] Are dependencies explicit?
- [ ] Is output minimal by default?

#### Hub-and-Spoke Compliance
- [ ] Is shared code in core/?
- [ ] Is site-specific code in sites/[name]/?
- [ ] Are imports from core/ not duplicated?
- [ ] Is site isolation maintained?

#### Security Considerations
- [ ] Are Deno permissions minimal?
- [ ] Is input validated?
- [ ] Are queries parameterized?
- [ ] Is multi-tenant isolation enforced?

#### Performance Impact
- [ ] Will this scale with data size?
- [ ] Are database queries optimized?
- [ ] Is caching appropriate?
- [ ] Are there N+1 query patterns?

---

## Module Design Patterns

### Pattern 1: Core Utility Module

```typescript
/**
 * core/utils/validation.ts
 *
 * Purpose: Data validation following Unix Philosophy
 * Exports: Pure validation functions, no side effects
 * Usage: Import in any site for consistent validation
 */

import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Define schema
export const SiteConfigSchema = z.object({
  siteName: z.string().min(1).max(50),
  port: z.number().int().min(1000).max(9999),
  features: z.array(z.string())
});

// Export type
export type SiteConfig = z.infer<typeof SiteConfigSchema>;

// Export validation function
export function validateSiteConfig(raw: unknown): SiteConfig {
  return SiteConfigSchema.parse(raw);
}
```

### Pattern 2: Site-Specific Module

```typescript
/**
 * sites/domtech/mod.ts
 *
 * Purpose: Site entry point, composes core functionality
 * Imports: Core utilities, site-specific config
 * Exports: Nothing (entry point)
 */

import { serve } from "../../core/http/server.ts";
import { router } from "./routes/mod.ts";
import { SITE_CONFIG } from "./site-config.ts";
import { db, initializeDatabase } from "../../core/database/client.ts";

// Initialize database
await initializeDatabase();

// Start server
console.log(`${SITE_CONFIG.siteName} running on port ${SITE_CONFIG.port}`);
await serve(router, { port: SITE_CONFIG.port });
```

### Pattern 3: Middleware Module

```typescript
/**
 * core/middleware/auth.ts
 *
 * Purpose: Authentication middleware (single responsibility)
 * Pattern: Returns null on success, Response on failure
 * Composable: Can be used in any route
 */

export function requireAuth(req: Request): Response | null {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response("Unauthorized", { status: 401 });
  }

  const token = authHeader.slice(7);

  try {
    const payload = verifyJWT(token);
    (req as any).user = payload;
    return null; // Success - continue processing
  } catch (error) {
    return new Response("Invalid token", { status: 401 });
  }
}

// Usage in route
export async function protectedRoute(req: Request): Promise<Response> {
  const authResult = requireAuth(req);
  if (authResult) return authResult; // Auth failed

  // Auth succeeded, process request
  const user = (req as any).user;
  return new Response(`Hello, ${user.name}`);
}
```

---

## Version Control Strategy

### Framework Versioning

**VERSION File Format:**
```
2.1.0
Build Date: 2025-09-04
Git Hash: abc123def456
Centralized: 2025-09-04T10:30:00Z
```

**Semantic Versioning:**
- MAJOR: Breaking changes to core/ interfaces
- MINOR: New features in core/, backward compatible
- PATCH: Bug fixes, no API changes

### Git Workflow

```bash
# Feature development
git checkout main
git pull origin main
git checkout -b feature/site-health-monitoring

# Make changes following patterns
# Commit with conventional commit format
git add .
git commit -m "feat(core): add site health monitoring utility

- Implements Unix Philosophy single responsibility principle
- Returns structured health data for programmatic use
- Includes integration with existing logging system
- Follows established error handling patterns

Closes #123"

# Push and create pull request
git push origin feature/site-health-monitoring
```

---

## File Naming Conventions

```typescript
// ✅ File naming: kebab-case for files
// file: console-styler.ts
export class ConsoleStyler {
  // ✅ Method naming: camelCase, descriptive
  formatInfoMessage(message: string): string { }

  // ✅ Constant naming: SCREAMING_SNAKE_CASE
  private static readonly DEFAULT_COLOR_RESET = '\x1b[0m';
}

// ✅ Interface naming: PascalCase with descriptive suffixes
interface SiteConfiguration { }
interface DatabaseConnectionOptions { }
interface HealthCheckResult { }

// ✅ Type naming: PascalCase
type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type DeploymentEnvironment = 'development' | 'staging' | 'production';
```

---

## Import/Export Patterns

```typescript
// ✅ GOOD: Use explicit, descriptive imports
import { validateSiteConfig } from "../utils/validation.ts";
import { ConsoleStyler } from "../utils/console-styler.ts";
import type { SiteConfiguration } from "../types/site.ts";

// ✅ GOOD: Barrel exports for convenience (index.ts files)
// core/utils/index.ts
export { validateSiteConfig } from "./validation.ts";
export { ConsoleStyler } from "./console-styler.ts";
export { formatErrorMessage } from "./error-formatting.ts";

// ✅ GOOD: Re-export types for easy access
export type { SiteConfiguration } from "../types/site.ts";

// ❌ BAD: Avoid wildcard imports for clarity
// import * as utils from "../utils/index.ts"; // Too ambiguous
```

---

## Framework Integrity Validation

The `core/meta.ts` module provides comprehensive framework validation:

```typescript
/**
 * Validates framework integrity
 * Checks:
 * - Core directory structure
 * - VERSION file format
 * - Site configurations
 * - Symbolic links (if applicable)
 */
import { validateFrameworkIntegrity } from "../core/meta.ts";

const integrityResult = await validateFrameworkIntegrity();

if (!integrityResult.valid) {
  console.error("❌ Framework integrity check failed:");
  integrityResult.errors.forEach(error => console.error(`  - ${error}`));
  Deno.exit(1);
}

console.log("✅ Framework integrity validated");
```

---

## Summary

The hub-and-spoke architecture provides:
- **Single source of truth**: One framework version
- **Maintainability**: Updates propagate automatically
- **Isolation**: Sites run independently
- **Clarity**: Clear separation of concerns
- **Scalability**: Easy to add new sites

**Key Principle**: Centralize what's shared, isolate what's unique.

---

## Next Steps

- **[04-development.md](./04-development.md)** - Learn development standards and coding patterns
- **[06-database.md](./06-database.md)** - Understand multi-tenant data architecture
- **[10-decision-trees.md](./10-decision-trees.md)** - Use decision frameworks for common scenarios

---

**Remember**: Good architecture makes the right thing easy and the wrong thing hard.
