# CodeRabbit Path Filters - Per-PR Configuration Guide

## Overview

CodeRabbit Free has a **100-file limit** per review. This guide explains how to adjust `.coderabbit.yaml` path filters for different types of work.

## Current File Distribution

```
app/                 ~57 files   ✅ Core application logic
lib/                 ~13 files   ✅ Shared utilities
components/          ~87 files   ⚠️  Large UI component library
hooks/               ~8 files    📦 React hooks
providers/           ~5 files    📦 Context providers
types/               ~4 files    📦 TypeScript definitions
config/              ~3 files    📦 Configuration
scripts/             ~3 files    📦 Build utilities
```

**Default configuration**: `app/**` + `lib/**` = **70 files** (under limit)

---

## Default Configuration (Backend/API Work)

**When to use:** Most PRs involving server actions, API routes, authentication, database logic.

**Files reviewed:** ~70 files
- ✅ `app/**` - Next.js app router, server actions, route handlers
- ✅ `lib/**` - Shared business logic, utilities, database queries

**Edit `.coderabbit.yaml`:**
```yaml
path_filters:
  - "app/**"
  - "lib/**"
  # Other directories commented out
```

---

## UI-Focused Configuration

**When to use:** PRs primarily modifying React components, UI layouts, styling.

**Files reviewed:** ~87 files (still under 100)
- ✅ `components/**` - React components, UI elements
- ❌ `app/**` - Excluded (backend logic not changing)
- ❌ `lib/**` - Excluded (utilities not changing)

**Edit `.coderabbit.yaml`:**
```yaml
path_filters:
  # - "app/**"        # Commented out for UI work
  # - "lib/**"        # Commented out for UI work
  - "components/**"   # Enabled for UI review
```

---

## Full-Stack Configuration (Use Carefully)

**When to use:** PRs touching both frontend and backend significantly.

**Files reviewed:** ~157 files (⚠️ **exceeds 100-file limit**)
- ⚠️ This configuration will skip CodeRabbit review due to size

**Strategy:** Split into multiple PRs:
1. **Backend PR**: `app/**` + `lib/**`
2. **Frontend PR**: `components/**` + `hooks/**` + `providers/**`

---

## Infrastructure/Config Configuration

**When to use:** Build system changes, configuration updates, CI/CD modifications.

**Files reviewed:** ~19 files
- ✅ `config/**` - Configuration files
- ✅ `scripts/**` - Build and utility scripts
- ❌ Application code excluded

**Edit `.coderabbit.yaml`:**
```yaml
path_filters:
  # - "app/**"      # Commented out
  # - "lib/**"      # Commented out
  - "config/**"     # Enabled for config review
  - "scripts/**"    # Enabled for scripts review
```

---

## Workflow for Adjusting Path Filters

### Before Creating a PR

1. **Identify affected directories:**
   ```bash
   git diff main --name-only | cut -d'/' -f1 | sort -u
   ```

2. **Count files in those directories:**
   ```bash
   find app lib -type f -name "*.ts" -o -name "*.tsx" | grep -v test | wc -l
   ```

3. **Edit `.coderabbit.yaml`:**
   - Keep only directories you're modifying
   - Ensure total stays under 100 files
   - Comment out unused directories with explanatory notes

4. **Commit the path filter change on your feature branch:**
   ```bash
   git add .coderabbit.yaml
   git commit -m "chore: adjust CodeRabbit path filters for [type] work"
   ```

### After PR is Merged

**Option 1:** Keep the narrowed configuration (recommended)
- Maintains focus on core application logic
- Keeps future PRs under file limit

**Option 2:** Restore broader configuration
- Only if you need different directories reviewed
- Update before next PR based on work type

---

## Quick Reference

| PR Type | Directories | File Count | Command |
|---------|-------------|------------|---------|
| **Backend/API** (default) | `app/`, `lib/` | ~70 | Keep as-is |
| **UI Components** | `components/` | ~87 | Uncomment `components/**` |
| **React Hooks** | `hooks/`, `providers/` | ~13 | Uncomment hooks/providers |
| **Infrastructure** | `config/`, `scripts/` | ~6 | Uncomment config/scripts |
| **Types Only** | `types/` | ~4 | Uncomment `types/**` |

---

## Examples

### Example 1: Authentication PR

**Changes:** Login flow, rate limiting, server actions
**Directories:** `app/@left/(_AUTH)/`, `lib/auth/`
**Configuration:** Default (app + lib)
**Action:** No change needed ✅

---

### Example 2: Component Library Refactor

**Changes:** Button, Input, Card components
**Directories:** `components/ui/`
**Configuration:** UI-focused
**Action:**
1. Comment out `app/**` and `lib/**`
2. Uncomment `components/**`
3. Commit change
4. Create PR

---

### Example 3: CI/CD Pipeline Update

**Changes:** GitHub Actions workflows, build scripts
**Directories:** `.github/workflows/`, `scripts/`
**Configuration:** Infrastructure
**Action:**
1. Comment out `app/**` and `lib/**`
2. Uncomment `scripts/**`
3. Note: `.github/` is excluded by default in path_filters
4. Commit change

---

## Troubleshooting

### CodeRabbit skips review with "too many files"

**Solution:**
1. Check current file count:
   ```bash
   find app lib components -name "*.ts" -o -name "*.tsx" | wc -l
   ```
2. If > 100, reduce scope in `.coderabbit.yaml`
3. Commit and push updated config
4. Re-run CodeRabbit (comment `@coderabbitai review`)

### Need to review specific file outside included paths

**Solution:**
1. Temporarily add that directory to `path_filters`
2. Create PR with updated config
3. After review, revert config or keep for future PRs

---

## Best Practices

1. **Default to app + lib**: Covers most backend work (70 files)
2. **Single focus per PR**: Don't mix UI and backend changes
3. **Commit config changes**: Always commit `.coderabbit.yaml` updates
4. **Document in PR description**: Note which directories are in scope
5. **Verify file count**: Before creating PR, check you're under 100 files

---

## Related Files

- `.coderabbit.yaml` - Main configuration file
- `docs/development/CODERABBIT-SETUP.md` - General CodeRabbit setup
- `.github/workflows/ci.yml` - CI pipeline with CodeRabbit integration

---

**Last Updated:** 2025-12-11
**Maintained By:** Development Team
