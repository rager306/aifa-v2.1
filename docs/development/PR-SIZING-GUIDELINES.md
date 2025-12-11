# Pull Request Sizing Guidelines

**Version**: 1.0.0
**Last Updated**: 2025-12-11
**Status**: Active

---

## Overview

This document defines best practices for pull request (PR) sizing to ensure efficient code reviews, maintain CodeRabbit Free compatibility, and improve development velocity.

### Why PR Sizing Matters

1. **CodeRabbit Free Limit**: Reviews are limited to 100 files per PR
2. **Faster Reviews**: Smaller PRs get reviewed and merged faster
3. **Easier to Understand**: Focused changes are easier to review and test
4. **Better Git History**: Logical, atomic commits improve project history
5. **Reduced Conflicts**: Smaller PRs have fewer merge conflicts
6. **Lower Risk**: Smaller changes are easier to revert if issues arise

---

## The 100-File Rule

**CRITICAL**: Keep all pull requests **under 100 files** to ensure CodeRabbit Free can review them.

### What Counts Toward the Limit

✅ **Counted**:
- Source code files (`app/**`, `components/**`, `lib/**`)
- Configuration files (`.env.example`, `tsconfig.json`)
- Scripts and tooling
- Stylesheets and assets

❌ **Not Counted** (filtered by `.coderabbit.yaml`):
- Test files (`**/__tests__/**`, `*.test.ts`)
- Documentation (`docs/**`, `*.md`)
- Build artifacts (`node_modules/`, `.next/`)
- Lock files (`package-lock.json`)

### Checking File Count

```bash
# Count files in your PR that CodeRabbit will review
git diff --name-only main... | \
  grep -v -E '(\.md$|/__tests__/|\.test\.|\.spec\.|^(docs|tests|e2e)/|package-lock\.json)' | \
  wc -l
```

If the count exceeds **80 files**, consider splitting the PR.

---

## PR Sizing Best Practices

### ✅ Good PR Examples (Under 100 Files)

#### 1. **Single Feature Addition**
```
feat: add user profile page

Changes:
- app/profile/page.tsx (new)
- components/ProfileCard.tsx (new)
- lib/api/user.ts (modified)
- types/user.ts (modified)

Files changed: 4
```

#### 2. **Bug Fix**
```
fix: resolve login rate limiting issue

Changes:
- lib/auth/upstash-rate-limiter.ts (modified)
- app/@left/(_AUTH)/login/(_server)/actions/auth.ts (modified)

Files changed: 2
```

#### 3. **Focused Refactor**
```
refactor: extract authentication utilities

Changes:
- lib/auth/utils.ts (new)
- lib/auth/password.ts (modified)
- lib/auth/session.ts (modified)
- app/**/actions/auth.ts (modified × 3)

Files changed: 6
```

### ❌ Bad PR Examples (Over 100 Files)

#### 1. **Mixed Changes**
```
feat: add dashboard + fix bugs + update deps + format all files

Changes:
- 30 new dashboard components
- 15 bug fixes across codebase
- 80 files auto-formatted by Biome
- package.json dependency updates

Files changed: 125+ ❌
```

**Solution**: Split into 4 separate PRs:
1. `feat: add dashboard components` (30 files)
2. `fix: resolve critical bugs` (15 files)
3. `chore: update dependencies` (1 file)
4. `style: format codebase with Biome` (80 files, optional separate PR)

---

## How to Split Large PRs

### Strategy 1: Feature-Based Splitting

Break large features into incremental PRs:

```
Original PR: "Implement complete user management system" (150 files)

Split into:
1. PR #1: "feat: add user database schema and models" (5 files)
2. PR #2: "feat: implement user API endpoints" (8 files)
3. PR #3: "feat: add user management UI components" (12 files)
4. PR #4: "feat: integrate user management with auth" (6 files)
```

### Strategy 2: Separate Mechanical Changes

Move bulk edits to separate PRs:

