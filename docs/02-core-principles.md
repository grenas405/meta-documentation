# Core Principles: Unix Philosophy for Modern Development

**The seven timeless principles applied to Deno-based development**

---

## Overview

Every decision in DenoGenesis derives from Unix Philosophy principles, adapted for modern web application development. These aren't abstract ideals - they're practical patterns that reduce complexity, improve security, and enhance maintainability.

---

## The Seven Core Principles

### 1. Do One Thing Well

Each module should have a single, clearly defined responsibility.

```typescript
// ❌ ANTI-PATTERN: God object doing everything
class Application {
  handleHTTP() { /* ... */ }
  connectDatabase() { /* ... */ }
  authenticateUser() { /* ... */ }
  renderTemplate() { /* ... */ }
  sendEmail() { /* ... */ }
}

// ✅ CORRECT PATTERN: Focused, single-responsibility modules
// http/server.ts - HTTP handling only
export function createServer(handler: RequestHandler): Deno.HttpServer {
  return Deno.serve(handler);
}

// database/client.ts - Database operations only
export class DatabaseManager {
  async query(sql: string, params: unknown[]): Promise<unknown[]> {
    // Database query logic
  }
}

// auth/middleware.ts - Authentication only
export function requireAuth(req: Request): Response | null {
  // Authentication logic
  return null; // User is authenticated
}
```

**Decision Criterion**: Can you describe the module's purpose in one sentence without using "and"?
- If YES: Good single-responsibility design
- If NO: Module needs to be split

---

### 2. Make Everything a Filter

Scripts should accept input, transform it, and produce output without side effects where possible.

```typescript
// ✅ GOOD: Pure function that transforms data
export function validateSiteConfig(config: SiteConfig): ValidationResult {
  return {
    isValid: config.port > 0 && config.siteName.length > 0,
    errors: []
  };
}

// ✅ GOOD: Composable pipeline
const result = await validateSiteConfig(config)
  .then(transformToSystemdConfig)
  .then(writeConfigFile);

// ✅ GOOD: Type-safe filters
type DataProcessor = (data: string) => string;

const toUpperCase: DataProcessor = (data) => data.toUpperCase();
const trim: DataProcessor = (data) => data.trim();
const removeSpaces: DataProcessor = (data) => data.replace(/\s/g, "");

// Compose functions explicitly
const processData: DataProcessor = (data) =>
  removeSpaces(trim(toUpperCase(data)));
```

**Decision Criterion**: Can this function be tested in isolation without setup/teardown?
- If YES: Good pure function design
- If NO: Consider extracting side effects to higher layer

---

### 3. Avoid Captive User Interfaces

Scripts should work programmatically and in automation contexts.

```typescript
// ❌ BAD: Direct console output only
function checkHealth() {
  console.log("Database is up"); // Not programmatically useful
}

// ✅ GOOD: Return structured data for programmatic use
export async function healthCheck(): Promise<HealthStatus> {
  return {
    status: "healthy",
    services: [
      { name: "database", status: "up", responseTime: 23 }
    ],
    timestamp: new Date().toISOString()
  };
}

// Can be used programmatically
const health = await healthCheck();
if (health.status !== "healthy") {
  await sendAlert(health);
}

// Or with CLI when run directly
if (import.meta.main) {
  const health = await healthCheck();
  console.log(JSON.stringify(health, null, 2));
  Deno.exit(health.status === "healthy" ? 0 : 1);
}
```

**Decision Criterion**: Can this be used by another program without parsing text output?
- Functions should return structured data
- CLI presentation layer is separate
- Exit codes communicate success/failure

---

### 4. Store Data in Flat Text Files

Configuration and state should be human-readable and version-controllable.

```typescript
// ❌ ANTI-PATTERN: Complex JSON configuration with magic strings
{
  "server": {
    "middleware": ["auth", "cors", "logging"],
    "plugins": {
      "db": { "type": "mysql", "options": { /* ... */ } }
    }
  }
}

// ✅ CORRECT PATTERN: Explicit TypeScript configuration
// site-config.ts
export interface SiteConfig {
  readonly siteName: string;
  readonly port: number;
  readonly enabledFeatures: readonly Feature[];
}

export const config: SiteConfig = {
  siteName: "my-business",
  port: 3000,
  enabledFeatures: ["auth", "monitoring", "api"] as const,
};

// ✅ GOOD: Version file format (flat text, parseable)
// VERSION file content:
// 2.1.0
// Build Date: 2025-09-04
// Git Hash: abc123def456
// Centralized: 2025-09-04T10:30:00Z
```

**Decision Criterion**: Can a human read and understand the configuration without documentation?
- Configuration should be self-documenting
- Use TypeScript types for compile-time validation
- Avoid magic strings and implicit behavior

---

### 5. Use Software Leverage

Leverage Deno's built-in capabilities and existing tools rather than reinventing.

