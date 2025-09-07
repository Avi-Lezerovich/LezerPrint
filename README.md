# LezerPrint - 3D Printer Management System

A comprehensive 3D printer management system with real-time monitoring, file management, and print job control.

## 🚀 Quick Start

### Option 1: Use the startup script (Recommended)
```bash
./start.sh
```

### Option 2: Use npm command
```bash
npm run start
# or
npm run dev
```

### Option 3: Manual startup
```bash
# 1. Start database
docker-compose -f docker-compose.dev.yml up -d

# 2. Start backend (in one terminal)
cd backend && npx tsx src/server.ts

# 3. Start frontend (in another terminal)
cd frontend && npm run dev

# 4. Start Prisma Studio (optional)
cd backend && npx prisma studio
```

## 🛑 Stop All Services

```bash
./stop.sh
# or
npm run stop
```

## 📱 Access Points

- **Main Website**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Database Admin (Prisma Studio)**: http://localhost:5555

## 🔐 Features

- **User Authentication**: Sign up, login, JWT tokens
- **File Management**: Upload STL/G-code files
- **Print Job Control**: Start, pause, resume, cancel prints
- **Real-time Monitoring**: WebSocket for live updates
- **Database Management**: Cloud database with Prisma Accelerate

## 📋 First Time Setup

1. **Install Dependencies**:
   ```bash
   npm run setup
   ```

2. **Start the application**:
   ```bash
   ./start.sh
   ```

3. **Sign up for an account**:
   - Go to http://localhost:3000
   - Click "Register"
   - Fill out the form
   - Start using LezerPrint!

## 🗄️ Database

- Uses **Prisma Accelerate** for cloud database
- Environment variables are secured in `.env` (not committed to Git)
- View data in Prisma Studio at http://localhost:5555

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Real-time**: Socket.io WebSockets
- **Authentication**: JWT with bcrypt
- **Cloud Database**: Prisma Accelerate

## 📁 Project Structure

```
LezerPrint/
├── frontend/          # Next.js frontend
├── backend/           # Node.js backend
├── shared/           # Shared types and utilities
├── docs/             # Documentation
├── start.sh          # Startup script
├── stop.sh           # Stop script
└── docker-compose.dev.yml  # Local database
```

## 🚨 Troubleshooting

- **Port conflicts**: The startup script automatically handles port conflicts
- **Docker not running**: The script will prompt you to start Docker
- **Database connection**: Ensure your Prisma Accelerate URL is in `backend/.env`

## 🔒 Security

- Environment variables are not committed to Git
- Passwords are hashed with bcrypt
- JWT tokens for secure authentication
- Cloud database with Prisma Accelerate
