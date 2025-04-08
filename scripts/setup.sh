#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status.

echo "Setting up Backend..."
(cd backend && chmod +x scripts/setup.sh && ./scripts/setup.sh)

echo "\nSetting up Frontend..."
(cd frontend && pnpm install)

echo "\n✅ Full project setup complete!" 