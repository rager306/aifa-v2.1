# CodeRabbit Configuration Setup

**Date**: 2025-12-11
**Status**: ✅ Active
**Version**: 1.0.0

---

## Overview

CodeRabbit Free is configured for automated code reviews with a **100-file limit per PR**. This document explains the configuration and how to use it effectively.

---

## Configuration File

**Location**: `.coderabbit.yaml`

### Path Filters

CodeRabbit reviews these files:

✅ **INCLUDED**:
```yaml
- "app/**"           # Next.js app directory
- "components/**"    # React components
- "lib/**"           # Utility libraries
- "hooks/**"         # Custom React hooks
- "providers/**"     # Context providers
- "types/**"         # TypeScript types
- "config/**"        # Configuration files
- "scripts/**"       # Build/deploy scripts
- "public/**/*.ts"   # TypeScript in public
- "public/**/*.tsx"  # React in public
```

❌ **EXCLUDED**:
```yaml
- "!doc/**"          # Documentation
- "!docs/**"         # Documentation
- "!*.md"            # Markdown files
- "!**/*.md"         # All markdown
- "!e2e/**"          # E2E tests
- "!tests/**"        # Unit tests
- "!**/__tests__/**" # Test directories
- "!*.test.ts"       # Test files
- "!*.spec.ts"       # Spec files
- "!node_modules/**" # Dependencies
- "!.next/**"        # Build artifacts
- "!coordination/**" # Claude Flow internal
- "!memory/**"       # Claude Flow internal
```

---

## How It Works

### 1. File Counting

CodeRabbit only counts files that match the `path_filters` include patterns and don't match exclude patterns.

**Example PR**:
```
Total files changed: 150
- Source files (app, lib, components): 45 ✅ Counted
- Test files (tests, __tests__): 30 ❌ Excluded
- Documentation (*.md, docs): 25 ❌ Excluded
- Build artifacts (.next): 50 ❌ Excluded

CodeRabbit sees: 45 files ✅ Under 100-file limit
```

### 2. Review Triggers

CodeRabbit automatically reviews PRs when:
- PR is opened
- New commits are pushed
- PR is not in draft mode
- Base branch is `main`, `master`, `develop`, or `dev`

### 3. Review Focus

CodeRabbit is configured to focus on:
- Security vulnerabilities (XSS, injection, auth)
- Performance issues
- Code maintainability
- Next.js, React, TypeScript best practices
- Accessibility (a11y)

**NOT focused on** (handled by other tools):
- Code formatting (handled by Biome)
- Style preferences (handled by Biome)
- Security rules already covered by Semgrep

---

## Verifying Configuration

### Check File Count

Before creating a PR:

```bash
# Count files CodeRabbit will review
git diff --name-only main... | \
  grep -E "^(app|components|lib|hooks|providers|types|config|scripts)/" | \
  grep -v -E "\.(md)$|/__tests__/|\.test\.|\.spec\." | \
  wc -l
```

**Expected output**: `< 100` ✅

### Test Configuration Locally

Simulate CodeRabbit filtering:

```bash
# List files that WILL be reviewed
git diff --name-only main... | \
  grep -E "^(app|components|lib|hooks|providers|types|config|scripts)/" | \
  grep -v -E "\.(md)$|/__tests__/|\.test\.|\.spec\."

# List files that will be EXCLUDED
git diff --name-only main... | \
  grep -E "\.(md)$|^(docs?|tests?|e2e)/|/__tests__/|\.test\.|\.spec\."
```

---

## Common Scenarios

### Scenario 1: New Feature (Under Limit)

```bash
# Your changes
app/dashboard/page.tsx (new)
components/DashboardCard.tsx (new)
lib/api/dashboard.ts (new)
docs/dashboard.md (new)
tests/dashboard.test.ts (new)

# CodeRabbit sees
✅ app/dashboard/page.tsx
✅ components/DashboardCard.tsx
✅ lib/api/dashboard.ts
❌ docs/dashboard.md (excluded)
❌ tests/dashboard.test.ts (excluded)

Result: 3 files reviewed ✅
```

### Scenario 2: Large Refactor (Split Required)

```bash
# Your changes (150 files total)
app/**/[45 files]
components/**/[60 files]
tests/**/[45 files]

# CodeRabbit sees
✅ 105 source files (app + components)
❌ 45 test files (excluded)

Result: 105 files ❌ OVER LIMIT

Solution: Split into 2 PRs
1. PR #1: app/** changes (45 files) ✅
2. PR #2: components/** changes (60 files) ✅
```

### Scenario 3: Documentation Update (Fully Excluded)

```bash
# Your changes
README.md (modified)
docs/api.md (modified)
docs/guide.md (new)
CONTRIBUTING.md (modified)

# CodeRabbit sees
❌ All files excluded (*.md pattern)

Result: 0 files reviewed
Note: CodeRabbit will skip this PR (no source code changes)
```