```typescript
// ✅ GOOD: Use Deno's built-in capabilities
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { parse } from "https://deno.land/std@0.224.0/flags/mod.ts";

// ✅ GOOD: Leverage existing validation patterns
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const ConfigSchema = z.object({
  port: z.number().min(1000).max(9999),
  siteName: z.string().min(1)
});

// ❌ BAD: Reinventing standard library functionality
function myOwnHTTPServer() { /* Don't do this */ }
function myOwnArgumentParser() { /* Don't do this */ }
```

**Decision Criterion**: Does this functionality exist in Deno standard library or trusted ecosystem?
- Prefer Deno standard library
- Use specific versions for external dependencies
- Document why each external dependency is needed

---

### 6. Use Shell Scripts to Increase Leverage

Complement TypeScript with shell scripts for system operations.

```bash
#!/bin/bash
# ✅ GOOD: Shell script for system-level operations
# scripts/health-check.sh

check_service() {
  local service=$1
  local port=$2

  if curl -sf "http://localhost:$port/health" > /dev/null; then
    echo "$service:healthy"
  else
    echo "$service:unhealthy"
  fi
}

# Export results in parseable format
check_service "domtech" 3000
check_service "okdevs" 3002
```

**Decision Criterion**: Is this a system-level operation?
- Use shell scripts for: systemd, file operations, process management
- Use TypeScript for: application logic, data processing, APIs
- Compose both for comprehensive automation

---

### 7. Avoid Gratuitous Output

Scripts should be quiet by default, verbose when requested.

```typescript
// ❌ BAD: Noisy by default
function processData(data: string): string {
  console.log("Processing data...");
  console.log("Step 1 complete");
  console.log("Step 2 complete");
  console.log("Done!");
  return data.toUpperCase();
}

// ✅ GOOD: Configurable output levels
export interface LoggerConfig {
  level: 'silent' | 'error' | 'info' | 'debug';
  format: 'json' | 'text';
}

export function log(
  message: string,
  level: 'info' | 'error' | 'debug' = 'info'
) {
  if (shouldLog(level)) {
    console.log(formatMessage(message, level));
  }
}

// ✅ GOOD: Success indicated by exit code, minimal output
// Exit code 0 = success, non-zero = error
// Detailed output only when --verbose flag used
```

**Decision Criterion**: Does the script produce output without being asked?
- Silent by default for composability
- Verbose mode via flag (--verbose, -v)
- Errors always go to stderr
- Success indicated by exit code

---

## Deno-Specific Advantages

### Explicit Permissions as Security Boundary

```typescript
#!/usr/bin/env -S deno run --allow-read=./config --allow-write=./logs --allow-net=api.stripe.com

/**
 * This script's security boundaries are explicit and auditable:
 *
 * CAN DO:
 * - Read files in ./config directory
 * - Write files to ./logs directory
 * - Make network requests to api.stripe.com
 *
 * CANNOT DO:
 * - Read other files (e.g., /etc/passwd)
 * - Write to other directories (e.g., /tmp)
 * - Make network requests to other domains
 * - Execute system commands
 * - Access environment variables
 */
```

**Decision Criterion**: Does every script declare the minimum permissions needed?
- Be specific with permissions (--allow-read=./config, not just --allow-read)
- Document WHY each permission is needed
- Review permissions during code review

---

### No Build Step, Direct Execution

```typescript
// ❌ ANTI-PATTERN: Complex build pipeline
// 1. TypeScript compiler (tsconfig.json)
// 2. Webpack bundler (webpack.config.js)
// 3. Babel transpiler (babel.config.js)
// 4. PostCSS processor (postcss.config.js)
// 5. Minification (terser config)
// 6. Generate source maps
// 7. Copy assets
// 8. Finally: Deployable artifact

// ✅ CORRECT PATTERN: Direct execution
// deno run --allow-net main.ts

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { handleRequest } from "./routes/handler.ts";

// No build step needed
// No bundler configuration
// No transpilation pipeline
// Direct execution with full type safety
serve(handleRequest, { port: 3000 });
```

**Decision Criterion**: Does this introduce a build step?
- If YES: Reconsider if it's truly necessary
- If NECESSARY: Document why in ADR
- Default: Direct execution without builds

---

### Standard Library and Security

```typescript
// ❌ ANTI-PATTERN: Unvetted npm packages
// npm install express body-parser cors helmet morgan winston
// + 500 transitive dependencies you didn't audit

// ✅ CORRECT PATTERN: Deno standard library + explicit trusted sources
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { parse } from "https://deno.land/std@0.224.0/flags/mod.ts";
import { join } from "https://deno.land/std@0.224.0/path/mod.ts";

// Every import is:
// - Explicitly versioned (@0.224.0)
// - Auditable (can read the source at the URL)
// - Immutable (CDN-cached at specific version)
// - No hidden transitive dependencies
```

**Decision Criterion**: Is this dependency necessary and trustworthy?
- Prefer Deno standard library
- For external deps: Use specific versions, review source
- Document why each external dependency is needed

---

## Applying the Principles

### Module Design Checklist

When creating a new module, verify:

