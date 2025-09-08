# 🚨 Troubleshooting Guide

*Solutions to common issues and problems with LezerPrint*

---

## 📖 Table of Contents

- [Quick Diagnostics](#-quick-diagnostics)
- [Installation Issues](#-installation-issues)
- [Connection Problems](#-connection-problems)
- [File Upload Issues](#-file-upload-issues)
- [Print Job Problems](#-print-job-problems)
- [Performance Issues](#-performance-issues)
- [Database Problems](#-database-problems)
- [Browser Issues](#-browser-issues)
- [Hardware Communication](#-hardware-communication)
- [Error Code Reference](#-error-code-reference)
- [Getting Help](#-getting-help)

---

## 🔍 Quick Diagnostics

### Health Check Commands

Run these commands to quickly identify issues:

```bash
# Check service status
curl http://localhost:3001/api/health

# Check all running processes
ps aux | grep -E "(node|npm|docker)"

# Check port usage
netstat -tulpn | grep -E "(3000|3001|5432|6379|5555)"

# Check Docker containers
docker ps -a

# Check logs for errors
docker-compose logs --tail=50
```

### System Requirements Check

```bash
# Check Node.js version (requires 20+)
node --version

# Check npm version
npm --version

# Check Docker version
docker --version

# Check available disk space
df -h

# Check available memory
free -h
```

### Environment Validation

```bash
# Verify environment files exist
ls -la backend/.env frontend/.env.local

# Check database connection
cd backend && npx prisma db pull

# Test API connectivity
curl -I http://localhost:3001/api/health
```

---

## 📦 Installation Issues

### Issue: `npm install` Fails

#### Symptoms
- Package installation errors
- Permission denied messages
- Network timeout errors

#### Solutions

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf backend/node_modules backend/package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json

# Reinstall with verbose output
npm run setup --verbose

# If permission issues on Linux/Mac
sudo chown -R $USER ~/.npm
```

#### Alternative Solutions

```bash
# Use different registry if network issues
npm config set registry https://registry.npmjs.org/

# Try with yarn instead
npm install -g yarn
cd backend && yarn install
cd ../frontend && yarn install

# For corporate networks, configure proxy
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080
```

### Issue: Docker Installation Problems

#### Symptoms
- Docker commands not found
- Permission denied when running Docker
- Container startup failures

#### Solutions

```bash
# Install Docker (Ubuntu/Debian)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER
# Logout and login again

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Test Docker installation
docker run hello-world
```

### Issue: TypeScript Compilation Errors

#### Symptoms
- Build fails with TypeScript errors
- Module not found errors
- Type declaration issues

#### Solutions

```bash
# Update TypeScript
cd backend && npm install typescript@latest
cd ../frontend && npm install typescript@latest

# Clear TypeScript cache
cd backend && npx tsc --build --clean
cd ../frontend && npx tsc --build --clean

# Regenerate Prisma client
cd backend && npx prisma generate

# Check tsconfig.json is valid
cd backend && npx tsc --noEmit
cd ../frontend && npx tsc --noEmit
```

---

## 🌐 Connection Problems

### Issue: Cannot Access LezerPrint

#### Symptoms
- Browser shows "This site can't be reached"
- Connection timeout errors
- ERR_CONNECTION_REFUSED

#### Diagnostic Steps

```bash
# Check if processes are running
ps aux | grep -E "(next|tsx)"

# Check specific ports
lsof -i :3000  # Frontend
lsof -i :3001  # Backend

# Check firewall
sudo ufw status
```

#### Solutions

```bash
# Option 1: Restart all services
./stop.sh
./start.sh

# Option 2: Manual restart
pkill -f "next dev"
pkill -f "tsx.*server.ts"
npm run dev

# Option 3: Check port conflicts
# Kill processes using required ports
sudo kill -9 $(lsof -t -i:3000)
sudo kill -9 $(lsof -t -i:3001)
```

### Issue: WebSocket Connection Failures

#### Symptoms
- Real-time updates not working
- "WebSocket connection failed" in console
- Frequent disconnections

#### Solutions

```bash
# Check WebSocket endpoint
curl -I http://localhost:3001/socket.io/

# Verify backend WebSocket server
grep -r "socket.io" backend/src/

# Test WebSocket connection
node -e "
const io = require('socket.io-client');
const socket = io('http://localhost:3001');
socket.on('connect', () => console.log('Connected'));
socket.on('disconnect', () => console.log('Disconnected'));
"
```

#### Network Issues

```bash
# Check proxy settings
echo $HTTP_PROXY
echo $HTTPS_PROXY

# Test with proxy bypass
HTTP_PROXY="" HTTPS_PROXY="" npm run dev

# For corporate networks, configure WebSocket
# Add to frontend/.env.local:
NEXT_PUBLIC_WS_TRANSPORTS=polling
```

### Issue: CORS Errors

#### Symptoms
- "Access blocked by CORS policy" in browser console
- API requests failing from frontend
- OPTIONS request failures

#### Solutions

Check backend CORS configuration:

```typescript
// backend/src/server.ts
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

Temporary development fix:

```bash
# Start Chrome with disabled security (development only)
google-chrome --disable-web-security --user-data-dir="/tmp/chrome_dev"
```

---

## 📁 File Upload Issues

### Issue: File Upload Fails

#### Symptoms
- Upload progress stops
- "File too large" errors
- "Invalid file type" messages

#### Diagnostic Steps

```bash
# Check upload directory permissions
ls -la backend/uploads/
# Should show: drwxr-xr-x ... uploads

# Check disk space
df -h backend/uploads/

# Check file type and size
file your-model.stl
ls -lh your-model.stl
```

#### Solutions

```bash
# Fix upload directory permissions
mkdir -p backend/uploads
chmod 755 backend/uploads

# Increase upload limits in backend
# Edit backend/src/middleware/upload.ts
const upload = multer({
  limits: {
    fileSize: 100 * 1024 * 1024  // 100MB
  }
});

# Check supported file types
echo "Supported: STL, G-code"
```

### Issue: Thumbnail Generation Fails

#### Symptoms
- Files upload but no thumbnails appear
- Sharp library errors in logs
- Image processing failures

#### Solutions

```bash
# Install system dependencies for Sharp
sudo apt update
sudo apt install libvips-dev

# Reinstall Sharp
cd backend
npm uninstall sharp
npm install sharp

# Test Sharp installation
node -e "console.log(require('sharp'))"

# Check if files are valid
file backend/uploads/your-file.stl
```

### Issue: Metadata Extraction Fails

#### Symptoms
- Files upload but show no metadata
- STL parsing errors
- Missing file information

#### Solutions

```bash
# Check file format
file your-model.stl
hexdump -C your-model.stl | head

# Verify file isn't corrupted
# Try opening in 3D software

# Check backend logs for parsing errors
tail -f backend/logs/app.log | grep -i "metadata"

# Test with known good file
curl -o test.stl "https://www.thingiverse.com/download:12345"
```

---

## 🖨️ Print Job Problems

### Issue: Print Jobs Won't Start

#### Symptoms
- Jobs stay in "QUEUED" status
- "Printer not responding" errors
- Commands not reaching printer

#### Diagnostic Steps

```bash
# Check printer connection
ls /dev/tty*  # Look for USB serial devices
dmesg | grep -i usb  # Check USB device logs

# Test serial communication
screen /dev/ttyUSB0 115200  # Replace with your port
# Type: M105 (get temperature)
# Should respond with: ok T:23.4 /0.0 B:22.8 /0.0
```

#### Solutions

```bash
# Fix USB permissions
sudo usermod -a -G dialout $USER
# Logout and login again

# Check if port is available
sudo fuser /dev/ttyUSB0
# Kill if process is using it:
sudo fuser -k /dev/ttyUSB0

# Update printer port in environment
echo "PRINTER_PORT=/dev/ttyUSB0" >> backend/.env
echo "PRINTER_BAUDRATE=115200" >> backend/.env

# Test with different baud rates
# Common rates: 9600, 38400, 115200, 250000
```

### Issue: Print Progress Not Updating

#### Symptoms
- Progress stuck at 0%
- No real-time updates
- WebSocket events not firing

#### Solutions

```bash
# Check WebSocket connection
# Open browser console and look for:
# "Connected to LezerPrint server"

# Verify event listeners
# Check browser Network tab for WebSocket frames

# Test direct printer communication
cd backend
node -e "
const { PrinterService } = require('./dist/services/printer/PrinterService');
const printer = new PrinterService();
printer.getStatus().then(console.log);
"

# Check if G-code has progress comments
grep -n "; layer" your-file.gcode | head -5
```

### Issue: Temperature Readings Incorrect

#### Symptoms
- Temperature shows 0°C
- Wildly fluctuating readings
- Sensor errors

#### Solutions

```bash
# Test temperature command directly
echo "M105" > /dev/ttyUSB0
cat /dev/ttyUSB0

# Check thermistor configuration
# Send: M303 E0 S200 C8  (PID autotune)

# Verify wiring if hardware issue
# Check firmware configuration

# Update temperature parsing in backend
# Check backend/src/services/printer/TemperatureParser.ts
```

---

## ⚡ Performance Issues

### Issue: Slow Page Loading

#### Symptoms
- Pages take long to load
- High CPU usage
- Memory consumption growing

#### Diagnostic Steps

```bash
# Check system resources
htop
# or
top

# Check Node.js memory usage
ps aux | grep node

# Monitor database performance
docker-compose exec postgres pg_stat_activity

# Check network requests in browser
# Open DevTools > Network tab
```

#### Solutions

```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run dev

# Optimize database queries
cd backend
npx prisma studio
# Check slow query logs

# Enable production optimizations
export NODE_ENV=production
npm run build
npm start

# Clear browser cache
# Ctrl+Shift+Delete in most browsers
```

### Issue: Database Queries Slow

#### Symptoms
- API requests timing out
- High database CPU usage
- Slow analytics loading

#### Solutions

```sql
-- Check for missing indexes
SELECT 
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE schemaname = 'public'
  AND n_distinct > 100;

-- Add missing indexes
CREATE INDEX CONCURRENTLY idx_print_jobs_status_created 
ON print_jobs(status, created_at);

CREATE INDEX CONCURRENTLY idx_files_user_type 
ON files(user_id, file_type);

-- Analyze tables
ANALYZE;

-- Update table statistics
VACUUM ANALYZE;
```

### Issue: High Memory Usage

#### Symptoms
- System running out of memory
- Frequent garbage collection
- Application crashes

#### Solutions

```bash
# Monitor memory usage
watch -n 1 'free -h'

# Check for memory leaks
node --inspect backend/dist/server.js
# Open chrome://inspect in Chrome

# Limit container memory
# Add to docker-compose.yml:
services:
  backend:
    mem_limit: 1g
    memswap_limit: 1g

# Use memory profiling
npm install -g clinic
clinic doctor -- node backend/dist/server.js
```

---

## 🗄️ Database Problems

### Issue: Database Connection Failed

#### Symptoms
- "Cannot connect to database" errors
- Prisma client errors
- Connection timeout

#### Diagnostic Steps

```bash
# Check PostgreSQL container
docker-compose ps postgres

# Check container logs
docker-compose logs postgres

# Test direct connection
psql "postgresql://developer:devpass123@localhost:5432/lezerprint_dev"
```

#### Solutions

```bash
# Restart database container
docker-compose restart postgres

# Check database URL
echo $DATABASE_URL
# Should be: postgresql://developer:devpass123@localhost:5432/lezerprint_dev

# Reset database
docker-compose down -v
docker-compose up -d postgres
# Wait 30 seconds
cd backend && npx prisma db push

# Check firewall/ports
sudo ufw status
telnet localhost 5432
```

### Issue: Migration Errors

#### Symptoms
- Prisma migrate fails
- Schema out of sync
- Foreign key constraint errors

#### Solutions

```bash
# Check migration status
cd backend
npx prisma migrate status

# Reset database (development only)
npx prisma migrate reset

# Apply pending migrations
npx prisma migrate deploy

# Generate new migration
npx prisma migrate dev --name fix_schema

# Force schema sync (dangerous - backup first)
npx prisma db push --force-reset
```

### Issue: Data Corruption

#### Symptoms
- Unexpected data in database
- Foreign key violations
- Inconsistent state

#### Solutions

```bash
# Backup current data
pg_dump "postgresql://developer:devpass123@localhost:5432/lezerprint_dev" > backup.sql

# Check data integrity
psql -d lezerprint_dev -c "
SELECT 
  COUNT(*) as orphaned_jobs
FROM print_jobs pj
LEFT JOIN files f ON pj.file_id = f.id
WHERE f.id IS NULL;
"

# Fix orphaned records
psql -d lezerprint_dev -c "
DELETE FROM print_jobs 
WHERE file_id NOT IN (SELECT id FROM files);
"

# Restore from backup if needed
dropdb lezerprint_dev
createdb lezerprint_dev
psql lezerprint_dev < backup.sql
```

---

## 🌐 Browser Issues

### Issue: Browser Compatibility

#### Symptoms
- Features not working in specific browsers
- JavaScript errors in console
- UI elements not displaying correctly

#### Solutions

```bash
# Check browser requirements
echo "Supported browsers:
- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+"

# Clear browser data
# Chrome: Settings > Privacy > Clear browsing data
# Firefox: Settings > Privacy > Clear Data

# Disable browser extensions
# Test in incognito/private mode

# Update browser to latest version
```

### Issue: JavaScript Errors

#### Symptoms
- Console shows JavaScript errors
- Features not responding
- White screen of death

#### Diagnostic Steps

1. Open browser Developer Tools (F12)
2. Check Console tab for errors
3. Check Network tab for failed requests
4. Check Sources tab for debugging

#### Common Fixes

```javascript
// Clear localStorage
localStorage.clear();
sessionStorage.clear();

// Check for conflicting extensions
// Disable ad blockers, VPNs, etc.

// Verify JavaScript is enabled
// Chrome: Settings > Privacy > Site Settings > JavaScript

// Check Content Security Policy errors
// Look for CSP violations in console
```

### Issue: WebRTC/Camera Issues

#### Symptoms
- Camera feed not loading
- "Permission denied" errors
- Black screen in camera view

#### Solutions

```bash
# Check camera permissions
# Chrome: Settings > Privacy > Camera
# Firefox: Settings > Privacy > Permissions > Camera

# Test camera directly
# Chrome: chrome://settings/content/camera
# Firefox: about:preferences#privacy

# Check HTTPS requirement
# WebRTC requires HTTPS in production
# Use https://localhost:3000 instead of http://

# Clear site permissions
# Chrome: Settings > Privacy > Site Settings > localhost
```

---

## 🔧 Hardware Communication

### Issue: Printer Not Detected

#### Symptoms
- No printer in device list
- "No serial ports found" error
- USB connection issues

#### Diagnostic Steps

```bash
# List USB devices
lsusb

# Check serial devices
ls -la /dev/tty*

# Check dmesg for USB events
dmesg | tail -20 | grep -i usb

# Test with screen command
screen /dev/ttyUSB0 115200
```

#### Solutions

```bash
# Install USB drivers (if needed)
sudo apt update
sudo apt install brltty

# Add user to dialout group
sudo usermod -a -G dialout $USER
# Logout and login

# Check USB cable and ports
# Try different USB port
# Try different USB cable

# Update udev rules
echo 'SUBSYSTEM=="tty", ATTRS{idVendor}=="1a86", ATTRS{idProduct}=="7523", MODE="0666"' | sudo tee /etc/udev/rules.d/99-printer.rules
sudo udevadm control --reload-rules
```

### Issue: Communication Timeout

#### Symptoms
- Commands timeout
- Intermittent connection drops
- "Printer not responding" errors

#### Solutions

```bash
# Increase timeout values
# Edit backend/.env:
PRINTER_TIMEOUT=10000  # 10 seconds

# Check baud rate
# Common rates: 115200, 250000
# Edit backend/.env:
PRINTER_BAUDRATE=115200

# Test with lower baud rate
PRINTER_BAUDRATE=9600

# Check for electromagnetic interference
# Move USB cable away from power cables
# Use shielded USB cable
```

### Issue: G-code Command Errors

#### Symptoms
- "Unknown command" errors
- Printer rejects commands
- Firmware compatibility issues

#### Solutions

```bash
# Check firmware type
# Send M115 command to get firmware info

# Update command set for firmware
# Marlin vs RepRap vs other firmware

# Test basic commands
echo "G28" > /dev/ttyUSB0  # Home all axes
echo "M105" > /dev/ttyUSB0  # Get temperature

# Check for firmware updates
# Update printer firmware if needed
```

---

## 📋 Error Code Reference

### API Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| `VALIDATION_ERROR` | Invalid input data | Check request format and required fields |
| `UNAUTHORIZED` | Missing or invalid token | Login again or refresh token |
| `FORBIDDEN` | Insufficient permissions | Contact admin for role upgrade |
| `NOT_FOUND` | Resource not found | Verify resource ID exists |
| `CONFLICT` | Resource already exists | Use different name or update existing |
| `RATE_LIMITED` | Too many requests | Wait and retry, or upgrade account |
| `INTERNAL_ERROR` | Server error | Check logs and contact support |
| `PRINTER_ERROR` | Hardware communication error | Check printer connection |

### HTTP Status Codes

| Status | Meaning | Common Causes |
|--------|---------|---------------|
| `400` | Bad Request | Invalid JSON, missing fields |
| `401` | Unauthorized | Expired token, invalid credentials |
| `403` | Forbidden | Insufficient permissions |
| `404` | Not Found | Wrong URL, deleted resource |
| `409` | Conflict | Duplicate username/email |
| `422` | Validation Failed | Invalid data format |
| `429` | Rate Limited | Too many requests |
| `500` | Server Error | Database connection, code bugs |
| `503` | Service Unavailable | Server overloaded, maintenance |

### Database Error Codes

| Error | Description | Solution |
|-------|-------------|----------|
| `P2002` | Unique constraint violation | Use different value for unique field |
| `P2003` | Foreign key constraint violation | Ensure referenced record exists |
| `P2025` | Record not found | Check if record exists before operation |
| `P1008` | Operation timed out | Optimize query or increase timeout |
| `P1001` | Can't reach database | Check connection string and network |

---

## 🆘 Getting Help

### Self-Service Options

#### 1. Documentation
- [**User Manual**](USER_MANUAL.md) - Complete feature guide
- [**API Reference**](API_REFERENCE.md) - Technical documentation
- [**Development Guide**](DEVELOPMENT_GUIDE.md) - Developer resources

#### 2. Community Resources
- [**GitHub Discussions**](https://github.com/Avi-Lezerovich/LezerPrint/discussions) - Community help
- [**FAQ**](FAQ.md) - Frequently asked questions
- [**Issue Search**](https://github.com/Avi-Lezerovich/LezerPrint/issues) - Existing solutions

### Getting Support

#### Information to Include

When seeking help, please provide:

1. **System Information**
   ```bash
   # Run this command and include output:
   echo "OS: $(uname -a)"
   echo "Node.js: $(node --version)"
   echo "npm: $(npm --version)"
   echo "Docker: $(docker --version)"
   ```

2. **Error Details**
   - Exact error message
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable

3. **Environment**
   - Development or production
   - Browser and version
   - Any customizations made

4. **Logs**
   ```bash
   # Backend logs
   docker-compose logs backend --tail=50
   
   # Frontend logs
   # Check browser console (F12)
   
   # Database logs
   docker-compose logs postgres --tail=20
   ```

#### Support Channels

1. **GitHub Issues** - Bug reports and feature requests
2. **GitHub Discussions** - General questions and help
3. **Community Discord** - Real-time chat support
4. **Email Support** - For sensitive issues

### Emergency Procedures

#### System Recovery

```bash
# Stop all services
./stop.sh

# Backup current state
tar -czf backup-$(date +%Y%m%d).tar.gz backend/uploads backend/.env frontend/.env.local

# Reset to clean state
git stash
git checkout main
git pull origin main

# Restore environment
cp backup/.env backend/
cp backup/.env.local frontend/

# Restart services
./start.sh
```

#### Data Recovery

```bash
# Database backup
pg_dump "postgresql://developer:devpass123@localhost:5432/lezerprint_dev" > emergency-backup.sql

# File backup
cp -r backend/uploads /backup/location/

# Restore from backup
psql lezerprint_dev < emergency-backup.sql
cp -r /backup/location/uploads backend/
```

---

## 🔧 Quick Reference

### Essential Commands

```bash
# Service management
./start.sh          # Start all services
./stop.sh           # Stop all services
npm run dev         # Development mode

# Health checks
curl localhost:3001/api/health
docker-compose ps
pm2 status

# Logs
docker-compose logs --tail=50
tail -f backend/logs/app.log
journalctl -u lezerprint

# Database
npx prisma studio
npx prisma migrate status
pg_dump database_url > backup.sql

# File permissions
chmod +x start.sh stop.sh
chown -R $USER:$USER backend/uploads
```

### Port Reference

| Port | Service | Description |
|------|---------|-------------|
| 3000 | Frontend | Next.js application |
| 3001 | Backend | Express API server |
| 5432 | PostgreSQL | Database server |
| 6379 | Redis | Cache server |
| 5555 | Prisma Studio | Database admin UI |

### Common File Locations

```bash
# Configuration
backend/.env                 # Backend environment
frontend/.env.local         # Frontend environment
docker-compose.dev.yml      # Development containers

# Logs
backend/logs/app.log        # Application logs
/var/log/nginx/             # Nginx logs (production)
~/.pm2/logs/                # PM2 logs (production)

# Data
backend/uploads/            # User uploads
backend/prisma/schema.prisma # Database schema
```

---

**Still having issues?** Don't hesitate to [open an issue](https://github.com/Avi-Lezerovich/LezerPrint/issues) or start a [discussion](https://github.com/Avi-Lezerovich/LezerPrint/discussions). The community is here to help! 🤝