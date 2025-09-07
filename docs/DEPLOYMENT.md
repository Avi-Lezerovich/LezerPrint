# 🚀 Deployment Guide

*Complete guide for deploying LezerPrint to production environments*

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Server Requirements](#-server-requirements)
- [Docker Deployment](#-docker-deployment)
- [Manual Deployment](#-manual-deployment)
- [Database Setup](#-database-setup)
- [SSL Configuration](#-ssl-configuration)
- [Environment Configuration](#-environment-configuration)
- [Monitoring Setup](#-monitoring-setup)
- [Backup Strategies](#-backup-strategies)
- [Update Procedures](#-update-procedures)
- [Scaling Considerations](#-scaling-considerations)
- [Security Hardening](#-security-hardening)

---

## 🔍 Overview

LezerPrint can be deployed in several ways depending on your infrastructure needs:

- **Docker Compose** - Recommended for most deployments
- **Kubernetes** - For large-scale or enterprise deployments
- **Manual Installation** - For custom environments
- **Cloud Platforms** - AWS, Google Cloud, Azure
- **VPS/Dedicated Server** - Self-hosted solutions

### Deployment Architecture

```
                    ┌─────────────────┐
                    │   Load Balancer │
                    │   (nginx/HAProxy)│
                    └─────────┬───────┘
                              │
                    ┌─────────▼───────┐
                    │   Frontend      │
                    │   (Next.js)     │
                    └─────────┬───────┘
                              │
                    ┌─────────▼───────┐
                    │   Backend API   │
                    │   (Node.js)     │
                    └─────────┬───────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
        ┌─────▼─────┐   ┌─────▼─────┐   ┌─────▼─────┐
        │PostgreSQL │   │   Redis   │   │File Storage│
        │ Database  │   │  Cache    │   │   (S3)    │
        └───────────┘   └───────────┘   └───────────┘
```

---

## 💻 Server Requirements

### Minimum Requirements

| Component | Specification |
|-----------|---------------|
| **CPU** | 2 cores, 2.0 GHz |
| **RAM** | 4 GB |
| **Storage** | 20 GB SSD |
| **Network** | 10 Mbps upload/download |
| **OS** | Ubuntu 20.04+, CentOS 8+, or Docker-compatible |

### Recommended Requirements

| Component | Specification |
|-----------|---------------|
| **CPU** | 4+ cores, 3.0 GHz |
| **RAM** | 8+ GB |
| **Storage** | 100+ GB SSD |
| **Network** | 100 Mbps upload/download |
| **OS** | Ubuntu 22.04 LTS |

### High-Load Requirements

| Component | Specification |
|-----------|---------------|
| **CPU** | 8+ cores, 3.5 GHz |
| **RAM** | 16+ GB |
| **Storage** | 500+ GB NVMe SSD |
| **Network** | 1 Gbps |
| **Load Balancer** | Dedicated reverse proxy |

---

## 🐳 Docker Deployment

### Prerequisites

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### Production Docker Setup

#### 1. Clone Repository

```bash
git clone https://github.com/Avi-Lezerovich/LezerPrint.git
cd LezerPrint
```

#### 2. Create Production Environment

```bash
# Copy environment template
cp .env.example .env.production

# Edit with production values
nano .env.production
```

#### 3. Production Environment File

```env
# Application
NODE_ENV=production
FRONTEND_URL=https://your-domain.com
BACKEND_URL=https://your-domain.com/api

# Database
DATABASE_URL=postgresql://lezerprint:SECURE_PASSWORD@postgres:5432/lezerprint_prod
REDIS_URL=redis://redis:6379

# Security
JWT_SECRET=your-very-secure-256-bit-secret-key-here
SESSION_SECRET=another-secure-secret-for-sessions

# File Storage
UPLOAD_DIR=/app/uploads
MAX_FILE_SIZE=100000000

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASS=your-app-password

# Monitoring
LOG_LEVEL=info
SENTRY_DSN=your-sentry-dsn-for-error-tracking
```

#### 4. Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/ssl/certs:ro
      - uploads:/usr/share/nginx/html/uploads:ro
    depends_on:
      - frontend
      - backend
    restart: unless-stopped
    networks:
      - app-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://your-domain.com/api
      - NEXT_PUBLIC_WS_URL=https://your-domain.com
    restart: unless-stopped
    networks:
      - app-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
      - FRONTEND_URL=${FRONTEND_URL}
    volumes:
      - uploads:/app/uploads
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    networks:
      - app-network

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: lezerprint_prod
      POSTGRES_USER: lezerprint
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    restart: unless-stopped
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    restart: unless-stopped
    networks:
      - app-network

volumes:
  postgres_data:
  redis_data:
  uploads:

networks:
  app-network:
    driver: bridge
```

#### 5. Frontend Production Dockerfile

Create `frontend/Dockerfile.prod`:

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Add non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### 6. Backend Production Dockerfile

Create `backend/Dockerfile.prod`:

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Add non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nodejs

# Install production dependencies
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma

# Create uploads directory
RUN mkdir -p uploads && chown nodejs:nodejs uploads

USER nodejs

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

CMD ["node", "dist/server.js"]
```

#### 7. Deploy Application

```bash
# Build and start services
docker-compose -f docker-compose.prod.yml up -d --build

# Check logs
docker-compose -f docker-compose.prod.yml logs

# Run database migrations
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# Generate Prisma client
docker-compose -f docker-compose.prod.yml exec backend npx prisma generate
```

---

## 📦 Manual Deployment

### Server Preparation

#### 1. Install Node.js

```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

#### 2. Install PostgreSQL

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start and enable service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
postgres=# CREATE DATABASE lezerprint_prod;
postgres=# CREATE USER lezerprint WITH PASSWORD 'secure_password';
postgres=# GRANT ALL PRIVILEGES ON DATABASE lezerprint_prod TO lezerprint;
postgres=# \q
```

#### 3. Install Redis

```bash
# Install Redis
sudo apt install redis-server

# Configure Redis
sudo nano /etc/redis/redis.conf
# Set: supervised systemd
# Set: requirepass your_secure_password

# Start and enable service
sudo systemctl restart redis-server
sudo systemctl enable redis-server
```

#### 4. Install Nginx

```bash
# Install Nginx
sudo apt install nginx

# Start and enable service
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Application Deployment

#### 1. Deploy Backend

```bash
# Create application directory
sudo mkdir -p /opt/lezerprint
sudo chown $USER:$USER /opt/lezerprint
cd /opt/lezerprint

# Clone repository
git clone https://github.com/Avi-Lezerovich/LezerPrint.git .

# Install backend dependencies
cd backend
npm install

# Build application
npm run build

# Set up environment
cp .env.example .env.production
nano .env.production

# Run database migrations
npx prisma migrate deploy
npx prisma generate
```

#### 2. Deploy Frontend

```bash
# Install frontend dependencies
cd ../frontend
npm install

# Build for production
npm run build

# Export static files (if using static export)
npm run export
```

#### 3. Set Up Process Manager

Install PM2 for process management:

```bash
# Install PM2 globally
sudo npm install -g pm2

# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'lezerprint-backend',
      script: 'dist/server.js',
      cwd: '/opt/lezerprint/backend',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      instances: 2,
      exec_mode: 'cluster',
      max_memory_restart: '1G',
      error_file: '/var/log/lezerprint/backend-error.log',
      out_file: '/var/log/lezerprint/backend-out.log',
      log_file: '/var/log/lezerprint/backend.log'
    },
    {
      name: 'lezerprint-frontend',
      script: 'server.js',
      cwd: '/opt/lezerprint/frontend',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 1,
      max_memory_restart: '512M',
      error_file: '/var/log/lezerprint/frontend-error.log',
      out_file: '/var/log/lezerprint/frontend-out.log'
    }
  ]
}
EOF

# Create log directory
sudo mkdir -p /var/log/lezerprint
sudo chown $USER:$USER /var/log/lezerprint

# Start applications
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set up PM2 startup script
pm2 startup
```

---

## 🔒 SSL Configuration

### Using Let's Encrypt (Recommended)

#### 1. Install Certbot

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Or using snap
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

#### 2. Obtain SSL Certificate

```bash
# Get certificate for your domain
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test automatic renewal
sudo certbot renew --dry-run

# Set up automatic renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Manual SSL Setup

#### 1. Generate SSL Certificate

```bash
# Create SSL directory
sudo mkdir -p /etc/ssl/lezerprint

# Generate private key
sudo openssl genrsa -out /etc/ssl/lezerprint/private.key 2048

# Generate certificate signing request
sudo openssl req -new -key /etc/ssl/lezerprint/private.key -out /etc/ssl/lezerprint/cert.csr

# Generate self-signed certificate (for testing)
sudo openssl x509 -req -days 365 -in /etc/ssl/lezerprint/cert.csr -signkey /etc/ssl/lezerprint/private.key -out /etc/ssl/lezerprint/certificate.crt
```

#### 2. Nginx SSL Configuration

Create `/etc/nginx/sites-available/lezerprint`:

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL Configuration
    ssl_certificate /etc/ssl/lezerprint/certificate.crt;
    ssl_certificate_key /etc/ssl/lezerprint/private.key;
    
    # SSL Security
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # File upload size
    client_max_body_size 100M;

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout settings for long-running operations
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static file serving
    location /uploads/ {
        alias /opt/lezerprint/uploads/;
        expires 1M;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Security - deny access to sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

#### 3. Enable Site and Restart Nginx

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/lezerprint /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## 📊 Monitoring Setup

### Application Monitoring

#### 1. Health Check Endpoints

The application provides health check endpoints:

```bash
# Backend health
curl https://your-domain.com/api/health

# Expected response:
# {
#   "status": "ok",
#   "timestamp": "2024-01-01T00:00:00.000Z",
#   "version": "1.0.0",
#   "database": "connected",
#   "redis": "connected"
# }
```

#### 2. PM2 Monitoring

```bash
# Monitor PM2 processes
pm2 monit

# View logs
pm2 logs

# Restart applications
pm2 restart all

# View application status
pm2 status
```

#### 3. System Monitoring

Install monitoring tools:

```bash
# Install htop and iotop
sudo apt install htop iotop

# Install netdata for web-based monitoring
bash <(curl -Ss https://my-netdata.io/kickstart.sh)

# Access netdata at http://your-server:19999
```

### Log Management

#### 1. Application Logs

```bash
# Backend logs
tail -f /var/log/lezerprint/backend.log

# Frontend logs
tail -f /var/log/lezerprint/frontend.log

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

#### 2. Log Rotation

Create `/etc/logrotate.d/lezerprint`:

```
/var/log/lezerprint/*.log {
    daily
    missingok
    rotate 52
    compress
    notifempty
    create 644 $USER $USER
    postrotate
        pm2 reloadLogs
    endscript
}
```

### Error Tracking

#### 1. Sentry Integration

Add to environment variables:

```env
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

Backend integration:

```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});

// Error handler middleware
app.use(Sentry.Handlers.errorHandler());
```

Frontend integration:

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

---

## 💾 Backup Strategies

### Database Backups

#### 1. Automated PostgreSQL Backups

Create backup script `/opt/scripts/backup-db.sh`:

```bash
#!/bin/bash

# Configuration
DB_NAME="lezerprint_prod"
DB_USER="lezerprint"
BACKUP_DIR="/backups/database"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup
pg_dump -h localhost -U $DB_USER -d $DB_NAME > $BACKUP_DIR/lezerprint_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/lezerprint_$DATE.sql

# Remove old backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

# Log backup completion
echo "$(date): Database backup completed - lezerprint_$DATE.sql.gz" >> /var/log/backups.log
```

#### 2. Set Up Backup Cron Job

```bash
# Make script executable
chmod +x /opt/scripts/backup-db.sh

# Add to crontab
crontab -e
# Add: 0 2 * * * /opt/scripts/backup-db.sh
```

### File Backups

#### 1. Upload Directory Backup

Create backup script `/opt/scripts/backup-files.sh`:

```bash
#!/bin/bash

# Configuration
SOURCE_DIR="/opt/lezerprint/uploads"
BACKUP_DIR="/backups/files"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR

# Create tar backup
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz -C $SOURCE_DIR .

# Remove old backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

# Log backup completion
echo "$(date): Files backup completed - uploads_$DATE.tar.gz" >> /var/log/backups.log
```

#### 2. Cloud Storage Backup

Install AWS CLI for S3 backups:

```bash
# Install AWS CLI
sudo apt install awscli

# Configure AWS credentials
aws configure

# Sync uploads to S3
aws s3 sync /opt/lezerprint/uploads s3://your-backup-bucket/uploads
```

### System Configuration Backup

```bash
# Backup system configurations
sudo tar -czf /backups/system/system-config-$(date +%Y%m%d).tar.gz \
  /etc/nginx/sites-available \
  /etc/ssl/lezerprint \
  /opt/lezerprint/.env.production \
  /opt/lezerprint/ecosystem.config.js
```

---

## 🔄 Update Procedures

### Application Updates

#### 1. Backup Before Update

```bash
# Create backup
/opt/scripts/backup-db.sh
/opt/scripts/backup-files.sh

# Backup current application
sudo tar -czf /backups/app/lezerprint-$(date +%Y%m%d).tar.gz -C /opt lezerprint
```

#### 2. Update Application

```bash
# Navigate to application directory
cd /opt/lezerprint

# Backup current version
git tag backup-$(date +%Y%m%d)

# Pull latest changes
git pull origin main

# Update backend
cd backend
npm install
npm run build

# Update frontend
cd ../frontend
npm install
npm run build

# Run database migrations
cd ../backend
npx prisma migrate deploy
npx prisma generate
```

#### 3. Restart Services

```bash
# Restart PM2 applications
pm2 restart all

# Reload Nginx
sudo systemctl reload nginx

# Check application status
pm2 status
curl https://your-domain.com/api/health
```

### Rollback Procedure

If update fails:

```bash
# Stop current services
pm2 stop all

# Restore from backup
sudo rm -rf /opt/lezerprint
sudo tar -xzf /backups/app/lezerprint-YYYYMMDD.tar.gz -C /opt

# Restore database (if needed)
psql -h localhost -U lezerprint -d lezerprint_prod < /backups/database/latest.sql

# Restart services
pm2 start ecosystem.config.js
```

---

## 📈 Scaling Considerations

### Horizontal Scaling

#### Load Balancer Configuration

For multiple application instances:

```nginx
upstream backend {
    least_conn;
    server 10.0.1.10:3001;
    server 10.0.1.11:3001;
    server 10.0.1.12:3001;
}

upstream frontend {
    least_conn;
    server 10.0.1.10:3000;
    server 10.0.1.11:3000;
    server 10.0.1.12:3000;
}

server {
    location /api/ {
        proxy_pass http://backend;
    }
    
    location / {
        proxy_pass http://frontend;
    }
}
```

#### Database Scaling

##### Read Replicas

```env
# Primary database
DATABASE_URL=postgresql://user:pass@primary-db:5432/lezerprint

# Read replica
DATABASE_READ_URL=postgresql://user:pass@replica-db:5432/lezerprint
```

##### Connection Pooling

```typescript
// Use PgBouncer for connection pooling
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### Vertical Scaling

#### Resource Optimization

```javascript
// PM2 cluster mode
module.exports = {
  apps: [{
    name: 'lezerprint-backend',
    script: 'dist/server.js',
    instances: 'max', // Use all CPU cores
    exec_mode: 'cluster',
    max_memory_restart: '2G',
  }]
}
```

#### Database Optimization

```sql
-- Add indexes for performance
CREATE INDEX CONCURRENTLY idx_print_jobs_user_status 
ON print_jobs(user_id, status);

CREATE INDEX CONCURRENTLY idx_files_user_created 
ON files(user_id, created_at DESC);

-- Analyze tables
ANALYZE;
```

---

## 🔐 Security Hardening

### Server Security

#### 1. Firewall Configuration

```bash
# Install UFW
sudo apt install ufw

# Default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH
sudo ufw allow ssh

# Allow HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Enable firewall
sudo ufw enable
```

#### 2. Fail2Ban Setup

```bash
# Install Fail2Ban
sudo apt install fail2ban

# Configure Nginx protection
sudo cat > /etc/fail2ban/jail.local << EOF
[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 10
findtime = 600
bantime = 7200
EOF

# Restart Fail2Ban
sudo systemctl restart fail2ban
```

#### 3. System Updates

```bash
# Set up automatic security updates
sudo apt install unattended-upgrades

# Configure updates
sudo dpkg-reconfigure -plow unattended-upgrades
```

### Application Security

#### 1. Environment Variables

```bash
# Secure .env file permissions
chmod 600 /opt/lezerprint/.env.production
chown root:root /opt/lezerprint/.env.production
```

#### 2. Rate Limiting

```typescript
// Express rate limiting
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);
```

#### 3. Security Headers

```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
```

---

## 📚 Additional Resources

### Deployment Tools
- [**Docker Documentation**](https://docs.docker.com/)
- [**Nginx Configuration**](https://nginx.org/en/docs/)
- [**PM2 Documentation**](https://pm2.keymetrics.io/docs/)
- [**Let's Encrypt**](https://letsencrypt.org/docs/)

### Monitoring & Security
- [**Sentry Error Tracking**](https://docs.sentry.io/)
- [**Fail2Ban Documentation**](https://fail2ban.readthedocs.io/)
- [**UFW Firewall**](https://help.ubuntu.com/community/UFW)

### Related Documentation
- [**Architecture Overview**](ARCHITECTURE.md)
- [**Security Guidelines**](SECURITY.md)
- [**Troubleshooting**](TROUBLESHOOTING.md)

---

**Deployment complete!** 🎉 Your LezerPrint instance should now be running in production. For ongoing maintenance, refer to our [**troubleshooting guide**](TROUBLESHOOTING.md) or [open an issue](https://github.com/Avi-Lezerovich/LezerPrint/issues).