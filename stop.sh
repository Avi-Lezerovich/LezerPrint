#!/bin/bash

# LezerPrint Stop Script
echo "🛑 Stopping LezerPrint..."

# Colors for output
RED='\033[0;31m'
BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧹 Stopping all processes...${NC}"

# Kill all related processes
pkill -f "next dev" 2>/dev/null || true
pkill -f "tsx.*server.ts" 2>/dev/null || true
pkill -f "prisma studio" 2>/dev/null || true
pkill -f "nodemon" 2>/dev/null || true

# Stop Docker containers
echo -e "${BLUE}🐳 Stopping database containers...${NC}"
docker-compose -f docker-compose.dev.yml down

echo -e "${GREEN}✅ LezerPrint stopped successfully!${NC}"
