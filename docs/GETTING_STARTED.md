# 🚀 Getting Started with LezerPrint

*Get LezerPrint up and running in under 10 minutes*

---

## 📋 Prerequisites Checklist

Before starting, ensure you have these installed:

- [ ] **Node.js 18+** - [Download here](https://nodejs.org/)
- [ ] **npm or yarn** - Comes with Node.js
- [ ] **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop/)
- [ ] **Git** - [Download here](https://git-scm.com/)

### ✅ Quick Verification

```bash
# Verify installations
node --version    # Should be 18.0.0 or higher
npm --version     # Should be 8.0.0 or higher
docker --version  # Should be 20.0.0 or higher
git --version     # Should be 2.30.0 or higher
```

---

## ⚡ One-Command Setup

The fastest way to get started:

```bash
# Clone, setup, and start in one go
git clone https://github.com/Avi-Lezerovich/LezerPrint.git && \
cd LezerPrint && \
npm run setup && \
./start.sh
```

**That's it!** 🎉 LezerPrint will be running at http://localhost:3000

---

## 📖 Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Avi-Lezerovich/LezerPrint.git
cd LezerPrint
```

### 2. Install Dependencies

```bash
# Install all dependencies for frontend and backend
npm run setup

# Or manually install each part
cd backend && npm install
cd ../frontend && npm install
```

### 3. Start the Application

```bash
# Option 1: Use the automated script (Recommended)
./start.sh

# Option 2: Use npm command
npm run start

# Option 3: Manual startup (for development)
# Terminal 1: Start database
docker-compose -f docker-compose.dev.yml up -d

# Terminal 2: Start backend
cd backend && npx tsx src/server.ts

# Terminal 3: Start frontend
cd frontend && npm run dev

# Terminal 4: Start database admin (optional)
cd backend && npx prisma studio
```

### 4. Verify Installation

After startup, you should see:

```
✅ Backend running at http://localhost:3001
✅ Frontend running at http://localhost:3000
✅ Database Admin running at http://localhost:5555
```

---

## 🎯 First Successful Run

### Access the Application

1. **Open your browser** to http://localhost:3000
2. **You should see** the LezerPrint welcome screen
3. **Create an account** by clicking "Register"
4. **Fill out the form** with your information
5. **Sign in** and explore the dashboard

### Test Core Features

```bash
# 1. Check API health
curl http://localhost:3001/api/health

# Expected response:
# {
#   "status": "ok",
#   "timestamp": "2024-01-01T00:00:00.000Z",
#   "version": "1.0.0"
# }

# 2. Test WebSocket connection
# Open browser console on http://localhost:3000
# You should see: "Connected to LezerPrint server"
```

### Quick Feature Tour

1. **Dashboard** - View printer status and recent activity
2. **Files** - Upload an STL file (use any 3D model)
3. **Print Jobs** - Start a demo print job
4. **Analytics** - View print statistics and charts
5. **Camera** - Check the simulated camera feed
6. **Settings** - Explore printer configuration

---

## 🛠️ Development Workflow

### Hot Reload Development

```bash
# Start in development mode with hot reload
npm run dev

# This starts:
# - Frontend dev server with fast refresh
# - Backend with auto-restart on changes
# - Database with persistent data
```

### Database Management

```bash
# View database content
npm run db:studio
# Opens at http://localhost:5555

# Reset database (if needed)
cd backend && npx prisma migrate reset

# Apply schema changes
cd backend && npx prisma db push
```

### Code Quality

```bash
# Frontend linting
cd frontend && npm run lint

# Format code
cd frontend && npm run format

# Type checking
cd frontend && npm run type-check
```

---

## 🚨 Common Setup Issues

### Issue: Docker Not Running

**Error**: `Cannot connect to the Docker daemon`

**Solution**:
```bash
# Start Docker Desktop
# Wait for it to fully start (check system tray)
# Then retry: ./start.sh
```

### Issue: Port Already in Use

**Error**: `EADDRINUSE: address already in use :::3000`

**Solution**:
```bash
# Stop all services
./stop.sh

# Kill any remaining processes
pkill -f "next dev"
pkill -f "tsx.*server.ts"

# Restart
./start.sh
```

### Issue: Database Connection Error

**Error**: `Can't reach database server`

**Solution**:
```bash
# Ensure Docker is running
docker ps

# Restart database
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up -d

# Wait 30 seconds, then restart app
./start.sh
```

### Issue: Dependencies Not Installing

**Error**: `npm ERR! peer dep missing`

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf backend/node_modules backend/package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json

# Reinstall
npm run setup
```

---

## 🔧 Environment Variables

LezerPrint uses environment variables for configuration. The system works out-of-the-box with defaults, but you can customize:

### Backend Configuration

Create `backend/.env`:

```env
# Database
DATABASE_URL="postgresql://developer:devpass123@localhost:5432/lezerprint_dev"

# JWT
JWT_SECRET="your-super-secret-jwt-key"

# App
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"

# File uploads
MAX_FILE_SIZE=50000000  # 50MB
UPLOAD_DIR="./uploads"

# Printer (optional - for real hardware)
PRINTER_PORT="/dev/ttyUSB0"
PRINTER_BAUDRATE=115200
```

### Frontend Configuration

Create `frontend/.env.local`:

```env
# API
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_WS_URL="http://localhost:3001"

# Features
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_CAMERA_ENABLED=true
```

---

## 📱 Next Steps

Now that you have LezerPrint running:

### 🎓 Learning Path

1. **Explore the UI** - Click through all the features
2. **Upload a 3D Model** - Try an STL file from Thingiverse
3. **Start a Print Job** - Experience the full workflow
4. **Check Analytics** - View the generated charts and data
5. **Try the Terminal** - Send G-code commands
6. **Customize Settings** - Configure printer profiles

### 🔍 Deep Dive

- [**User Manual**](USER_MANUAL.md) - Complete feature guide
- [**Development Guide**](DEVELOPMENT_GUIDE.md) - Code architecture
- [**API Reference**](API_REFERENCE.md) - Endpoint documentation

### 🛠️ Development

- [**Contributing**](CONTRIBUTING.md) - How to contribute
- [**Architecture**](ARCHITECTURE.md) - System design
- [**Deployment**](DEPLOYMENT.md) - Production setup

### 🆘 Need Help?

- [**Troubleshooting Guide**](TROUBLESHOOTING.md) - Common solutions
- [**FAQ**](FAQ.md) - Frequently asked questions
- [**GitHub Issues**](https://github.com/Avi-Lezerovich/LezerPrint/issues) - Report bugs

---

## 🎉 Success Criteria

You've successfully set up LezerPrint when:

- [ ] All services start without errors
- [ ] You can access the web interface at http://localhost:3000
- [ ] You can create an account and sign in
- [ ] You can upload a file successfully
- [ ] You can start a print job
- [ ] Real-time updates work (WebSocket connection)
- [ ] Charts and analytics display correctly
- [ ] Camera feed shows (simulated in demo mode)

**Time to complete**: 5-10 minutes for experienced developers, 15-20 minutes for beginners.

---

**🚀 Ready to explore?** Head over to the [**User Manual**](USER_MANUAL.md) to discover all of LezerPrint's powerful features!

*Having issues? Check our [**Troubleshooting Guide**](TROUBLESHOOTING.md) or [open an issue](https://github.com/Avi-Lezerovich/LezerPrint/issues).*