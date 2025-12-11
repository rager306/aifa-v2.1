#!/bin/bash

##############################################################################
# Git Safe Operations - Collection of safe git operations for special paths
#
# This script provides wrappers for common git operations with proper
# escaping for paths containing parentheses, spaces, and other special chars
##############################################################################

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

##############################################################################
# git_safe_status - Show git status for a specific file
##############################################################################
git_safe_status() {
    local filepath="$1"
    echo -e "${BLUE}[git status]${NC} $filepath"
    git status -- "$filepath"
}

##############################################################################
# git_safe_add - Stage changes for a file
##############################################################################
git_safe_add() {
    local filepath="$1"
    echo -e "${GREEN}[git add]${NC} $filepath"
    git add -- "$filepath"
    echo -e "${GREEN}✓ Added${NC}"
}

##############################################################################
# git_safe_diff - Show diff for a file
##############################################################################
git_safe_diff() {
    local filepath="$1"
    local cached=${2:-false}
    
    if [[ "$cached" == "cached" ]]; then
        echo -e "${BLUE}[git diff --cached]${NC} $filepath"
        git diff --cached -- "$filepath"
    else
        echo -e "${BLUE}[git diff]${NC} $filepath"
        git diff -- "$filepath"
    fi
}

##############################################################################
# git_safe_log - Show git log for a file
##############################################################################
git_safe_log() {
    local filepath="$1"
    local limit=${2:-5}
    
    echo -e "${BLUE}[git log -n $limit]${NC} $filepath"
    git log -n "$limit" --oneline -- "$filepath"
}

##############################################################################
# git_safe_checkout - Checkout a file from git
##############################################################################
git_safe_checkout() {
    local filepath="$1"
    local ref=${2:-HEAD}
    
    echo -e "${YELLOW}[git checkout $ref]${NC} $filepath"
    git checkout "$ref" -- "$filepath"
    echo -e "${GREEN}✓ Checked out${NC}"
}

##############################################################################
# git_safe_blame - Show blame for a file
##############################################################################
git_safe_blame() {
    local filepath="$1"
    
    echo -e "${BLUE}[git blame]${NC} $filepath"
    git blame -- "$filepath"
}

##############################################################################
# git_safe_rm - Remove a file from git
##############################################################################
git_safe_rm() {
    local filepath="$1"
    local force=${2:-false}
    
    if [[ "$force" == "force" ]]; then
        echo -e "${YELLOW}[git rm -f]${NC} $filepath"
        git rm -f -- "$filepath"
    else
        echo -e "${YELLOW}[git rm]${NC} $filepath"
        git rm -- "$filepath"
    fi
    echo -e "${GREEN}✓ Removed${NC}"
}

##############################################################################
# git_safe_reset - Reset changes in a file
##############################################################################
git_safe_reset() {
    local filepath="$1"
    local mode=${2:-mixed}  # soft, mixed, hard
    
    echo -e "${YELLOW}[git reset --$mode]${NC} $filepath"
    git reset "--$mode" -- "$filepath"
    echo -e "${GREEN}✓ Reset${NC}"
}

##############################################################################
# git_safe_restore - Restore a file to HEAD
##############################################################################
git_safe_restore() {
    local filepath="$1"
    local staged=${2:-false}
    
    if [[ "$staged" == "staged" ]]; then
        echo -e "${YELLOW}[git restore --staged]${NC} $filepath"
        git restore --staged -- "$filepath"
    else
        echo -e "${YELLOW}[git restore]${NC} $filepath"
        git restore -- "$filepath"
    fi
    echo -e "${GREEN}✓ Restored${NC}"
}

##############################################################################
# git_safe_show - Show file content from a specific commit
##############################################################################
git_safe_show() {
    local ref=$1
    local filepath=$2
    
    echo -e "${BLUE}[git show]${NC} $ref:$filepath"
    git show "$ref:$filepath"
}

##############################################################################
# git_safe_batch - Batch operation for multiple files
##############################################################################
git_safe_batch() {
    local operation=$1
    shift
    local -a files=("$@")
    
    echo -e "${BLUE}[Batch Operation: $operation]${NC}"
    
    for file in "${files[@]}"; do
        case $operation in
            add)
                git_safe_add "$file"
                ;;
            diff)
                git_safe_diff "$file"
                echo ""
                ;;
            status)
                git_safe_status "$file"
                echo ""
                ;;
            *)
                echo -e "${RED}Unknown operation: $operation${NC}"
                return 1
                ;;
        esac
    done
}

##############################################################################
# MAIN - Command dispatcher
##############################################################################
if [[ $# -eq 0 ]]; then
    cat << 'HELP'
Git Safe Operations - Wrapper for git commands with special path handling

USAGE: git-safe-operations.sh <command> [args...]

COMMANDS:
  status <path>              Show git status for a file
  add <path>                 Stage changes for a file
  diff <path> [cached]       Show diff (use 'cached' for --cached)
  log <path> [limit]         Show git log (default: 5 commits)
  checkout <path> [ref]      Checkout file from ref (default: HEAD)
  blame <path>               Show blame information
  rm <path> [force]          Remove file (use 'force' to force remove)
  reset <path> [mode]        Reset file (soft/mixed/hard)
  restore <path> [staged]    Restore file (use 'staged' for --staged)
  show <ref> <path>          Show file from specific commit
  batch <op> <path1> <path2> ...  Batch operation on multiple files

EXAMPLES:
  # Show diff with parentheses in path
  git-safe-operations.sh diff "app/@left/(_AUTH)/login/(_server)/actions/auth.ts"
  
  # Stage file with spaces
  git-safe-operations.sh add "path/to/file with spaces.ts"
  
  # Show git log for complex path
  git-safe-operations.sh log "app/@left/(_AUTH)/login/(_server)/actions/auth.ts" 10
  
  # Batch operations
  git-safe-operations.sh batch add "file1.ts" "file with spaces.ts" "(special).ts"
  
HELP
    exit 0
fi

COMMAND=$1
shift

case $COMMAND in
    status)
        git_safe_status "$@"
        ;;
    add)
        git_safe_add "$@"
        ;;
    diff)
        git_safe_diff "$@"
        ;;
    log)
        git_safe_log "$@"
        ;;
    checkout)
        git_safe_checkout "$@"
        ;;
    blame)
        git_safe_blame "$@"
        ;;
    rm)
        git_safe_rm "$@"
        ;;
    reset)
        git_safe_reset "$@"
        ;;
    restore)
        git_safe_restore "$@"
        ;;
    show)
        git_safe_show "$@"
        ;;
    batch)
        git_safe_batch "$@"
        ;;
    *)
        echo -e "${RED}Unknown command: $COMMAND${NC}"
        exit 1
        ;;
esac
