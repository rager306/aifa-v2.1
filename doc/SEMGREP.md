# Semgrep Security Scanning

## Overview

Semgrep — SAST (Static Application Security Testing) tool for finding security vulnerabilities, bugs, and anti-patterns in code.

## Installation

Semgrep is installed via `uvx` (no need to install globally):

```bash
# Already installed via package.json
npm run semgrep
```

## Usage

### Local Development

```bash
# Full project scan
npm run semgrep

# Scan AI components only
npm run semgrep:ai

# Scan auth modules only
npm run semgrep:auth

# Scan API routes only
npm run semgrep:api

# Auto-detect rules (official registry)
npm run semgrep:auto
```

### CI/CD

```bash
# Generate JSON report for CI
npm run semgrep:ci

# Generate SARIF report for GitHub Code Scanning
npm run semgrep:sarif
```

## Configuration

### `.semgrep.yml`

Contains:
- **Official rulesets**: Next.js, OWASP Top 10, React security
- **Custom rules**:
  - AI Security (4 rules)
  - Auth Security (5 rules)
  - XSS & Injection (6 rules)

### Severity Levels

- **ERROR**: Critical vulnerabilities requiring immediate fixes
- **WARNING**: Potential issues requiring review
- **INFO**: Informational messages

## Priority Findings

### 1. Fake Authentication (CRITICAL)
**File**: `app/@left/(_AUTH)/login/(_server)/actions/auth.ts`
**Issue**: Accepts any credentials
**Fix**: Replace with bcrypt + database or OAuth

### 2. AI Prompt Injection (ERROR)
**File**: `app/api/chat/route.ts`
**Issue**: No validation of `messages` before sending to AI
**Fix**: Add Zod schema for message structure validation

### 3. No Rate Limiting (ERROR)
**File**: `app/@left/(_AUTH)/login/(_server)/actions/auth.ts`
**Issue**: No brute-force protection
**Fix**: Add `@upstash/ratelimit`

### 4. Session Fixation (WARNING)
**File**: `app/@left/(_AUTH)/login/(_server)/actions/auth.ts`
**Issue**: Static session value
**Fix**: Use `crypto.randomUUID()`

### 5. Error Disclosure (WARNING)
**File**: `app/api/chat/route.ts`
**Issue**: `error.message` in response
**Fix**: Log details, return generic message

## CI/CD Integration

### GitHub Actions

```yaml
- name: Semgrep Scan
  run: npm run semgrep:ci

- name: Upload SARIF
  uses: github/codeql-action/upload-sarif@v2
  with:
    sarif_file: semgrep.sarif
```

### Pre-commit Hook (Lefthook)

```yaml
pre-commit:
  commands:
    semgrep:
      run: npm run semgrep:ai && npm run semgrep:auth
```

## False Positives

If a rule gives false positive, add `# nosemgrep: rule-id` above the line:

```typescript
// nosemgrep: auth-weak-fake-authentication
if (email && password) { ... }
```

Or update `.semgrep.yml` with `pattern-not`.

## Additional Resources

- [Semgrep Docs](https://semgrep.dev/docs/)
- [Semgrep Registry](https://semgrep.dev/r)
- [OWASP LLM Top 10](https://owasp.org/www-project-top-10-for-large-language-model-applications/)
