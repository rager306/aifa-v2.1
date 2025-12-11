# Git Path Escaping - Working Examples

## Quick Start

For the problematic path: `app/@left/(_AUTH)/login/(_server)/actions/auth.ts`

### Method 1: Double Quotes (Simple)
```bash
git diff -- "app/@left/(_AUTH)/login/(_server)/actions/auth.ts"
```

### Method 2: With Variable (Recommended)
```bash
filepath="app/@left/(_AUTH)/login/(_server)/actions/auth.ts"
git diff -- "$filepath"
```

### Method 3: Array Approach (Most Robust)
```bash
declare -a cmd=("git" "diff" "--" "app/@left/(_AUTH)/login/(_server)/actions/auth.ts")
"${cmd[@]}"
```

---

## Working Git Commands

### Show Diff
```bash
# Method 1: Simple double quotes
git diff -- "app/@left/(_AUTH)/login/(_server)/actions/auth.ts"

# Method 2: With variable
file="app/@left/(_AUTH)/login/(_server)/actions/auth.ts"
git diff -- "$file"

# Method 3: Array approach
cmd=("git" "diff" "--" "app/@left/(_AUTH)/login/(_server)/actions/auth.ts")
"${cmd[@]}"
```

### Show Staged Changes
```bash
git diff --cached -- "app/@left/(_AUTH)/login/(_server)/actions/auth.ts"
```

### Show Statistics
```bash
git diff --stat -- "app/@left/(_AUTH)/login/(_server)/actions/auth.ts"
```

### Stage File
```bash
git add -- "app/@left/(_AUTH)/login/(_server)/actions/auth.ts"
```

### Check Status
```bash
git status -- "app/@left/(_AUTH)/login/(_server)/actions/auth.ts"
```

### Show Log
```bash
git log -n 5 -- "app/@left/(_AUTH)/login/(_server)/actions/auth.ts"
```

### Show Blame
```bash
git blame -- "app/@left/(_AUTH)/login/(_server)/actions/auth.ts"
```

### Checkout File
```bash
# From HEAD
git checkout -- "app/@left/(_AUTH)/login/(_server)/actions/auth.ts"

# From specific commit
git checkout HEAD~1 -- "app/@left/(_AUTH)/login/(_server)/actions/auth.ts"
```

### Reset File
```bash
# Soft reset (keep changes)
git reset --soft -- "app/@left/(_AUTH)/login/(_server)/actions/auth.ts"

# Mixed reset (unstage)
git reset --mixed -- "app/@left/(_AUTH)/login/(_server)/actions/auth.ts"

# Hard reset (discard changes)
git reset --hard -- "app/@left/(_AUTH)/login/(_server)/actions/auth.ts"
```

### Restore File
```bash
# From HEAD
git restore -- "app/@left/(_AUTH)/login/(_server)/actions/auth.ts"

# Unstage
git restore --staged -- "app/@left/(_AUTH)/login/(_server)/actions/auth.ts"
```

---

## Batch Operations

### Multiple Files with Special Characters
```bash
git add -- \
  "app/@left/(_AUTH)/login/(_server)/actions/auth.ts" \
  "app/component (old).tsx" \
  "file with spaces.ts"
```

### Using Arrays for Multiple Files
```bash
files=(
  "app/@left/(_AUTH)/login/(_server)/actions/auth.ts"
  "app/component (old).tsx"
  "file with spaces.ts"
)

# Show diffs
for file in "${files[@]}"; do
  git diff -- "$file"
done

# Stage all
for file in "${files[@]}"; do
  git add -- "$file"
done

# Or use array expansion (requires git)
git add -- "${files[@]}"
```

### Using find with xargs (Most Robust)
```bash
# Find all TypeScript files and stage them
find app -name "*.ts" -print0 | xargs -0 git add --

# Find modified files and show diffs
git diff --name-only | xargs -I {} git diff -- "{}"

# Find files matching pattern
find . -path "*/(_AUTH)/*" -name "*.ts" -print0 | xargs -0 git add --
```

---

## Helper Scripts Usage

