#!/bin/bash

##############################################################################
# Git Safe Diff Script
# Safely handles git diff for paths with special characters (parentheses, spaces, etc.)
#
# Usage:
#   ./git-safe-diff.sh "path/to/file.ts"
#   ./git-safe-diff.sh "app/@left/(_AUTH)/login/(_server)/actions/auth.ts"
#   ./git-safe-diff.sh "file with spaces.txt"
#
# Method 1: Using double quotes (simplest)
# Method 2: Using -- separator (safest)
# Method 3: Using quoted arrays (most robust)
##############################################################################

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

show_usage() {
    cat << 'USAGE'
Git Safe Diff - Handle paths with special characters safely

USAGE: git-safe-diff.sh [OPTIONS] <filepath>

OPTIONS:
  -h, --help              Show this help message
  -m, --method <num>      Choose escape method (1, 2, or 3)
  -c, --cached            Show staged changes (git diff --cached)
  --stat                  Show statistics instead of full diff

METHODS:
  1 = Double quotes (for most cases)
  2 = -- separator (git standard)
  3 = Array approach (most robust)

EXAMPLES:
  git-safe-diff.sh "app/@left/(_AUTH)/login/(_server)/actions/auth.ts"
  git-safe-diff.sh -m 2 "path/to/file.ts"
  git-safe-diff.sh -c "file with spaces.ts"
  git-safe-diff.sh --stat "file (1).ts"

USAGE
}

# Default values
METHOD=2
CACHED=false
STAT=false
FILEPATH=""

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_usage
            exit 0
            ;;
        -m|--method)
            METHOD="$2"
            shift 2
            ;;
        -c|--cached)
            CACHED=true
            shift
            ;;
        --stat)
            STAT=true
            shift
            ;;
        *)
            FILEPATH="$1"
            shift
            ;;
    esac
done

if [[ -z "$FILEPATH" ]]; then
    echo -e "${RED}Error: filepath required${NC}"
    show_usage
    exit 1
fi

echo -e "${BLUE}[Git Safe Diff]${NC}"
echo -e "File: ${YELLOW}$FILEPATH${NC}"
echo -e "Method: ${YELLOW}$METHOD${NC}"
[[ "$CACHED" == true ]] && echo -e "Mode: ${YELLOW}--cached (staged)${NC}"
echo ""

case $METHOD in
    1)
        echo -e "${GREEN}Using Method 1: Double Quotes${NC}"
        echo -e "${BLUE}Command:${NC} git diff $([ "$CACHED" == true ] && echo "--cached") --stat \"$FILEPATH\""
        echo ""
        if [[ "$STAT" == true ]]; then
            git diff $([ "$CACHED" == true ] && echo "--cached") --stat "$FILEPATH"
        else
            git diff $([ "$CACHED" == true ] && echo "--cached") "$FILEPATH"
        fi
        ;;
    2)
        echo -e "${GREEN}Using Method 2: -- Separator (RECOMMENDED)${NC}"
        echo -e "${BLUE}Command:${NC} git diff $([ "$CACHED" == true ] && echo "--cached") -- \"$FILEPATH\""
        echo ""
        if [[ "$STAT" == true ]]; then
            git diff $([ "$CACHED" == true ] && echo "--cached") --stat -- "$FILEPATH"
        else
            git diff $([ "$CACHED" == true ] && echo "--cached") -- "$FILEPATH"
        fi
        ;;
    3)
        echo -e "${GREEN}Using Method 3: Array Approach (MOST ROBUST)${NC}"
        echo -e "${BLUE}Command:${NC} git diff using quoted array..."
        echo ""
        # Use array to properly handle special characters
        local -a cmd=("git" "diff")
        [[ "$CACHED" == true ]] && cmd+=("--cached")
        [[ "$STAT" == true ]] && cmd+=("--stat")
        cmd+=("--" "$FILEPATH")
        
        "${cmd[@]}"
        ;;
    *)
        echo -e "${RED}Error: Invalid method $METHOD (must be 1, 2, or 3)${NC}"
        exit 1
        ;;
esac

exit 0