---

## Troubleshooting

### Issue 1: "CodeRabbit Skipped - Too Many Files"

**Cause**: PR has 100+ files matching include patterns

**Solution**:
1. Check file count:
   ```bash
   git diff --name-only main... | \
     grep -E "^(app|components|lib)/" | \
     grep -v -E "\.md$|/__tests__/" | wc -l
   ```
2. If > 100, split the PR (see [PR-SIZING-GUIDELINES.md](PR-SIZING-GUIDELINES.md))

### Issue 2: "CodeRabbit Not Reviewing Test Changes"

**Cause**: Test files are excluded by design

**Solution**: This is intentional. Test files don't count toward the limit.

### Issue 3: "CodeRabbit Missing Important Files"

**Cause**: Files might not match include patterns

**Check**:
```bash
# Verify file should be included
echo "app/api/route.ts" | grep -E "^(app|components|lib)/"
# Output = file will be reviewed ✅
# No output = file is excluded ❌
```

**Fix**: Update `.coderabbit.yaml` path_filters if needed

---

## Customizing Configuration

### Add New Include Pattern

Edit `.coderabbit.yaml`:

```yaml
path_filters:
  # Existing patterns...
  - "app/**"
  - "components/**"

  # Add new pattern
  - "middleware/**"  # Review middleware files
```

### Add New Exclude Pattern

```yaml
path_filters:
  # Existing patterns...
  - "!tests/**"
  - "!docs/**"

  # Add new pattern
  - "!scripts/generated/**"  # Exclude generated scripts
```

### Adjust Review Settings

```yaml
reviews:
  # Enable/disable features
  poem: false              # Disable review poems (save tokens)
  auto_review:
    enabled: true
    drafts: false          # Don't auto-review draft PRs
```

---

## Best Practices

### ✅ DO

1. **Check file count before creating PR**
   ```bash
   git diff --name-only main... | wc -l
   ```

2. **Keep PRs focused** (20-50 files ideal)

3. **Split large changes** into logical chunks

4. **Use meaningful commit messages** (CodeRabbit reads them)

5. **Respond to CodeRabbit comments** (improves future reviews)

### ❌ DON'T

1. **Don't create 100+ file PRs** (exceeds limit)

2. **Don't mix unrelated changes** (feature + refactor + formatting)

3. **Don't ignore CodeRabbit suggestions** (they're often valuable)

4. **Don't commit generated files** (excluded anyway)

5. **Don't update `.coderabbit.yaml` without testing** (could break reviews)

---

## Monitoring and Metrics

### PR Size Distribution

Check your team's PR sizes:

```bash
# List recent PR file counts
gh pr list --state all --limit 20 --json number,files | \
  jq '.[] | {pr: .number, files: .files | length}'
```

### CodeRabbit Success Rate

Track CodeRabbit review completion:

```bash
# Check PRs reviewed by CodeRabbit
gh pr list --state all --limit 20 --json number,labels | \
  jq '.[] | select(.labels[]?.name == "coderabbit")'
```

---

## FAQ

### Q: Why exclude test files?

**A**: Test files:
- Don't count toward 100-file limit
- Are less critical than source code
- Are validated by test runners (Jest, Playwright)
- Help keep PRs under the limit

### Q: Can I force CodeRabbit to review a large PR?

**A**: No. CodeRabbit Free has a hard 100-file limit. Options:
1. Split the PR (recommended)
2. Upgrade to CodeRabbit Pro (unlimited files)
3. Skip CodeRabbit for this PR (use label `skip-coderabbit`)

### Q: Why does CodeRabbit skip my documentation PR?

**A**: Documentation files (*.md) are excluded. This is intentional to:
- Save review quota for source code
- Focus on code quality and security
- Keep PRs under the limit

### Q: How do I disable CodeRabbit for a specific PR?

**A**: Add label `skip-coderabbit` to the PR.

### Q: Does CodeRabbit review package.json changes?

**A**: Only if they're in the root directory and not excluded. Dependency changes are reviewed but lock files are excluded.

---

## Related Documentation

- [PR Sizing Guidelines](PR-SIZING-GUIDELINES.md) - How to keep PRs under 100 files
- [CONTRIBUTING.md](../../CONTRIBUTING.md) - General contribution guidelines
- [CodeRabbit Official Docs](https://docs.coderabbit.ai/)

---

## Updates and Changes

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-11 | Initial configuration with path_filters |

---

## Support

**Issues with CodeRabbit?**
1. Check this documentation first
2. Verify `.coderabbit.yaml` syntax
3. Test file count locally
4. Open an issue if problem persists

**Feature Requests?**
1. Discuss with team
2. Update `.coderabbit.yaml`
3. Test on a small PR
4. Document changes here

---

**Remember**: CodeRabbit is a tool to help, not replace, human code review. Use it to catch common issues, but always have team members review critical changes! 🤖✅