### git-safe-diff.sh
```bash
# Show diff (default method)
./scripts/git-safe-diff.sh "app/@left/(_AUTH)/login/(_server)/actions/auth.ts"

# Show staged changes
./scripts/git-safe-diff.sh -c "app/@left/(_AUTH)/login/(_server)/actions/auth.ts"

# Show statistics
./scripts/git-safe-diff.sh --stat "app/@left/(_AUTH)/login/(_server)/actions/auth.ts"

# Use specific method (1, 2, or 3)
./scripts/git-safe-diff.sh -m 2 "app/@left/(_AUTH)/login/(_server)/actions/auth.ts"
```

### git-safe-operations.sh
```bash
# Check status
./scripts/git-safe-operations.sh status "app/@left/(_AUTH)/login/(_server)/actions/auth.ts"

# Stage file
./scripts/git-safe-operations.sh add "app/@left/(_AUTH)/login/(_server)/actions/auth.ts"

# Show diff
./scripts/git-safe-operations.sh diff "app/@left/(_AUTH)/login/(_server)/actions/auth.ts"

# Show log
./scripts/git-safe-operations.sh log "app/@left/(_AUTH)/login/(_server)/actions/auth.ts" 10

# Batch operations
./scripts/git-safe-operations.sh batch add \
  "app/@left/(_AUTH)/login/(_server)/actions/auth.ts" \
  "app/component (old).tsx" \
  "file with spaces.ts"
```

### npm Scripts
```bash
# Run via npm
npm run git:safe:diff "app/@left/(_AUTH)/login/(_server)/actions/auth.ts"
npm run git:safe:ops diff "app/@left/(_AUTH)/login/(_server)/actions/auth.ts"
npm run git:escaping:demo
```

---

## Common Workflows

### Commit Changes to Complex Path
```bash
file="app/@left/(_AUTH)/login/(_server)/actions/auth.ts"
git add -- "$file"
git commit -m "Update auth actions" -- "$file"
```

### Compare with Previous Commit
```bash
file="app/@left/(_AUTH)/login/(_server)/actions/auth.ts"
git diff HEAD~1 -- "$file"
```

### See Who Changed What
```bash
git blame -- "app/@left/(_AUTH)/login/(_server)/actions/auth.ts" | head -20
```

### Revert Changes to File
```bash
git checkout -- "app/@left/(_AUTH)/login/(_server)/actions/auth.ts"
```

### See File History
```bash
git log --oneline -- "app/@left/(_AUTH)/login/(_server)/actions/auth.ts"
```

### Copy File from Another Branch
```bash
git checkout feature-branch -- "app/@left/(_AUTH)/login/(_server)/actions/auth.ts"
```

---

## Testing Your Escaping

Verify your escaping works before using in scripts:

```bash
# Test 1: List file (if it works, escaping is good)
ls -- "app/@left/(_AUTH)/login/(_server)/actions/auth.ts"

# Test 2: Check git status
git status -- "app/@left/(_AUTH)/login/(_server)/actions/auth.ts"

# Test 3: Show git diff
git diff -- "app/@left/(_AUTH)/login/(_server)/actions/auth.ts"

# If all three work, your path escaping is correct!
```

---

## Key Takeaways

1. **Always use `--` separator**: Tells git "everything after is a path"
2. **Always quote variables**: `"$path"` not `$path`
3. **Use arrays for multiple paths**: Prevents word splitting
4. **Prefer `find -print0 | xargs -0`** for batch operations
5. **Test your escaping** with `ls` and `git status` first

---

## Troubleshooting

### Error: "No such file or directory"
Make sure the path exists:
```bash
ls -- "app/@left/(_AUTH)/login/(_server)/actions/auth.ts"
```

### Error: "ambiguous argument"
Use proper quoting and -- separator:
```bash
# Wrong
git diff app/@left/(_AUTH)...

# Right
git diff -- "app/@left/(_AUTH)..."
```

### Error: "not a git command"
Make sure you're in a git repository:
```bash
git status  # Should work
```

### Variable not expanding
Use double quotes, not single quotes:
```bash
file="path.ts"
git diff -- "$file"      # Works
git diff -- '$file'      # Doesn't expand
```

