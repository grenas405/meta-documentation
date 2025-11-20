# Development Standards

**Coding patterns, naming conventions, and best practices**

---

## Overview

This document defines the development standards for DenoGenesis. These standards ensure consistency, maintainability, and alignment with Unix Philosophy principles.

---

## TypeScript Configuration

```typescript
// deno.json - Project-level configuration
{
  "compilerOptions": {
    "allowJs": true,
    "lib": ["deno.window"],
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  },
  "lint": {
    "rules": {
      "tags": ["recommended"]
    }
  },
  "fmt": {
    "useTabs": false,
    "lineWidth": 100,
    "indentWidth": 2,
    "semiColons": true,
    "singleQuote": false
  }
}
```

**Key Settings:**
- **strict**: Enables all strict type checking
- **noImplicitAny**: Prevents implicit any types
- **lineWidth: 100**: Reasonable line length for modern displays
- **semiColons: true**: Explicit statement termination

---

## Naming Conventions

### Files and Modules

```typescript
// ✅ Files: kebab-case
console-styler.ts
database-client.ts
health-monitor.ts

// ✅ Directories: kebab-case
core/middleware/
sites/heavenly-roofing/
shared-components/

// ✅ Test files: .test.ts suffix
validation.test.ts
database.test.ts
```

### TypeScript Identifiers

```typescript
// ✅ Classes: PascalCase
class DatabaseManager { }
class HealthMonitor { }
class ConsoleStyler { }

// ✅ Interfaces: PascalCase with descriptive suffix
interface SiteConfiguration { }
interface DatabaseConnectionOptions { }
interface HealthCheckResult { }

// ✅ Types: PascalCase
type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type Status = 'healthy' | 'degraded' | 'unhealthy';

// ✅ Functions: camelCase, descriptive verbs
function validateSiteConfig() { }
function checkHealthStatus() { }
function formatErrorMessage() { }

// ✅ Variables: camelCase
const siteConfig = {};
let connectionStatus = "idle";
const healthCheckInterval = 5000;

// ✅ Constants: SCREAMING_SNAKE_CASE
const MAX_RETRIES = 3;
const DEFAULT_TIMEOUT = 5000;
const API_VERSION = "v1";

// ✅ Private class members: prefix with _
class Example {
  private _internalState: string;
  private readonly _config: Config;
}
```

---

## Code Organization

### Module Structure

```typescript
/**
 * Module header comment
 *
 * @fileoverview Brief description of module purpose
 * @module path/to/module
 */

// 1. Imports - grouped and ordered
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { parse } from "https://deno.land/std@0.224.0/flags/mod.ts";

// 2. Type definitions
export interface Config {
  port: number;
  host: string;
}

// 3. Constants
export const DEFAULT_PORT = 3000;

// 4. Functions (exported first, then private)
export function createServer(config: Config) {
  return serve(handleRequest, { port: config.port });
}

function handleRequest(req: Request): Response {
  return new Response("OK");
}

// 5. Classes (exported first, then private)
export class Server {
  constructor(private config: Config) {}
}

// 6. Main execution (if applicable)
if (import.meta.main) {
  // CLI entry point
}
```

---

## Error Handling

### Custom Error Classes

```typescript
// ✅ CORRECT: Typed error hierarchy
export class DenoGenesisError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'DenoGenesisError';
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      context: this.context,
      stack: this.stack
    };
  }
}

export class DatabaseError extends DenoGenesisError {
  constructor(
    message: string,
    public readonly query: string,
    cause?: Error
  ) {
    super(message, 'DATABASE_ERROR', { query, cause });
    this.name = 'DatabaseError';
  }
}

export class NotFoundError extends DenoGenesisError {
  constructor(
    public readonly entity: string,
    public readonly id: string
  ) {
    super(`${entity} not found: ${id}`, 'NOT_FOUND', { entity, id });
    this.name = 'NotFoundError';
  }
}
```

### Error Handling Patterns

```typescript
// ✅ CORRECT: Explicit error handling with context
export async function fetchUser(id: string): Promise<User> {
  try {
    const result = await db.query(
      "SELECT * FROM users WHERE id = ?",
      [id]
    );

    if (result.length === 0) {
      throw new NotFoundError("User", id);
    }

    return result[0] as User;

  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error; // Re-throw known errors
    }

    // Wrap unknown errors with context
    throw new DatabaseError(
      `Failed to fetch user: ${id}`,
      "SELECT * FROM users WHERE id = ?",
      error
    );
  }
}

// ✅ CORRECT: Result pattern for operations that might fail
export interface Result<T, E = Error> {
  success: boolean;
  data?: T;
  error?: E;
}

export function success<T>(data: T): Result<T> {
  return { success: true, data };
}

export function failure<E extends Error>(error: E): Result<never, E> {
  return { success: false, error };
}
```

---

## Documentation Standards

### JSDoc Comments