```
Original PR: "Add feature X + format all files" (120 files)

Split into:
1. PR #1: "feat: add feature X" (40 files) ← Review with CodeRabbit
2. PR #2: "style: run Biome formatter" (80 files) ← Skip CodeRabbit, merge after tests pass
```

### Strategy 3: Dependency vs. Implementation

Separate infrastructure changes from feature implementation:

```
Original PR: "Add real-time notifications" (95 files)

Split into:
1. PR #1: "chore: add socket.io dependencies and config" (3 files)
2. PR #2: "feat: implement notification system" (45 files)
3. PR #3: "feat: add notification UI components" (47 files)
```

---

## Workflow for Large Changes

### Step 1: Plan the Split

```bash
# Create a feature branch from main
git checkout -b feature/large-change

# Make all your changes
# ... work work work ...

# Review total file count
git diff --name-only main...feature/large-change | wc -l
# Output: 150 files ❌
```

### Step 2: Create Sub-Branches

```bash
# From main, create first sub-branch
git checkout main
git checkout -b feature/large-change-part1

# Cherry-pick relevant commits or make changes
git cherry-pick <commit-hash>
# OR make focused changes

# Verify file count
git diff --name-only main...feature/large-change-part1 | wc -l
# Output: 40 files ✅

# Push and create PR #1
git push -u origin feature/large-change-part1
```

### Step 3: Sequential or Parallel PRs

**Sequential (Dependent Changes)**:
```bash
# PR #1 merged ✅
git checkout main
git pull

# Create PR #2 from updated main
git checkout -b feature/large-change-part2
```

**Parallel (Independent Changes)**:
```bash
# Create multiple branches from main simultaneously
git checkout main
git checkout -b feature/part1  # Independent work
git checkout main
git checkout -b feature/part2  # Independent work
git checkout main
git checkout -b feature/part3  # Independent work
```

---

## Special Cases

### Renaming/Moving Files

Large renames can exceed 100 files. Handle them separately:

```bash
# Create dedicated rename PR
git checkout -b refactor/rename-components

# Rename files (Git tracks this efficiently)
git mv old-name.tsx new-name.tsx
# ... rename all files ...

# Commit with descriptive message
git commit -m "refactor: rename components for consistency"

# Note in PR description:
# "This is a pure rename with no logic changes.
#  CodeRabbit review not required - tests confirm no breakage."
```

### Auto-Generated Code

Generated files (OpenAPI clients, Prisma schema, etc.):

```bash
# Separate PR for generator config changes
git checkout -b chore/update-api-generator
# Modify generator config only
# Files changed: 1-2 ✅

# Separate PR for regenerated code
git checkout -b chore/regenerate-api-client
# Run generator
# Files changed: 50+ (but marked as generated in .coderabbit.yaml)
```

### Dependency Updates

```bash
# Small dependency update
git checkout -b chore/update-react
npm install react@latest react-dom@latest
# Files changed: 1 (package.json) ✅

# Large dependency update (major versions)
git checkout -b chore/update-nextjs-15
npm install next@15
# Files changed: 1 (package.json)
# + update code in separate PR if needed
```

---

## PR Templates

### Feature PR Template

```markdown
## Description
Brief description of the feature

## Changes
- List of key changes
- Component additions
- API modifications

## Testing
- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Screenshots (if UI changes)
[Add screenshots]

## File Count
**Files changed**: XX/100 ✅
```

### Refactor PR Template

```markdown
## Refactor Goal
Why this refactor is needed

## Approach
High-level refactoring strategy

## Changes
- What was extracted/moved/renamed
- Architecture improvements

## Safety
- [ ] No behavior changes
- [ ] Tests still pass
- [ ] No breaking changes

## File Count
**Files changed**: XX/100 ✅
```

---

## CodeRabbit Integration

### Configuration

The `.coderabbit.yaml` file automatically filters out:
- Test files (`tests/**`, `**/__tests__/**`)
- Documentation (`docs/**`, `*.md`)
- Build artifacts (`node_modules/`, `.next/`)

