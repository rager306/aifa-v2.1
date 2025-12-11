#!/bin/bash

##############################################################################
# Git Path Escaping Demonstration
# Shows 3 methods for safely handling paths with special characters
##############################################################################

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

DEMO_FILE="app/@left/(_AUTH)/login/(_server)/actions/auth.ts"

section() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
}

subsection() {
    echo ""
    echo -e "${CYAN}→ $1${NC}"
}

show_command() {
    echo -e "${YELLOW}Command:${NC}"
    echo -e "  \`$1\`"
}

show_explanation() {
    echo -e "${GREEN}Explanation:${NC}"
    echo -e "  $1"
}

##############################################################################
section "GIT PATH ESCAPING - DEMONSTRATION & BEST PRACTICES"

echo ""
echo -e "Target file: ${YELLOW}$DEMO_FILE${NC}"
echo ""
echo "This file contains special characters that break unescaped bash commands:"
echo "  • @ symbol"
echo "  • Parentheses ( )"
echo "  • Forward slashes /"
echo ""

##############################################################################
subsection "METHOD 1: Double Quotes (Simplest)"
echo ""
show_command 'git diff "$FILEPATH"'
show_explanation "Wrap path in double quotes. Works for most cases but backslashes need escaping."
echo ""
echo -e "${GREEN}Advantages:${NC}"
echo "  ✓ Simple and readable"
echo "  ✓ Works for most special characters"
echo "  ✓ Good for interactive use"
echo ""
echo -e "${RED}Disadvantages:${NC}"
echo "  ✗ Variable expansion happens inside quotes"
echo "  ✗ Backslashes need special handling"
echo ""

##############################################################################
subsection "METHOD 2: -- Separator (RECOMMENDED)"
echo ""
show_command 'git diff -- "$FILEPATH"'
show_explanation "Use -- to tell git 'everything after this is a path, not an option'."
echo ""
echo -e "${GREEN}Advantages:${NC}"
echo "  ✓ Git standard (works with all git commands)"
echo "  ✓ Prevents -- from being interpreted as option"
echo "  ✓ Most compatible with git tooling"
echo "  ✓ Prevents accidental option injection"
echo ""
echo -e "${YELLOW}Best for:${NC}"
echo "  • Production scripts"
echo "  • Security-critical operations"
echo "  • Paths from untrusted sources"
echo ""

##############################################################################
subsection "METHOD 3: Array Approach (MOST ROBUST)"
echo ""
cat << 'ARRAY_DEMO'
local -a cmd=("git" "diff" "--" "$FILEPATH")
"${cmd[@]}"
ARRAY_DEMO
show_explanation "Use bash arrays to prevent word splitting and globbing."
echo ""
echo -e "${GREEN}Advantages:${NC}"
echo "  ✓ No variable expansion issues"
echo "  ✓ No globbing or word splitting"
echo "  ✓ Handles all special characters"
echo "  ✓ Most secure approach"
echo ""
echo -e "${YELLOW}Best for:${NC}"
echo "  • Complex paths"
echo "  • Security-sensitive operations"
echo "  • Dynamic path construction"
echo ""

##############################################################################
subsection "METHOD 4: Quoting Individual Arguments"
echo ""
show_command "git diff -- 'app/@left/(_AUTH)/login/(_server)/actions/auth.ts'"
show_explanation "Single quotes prevent all interpretation; no variables are expanded."
echo ""
echo -e "${GREEN}Advantages:${NC}"
echo "  ✓ Literal interpretation"
echo "  ✓ No variable expansion"
echo "  ✓ Clear intent"
echo ""
echo -e "${RED}Disadvantages:${NC}"
echo "  ✗ Can't use variables inside single quotes"
echo "  ✗ Need to close quote to use variables: 'part1'\$VAR'part2'"
echo ""

##############################################################################
section "PRACTICAL EXAMPLES"

subsection "Example 1: Show diff for auth.ts"
show_command "git diff -- \"app/@left/(_AUTH)/login/(_server)/actions/auth.ts\""
echo ""

subsection "Example 2: Stage file with spaces and parentheses"
show_command "git add -- \"file (with) spaces.ts\""
echo ""

subsection "Example 3: Show commit history"
show_command "git log -n 5 -- \"app/@left/(_AUTH)/login/(_server)/actions/auth.ts\""
echo ""

subsection "Example 4: Batch process multiple files"
cat << 'BATCH_EXAMPLE'
files=(
  "app/@left/(_AUTH)/login/(_server)/actions/auth.ts"
  "app/component (old).tsx"
  "file with spaces.ts"
)