```typescript
/**
 * Creates a database connection with site-specific configuration
 *
 * @param siteConfig - Site-specific database configuration
 * @returns Promise resolving to database connection instance
 * @throws {DatabaseError} When connection fails or configuration is invalid
 *
 * @example
 * ```typescript
 * const connection = await createConnection({
 *   database: "domtech_db",
 *   host: "localhost",
 *   port: 3306
 * });
 * ```
 */
export async function createConnection(
  siteConfig: DatabaseConfig
): Promise<DatabaseConnection> {
  // Implementation...
}
```

### Module Headers

```typescript
/**
 * @fileoverview Site health monitoring utility
 * @module core/utils/health
 *
 * Purpose: Monitor site health and availability
 * Pattern: Single responsibility (health checking only)
 * Architecture: Hub-and-spoke (used by all sites via core/)
 *
 * @requires core/config/env.ts - Environment configuration
 * @requires core/database/client.ts - Database connectivity
 *
 * @see docs/02-core-principles.md - Unix Philosophy implementation
 * @see docs/03-architecture.md - Hub-and-spoke architecture
 */
```

---

## Command-Line Interface Structure

```typescript
#!/usr/bin/env -S deno run --allow-read --allow-write --allow-net

/**
 * Standard CLI script structure
 */

import { parseArgs } from "https://deno.land/std@0.224.0/cli/parse_args.ts";
import { colors } from "https://deno.land/std@0.224.0/fmt/colors.ts";

interface ScriptOptions {
  verbose?: boolean;
  dryRun?: boolean;
  config?: string;
  help?: boolean;
}

async function main(): Promise<void> {
  const args = parseArgs(Deno.args, {
    boolean: ["verbose", "dry-run", "help"],
    string: ["config"],
    alias: {
      v: "verbose",
      h: "help",
      c: "config"
    }
  }) as ScriptOptions;

  if (args.help) {
    showHelp();
    Deno.exit(0);
  }

  try {
    const result = await executeScript(args);

    if (args.verbose) {
      console.log(colors.green("✅ Script completed successfully"));
      console.log(JSON.stringify(result, null, 2));
    }

    Deno.exit(0);
  } catch (error) {
    console.error(colors.red("❌ Script failed:"), error.message);

    if (args.verbose) {
      console.error(error.stack);
    }

    Deno.exit(1);
  }
}

function showHelp(): void {
  console.log(`
Usage: script-name [OPTIONS]

Options:
  -v, --verbose     Enable verbose output
      --dry-run     Show what would be done without executing
  -c, --config      Specify configuration file path
  -h, --help        Show this help message

Examples:
  script-name --verbose --config=/path/to/config.ts
  script-name --dry-run
`);
}

async function executeScript(options: ScriptOptions): Promise<unknown> {
  // Implementation follows Unix Philosophy:
  // 1. Single responsibility
  // 2. Structured input/output
  // 3. Composable with other scripts
  // 4. Minimal output by default
}

// Execute main function
if (import.meta.main) {
  main();
}
```

---

## Testing Patterns

### Unit Test Structure

```typescript
// test/utils/validation.test.ts
import {
  assertEquals,
  assertThrows
} from "https://deno.land/std@0.224.0/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.224.0/testing/bdd.ts";
import { validateSiteConfig } from "../../core/utils/validation.ts";

describe("validateSiteConfig", () => {
  it("should validate correct site configuration", () => {
    const validConfig = {
      siteName: "testsite",
      port: 3000,
      features: ["auth", "api"]
    };

    const result = validateSiteConfig(validConfig);
    assertEquals(result.isValid, true);
  });

  it("should reject invalid port numbers", () => {
    const invalidConfig = {
      siteName: "testsite",
      port: -1,  // Invalid
      features: ["auth"]
    };

    assertThrows(
      () => validateSiteConfig(invalidConfig),
      Error,
      "Port must be >= 1000"
    );
  });
});
```

---

## Performance Best Practices

### Database Queries

```typescript
// ❌ WRONG: N+1 query problem
async function getBlogsWithAuthors(siteKey: string): Promise<BlogWithAuthor[]> {
  const blogs = await db.query(
    "SELECT * FROM blogs WHERE site_key = ?",
    [siteKey]
  );

  // N additional queries!
  for (const blog of blogs) {
    blog.author = await db.query(
      "SELECT * FROM authors WHERE id = ?",
      [blog.author_id]
    );
  }

  return blogs;
}

// ✅ CORRECT: Single JOIN query
async function getBlogsWithAuthors(siteKey: string): Promise<BlogWithAuthor[]> {
  return await db.query(
    `SELECT
       blogs.*,
       authors.name as author_name,
       authors.email as author_email
     FROM blogs
     INNER JOIN authors ON blogs.author_id = authors.id
     WHERE blogs.site_key = ?
     ORDER BY blogs.created_at DESC`,
    [siteKey]
  );
}
```

### Async Patterns

