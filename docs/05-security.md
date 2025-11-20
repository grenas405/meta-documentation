# Security: Defense in Depth

**Multi-layered security through explicit permissions and validation**

---

## Overview

DenoGenesis implements security-first development through multiple layers of defense. This isn't "security through obscurity" - it's security through explicit, auditable boundaries.

---

## The Five Security Layers

### Layer 1: Runtime Permissions (Deno)

Enforced by Deno runtime, cannot be bypassed.

```typescript
#!/usr/bin/env -S deno run --allow-read=./config --allow-net=localhost

/**
 * Security boundary defined at runtime invocation
 * 
 * ALLOWED:
 * - Read files in ./config directory
 * - Network access to localhost only
 * 
 * DENIED:
 * - Write operations
 * - Network access to external hosts
 * - Environment variable access
 * - System command execution
 */
```

**Best Practices:**
- Use most specific permissions possible
- Document WHY each permission is needed
- Review permissions in code review
- Audit permission changes carefully

---

### Layer 2: Input Validation (Application)

Validate and sanitize all user input.

```typescript
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Define schema for validation
const BlogSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().max(50000),
  author: z.string().min(1).max(100),
  status: z.enum(["draft", "published", "archived"]),
});

export async function createBlog(
  siteKey: string,
  rawData: unknown
): Promise<Blog> {
  // Validate input structure
  const data = BlogSchema.parse(rawData);
  
  // Additional business logic validation
  if (await blogSlugExists(siteKey, generateSlug(data.title))) {
    throw new Error("Blog with this title already exists");
  }
  
  // Proceed with creation
  return await db.createBlog(siteKey, data);
}
```

**Validation utilities:**

```typescript
// Sanitization utilities
export function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .substring(0, 1000); // Limit length
}

export function sanitizeInteger(
  input: unknown,
  min = 0,
  max = Number.MAX_SAFE_INTEGER
): number {
  const num = Number(input);
  
  if (isNaN(num) || !Number.isInteger(num)) {
    throw new Error('Input must be a valid integer');
  }
  
  if (num < min || num > max) {
    throw new Error(`Integer must be between ${min} and ${max}`);
  }
  
  return num;
}

// Path traversal prevention
export function sanitizePath(input: string): string {
  return input
    .replace(/\.\./g, '') // Remove parent directory references
    .replace(/[^a-zA-Z0-9-_./]/g, '') // Allow only safe characters
    .replace(/\/+/g, '/') // Collapse multiple slashes
    .replace(/^\/+|\/+$/g, ''); // Remove leading/trailing slashes
}
```

---

### Layer 3: SQL Parameterization (Database)

Never concatenate SQL, always use parameterized queries.

```typescript
// ❌ NEVER DO THIS: SQL injection vulnerability
async function getBlog(siteKey: string, slug: string) {
  const query = `SELECT * FROM blogs WHERE site_key = '${siteKey}' AND slug = '${slug}'`;
  return await db.query(query);
}

// ✅ ALWAYS DO THIS: Parameterized query
async function getBlog(siteKey: string, slug: string): Promise<Blog | null> {
  const result = await db.query(
    "SELECT * FROM blogs WHERE site_key = ? AND slug = ?",
    [siteKey, slug]
  );
  
  return result[0] || null;
}
```

---

### Layer 4: Authentication & Authorization (Middleware)

Verify identity and permissions.

```typescript
export function requireAuth(req: Request): Response | null {
  const authHeader = req.headers.get("Authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response("Unauthorized", { status: 401 });
  }
  
  const token = authHeader.slice(7);
  
  try {
    const payload = verifyJWT(token);
    
    // Check token expiration
    if (payload.exp < Date.now() / 1000) {
      return new Response("Token expired", { status: 401 });
    }
    
    // Attach user to request context
    (req as any).user = payload;
    
    return null; // Authentication successful
    
  } catch (error) {
    return new Response("Invalid token", { status: 401 });
  }
}

// Usage in routes
export async function protectedRoute(req: Request): Promise<Response> {
  const authResult = requireAuth(req);
  if (authResult) return authResult;
  
  const user = (req as any).user;
  return new Response(`Hello, ${user.name}`);
}
```

---

### Layer 5: Multi-Tenant Isolation (Architecture)

Ensure data isolation through site_key.

```typescript
// CRITICAL: All queries must include site_key
export async function getUserBlogs(
  siteKey: string,
  userId: string
): Promise<Blog[]> {
  // Both site_key AND user_id filtering
  return await db.query(
    "SELECT * FROM blogs WHERE site_key = ? AND author_id = ?",
    [siteKey, userId]
  );
}
```

---

## Security Review Checklist

Before merging any code, verify:

- [ ] Deno permissions are minimal and explicit
- [ ] All user input is validated with schemas
- [ ] SQL queries use parameterization
- [ ] Authentication is required for protected routes
- [ ] site_key filtering on all database queries
- [ ] Sensitive data is not logged
- [ ] Error messages don't leak system information
- [ ] File uploads are validated and sanitized
- [ ] Rate limiting on public endpoints
- [ ] HTTPS enforced in production

---

## Rate Limiting

```typescript
interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export class RateLimiter {
  private requests = new Map<string, number[]>();
  
  constructor(private config: RateLimitConfig) {}
  
  check(clientId: string): boolean {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    
    let requests = this.requests.get(clientId) || [];
    requests = requests.filter(time => time > windowStart);
    
    if (requests.length >= this.config.maxRequests) {
      return false; // Rate limit exceeded
    }
    
    requests.push(now);
    this.requests.set(clientId, requests);
    return true;
  }
}

// Usage
const limiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100
});

export async function handleRequest(req: Request): Promise<Response> {
  const clientId = req.headers.get("x-forwarded-for") || "unknown";
  
  if (!limiter.check(clientId)) {
    return new Response("Too many requests", { status: 429 });
  }
  
  // Process request
}
```

---

## Common Security Vulnerabilities to Avoid

### 1. SQL Injection
**Risk**: Attackers can execute arbitrary SQL
**Prevention**: Always use parameterized queries

### 2. Cross-Site Scripting (XSS)
**Risk**: Malicious scripts in user content
**Prevention**: Sanitize input, escape output

### 3. Cross-Site Request Forgery (CSRF)
**Risk**: Unauthorized actions on behalf of user
**Prevention**: CSRF tokens, SameSite cookies

### 4. Path Traversal
**Risk**: Access to unauthorized files
**Prevention**: Sanitize file paths, validate against whitelist

### 5. Multi-Tenant Data Leakage
**Risk**: Users accessing other tenants' data
**Prevention**: Always filter by site_key

---

## Next Steps

- **[06-database.md](./06-database.md)** - Multi-tenant security patterns
- **[07-testing.md](./07-testing.md)** - Security testing strategies

---

**Core Principle**: Security is not optional - it's foundational.
