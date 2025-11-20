# Contributing to DenoGenesis Meta-Documentation

Thank you for your interest in contributing to the DenoGenesis Meta-Documentation framework!

## Philosophy

This meta-documentation framework is built on Unix Philosophy principles and aims to maintain:
- **Simplicity**: Complexity is the enemy
- **Clarity**: Documentation should be self-evident
- **Consistency**: Patterns should be uniform
- **Practical**: Real-world validation over theory

## How to Contribute

### 1. Understanding the Framework

Before contributing, please:
1. Read [README.md](./README.md) for overview
2. Study [docs/01-philosophy.md](./docs/01-philosophy.md) for core philosophy
3. Review existing patterns in other documentation modules
4. Understand the Unix Philosophy principles being applied

### 2. Types of Contributions

We welcome:

#### Documentation Improvements
- Clarifying existing explanations
- Adding practical examples
- Fixing typos and grammar
- Improving organization

#### Pattern Additions
- New architectural patterns (with ADR)
- Additional code examples
- Real-world use cases
- Decision trees and checklists

#### Framework Extensions
- TypeScript utilities in mod.ts
- Validation functions
- Compliance checkers
- Tooling improvements

### 3. Contribution Process

#### For Documentation Changes

1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/deno-genesis-meta-docs.git
   cd deno-genesis-meta-docs
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b docs/improve-security-section
   ```

3. **Make Changes**
   - Follow existing documentation style
   - Use clear, concise language
   - Include practical examples
   - Add code samples where helpful

4. **Test Locally**
   ```bash
   # Verify markdown formatting
   deno fmt --check

   # Check for broken links
   deno run --allow-read scripts/check-links.ts
   ```

5. **Commit with Clear Message**
   ```bash
   git commit -m "docs: improve security patterns section

   - Add defense-in-depth examples
   - Clarify permission model
   - Include real-world scenarios"
   ```

6. **Submit Pull Request**
   - Reference related issues
   - Explain rationale for changes
   - Note any breaking changes

#### For Pattern/Architecture Changes

**IMPORTANT**: Architectural changes require an ADR (Architectural Decision Record).

1. **Create ADR**
   ```bash
   cp docs/templates/adr-template.md docs/adr/ADR-NNN-your-decision.md
   ```

2. **Fill Out ADR**
   - **Context**: Why is this decision needed?
   - **Decision**: What are you proposing?
   - **Rationale**: Why is this the right choice?
   - **Alternatives**: What else was considered?
   - **Consequences**: What are the trade-offs?

3. **Implement Pattern**
   - Update relevant documentation
   - Add code examples
   - Include tests if applicable
   - Update navigation/links

4. **Get Review**
   - Architectural changes require maintainer review
   - Be prepared to discuss alternatives
   - Expect iterative refinement

### 4. Code Style Guidelines

#### Documentation Style

```markdown
# Clear, Descriptive Heading

Brief introduction paragraph explaining the concept.

## Sub-Heading

Explanatory text with specific details.

### Code Examples

Always include both ❌ WRONG and ✅ CORRECT examples:

```typescript
// ❌ WRONG: Anti-pattern example
function badExample() {
  // Show what NOT to do
}

// ✅ CORRECT: Proper pattern
function goodExample() {
  // Show the right way
}
\`\`\`

**Outcome**: Explain the benefit or result of following the pattern.
```

#### TypeScript Style

```typescript
/**
 * Clear JSDoc comment explaining purpose
 *
 * @param param Description of parameter
 * @returns Description of return value
 */
export function utilityFunction(param: string): Result {
  // Implementation
}
```

### 5. Review Process

1. **Automated Checks**
   - Markdown linting
   - TypeScript type checking
   - Link validation
   - Spell checking

2. **Maintainer Review**
   - Philosophy alignment
   - Pattern consistency
   - Practical applicability
   - Documentation quality

3. **Community Feedback**
   - Real-world validation
   - Use case verification
   - Clarity assessment

### 6. What We Look For

#### ✅ Good Contributions

- **Clear rationale**: Explain WHY, not just WHAT
- **Practical examples**: Real-world, runnable code
- **Philosophy alignment**: Follows Unix principles
- **Well-documented**: Clear explanation and usage
- **Tested patterns**: Validated in production

#### ❌ Avoid

- **Theoretical complexity**: Academic without practical value
- **Framework-specific**: Tied to particular libraries
- **Undocumented magic**: Clever code without explanation
- **Breaking consistency**: Deviates from established patterns
- **Incomplete**: Missing examples or rationale

### 7. Getting Help

- **Questions**: Open a GitHub discussion
- **Bugs**: File an issue with reproduction steps
- **Ideas**: Start with a proposal issue
- **Urgent**: Email info@domingueztechsolutions.com

### 8. Community Standards

#### Code of Conduct

- **Be respectful**: Treat all contributors with respect
- **Be constructive**: Criticism should be helpful
- **Be patient**: Not everyone has the same experience level
- **Be open**: Different perspectives improve the framework

#### Attribution

- All contributors will be acknowledged
- Significant contributions noted in release notes
- Pattern creators credited in documentation

### 9. Release Process

1. **Version Numbering**: Semantic versioning (MAJOR.MINOR.PATCH)
2. **Changelog**: All changes documented
3. **Migration Guide**: Breaking changes explained
4. **JSR Publication**: Automated via GitHub Actions

### 10. License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## Quick Reference

### Commit Message Format

```
type(scope): brief description

Longer explanation if needed.

- Bullet points for details
- Reference issues: #123
```

**Types**: docs, feat, fix, refactor, test, chore

### File Naming

- Documentation: `kebab-case.md`
- TypeScript: `kebab-case.ts`
- ADRs: `ADR-NNN-descriptive-title.md`

### Documentation Structure

```
docs/
├── NN-topic.md          # Main topic docs (numbered)
├── adr/                 # Architectural Decision Records
│   └── ADR-NNN-*.md
├── examples/            # Extended code examples
│   └── *.ts
└── templates/           # Templates for contributors
    └── *.md
```

---

## Questions?

- **Documentation**: See [README.md](./README.md)
- **Philosophy**: See [docs/01-philosophy.md](./docs/01-philosophy.md)
- **Patterns**: See other docs/ files
- **Contact**: info@domingueztechsolutions.com

**Thank you for helping make software development better!**

---

*"Simplicity is the ultimate sophistication."* - Leonardo da Vinci
