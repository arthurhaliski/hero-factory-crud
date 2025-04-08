#!/bin/bash
set -e

# Check if Docker Compose is running the database
if ! docker-compose ps | grep -q 'hero-factory-db.*Up'; then
  echo "⚠️ Database container (hero-factory-db) is not running. Starting Docker Compose..."
  docker-compose up -d hero-factory-db
  echo "⏳ Waiting for database to be ready... (10 seconds)"
  sleep 10 # Give the DB time to initialize
fi

echo "🚀 Starting Backend and Frontend development servers concurrently..."

# Use pnpm dlx to run concurrently without installing it globally
# Assign names and colors for clarity
# Kill others if one process exits
pnpm dlx concurrently --kill-others-on-fail \
  --names "BACKEND,FRONTEND" \
  --prefix-colors "bgBlue.bold,bgGreen.bold" \
  "cd backend && pnpm dev" \
  "cd frontend && pnpm dev"