# ADR-001: Use Column-Based Multi-Tenancy with site_key

## Status
ACCEPTED - Implemented across all sites

Date: 2025-01-15

## Context
We need to isolate data between multiple client sites while maintaining a single codebase and database instance. Each client's data must be completely separated to ensure security and privacy.

Options for multi-tenancy include:
- Separate databases per tenant
- Separate schemas per tenant
- Column-based isolation (site_key)
- Row-level security

## Decision
Use column-based multi-tenancy with `site_key` column on all tables.

Every query MUST filter by `site_key` to ensure data isolation.

## Rationale

### Unix Philosophy Alignment
- **Simplicity**: One table structure, clear filtering rule
- **Composability**: Standard query pattern applies everywhere
- **Explicit**: site_key visible in every query, no hidden magic
- **Text-Based**: Database schema is human-readable SQL

### Technical Benefits
1. **Performance**: Single query engine, optimized indexes
2. **Maintenance**: One schema to manage, not dozens
3. **Scalability**: Easy to add new sites
4. **Backup/Restore**: Single backup covers all tenants
5. **Migrations**: Apply once, affects all sites

## Alternatives Considered

### Alternative 1: Separate Databases
- **Pros**: Complete isolation, easier to scale horizontally
- **Cons**: Complex backup, difficult migrations, resource overhead
- **Why not chosen**: Overkill for current scale, adds operational complexity

### Alternative 2: Separate Schemas
- **Pros**: Better isolation than columns, easier than separate DBs
- **Cons**: Schema management complexity, connection pooling issues
- **Why not chosen**: Middle ground that adds complexity without enough benefit

### Alternative 3: Row-Level Security
- **Pros**: Database-enforced security
- **Cons**: PostgreSQL-specific, complex policies, performance overhead
- **Why not chosen**: Adds database-specific dependency, harder to audit

## Consequences

### Positive
- Simple to understand and implement
- Easy to audit (grep for "site_key")
- Good performance with proper indexes
- Database-agnostic approach
- Easy testing of isolation

### Negative
- Requires discipline (must always include site_key)
- Risk of data leakage if forgotten
- All tenants share database resources

### Mitigation Strategies
- **Code review**: Reject any query without site_key
- **Testing**: Automated tests verify isolation
- **Linting**: Consider custom lint rule to detect missing site_key
- **Documentation**: Clear patterns in meta-documentation

## Implementation Notes

### Required Schema Pattern
```sql
CREATE TABLE example (
  id INT PRIMARY KEY,
  site_key VARCHAR(50) NOT NULL,
  data TEXT,
  
  INDEX idx_site_key (site_key)
);
```

### Required Query Pattern
```typescript
// ALWAYS include site_key
await db.query(
  "SELECT * FROM table WHERE site_key = ?",
  [siteKey]
);
```

### Testing Requirements
- Multi-tenant isolation tests for each table
- SQL injection tests with site_key parameter
- Performance tests with site_key indexes

## Related Patterns
- Implementation: `docs/06-database.md`
- Testing: `docs/07-testing.md` (multi-tenant tests)
- Code examples: `core/database/queries.ts`

## Review and Maintenance

### Review Date
Quarterly - Next review: April 2025

### Success Criteria
- Zero data leakage incidents
- Query performance remains <100ms
- All new tables follow pattern
- 100% test coverage of isolation

### Revision History
- 2025-01-15: Initial draft and acceptance
- Reviewed by: Development Team
- Accepted by: Pedro M. Dominguez, CTO
