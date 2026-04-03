#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "==> Building nexus-core..."
cd "$REPO_ROOT/nexus-core"
npm run build

echo "==> Reinstalling nexus-core in client..."
cd "$REPO_ROOT/client"
rm -rf node_modules/@nexus-academy
npm install --no-audit --no-fund
rm -rf node_modules/.vite

echo "==> Done! nexus-core changes are live in client."
