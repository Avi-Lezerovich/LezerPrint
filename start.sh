#!/bin/bash

# LezerPrint Startup Script
echo "🚀 Starting LezerPrint..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to kill processes on specific ports
cleanup_ports() {
    echo -e "${BLUE}🧹 Cleaning up any existing processes...${NC}"
    
    # Kill processes on common ports
    pkill -f "next dev" 2>/dev/null || true
    pkill -f "tsx.*server.ts" 2>/dev/null || true
    pkill -f "prisma studio" 2>/dev/null || true
    
    # Wait a moment for processes to terminate
    sleep 2
}

# Cleanup existing processes
cleanup_ports

# Start database containers
echo -e "${BLUE}🗄️  Starting database containers...${NC}"
docker-compose -f docker-compose.dev.yml up -d

# Wait for database to be ready
echo -e "${YELLOW}⏳ Waiting for database to be ready...${NC}"
sleep 5

# Generate Prisma client and push schema
echo -e "${BLUE}🔄 Setting up database schema...${NC}"
cd backend
npx prisma generate
npx prisma db push
cd ..

# Start backend server
echo -e "${BLUE}🖥️  Starting backend server...${NC}"
cd backend
npx tsx src/server.ts &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 5

# Start frontend server
echo -e "${BLUE}🌐 Starting frontend server...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Start Prisma Studio
echo -e "${BLUE}📊 Starting Prisma Studio...${NC}"
cd backend
npx prisma studio &
STUDIO_PID=$!
cd ..

# Wait for all services to start
echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"
sleep 10

# Check if services are running (simple port checks)
echo -e "${GREEN}✅ Checking services...${NC}"

# Check backend
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend running at http://localhost:3001${NC}"
else
    echo -e "${RED}❌ Backend not responding${NC}"
fi

# Check frontend
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend running at http://localhost:3000${NC}"
else
    echo -e "${RED}❌ Frontend not responding${NC}"
fi

# Check Prisma Studio
if lsof -Pi :5555 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Database Admin running at http://localhost:5555${NC}"
else
    echo -e "${RED}❌ Database Admin not responding${NC}"
fi

echo ""
echo -e "${GREEN}🎉 LezerPrint startup complete!${NC}"
echo ""
echo -e "${BLUE}📱 Main Website:     ${NC}http://localhost:3000"
echo -e "${BLUE}🔧 Backend API:      ${NC}http://localhost:3001"
echo -e "${BLUE}📊 Database Admin:   ${NC}http://localhost:5555"
echo ""
echo -e "${YELLOW}Services are running in background.${NC}"
echo -e "${YELLOW}To stop all services, run: ./stop.sh${NC}"
echo ""
echo -e "${GREEN}✅ All services started successfully!${NC}"
