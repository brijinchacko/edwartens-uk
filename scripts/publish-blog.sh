#!/usr/bin/env bash
# publish-blog.sh — build and deploy the edwartens-uk site to production
# Used by the /blog slash command after writing a new post.
#
# Usage: bash scripts/publish-blog.sh
#
# Assumes expect is installed (macOS default). SSH password is read from
# the environment variable EDWARTENS_SSH_PASS, or prompts if unset.

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SERVER="root@72.62.230.223"
REMOTE_DIR="/var/www/edwartens-uk"

# Prefer nvm/homebrew node paths
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

SSH_PASS="${EDWARTENS_SSH_PASS:-}"
if [[ -z "$SSH_PASS" ]]; then
  echo "Enter SSH password for ${SERVER}:"
  read -rs SSH_PASS
  echo ""
fi

cd "$PROJECT_DIR"

echo "==> [1/4] Building Next.js app..."
npm run build 2>&1 | tail -15

echo ""
echo "==> [2/4] Syncing .next build to production..."
expect <<EOF
set timeout 600
log_user 0
spawn rsync -az --delete --exclude node_modules --exclude .git --exclude .env --exclude .next/cache "${PROJECT_DIR}/.next/" "${SERVER}:${REMOTE_DIR}/.next/"
expect {
  "password:" { send "${SSH_PASS}\r"; exp_continue }
  eof
}
EOF
echo "    .next synced."

echo ""
echo "==> [3/4] Syncing blog source files..."
expect <<EOF
set timeout 120
log_user 0
spawn rsync -az "${PROJECT_DIR}/src/lib/blog-seo-2025.ts" "${PROJECT_DIR}/src/lib/blog-data.ts" "${SERVER}:${REMOTE_DIR}/src/lib/"
expect {
  "password:" { send "${SSH_PASS}\r"; exp_continue }
  eof
}
EOF
echo "    blog files synced."

echo ""
echo "==> [4/4] Restarting PM2 process..."
expect <<EOF
set timeout 60
log_user 0
spawn ssh -o StrictHostKeyChecking=no "${SERVER}" "pm2 restart edwartens-uk --update-env"
expect {
  "password:" { send "${SSH_PASS}\r"; exp_continue }
  eof
}
EOF

echo ""
echo "==> Deploy complete. Waiting 4s for app to boot..."
sleep 4

echo ""
echo "==> Verifying live site..."
HTTP_CODE=$(curl -sS -o /dev/null -w '%{http_code}' https://edwartens.co.uk/blog)
echo "    /blog → HTTP ${HTTP_CODE}"

if [[ "$HTTP_CODE" == "200" ]]; then
  echo "✓ Published successfully"
  exit 0
else
  echo "✗ Deploy ran but /blog returned ${HTTP_CODE} — check pm2 logs"
  exit 1
fi
