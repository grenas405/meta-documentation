# Testing: Validation and Quality Assurance

**Security boundaries, isolation, and regression prevention**

---

## Testing Philosophy

Tests should:
1. Verify framework patterns are followed
2. Ensure multi-tenant isolation works
3. Validate security boundaries
4. Prevent regressions

---

## Unit Testing

```typescript
// test/utils/validation.test.ts
import { assertEquals, assertThrows } from "https://deno.land/std@0.224.0/testing/asserts.ts";
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
      port: -1,
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

## Integration Testing

```typescript
// test/integration/site-startup.test.ts
describe("Site Startup Integration", () => {
  let serverProcess: Deno.ChildProcess;
  
  beforeAll(async () => {
    serverProcess = new Deno.Command("deno", {
      args: ["run", "--allow-all", "sites/domtech/mod.ts"],
      env: { "DENO_ENV": "test", "PORT": "3099" }
    }).spawn();
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  });
  
  afterAll(() => {
    serverProcess.kill();
  });
  
  it("should respond to health check", async () => {
    const response = await fetch("http://localhost:3099/health");
    assertEquals(response.status, 200);
    
    const data = await response.json();
    assertEquals(data.status, "healthy");
  });
});
```

---

## Security Testing

```typescript
// test/security/multi-tenant-isolation.test.ts
Deno.test("Multi-tenant isolation", async () => {
  const site1 = "test-site-1";
  const site2 = "test-site-2";
  
  await createBlog(site1, { title: "Site 1", content: "Content" });
  await createBlog(site2, { title: "Site 2", content: "Content" });
  
  const site1Blogs = await getAllBlogs(site1);
  assertEquals(site1Blogs.length, 1);
  assertEquals(site1Blogs[0].title, "Site 1");
  
  // Cleanup
  await cleanup([site1, site2]);
});

Deno.test("SQL injection prevention", async () => {
  const siteKey = "test-site";
  const maliciousSlug = "'; DROP TABLE blogs; --";
  
  const result = await getBlog(siteKey, maliciousSlug);
  
  // Query should complete safely
  assertEquals(result, null);
  
  // Table should still exist
  const tableExists = await db.query("SHOW TABLES LIKE 'blogs'");
  assertEquals(tableExists.length, 1);
});
```

---

## Running Tests

```bash
# Run all tests
deno test --allow-all

# Run specific test file
deno test --allow-all test/utils/validation.test.ts

# Run with coverage
deno test --allow-all --coverage=coverage/

# Generate coverage report
deno coverage coverage/
```

---

## Test Coverage Requirements

- **Core utilities**: 90%+ coverage
- **Security functions**: 100% coverage
- **Database queries**: Multi-tenant isolation tests required
- **API endpoints**: Integration tests required

---

**Remember**: Tests are documentation that never goes out of date.