- [ ] **Single Responsibility**: Module does ONE thing well
- [ ] **Pure Functions**: Functions return data, avoid side effects
- [ ] **Structured I/O**: Returns structured data, not just text
- [ ] **Text-Based Config**: Configuration is readable TypeScript
- [ ] **Leverage Existing**: Uses Deno std lib where possible
- [ ] **Minimal Output**: Quiet by default, verbose on request
- [ ] **Explicit Permissions**: Declares minimum permissions needed

### Code Review Questions

Ask these questions during review:

1. **Single Responsibility**: Can you describe this module in one sentence?
2. **Composability**: Can this function be used in different contexts?
3. **Testability**: Can this be tested without complex setup?
4. **Explicitness**: Are all dependencies and permissions clear?
5. **Simplicity**: Could this be simpler while achieving the same goal?

---

## Examples in Practice

### Example 1: Health Check Utility

```typescript
#!/usr/bin/env -S deno run --allow-net

/**
 * Single responsibility: Check site health
 * Composable: Returns structured data
 * Minimal output: Only when run directly
 * Explicit permissions: Only network access needed
 */

interface HealthCheck {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime: number;
}

export async function checkHealth(port: number): Promise<HealthCheck> {
  const start = Date.now();

  try {
    const response = await fetch(`http://localhost:${port}/health`, {
      signal: AbortSignal.timeout(5000)
    });

    const responseTime = Date.now() - start;

    return {
      service: `port-${port}`,
      status: response.ok ? 'healthy' : 'unhealthy',
      responseTime
    };
  } catch (error) {
    return {
      service: `port-${port}`,
      status: 'unhealthy',
      responseTime: Date.now() - start
    };
  }
}

// CLI interface when run directly
if (import.meta.main) {
  const ports = Deno.args.map(Number).filter(Boolean);
  const results = await Promise.all(ports.map(checkHealth));
  console.log(JSON.stringify(results, null, 2));
  Deno.exit(results.every(r => r.status === 'healthy') ? 0 : 1);
}
```

### Example 2: Configuration Validator

```typescript
// Single responsibility: Validate configuration
// Text-based: TypeScript configuration
// Leverage existing: Uses Zod for validation
// Structured output: Returns validation result

import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const SiteConfigSchema = z.object({
  siteName: z.string().min(1).max(50),
  port: z.number().int().min(1000).max(9999),
  features: z.array(z.string())
});

export type SiteConfig = z.infer<typeof SiteConfigSchema>;

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  config?: SiteConfig;
}

export function validateConfig(raw: unknown): ValidationResult {
  const result = SiteConfigSchema.safeParse(raw);

  if (result.success) {
    return {
      valid: true,
      errors: [],
      config: result.data
    };
  }

  return {
    valid: false,
    errors: result.error.errors.map(e => `${e.path}: ${e.message}`)
  };
}
```

---

## Common Anti-Patterns to Avoid

### ❌ Anti-Pattern 1: Magic Configuration

```typescript
// BAD: Implicit behavior based on magic strings
const config = {
  mode: "production" // What does this enable/disable?
};
```

```typescript
// GOOD: Explicit configuration
const config = {
  logLevel: "error",
  enableCaching: true,
  enableHotReload: false,
  compressionEnabled: true
};
```

### ❌ Anti-Pattern 2: Hidden Side Effects

```typescript
// BAD: Function modifies global state
let counter = 0;
function processData(data: string): string {
  counter++; // Hidden side effect!
  return data.toUpperCase();
}
```

```typescript
// GOOD: Pure function, explicit state management
function processData(data: string): string {
  return data.toUpperCase();
}

function trackProcessing(count: number): number {
  return count + 1;
}
```

### ❌ Anti-Pattern 3: Verbose by Default

```typescript
// BAD: Can't be composed quietly
function deploy() {
  console.log("Starting deployment...");
  console.log("Connecting to server...");
  console.log("Uploading files...");
  console.log("Restarting service...");
  console.log("Done!");
}
```

```typescript
// GOOD: Configurable verbosity
interface DeployOptions {
  verbose?: boolean;
}

function deploy(options: DeployOptions = {}) {
  const log = options.verbose ? console.log : () => {};

  log("Starting deployment...");
  // ... deployment logic ...
  log("Done!");

  return { success: true };
}
```

---

## Summary

Unix Philosophy + Deno = A development experience that:
- **Reduces complexity** through single-responsibility modules
- **Enhances security** through explicit permissions
- **Improves composability** through pure functions
- **Simplifies deployment** through direct execution
- **Increases maintainability** through clear patterns

**Remember**: These principles aren't restrictions - they're liberating constraints that make your code better by default.

---

## Next Steps

- **[03-architecture.md](./03-architecture.md)** - Apply these principles to system architecture
- **[04-development.md](./04-development.md)** - Learn development standards and patterns
- **[05-security.md](./05-security.md)** - Implement security-first development

---

**Core Insight**: When every piece does one thing well, the whole system becomes more powerful than the sum of its parts.
