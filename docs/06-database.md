# Database: Multi-Tenant Patterns

**Column-based isolation for secure data separation**

---

## Overview

DenoGenesis uses `site_key` column-based multi-tenancy for data isolation. Every database query MUST include site_key filtering to prevent data leakage between tenants.

---

## Multi-Tenant Architecture

```typescript
/**
 * CRITICAL PATTERN: Every query MUST include site_key
 * 
 * This ensures:
 * 1. Data isolation between sites
 * 2. No cross-contamination of client data
 * 3. Simple, auditable security boundary
 */

// ❌ WRONG: Global query without site_key
async function getAllBlogs(): Promise<Blog[]> {
  // DANGER: Returns blogs from ALL sites!
  return await db.query("SELECT * FROM blogs");
}

// ✅ CORRECT: Always filter by site_key
export async function getAllBlogs(siteKey: string): Promise<Blog[]> {
  return await db.query(
    "SELECT * FROM blogs WHERE site_key = ?",
    [siteKey]
  );
}

export async function getBlogById(
  siteKey: string,
  blogId: number
): Promise<Blog | null> {
  const result = await db.query(
    "SELECT * FROM blogs WHERE site_key = ? AND id = ?",
    [siteKey, blogId]
  );
  
  return result.length > 0 ? result[0] : null;
}

export async function createBlog(
  siteKey: string,
  data: Omit<Blog, "id" | "site_key">
): Promise<Blog> {
  const result = await db.query(
    `INSERT INTO blogs (site_key, title, content, author, created_at)
     VALUES (?, ?, ?, ?, NOW())`,
    [siteKey, data.title, data.content, data.author]
  );
  
  return {
    id: result.insertId,
    site_key: siteKey,
    ...data,
  };
}
```

---

## Database Schema Patterns

```sql
-- ✅ CORRECT: Multi-tenant table with proper indexing
CREATE TABLE blogs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  site_key VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  content TEXT,
  author VARCHAR(100),
  status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- CRITICAL: Composite index for multi-tenant queries
  INDEX idx_site_key_status (site_key, status),
  INDEX idx_site_key_created (site_key, created_at DESC),
  
  -- Unique constraint within site
  UNIQUE KEY unique_slug_per_site (site_key, slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Schema Requirements:**
- **site_key column** on all tenant-specific tables
- **Composite indexes** starting with site_key
- **Unique constraints** include site_key
- **Foreign keys** respect site_key boundaries

---

## Connection Management

```typescript
// In site's mod.ts
import { db, initializeDatabase, closeDatabaseConnection } from "../../core/database/client.ts";
import { SITE_CONFIG } from "./site-config.ts";

// Initialize database connection
await initializeDatabase();

// Register cleanup handlers
Deno.addSignalListener("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await closeDatabaseConnection();
  Deno.exit(0);
});

Deno.addSignalListener("SIGTERM", async () => {
  console.log("Shutting down gracefully...");
  await closeDatabaseConnection();
  Deno.exit(0);
});
```

---

## Query Optimization

### Avoid N+1 Queries

```typescript
// ❌ WRONG: N+1 query problem
async function getBlogsWithAuthors(siteKey: string) {
  const blogs = await db.query(
    "SELECT * FROM blogs WHERE site_key = ?",
    [siteKey]
  );
  
  for (const blog of blogs) {
    blog.author = await db.query(
      "SELECT * FROM authors WHERE id = ?",
      [blog.author_id]
    );
  }
  
  return blogs;
}

// ✅ CORRECT: Single JOIN query
async function getBlogsWithAuthors(siteKey: string) {
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

---

## Testing Multi-Tenant Isolation

```typescript
Deno.test("Multi-tenant isolation - blogs", async () => {
  const site1 = "test-site-1";
  const site2 = "test-site-2";
  
  // Create blogs for two different sites
  await createBlog(site1, { title: "Site 1 Blog", content: "Content 1" });
  await createBlog(site2, { title: "Site 2 Blog", content: "Content 2" });
  
  // Verify site 1 can only see its blogs
  const site1Blogs = await getAllBlogs(site1);
  assertEquals(site1Blogs.length, 1);
  assertEquals(site1Blogs[0].title, "Site 1 Blog");
  
  // Verify site 2 can only see its blogs
  const site2Blogs = await getAllBlogs(site2);
  assertEquals(site2Blogs.length, 1);
  assertEquals(site2Blogs[0].title, "Site 2 Blog");
  
  // Cleanup
  await db.query("DELETE FROM blogs WHERE site_key IN (?, ?)", [site1, site2]);
});
```

---

## Summary

Multi-tenant database patterns:
- **Always include site_key** in queries
- **Index by site_key** for performance
- **Test isolation** thoroughly
- **Validate in code review** - no exceptions

---

**Critical Rule**: No query without site_key. Ever.
