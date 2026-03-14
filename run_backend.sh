#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# run_backend.sh — Start the EduSpark AI backend server
# ──────────────────────────────────────────────────────────────

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
elif [ -d ".venv" ]; then
    source .venv/bin/activate
fi

echo "══════════════════════════════════════════════"
echo "  Starting EduSpark AI backend …"
echo "  API:   http://localhost:8000"
echo "  Docs:  http://localhost:8000/docs"
echo "══════════════════════════════════════════════"

uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