```typescript
// ❌ WRONG: Sequential when parallel is possible
async function checkAllSites() {
  const site1 = await checkSite("domtech");
  const site2 = await checkSite("okdevs");
  const site3 = await checkSite("heavenlyroofing");
  return [site1, site2, site3];
}

// ✅ CORRECT: Parallel execution
async function checkAllSites() {
  return await Promise.all([
    checkSite("domtech"),
    checkSite("okdevs"),
    checkSite("heavenlyroofing")
  ]);
}
```

---

## Code Style Guidelines

### Formatting

```typescript
// ✅ CORRECT: Consistent formatting
export async function createBlog(
  siteKey: string,
  data: BlogData
): Promise<Blog> {
  const validation = validateBlogData(data);

  if (!validation.valid) {
    throw new ValidationError("Invalid blog data", validation.errors);
  }

  const result = await db.query(
    `INSERT INTO blogs (site_key, title, content, author)
     VALUES (?, ?, ?, ?)`,
    [siteKey, data.title, data.content, data.author]
  );

  return {
    id: result.insertId,
    site_key: siteKey,
    ...data
  };
}
```

### Comments

```typescript
// ✅ GOOD: Explain WHY, not WHAT
// Use binary search because dataset is pre-sorted and large (>10k items)
const index = binarySearch(sortedArray, target);

// ❌ BAD: Obvious comments
// Loop through array
for (const item of array) {
  // Process item
  process(item);
}

// ✅ GOOD: Document edge cases and gotchas
// NOTE: Must validate site_key BEFORE query to prevent data leakage
// between tenants. This is a security-critical operation.
const blogs = await db.query(
  "SELECT * FROM blogs WHERE site_key = ?",
  [siteKey]
);
```

---

## Git Commit Standards

### Conventional Commits

```bash
# Format: type(scope): brief description
#
# Types:
#   feat: New feature
#   fix: Bug fix
#   docs: Documentation only
#   style: Formatting, no code change
#   refactor: Code restructuring
#   test: Adding tests
#   chore: Maintenance

# Examples:
git commit -m "feat(core): add site health monitoring

- Implements Unix Philosophy single responsibility
- Returns structured health data
- Includes integration with logging system

Closes #123"

git commit -m "fix(database): prevent connection leak on error

- Ensure connections are closed even on exception
- Add try/finally blocks to connection handling
- Update tests to verify cleanup

Fixes #456"
```

---

## Code Review Checklist

Before submitting code for review:

### Functionality
- [ ] Code works as intended
- [ ] Edge cases handled
- [ ] Error handling implemented
- [ ] Tests pass

### Unix Philosophy
- [ ] Single responsibility
- [ ] Composable design
- [ ] Minimal side effects
- [ ] Explicit dependencies

### Code Quality
- [ ] Follows naming conventions
- [ ] Properly documented
- [ ] No code duplication
- [ ] Type-safe

### Security
- [ ] Input validated
- [ ] Queries parameterized
- [ ] Permissions minimal
- [ ] Multi-tenant isolation

### Performance
- [ ] No N+1 queries
- [ ] Appropriate indexes used
- [ ] Async patterns correct
- [ ] No obvious bottlenecks

---

## Common Anti-Patterns to Avoid

### 1. Magic Numbers

```typescript
// ❌ BAD
if (user.age > 18) { }
setTimeout(callback, 5000);

// ✅ GOOD
const LEGAL_AGE = 18;
const RETRY_DELAY_MS = 5000;

if (user.age > LEGAL_AGE) { }
setTimeout(callback, RETRY_DELAY_MS);
```

### 2. Deeply Nested Code

```typescript
// ❌ BAD
function process(data: Data) {
  if (data) {
    if (data.valid) {
      if (data.user) {
        if (data.user.active) {
          // Do something
        }
      }
    }
  }
}

// ✅ GOOD: Guard clauses
function process(data: Data) {
  if (!data) return;
  if (!data.valid) return;
  if (!data.user) return;
  if (!data.user.active) return;

  // Do something
}
```

### 3. Unclear Variable Names

```typescript
// ❌ BAD
const d = new Date();
const temp = user.name.split(' ');
const x = calculateTotal(items);

// ✅ GOOD
const currentDate = new Date();
const nameParts = user.name.split(' ');
const orderTotal = calculateTotal(items);
```

---

## Summary

Good development practices:
- **Follow conventions**: Consistent code is maintainable code
- **Write clear code**: Code is read more than written
- **Test thoroughly**: Tests prevent regressions
- **Document wisely**: Explain WHY, not WHAT
- **Review carefully**: Catch issues before production

**Remember**: Code quality is not about perfection - it's about consistency, clarity, and maintainability.

---

## Next Steps

- **[05-security.md](./05-security.md)** - Implement security best practices
- **[07-testing.md](./07-testing.md)** - Learn testing strategies
- **[10-decision-trees.md](./10-decision-trees.md)** - Use troubleshooting guides

---

**Core Principle**: Write code for humans first, computers second.