### Monitoring Reviews

Check CodeRabbit status on PRs:

```bash
# PR shows one of these:
✅ "CodeRabbit review completed"       # Under 100 files
⚠️  "CodeRabbit skipped: too many files"  # Over 100 files
```

### Requesting Re-Review

After splitting a large PR:

```bash
# Close original large PR
gh pr close 123

# Open smaller PRs
gh pr create --title "feat: add feature (part 1/3)" --body "..."
gh pr create --title "feat: add feature (part 2/3)" --body "..."
gh pr create --title "feat: add feature (part 3/3)" --body "..."
```

---

## Team Guidelines

### For PR Authors

1. **Check file count BEFORE creating PR**
   ```bash
   git diff --name-only main... | wc -l
   ```

2. **Aim for 20-50 files per PR** (well under the 100 limit)

3. **Write clear PR descriptions** explaining the scope

4. **Link related PRs** if splitting a large feature

5. **Label appropriately**:
   - `size/small` (1-10 files)
   - `size/medium` (11-50 files)
   - `size/large` (51-99 files)
   - `size/too-large` (100+ files) ← Needs splitting

### For PR Reviewers

1. **Fast-track small PRs** (< 20 files)

2. **Request splitting** for PRs approaching 100 files

3. **Skip CodeRabbit for mechanical changes** (formatting, renames)

4. **Approve infrastructure PRs quickly** (dependency updates, config)

### For Project Maintainers

1. **Monitor PR size trends**
   ```bash
   gh pr list --state all --json number,files | \
     jq '.[] | select(.files > 50)'
   ```

2. **Update this guide** when patterns emerge

3. **Automate PR size checks** in CI/CD

---

## Automation

### GitHub Actions Check (Optional)

Create `.github/workflows/pr-size-check.yml`:

```yaml
name: PR Size Check

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  check-size:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Check file count
        run: |
          FILE_COUNT=$(git diff --name-only origin/${{ github.base_ref }}... | \
            grep -v -E '(\.md$|/__tests__/|\.test\.|\.spec\.|^(docs|tests|e2e)/|package-lock\.json)' | \
            wc -l)

          echo "Files changed: $FILE_COUNT"

          if [ $FILE_COUNT -gt 80 ]; then
            echo "::warning::PR has $FILE_COUNT files (approaching 100-file limit for CodeRabbit)"
          fi

          if [ $FILE_COUNT -gt 100 ]; then
            echo "::error::PR exceeds 100-file limit for CodeRabbit Free. Please split into smaller PRs."
            exit 1
          fi
```

---

## FAQ

### Q: What if I must change 100+ files?

**A**: Very rare cases (framework upgrades, mass renames) may justify this. Options:
1. Split into multiple sequential PRs (preferred)
2. Skip CodeRabbit review (add label `skip-coderabbit`)
3. Use CodeRabbit Pro (unlimited files)

### Q: Do test files count toward the limit?

**A**: No, they're excluded via `.coderabbit.yaml` `path_filters`.

### Q: Can I merge without CodeRabbit review?

**A**: Yes, but only for:
- Mechanical changes (formatting, renames)
- Documentation updates
- Dependency updates (if tests pass)

### Q: How do I calculate file count?

**A**: Use the command in "Checking File Count" section above.

### Q: What if my PR is at 95 files?

**A**: You're at risk. Either:
1. Remove non-essential changes
2. Split now before adding more

### Q: Can I combine multiple features in one PR?

**A**: No. One PR = One logical change (feature, bug fix, refactor).

---

## Resources

- [CodeRabbit Documentation](https://docs.coderabbit.ai/)
- [GitHub PR Best Practices](https://github.com/features/code-review)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)

---

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-12-11 | Initial version with 100-file rule and splitting strategies |

---

## Feedback

Questions or suggestions? Open an issue or contact the maintainers.

**Remember**: Smaller PRs = Faster reviews = Faster shipping! 🚀
