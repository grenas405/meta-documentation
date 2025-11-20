# Decision Trees: Troubleshooting and Workflows

**Systematic approaches to common scenarios**

---

## Decision Tree: New Feature

```
Is this a new feature?
│
├─ YES → Does it fit existing patterns?
│        │
│        ├─ YES → Implement following pattern
│        │        Document in examples
│        │
│        └─ NO → Is pattern insufficient?
│                 │
│                 ├─ YES → Create ADR
│                 │        Propose new pattern
│                 │        Get review
│                 │
│                 └─ NO → Refactor to fit pattern
│
└─ NO → Is this a bug fix?
         │
         ├─ YES → Fix and add regression test
         │        Document if architectural
         │
         └─ NO → Documentation/refactoring
                  Update docs or add tests
```

---

## Troubleshooting: Data From Wrong Site

```
Problem: Query returning data from multiple sites
│
├─ Check 1: Does query include site_key filter?
│  │
│  ├─ NO → ADD: WHERE site_key = ?
│  │
│  └─ YES → Check 2: Is site_key value correct?
│           │
│           ├─ NO → Fix site_key parameter
│           │
│           └─ YES → Check 3: SQL injection?
│                     │
│                     ├─ YES → Use parameterized queries
│                     │
│                     └─ NO → Check indexes
│                               Run: EXPLAIN query
```

---

## Troubleshooting: Permission Denied

```
Problem: Deno permission errors
│
├─ Error: "Requires read access"
│  └─ Add: --allow-read=./path
│
├─ Error: "Requires write access"
│  └─ Add: --allow-write=./path
│
├─ Error: "Requires net access"
│  └─ Add: --allow-net=domain.com
│
└─ Error: "Requires env access"
   └─ Add: --allow-env=VAR_NAME

Principle: Only add MINIMUM permissions needed
```

---

## Troubleshooting: Performance Issues

```
Problem: Application slow
│
├─ Check 1: Database queries
│  ├─ Look for N+1 patterns
│  ├─ Run EXPLAIN on slow queries
│  ├─ Check for missing indexes
│  └─ Review site_key index usage
│
├─ Check 2: Network
│  ├─ Are static assets cached?
│  ├─ Is compression enabled?
│  └─ Consider CDN
│
└─ Check 3: Application code
   ├─ Profile with Deno profiler
   ├─ Check for blocking operations
   └─ Review connection pool settings
```

---

## Framework Compliance Checklist

### Unix Philosophy
- [ ] Single responsibility per module
- [ ] Composable functions/interfaces
- [ ] Text-based configuration
- [ ] Explicit dependencies
- [ ] Minimal output by default

### Security
- [ ] Explicit Deno permissions
- [ ] Input validation with schemas
- [ ] Parameterized SQL queries
- [ ] Multi-tenant isolation (site_key)
- [ ] Defense-in-depth implementation

### Architecture
- [ ] Follows hub-and-spoke pattern
- [ ] ADR for significant decisions
- [ ] Tests verify security boundaries
- [ ] Documentation updated
- [ ] Performance considered

### Code Quality
- [ ] Follows naming conventions
- [ ] Properly documented
- [ ] Type-safe
- [ ] No duplication
- [ ] Tests pass

---

## Decision: Where Does Code Belong?

```
Where should this code live?
│
├─ Shared across ALL sites?
│  └─ core/
│
├─ Site-specific logic?
│  └─ sites/[site-name]/
│
├─ Reusable UI component?
│  └─ shared-components/
│
└─ Development tooling?
   └─ scripts/ or deno-genesis-cli/
```

---

## Decision: Create New ADR?

```
Should I create an ADR?
│
├─ Affects system architecture?
│  └─ YES → Create ADR
│
├─ Changes API design?
│  └─ YES → Create ADR
│
├─ Introduces new dependency?
│  └─ YES → Create ADR
│
├─ Modifies security model?
│  └─ YES → Create ADR
│
└─ Implementation detail only?
   └─ NO → Document in code comments
```

---

## Quick Reference

### Common Commands

```bash
# Run tests
deno test --allow-all

# Format code
deno fmt

# Lint code
deno lint

# Type check
deno check mod.ts

# Run site
deno run --allow-all sites/domtech/mod.ts
```

### Common Patterns

```typescript
// Multi-tenant query
await db.query("SELECT * FROM table WHERE site_key = ?", [siteKey]);

// Input validation
const data = Schema.parse(rawData);

// Error handling
throw new DenoGenesisError("Message", "CODE", { context });

// CLI pattern
if (import.meta.main) { main(); }
```

---

## Summary

Decision trees provide:
- **Systematic approach**: Handle scenarios consistently
- **Quick reference**: Common solutions at hand
- **Quality gates**: Ensure standards maintained
- **Troubleshooting**: Debug efficiently

**Remember**: When in doubt, refer to the patterns. They're proven.

---

**Core Principle**: Good decisions come from good frameworks.
