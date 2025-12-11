# Contributing to AIFA v2.1

Thank you for considering contributing to AIFA v2.1! This document provides guidelines and best practices for contributing to the project.

---

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Code Quality Standards](#code-quality-standards)
- [Testing Requirements](#testing-requirements)
- [Security Guidelines](#security-guidelines)
- [Documentation](#documentation)
- [Community Guidelines](#community-guidelines)

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL (or Neon account)
- Upstash Redis account (for rate limiting)
- Git

### Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/aifa-v2.1.git
   cd aifa-v2.1
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

4. **Run database migrations**
   ```bash
   npm run db:migrate
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

---

## Development Workflow

### Branch Naming Convention

Use descriptive branch names with prefixes:

- `feat/` - New features (e.g., `feat/user-profile`)
- `fix/` - Bug fixes (e.g., `fix/login-error`)
- `refactor/` - Code refactoring (e.g., `refactor/auth-utils`)
- `docs/` - Documentation updates (e.g., `docs/api-guide`)
- `chore/` - Maintenance tasks (e.g., `chore/update-deps`)
- `test/` - Test additions/updates (e.g., `test/auth-coverage`)

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Examples**:
```bash
feat(auth): add email verification flow

Implements email verification with secure tokens and expiry.
- Add email verification table
- Create verification email template
- Add verification API endpoint

Closes #123
```

```bash
fix(rate-limiter): implement fail-closed pattern for production

Prevents brute force attacks when Upstash is misconfigured.
Blocks login in production if rate limiter unavailable.

BREAKING CHANGE: Requires UPSTASH_REDIS_REST_URL in production
```

---

## Pull Request Guidelines

### **CRITICAL: PR Size Limit**

**All pull requests MUST be under 100 files** to work with CodeRabbit Free automated code review.

📖 **Read the complete guide**: [`docs/development/PR-SIZING-GUIDELINES.md`](docs/development/PR-SIZING-GUIDELINES.md)

#### Quick Rules

✅ **DO**:
- Keep PRs focused on a single feature/fix/refactor
- Aim for 20-50 files per PR
- Split large changes into sequential PRs
- Check file count before creating PR:
  ```bash
  git diff --name-only main... | wc -l
  ```

❌ **DON'T**:
- Mix multiple unrelated changes in one PR
- Include bulk formatting with feature changes
- Submit PRs with 100+ files

#### PR Size Labels

Add appropriate labels:
- `size/small` (1-10 files)
- `size/medium` (11-50 files)
- `size/large` (51-99 files)
- `size/too-large` (100+ files) ← **Needs splitting!**

### PR Checklist

Before submitting a PR, ensure:

- [ ] Code follows project conventions
- [ ] All tests pass locally
  ```bash
  npm run test
  npm run test:e2e
  ```
- [ ] Linting passes
  ```bash
  npm run biome:check
  npm run typecheck
  ```
- [ ] Security scan passes
  ```bash
  npm run semgrep
  ```
- [ ] **PR is under 100 files** (check with `git diff --name-only main... | wc -l`)
- [ ] Documentation updated (if needed)
- [ ] Commit messages follow conventional format
- [ ] PR description clearly explains changes

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [ ] Documentation update
- [ ] Refactoring (no functional changes)

## Changes Made
- Key change 1
- Key change 2
- Key change 3

## Testing
- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

## Screenshots (if applicable)
[Add screenshots for UI changes]

## File Count
**Files changed**: XX/100 ✅

## Related Issues
Closes #XXX
```

---

## Code Quality Standards

### TypeScript

- Use strict TypeScript settings
- Avoid `any` types (use `unknown` if needed)
- Prefer interfaces over types for objects
- Use generics for reusable components

### React/Next.js

- Use server components by default
- Add `"use client"` only when needed
- Use server actions with `"use server"`
- Implement proper error boundaries
- Use Suspense for async components

### Code Style

We use **Biome** for linting and formatting:

```bash
# Check code style
npm run biome:check

# Auto-fix issues
npm run biome:fix
```

**Note**: We do NOT use Prettier or ESLint. Biome handles both linting and formatting.

### Security

Run Semgrep before submitting:

```bash
npm run semgrep
```

Common security requirements:
- **Authentication**: Always use bcrypt for passwords
- **Rate Limiting**: Implement for all auth endpoints
- **Input Validation**: Sanitize all user inputs
- **XSS Prevention**: Use proper escaping
- **CSRF Protection**: Use `sameSite` cookies
- **SQL Injection**: Use parameterized queries

---

## Testing Requirements

### Unit Tests

- Write tests for all business logic
- Aim for 80%+ code coverage
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

```typescript
describe('checkLoginRateLimit', () => {
  it('should block login in production when rate limiter unavailable', async () => {
    // Arrange
    process.env.NODE_ENV = 'production';

    // Act
    const result = await checkLoginRateLimit('test@example.com');

    // Assert
    expect(result.success).toBe(false);
  });
});
```

### E2E Tests

- Test critical user flows
- Use Playwright for browser testing
- Test mobile and desktop viewports
- Include accessibility checks

```bash
# Run E2E tests
npm run test:e2e

# Run specific test
npm run test:e2e -- login.spec.ts
```

---

## Security Guidelines

### Authentication

- Never commit credentials
- Use environment variables for secrets
- Implement proper session management
- Add rate limiting to all auth endpoints

### Input Validation

- Validate all user inputs
- Sanitize HTML/SQL inputs
- Use Zod for schema validation
- Implement CSRF protection

### Data Protection

- Hash passwords with bcrypt (10+ rounds)
- Use secure cookies (httpOnly, secure, sameSite)
- Implement proper CORS policies
- Log security events

---

## Documentation

### Code Comments

- Write comments for complex logic
- Document API functions with JSDoc
- Explain "why" not "what"
- Keep comments up-to-date

### API Documentation

- Document all API endpoints
- Include request/response examples
- List error codes and messages
- Update OpenAPI spec (if applicable)

### User Documentation

- Update README for major features
- Add usage examples
- Include screenshots for UI changes
- Keep docs in sync with code

---

## Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Provide constructive feedback
- Focus on the code, not the person

### Getting Help

- Read existing documentation first
- Search closed issues for answers
- Ask questions in discussions
- Be specific about the problem

### Review Process

- Reviews typically take 1-3 days
- Address all review comments
- Request re-review when ready
- Be patient and respectful

---

## CI/CD Pipeline

Our GitHub Actions run:

1. **Type Checking** (`npm run typecheck`)
2. **Linting** (`npm run biome:check`)
3. **Security Scan** (`npm run semgrep`)
4. **Unit Tests** (`npm run test`)
5. **E2E Tests** (`npm run test:e2e`)
6. **Build** (`npm run build`)

All checks must pass before merging.

---

## Release Process

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create release branch
4. Run full test suite
5. Merge to main
6. Tag release
7. Deploy to production

---

## Additional Resources

- [PR Sizing Guidelines](docs/development/PR-SIZING-GUIDELINES.md) ⭐ **Read this first!**
- [Security Documentation](docs/security/)
- [API Documentation](docs/api/)
- [Architecture Overview](docs/architecture/)
- [Testing Guide](docs/testing/)

---

## Questions?

- Open an issue for bugs
- Start a discussion for questions
- Check existing documentation
- Contact maintainers

---

**Thank you for contributing to AIFA v2.1!** 🎉
