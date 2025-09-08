# 🔧 Installation Guide

*Complete installation instructions for all environments*

---

## 📖 Table of Contents

- [System Requirements](#-system-requirements)
- [Development Installation](#-development-installation)
- [Production Installation](#-production-installation)
- [Docker Installation](#-docker-installation)
- [Environment Configuration](#-environment-configuration)
- [Database Setup](#-database-setup)
- [Verification](#-verification)
- [Troubleshooting](#-troubleshooting)

---

## 💻 System Requirements

### Minimum Requirements

| Component | Requirement | Recommended |
|-----------|-------------|-------------|
| **OS** | Windows 10, macOS 10.15, Ubuntu 18.04+ | Latest versions |
| **Node.js** | 20.0.0+ | 20.0.0+ |
| **RAM** | 4GB | 8GB+ |
| **Storage** | 2GB free space | 10GB+ |
| **Docker** | 20.0.0+ | Latest |

### Software Dependencies

#### Required
- **Node.js** 20+ with npm 10+
- **Docker Desktop** (for database)
- **Git** (for cloning)

#### Optional
- **PostgreSQL** 15+ (if not using Docker)
- **Redis** 7+ (for caching)
- **Visual Studio Code** (recommended IDE)

---

## 🚀 Development Installation

### Quick Development Setup

```bash
# 1. Clone repository
git clone https://github.com/Avi-Lezerovich/LezerPrint.git
cd LezerPrint

# 2. Install dependencies
npm run setup

# 3. Start development environment
./start.sh
```

### Manual Development Setup

#### 1. Clone and Navigate

```bash
git clone https://github.com/Avi-Lezerovich/LezerPrint.git
cd LezerPrint
```

#### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Set up environment variables
cp .env.example .env
# Edit .env with your settings
```

#### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your settings
```

#### 4. Database Setup

```bash
# Start PostgreSQL and Redis with Docker
docker-compose -f docker-compose.dev.yml up -d

# Wait for containers to be ready (30 seconds)
sleep 30

# Push database schema
cd backend
npx prisma db push
```

#### 5. Start Services

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev

# Terminal 3: Start Prisma Studio (optional)
cd backend
npx prisma studio
```

---

## 🏭 Production Installation

### Prerequisites

- **Linux server** (Ubuntu 20.04+ recommended)
- **Docker & Docker Compose** installed
- **Domain name** configured
- **SSL certificate** (Let's Encrypt recommended)

### Production Deployment

#### 1. Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
```

#### 2. Application Setup

```bash
# Clone repository
git clone https://github.com/Avi-Lezerovich/LezerPrint.git
cd LezerPrint

# Create production environment file
cp .env.example .env.production
# Edit with production values
```

#### 3. Environment Configuration

Create `.env.production`:

```env
# Database
DATABASE_URL="postgresql://lezerprint:STRONG_PASSWORD@postgres:5432/lezerprint_prod"

# Application
NODE_ENV=production
PORT=3001
FRONTEND_URL="https://your-domain.com"

# Security
JWT_SECRET="your-very-secure-jwt-secret-256-bits"
SESSION_SECRET="your-very-secure-session-secret"

# Email (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# File Storage
MAX_FILE_SIZE=100000000  # 100MB
UPLOAD_DIR="/app/uploads"

# Monitoring
LOG_LEVEL=info
```

#### 4. Production Build

```bash
# Build application
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Run database migrations
docker-compose -f docker-compose.prod.yml exec backend npx prisma db push
```

#### 5. SSL Configuration

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 🐳 Docker Installation

### Development with Docker

```bash
# Clone repository
git clone https://github.com/Avi-Lezerovich/LezerPrint.git
cd LezerPrint

# Start database services for development (Postgres, Redis)
docker-compose -f docker-compose.dev.yml up -d
```

### Production Docker Setup

#### docker-compose.prod.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: lezerprint_prod
      POSTGRES_USER: lezerprint
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    networks:
      - app-network
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://lezerprint:${DB_PASSWORD}@postgres:5432/lezerprint_prod
    volumes:
      - uploads:/app/uploads
    networks:
      - app-network
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://your-domain.com/api
    networks:
      - app-network
    depends_on:
      - backend
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl/certs
    networks:
      - app-network
    depends_on:
      - frontend
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  uploads:

networks:
  app-network:
    driver: bridge
```

---

## ⚙️ Environment Configuration

### Backend Environment Variables

Create `backend/.env`:

```env
# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# Application Settings
NODE_ENV="development"  # development | production | test
PORT=3001
FRONTEND_URL="http://localhost:3000"

# Authentication
JWT_SECRET="your-256-bit-secret"
JWT_EXPIRES_IN="7d"
SESSION_SECRET="your-session-secret"

# File Upload
MAX_FILE_SIZE=100000000  # 100MB in bytes (default)
UPLOAD_DIR="./uploads"
ALLOWED_FILE_TYPES="stl,gcode"

# Printer Communication (for real hardware)
PRINTER_PORT="/dev/ttyUSB0"  # Linux/Mac
# PRINTER_PORT="COM3"        # Windows
PRINTER_BAUDRATE=115200
PRINTER_TIMEOUT=5000

# Email Configuration (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your-email@example.com"
SMTP_PASS="your-app-password"

# Monitoring & Logging
LOG_LEVEL="info"  # error | warn | info | debug
LOG_FILE="./logs/app.log"

# Redis (optional)
REDIS_URL="redis://localhost:6379"

# Features
ENABLE_CAMERA=true
ENABLE_TIMELAPSE=true
ENABLE_NOTIFICATIONS=true
DEMO_MODE=false
```

### Frontend Environment Variables

Create `frontend/.env.local`:

```env
# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_WS_URL="http://localhost:3001"

# Application Features
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_CAMERA_ENABLED=true
NEXT_PUBLIC_ANALYTICS_ENABLED=true
NEXT_PUBLIC_TIMELAPSE_ENABLED=true

# Upload Configuration
NEXT_PUBLIC_MAX_FILE_SIZE=100000000  # 100MB
NEXT_PUBLIC_SUPPORTED_FORMATS="stl,gcode"

# UI Configuration
NEXT_PUBLIC_THEME="dark"  # light | dark | system
NEXT_PUBLIC_APP_NAME="LezerPrint"
NEXT_PUBLIC_APP_VERSION="1.0.0"

# Monitoring (optional)
NEXT_PUBLIC_ANALYTICS_ID="your-analytics-id"
NEXT_PUBLIC_SENTRY_DSN="your-sentry-dsn"
```

---

## 🗄️ Database Setup

### PostgreSQL with Docker (Recommended)

```bash
# Start PostgreSQL container
docker-compose -f docker-compose.dev.yml up -d postgres

# Wait for container to be ready
docker-compose -f docker-compose.dev.yml logs postgres

# Initialize database
cd backend
npx prisma db push
```

### Local PostgreSQL Installation

#### Ubuntu/Debian

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
postgres=# CREATE DATABASE lezerprint_dev;
postgres=# CREATE USER developer WITH PASSWORD 'devpass123';
postgres=# GRANT ALL PRIVILEGES ON DATABASE lezerprint_dev TO developer;
postgres=# \q
```

#### macOS

```bash
# Install with Homebrew
brew install postgresql
brew services start postgresql

# Create database
createdb lezerprint_dev
```

#### Windows

1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run installer and follow setup wizard
3. Use pgAdmin to create database `lezerprint_dev`

### Database Migration

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed database (optional)
npx prisma db seed
```

---

## ✅ Verification

### Health Checks

```bash
# Check API health
curl http://localhost:3001/api/health

# Expected response:
# {
#   "status": "ok",
#   "timestamp": "2024-01-01T00:00:00.000Z",
#   "version": "1.0.0"
# }

# Check database connection
curl http://localhost:3001/api/health

# Check frontend
curl http://localhost:3000/api/health
```

### Service Status

```bash
# Check if all services are running
docker-compose -f docker-compose.dev.yml ps

# Check logs
docker-compose -f docker-compose.dev.yml logs

# Check ports
netstat -tulpn | grep -E "(3000|3001|5432|6379|5555)"
```

### Functional Tests

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test

# Run end-to-end tests
npm run test:e2e
```

---

## 🚨 Troubleshooting

### Common Issues

#### Port Conflicts

```bash
# Find process using port
lsof -i :3000
lsof -i :3001

# Kill process
kill -9 <PID>

# Or use stop script
./stop.sh
```

#### Database Connection Issues

```bash
# Check PostgreSQL status
docker-compose -f docker-compose.dev.yml logs postgres

# Reset database
docker-compose -f docker-compose.dev.yml down -v
docker-compose -f docker-compose.dev.yml up -d postgres

# Wait and retry
sleep 30
cd backend && npx prisma db push
```

#### Permission Issues

```bash
# Fix file permissions
sudo chown -R $USER:$USER .
chmod +x start.sh stop.sh

# Fix Docker permissions
sudo usermod -aG docker $USER
# Logout and login again
```

#### Build Failures

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules
rm -rf backend/node_modules frontend/node_modules
rm -rf backend/package-lock.json frontend/package-lock.json

# Reinstall
npm run setup
```

### Getting Help

1. **Check logs**: `docker-compose logs`
2. **Review environment**: Ensure all `.env` files are configured
3. **Verify ports**: Make sure no conflicts exist
4. **Check documentation**: [Troubleshooting Guide](TROUBLESHOOTING.md)
5. **Open issue**: [GitHub Issues](https://github.com/Avi-Lezerovich/LezerPrint/issues)

---

## 🎯 Next Steps

After successful installation:

1. **Create your first account** at http://localhost:3000
2. **Follow the getting started guide**: [Getting Started](GETTING_STARTED.md)
3. **Read the user manual**: [User Manual](USER_MANUAL.md)
4. **Explore the API**: [API Reference](API_REFERENCE.md)

---

**🎉 Installation Complete!** You're ready to start using LezerPrint. If you encountered any issues, check our [**Troubleshooting Guide**](TROUBLESHOOTING.md) or [open an issue](https://github.com/Avi-Lezerovich/LezerPrint/issues).