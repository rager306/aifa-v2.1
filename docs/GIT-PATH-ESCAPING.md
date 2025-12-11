# Git Path Escaping Guide

## Problem Statement

Bash treats special characters as operators/metacharacters, which breaks git commands when file paths contain:
- Parentheses: `(_AUTH)`, `(_server)`
- Spaces: `file with spaces.ts`
- Symbols: `@`, `&`, `|`, `;`, etc.

### Example Issue
```bash
# FAILS: Parentheses cause syntax error
git diff app/@left/(_AUTH)/login/(_server)/actions/auth.ts
# Error: bash: syntax error near unexpected token `('

# Works: Path must be properly quoted/escaped
git diff -- "app/@left/(_AUTH)/login/(_server)/actions/auth.ts"
```

---

## Solution: 4 Methods for Safe Path Handling

### Method 1: Double Quotes (Simplest)
```bash
git diff "$filepath"
```
**Pros:**
- Simple and readable
- Works for most cases
- Good for interactive use

**Cons:**
- Variable expansion happens inside quotes
- Backslashes need careful handling
- Less safe than alternatives

**Use when:** Quick interactive commands, well-controlled paths

---

### Method 2: -- Separator (RECOMMENDED)
```bash
git diff -- "$filepath"
```

The `--` tells git: "Everything after this is a path, not an option"

**Pros:**
- Git standard (works with ALL git commands)
- Prevents pathnames from being interpreted as options
- Most compatible with git tooling
- Prevents accidental option injection

**Cons:** None significant

**Use when:** Production scripts, security-critical code, untrusted input

---

### Method 3: Array Approach (MOST ROBUST)
```bash
declare -a cmd=("git" "diff" "--" "$filepath")
"${cmd[@]}"
```

**Pros:**
- No variable expansion issues
- No globbing or word splitting
- Handles ALL special characters
- Most secure approach

**Cons:** Slightly more verbose

**Use when:** Complex paths, security-sensitive operations, dynamic path construction

---

### Method 4: Single Quotes (Literal Interpretation)
```bash
git diff -- 'app/@left/(_AUTH)/login/(_server)/actions/auth.ts'
```

**Pros:**
- Literal interpretation (no expansion)
- Crystal clear intent
- No variable confusion

**Cons:**
- Can't use variables inside single quotes
- Less useful for dynamic paths

**Use when:** Hardcoded paths, documentation, literal string preservation

---

## Practical Examples

### Basic Git Operations

#### Show diff with special characters
```bash
# Method 2 (Recommended)
git diff -- "app/@left/(_AUTH)/login/(_server)/actions/auth.ts"

# Method 3 (Most Robust)
filepath="app/@left/(_AUTH)/login/(_server)/actions/auth.ts"
git diff -- "$filepath"
```

#### Stage a file with spaces and parentheses
```bash
git add -- "file (with) spaces.ts"
git add -- "file with spaces.ts"
```

#### Show commit history for complex path
```bash
git log -n 5 -- "app/@left/(_AUTH)/login/(_server)/actions/auth.ts"
git blame -- "path/to/file (version 2).ts"
```

#### Checkout file from specific commit
```bash
git checkout HEAD~1 -- "app/@left/(_AUTH)/login/(_server)/actions/auth.ts"
```

#### Remove file from tracking
```bash
git rm -- "file with (special) chars.ts"
```

---

### Batch Operations

#### Process multiple files
```bash
files=(
  "app/@left/(_AUTH)/login/(_server)/actions/auth.ts"
  "app/component (old).tsx"
  "file with spaces.ts"
)

for file in "${files[@]}"; do
  git diff -- "$file"
done
```

#### Using find with xargs
```bash
# Add all TypeScript files (handles special characters)
find . -name "*.ts" -print0 | xargs -0 git add --

# Show diff for all modified files
git diff --name-only | xargs -I {} git diff -- "{}"
```

#### Batch stage operation
```bash
git add -- "file1.ts" "file (special).ts" "file with spaces.ts"
```

---

## Common Mistakes & Solutions

### ✗ WRONG: Unquoted paths with special characters
```bash
git diff app/@left/(_AUTH)/login/(_server)/actions/auth.ts
# Error: bash: syntax error near unexpected token `('
```

### ✗ WRONG: Unquoted variable with spaces
```bash
file="path with spaces.ts"
git diff $file
# Error: Treats each word as separate argument
```

### ✓ CORRECT: Double quoted path with -- separator
```bash
git diff -- "app/@left/(_AUTH)/login/(_server)/actions/auth.ts"
```

### ✓ CORRECT: Quoted variable with -- separator
```bash
file="app/@left/(_AUTH)/login/(_server)/actions/auth.ts"
git diff -- "$file"
```

### ✓ CORRECT: Array approach for complex scenarios
```bash
declare -a cmd=("git" "diff" "--")
cmd+=("app/@left/(_AUTH)/login/(_server)/actions/auth.ts")
"${cmd[@]}"
```

---

## Helper Scripts

### git-safe-diff.sh
Safely show diff for files with special characters

```bash
./scripts/git-safe-diff.sh "app/@left/(_AUTH)/login/(_server)/actions/auth.ts"
./scripts/git-safe-diff.sh -c "file with spaces.ts"  # Show cached changes
./scripts/git-safe-diff.sh --stat "file (special).ts"  # Show statistics
```

### git-safe-operations.sh
Collection of safe git operations with proper escaping

```bash
./scripts/git-safe-operations.sh status "path/to/file.ts"
./scripts/git-safe-operations.sh add "file with spaces.ts"
./scripts/git-safe-operations.sh diff "app/@left/(_AUTH)/..."
./scripts/git-safe-operations.sh log "file (special).ts" 10
./scripts/git-safe-operations.sh batch add file1.ts file2.ts file3.ts
```

---

## Shell Quoting Reference

| Character | In Double Quotes | In Single Quotes | With Backslash |
|-----------|------------------|------------------|-----------------|
| `$` | Expanded | Literal | Escaped: `\$` |
| `` ` `` | Expanded | Literal | Escaped: `` \` `` |
| `\` | Special | Literal | Escape: `\\` |
| `"` | End quote | Literal | Escaped: `\"` |
| `'` | Literal | End quote | Literal: `\'` |
| `(` | Literal | Literal | Literal: `(` |
| `)` | Literal | Literal | Literal: `)` |
| `@` | Literal | Literal | Literal: `@` |
| ` ` (space) | Literal | Literal | Escaped: `\ ` |

---

## Best Practices Summary

### 1. Always Use -- Separator
```bash
git add -- "$path"        # ✓ Good
git add "$path"           # ✗ Less safe
```

### 2. Always Quote Variables
```bash
git diff -- "$path"       # ✓ Good
git diff -- $path         # ✗ Bad (word splitting)
```

### 3. Use Arrays for Multiple Arguments
```bash
git add -- "${files[@]}"  # ✓ Good for arrays
git add -- $files         # ✗ Bad (word splitting)
```

### 4. Prefer Single Quotes for Literal Paths
```bash
git diff -- 'path/with/(special)chars.ts'  # ✓ Literal
git diff -- "path/with/$(command)here.ts"  # ✓ With expansion
```

### 5. Use find -print0 for Batch Operations
```bash
find . -name "*.ts" -print0 | xargs -0 git add --
```

### 6. Test Your Escaping
```bash
# If this works, your escaping is correct:
ls -- "app/@left/(_AUTH)/login/(_server)/actions/auth.ts"
git status -- "app/@left/(_AUTH)/login/(_server)/actions/auth.ts"
```

---

## Special Case: Escaped Filenames

If filenames themselves contain escape characters:

```bash
# Filename with backslash
git add -- 'file\with\backslash.ts'      # Single quotes keep literal

# Filename with single quotes
git add -- "file'with'quotes.ts"         # Double quotes work

# Filename with both
git add -- "file\with'both.ts"           # Double quotes + literal backslash

# Dynamic paths with special characters
path="app/@left/(_AUTH)/file'special.ts"
git add -- "$path"                        # Properly quoted variable
```

---

## Verification Commands

Test if your path escaping is working:

```bash
# Test 1: List file
ls -- "app/@left/(_AUTH)/login/(_server)/actions/auth.ts"

# Test 2: Check git status
git status -- "app/@left/(_AUTH)/login/(_server)/actions/auth.ts"

# Test 3: Show git diff
git diff -- "app/@left/(_AUTH)/login/(_server)/actions/auth.ts"

# If all three work, your escaping is correct!
```

---

## Additional Resources

- [GNU Bash Manual - Quoting](https://www.gnu.org/software/bash/manual/html_node/Quoting.html)
- [Git Documentation - Pathspec](https://git-scm.com/docs/gitglossary#Documentation/gitglossary.txt-pathspec)
- [POSIX Shell Command Language](https://pubs.opengroup.org/onlinepubs/9699919799/utilities/V3_chap02.html)

