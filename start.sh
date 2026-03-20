#!/usr/bin/env bash
set -e

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  VASTUSPACE — Local Dev Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check node version
NODE_VER=$(node -v 2>/dev/null || echo "missing")
if [[ "$NODE_VER" == "missing" ]]; then
  echo "❌  Node.js not found. Install from https://nodejs.org (v18+)"
  exit 1
fi
echo "✓  Node.js $NODE_VER"

# Install deps
echo ""
echo "📦  Installing dependencies..."
npm install --legacy-peer-deps
echo "✓  Dependencies installed"

# Create .env.local if missing
if [ ! -f .env.local ]; then
  cp .env.example .env.local
  echo "✓  Created .env.local (Supabase fields left blank — using mock data)"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🚀  Starting dev server..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Homepage:     http://localhost:3000"
echo "  Admin:        http://localhost:3000/dashboard"
echo "  New Project:  http://localhost:3000/dashboard/new"
echo "  Landing Page: http://localhost:3000/projects/marble-heights"
echo "  Landing Page: http://localhost:3000/projects/ocean-vista"
echo ""
npm run dev