for file in "${files[@]}"; do
  echo "Processing: $file"
  git diff -- "$file"
done
BATCH_EXAMPLE
echo ""

##############################################################################
section "COMMON MISTAKES TO AVOID"

echo ""
echo -e "${RED}✗ WRONG:${NC} git diff app/@left/(_AUTH)/login/(_server)/actions/auth.ts"
echo "  Error: Parentheses cause bash syntax errors"
echo ""

echo -e "${RED}✗ WRONG:${NC} git diff \"app/@left/(_AUTH)/login/(_server)/actions/auth.ts\""
echo "  Issue: Works but less safe; no -- separator"
echo ""

echo -e "${RED}✗ WRONG:${NC} file=\"app/@left/(_AUTH)...\"; git diff \$file"
echo "  Error: Unquoted variable causes word splitting"
echo ""

echo -e "${GREEN}✓ CORRECT:${NC} git diff -- \"app/@left/(_AUTH)/login/(_server)/actions/auth.ts\""
echo "  Good: Uses -- separator and quotes"
echo ""

echo -e "${GREEN}✓ CORRECT:${NC} file=\"app/@left/(_AUTH)...\"; git diff -- \"\$file\""
echo "  Best: Proper quoting with -- separator"
echo ""

##############################################################################
section "SHELL ESCAPING REFERENCE"

cat << 'REFERENCE'
Character          In Double Quotes    In Single Quotes    With Backslash
───────────────────────────────────────────────────────────────────────────
$                  Expanded           Literal            Escaped: \$
`                  Expanded           Literal            Escaped: \`
\                  Special            Literal            Escape: \\
"                  End quote          Literal            Escaped: \"
'                  Literal            End quote          Literal: \'
(                  Literal            Literal            Literal: (
)                  Literal            Literal            Literal: )
@                  Literal            Literal            Literal: @
Space              Literal            Literal            Escaped: \ 
Newline            Literal            Literal            Escaped: \n
REFERENCE

echo ""

##############################################################################
section "GIT COMMAND SAFE PATTERNS"

cat << 'PATTERNS'
Pattern 1: Double quotes + -- separator (RECOMMENDED)
  git diff -- "$path"
  git add -- "$path"
  git log -- "$path"
  
Pattern 2: Single quotes (for literal paths)
  git diff -- 'app/@left/(_AUTH)/login/(_server)/actions/auth.ts'
  
Pattern 3: Array approach (for complex scenarios)
  declare -a cmd=("git" "diff" "--" "$path")
  "${cmd[@]}"
  
Pattern 4: Multiple files
  git add -- "file1.ts" "file (special).ts" "file with spaces.ts"
  
Pattern 5: Using find with xargs
  find app -name "*.ts" -print0 | xargs -0 git add --
PATTERNS

echo ""

##############################################################################
section "BEST PRACTICES SUMMARY"

echo ""
echo -e "${GREEN}1. Always use -- separator with git commands${NC}"
echo "   git add -- \"\$path\""
echo ""

echo -e "${GREEN}2. Always quote variables${NC}"
echo "   git diff -- \"\$path\"    # Good"
echo "   git diff -- \$path       # Bad (word splitting)"
echo ""

echo -e "${GREEN}3. For multiple files, use arrays${NC}"
echo "   declare -a files=(...)"
echo "   git add -- \"\${files[@]}\""
echo ""

echo -e "${GREEN}4. Use single quotes for literal paths${NC}"
echo "   git diff -- 'path/with/special(chars).ts'"
echo ""

echo -e "${GREEN}5. For dynamic construction, use arrays${NC}"
echo "   cmd=(\"git\" \"diff\" \"--\" \"\$path\")"
echo "   \"\${cmd[@]}\""
echo ""

echo -e "${GREEN}6. Use find -print0 | xargs -0 for batch operations${NC}"
echo "   find . -name '*.ts' -print0 | xargs -0 git add --"
echo ""

##############################################################################
section "TESTING YOUR PATHS"

echo ""
echo "To test if a path works correctly, try these commands:"
echo ""
echo -e "${CYAN}1. Test with ls:${NC}"
echo "   ls -- \"$DEMO_FILE\""
echo ""
echo -e "${CYAN}2. Test with git status:${NC}"
echo "   git status -- \"$DEMO_FILE\""
echo ""
echo -e "${CYAN}3. Test with git diff:${NC}"
echo "   git diff -- \"$DEMO_FILE\""
echo ""

echo -e "${GREEN}If these commands work, your escaping is correct!${NC}"
echo ""

