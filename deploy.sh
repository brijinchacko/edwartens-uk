#!/bin/bash
# ═══════════════════════════════════════════════════════
# EDWartens UK - Production Deploy Script
# Server: root@72.62.230.223 | App: PM2 edwartens-uk
# ═══════════════════════════════════════════════════════
#
# Usage: ./deploy.sh
#
# What this does:
#   1. Builds locally to catch errors before deploying
#   2. Syncs source files (excludes .next, node_modules, .env, uploads)
#   3. Safety checks (removes rogue app/ dir, verifies route count)
#   4. Rebuilds on server with clean .next
#   5. Restarts PM2 and verifies key routes
#
# Root cause this prevents:
#   - Rogue app/ directory at root (Next.js prefers app/ over src/app/)
#   - Corrupted .next from cross-platform rsync (macOS -> Linux)
#   - Deploying broken code (local build check first)

set -e

# ─── Configuration ───
SERVER="root@72.62.230.223"
PASS='@@Warterh616'
REMOTE_DIR="/var/www/edwartens-uk"
APP_NAME="edwartens-uk"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[!!]${NC} $1"; }
err()  { echo -e "${RED}[FAIL]${NC} $1"; exit 1; }

echo ""
echo "═══════════════════════════════════════"
echo "  EDWartens UK - Deploy to Production"
echo "═══════════════════════════════════════"
echo ""

# ─── Step 1: Local build ───
echo "[1/5] Building locally..."
npx next build 2>&1 | tail -3
LOCAL_ROUTES=$(cat .next/server/app-paths-manifest.json 2>/dev/null | python3 -c 'import json,sys;d=json.load(sys.stdin);print(len(d))' 2>/dev/null || echo "0")
if [ "$LOCAL_ROUTES" -lt 50 ]; then
  err "Local build has only $LOCAL_ROUTES routes. Expected 200+. Fix build errors first."
fi
log "Local build OK ($LOCAL_ROUTES routes)"

# ─── Step 2: Sync source files ───
echo "[2/5] Syncing source to server..."
sshpass -p "$PASS" rsync -azP --delete \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='.env' \
  --exclude='.env.*' \
  --exclude='.next' \
  --exclude='uploads' \
  --exclude='public/uploads' \
  --exclude='app/' \
  ./ "$SERVER:$REMOTE_DIR/" 2>&1 | tail -3
log "Source synced"

# ─── Step 3: Safety checks on server ───
echo "[3/5] Running safety checks..."
sshpass -p "$PASS" ssh -o StrictHostKeyChecking=no "$SERVER" "
  cd $REMOTE_DIR

  # Check 1: Remove rogue app/ directory (CRITICAL - breaks all routes)
  if [ -d 'app/' ]; then
    echo '  WARNING: Removing rogue app/ directory at project root'
    rm -rf app/
  else
    echo '  No rogue app/ directory'
  fi

  # Check 2: Verify src/app exists with routes
  PAGE_COUNT=\$(find src/app -name 'page.tsx' | wc -l)
  echo \"  Found \$PAGE_COUNT page.tsx files in src/app/\"
  if [ \"\$PAGE_COUNT\" -lt 50 ]; then
    echo '  ERROR: Too few page files. Source may be corrupted.'
    exit 1
  fi

  # Check 3: Verify key files exist
  for f in src/app/layout.tsx 'src/app/(website)/page.tsx' src/app/admin/dashboard/page.tsx src/middleware.ts next.config.ts; do
    if [ ! -f \"\$f\" ]; then
      echo \"  ERROR: Missing critical file: \$f\"
      exit 1
    fi
  done
  echo '  All critical files present'
"
log "Safety checks passed"

# ─── Step 4: Build on server ───
echo "[4/5] Building on production server..."
sshpass -p "$PASS" ssh -o StrictHostKeyChecking=no "$SERVER" "
  cd $REMOTE_DIR
  pm2 stop $APP_NAME 2>/dev/null || true
  rm -rf .next
  npx prisma generate 2>&1 | tail -1
  npx next build 2>&1 | tail -10

  # Verify build produced routes
  ROUTE_COUNT=\$(cat .next/server/app-paths-manifest.json | python3 -c 'import json,sys;d=json.load(sys.stdin);print(len(d))' 2>/dev/null || echo '0')
  echo \"\"
  echo \"  Build produced \$ROUTE_COUNT routes\"
  if [ \"\$ROUTE_COUNT\" -lt 50 ]; then
    echo '  ERROR: Build produced too few routes. NOT restarting.'
    exit 1
  fi
"
log "Server build OK"

# ─── Step 5: Restart and verify ───
echo "[5/5] Restarting and verifying..."
sshpass -p "$PASS" ssh -o StrictHostKeyChecking=no "$SERVER" "
  cd $REMOTE_DIR
  pm2 start $APP_NAME
  sleep 5

  echo '  Route verification:'
  FAIL=0
  for path in / /login /contact /admin/dashboard; do
    CODE=\$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3006\$path)
    if [ \"\$path\" = '/admin/dashboard' ]; then
      if [ \"\$CODE\" = '307' ]; then echo \"    \$path -> \$CODE (OK: auth redirect)\";
      else echo \"    \$path -> \$CODE (FAIL: expected 307)\"; FAIL=1; fi
    else
      if [ \"\$CODE\" = '200' ]; then echo \"    \$path -> \$CODE (OK)\";
      else echo \"    \$path -> \$CODE (FAIL: expected 200)\"; FAIL=1; fi
    fi
  done

  if [ \"\$FAIL\" = '1' ]; then
    echo ''
    echo '  WARNING: Some routes failed verification!'
    echo '  Check: pm2 logs $APP_NAME'
  else
    echo ''
    echo '  All routes verified!'
  fi
"

echo ""
echo "═══════════════════════════════════════"
log "Deploy complete!"
echo "═══════════════════════════════════════"
echo ""
