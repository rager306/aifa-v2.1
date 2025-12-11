# Git Path Escaping - Quick Reference

## The Problem
Bash interprets special characters as operators, breaking git commands:
```bash
# FAILS
git diff app/@left/(_AUTH)/login/(_server)/actions/auth.ts
# Error: bash: syntax error near unexpected token `('
```

## The Solution
Use the `--` separator to tell git "everything after is a path":
```bash
# WORKS
git diff -- "app/@left/(_AUTH)/login/(_server)/actions/auth.ts"
```

---

## Three Methods (in order of preference)

### Method 2: -- Separator (RECOMMENDED) ✓✓✓
```bash
git diff -- "path/with/(special).ts"
git add -- "file with spaces.ts"
git log -- "path/@with/symbols.ts"
```
**Why:** Works with all git commands, safe, prevents option injection

### Method 3: Array Approach (MOST ROBUST) ✓✓✓
```bash
declare -a cmd=("git" "diff" "--" "$path")
"${cmd[@]}"
```
**Why:** Most secure, handles all edge cases, no variable expansion issues

### Method 1: Double Quotes (SIMPLE) ✓✓
```bash
git diff -- "$path"
```
**Why:** Simple and readable, but less safe than alternatives

---

## Common Commands

```bash
# Show diff
git diff -- "app/@left/(_AUTH)/login/(_server)/actions/auth.ts"

# Stage file
git add -- "app/@left/(_AUTH)/login/(_server)/actions/auth.ts"

# Show status
git status -- "app/@left/(_AUTH)/login/(_server)/actions/auth.ts"

# Show log
git log -n 5 -- "app/@left/(_AUTH)/login/(_server)/actions/auth.ts"

# Show blame
git blame -- "app/@left/(_AUTH)/login/(_server)/actions/auth.ts"

# Checkout
git checkout -- "app/@left/(_AUTH)/login/(_server)/actions/auth.ts"

# Reset
git reset --hard -- "app/@left/(_AUTH)/login/(_server)/actions/auth.ts"

# Restore
git restore -- "app/@left/(_AUTH)/login/(_server)/actions/auth.ts"
```

---

## Batch Operations

```bash
# Multiple files
git add -- "file1.ts" "file (with) spaces.ts" "file@special.ts"

# Using arrays
files=("file1.ts" "file (2).ts")
git add -- "${files[@]}"

# Using find (most robust)
find . -name "*.ts" -print0 | xargs -0 git add --
```

---

## Helper Scripts

```bash
# Show diff safely
./scripts/git-safe-diff.sh "path/with/(special).ts"

# Batch operations
./scripts/git-safe-operations.sh add "path/with/(special).ts"
./scripts/git-safe-operations.sh status "path/with/(special).ts"
./scripts/git-safe-operations.sh log "path/with/(special).ts" 10

# Demo all methods
./scripts/git-escaping-demo.sh
```

---

## npm Scripts

```bash
npm run git:safe:diff "path/with/(special).ts"
npm run git:safe:ops status "path/with/(special).ts"
npm run git:escaping:demo
```

---

## Key Rules

1. **Always use `--` separator**
   ```bash
   git diff -- "$path"      # ✓ Good
   git diff "$path"         # ✗ Less safe
   ```

2. **Always quote variables**
   ```bash
   git add -- "$file"       # ✓ Good
   git add -- $file         # ✗ Bad (word splitting)
   ```

3. **Use arrays for complex scenarios**
   ```bash
   cmd=("git" "diff" "--" "$path")
   "${cmd[@]}"              # ✓ Best
   ```

4. **Test before using in scripts**
   ```bash
   ls -- "$path"            # Test escaping first
   git status -- "$path"    # Then try git
   ```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "syntax error near `(`" | Use `--` separator: `git diff -- "path"` |
| "No such file or directory" | Check file exists: `ls -- "path"` |
| Variable not expanding | Use double quotes: `"$var"` not `'$var'` |
| Word splitting issues | Quote variables: `"$path"` not `$path` |

---

## Full Documentation

- **Detailed Guide**: `/root/aifa-v2.1/docs/GIT-PATH-ESCAPING.md`
- **Working Examples**: `/root/aifa-v2.1/docs/GIT-ESCAPING-EXAMPLES.md`
- **Helper Scripts**: `/root/aifa-v2.1/scripts/git-safe-*.sh`

