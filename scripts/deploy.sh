#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# deploy.sh  —  Deploy ShowMatch to the cloud
#
# Deploys:
#   Socket server  →  Fly.io  (fly deploy, builds Docker image)
#   Frontend       →  Vercel  (auto-deploys on every push to main — no action needed)
#
# Guards (all must pass before anything is deployed):
#   1. Must be on the main branch
#   2. Working tree must be clean (no uncommitted changes)
#   3. Local main must be in sync with origin/main (no unpushed or un-pulled commits)
#
# Usage:
#   bash scripts/deploy.sh
# ──────────────────────────────────────────────────────────────────────────────
set -euo pipefail

BOLD='\033[1m'
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
DIM='\033[2m'
NC='\033[0m'

echo -e "\n${BOLD}ShowMatch · Cloud Deploy${NC}\n"

# ── Guard 1: must be on main ──────────────────────────────────────────────────
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
  echo -e "${RED}✗ Not on main (currently: ${CURRENT_BRANCH})${NC}"
  echo -e "  Only main can be deployed. Merge your branch first.\n"
  exit 1
fi
echo -e "${GREEN}✓ Branch: main${NC}"

# ── Guard 2: working tree must be clean ──────────────────────────────────────
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo -e "${RED}✗ Uncommitted changes detected${NC}"
  echo -e "  Commit or stash before deploying.\n"
  exit 1
fi
echo -e "${GREEN}✓ Working tree clean${NC}"

# ── Guard 3: must be in sync with origin/main ─────────────────────────────────
echo -e "${DIM}  Fetching origin...${NC}"
git fetch origin main --quiet

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" != "$REMOTE" ]; then
  BEHIND=$(git rev-list HEAD..origin/main --count)
  AHEAD=$(git rev-list origin/main..HEAD --count)

  if [ "$BEHIND" -gt 0 ]; then
    echo -e "${RED}✗ Local main is $BEHIND commit(s) behind origin/main${NC}"
    echo -e "  Run: git pull origin main\n"
    exit 1
  fi
  if [ "$AHEAD" -gt 0 ]; then
    echo -e "${RED}✗ Local main has $AHEAD unpushed commit(s)${NC}"
    echo -e "  Run: git push origin main\n"
    exit 1
  fi
fi

COMMIT=$(git rev-parse --short HEAD)
echo -e "${GREEN}✓ In sync with origin/main${NC} ${DIM}($COMMIT)${NC}"

# ── Deploy: socket server → Fly.io ───────────────────────────────────────────
echo -e "\n${BOLD}Deploying socket server → Fly.io...${NC}"

if ! command -v fly &>/dev/null; then
  echo -e "${RED}✗ fly CLI not found${NC}"
  echo -e "  Install: curl -L https://fly.io/install.sh | sh\n"
  exit 1
fi

fly deploy

echo -e "\n${GREEN}${BOLD}✓ Socket server deployed${NC}"

# ── Vercel: auto-deploys from main, nothing to do ────────────────────────────
echo -e "\n${YELLOW}ℹ Vercel picks up main automatically — no action needed.${NC}"
echo -e "  Track: https://vercel.com/dashboard\n"

echo -e "${GREEN}${BOLD}Deploy complete.${NC} Commit: $COMMIT\n"
