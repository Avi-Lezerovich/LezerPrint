# 🔐 Security Guidelines

*Comprehensive security practices and guidelines for LezerPrint*

---

## 📖 Table of Contents

- [Security Overview](#-security-overview)
- [Authentication & Authorization](#-authentication--authorization)
- [Data Protection](#-data-protection)
- [Network Security](#-network-security)
- [Input Validation](#-input-validation)
- [File Upload Security](#-file-upload-security)
- [API Security](#-api-security)
- [Database Security](#-database-security)
- [Infrastructure Security](#-infrastructure-security)
- [Monitoring & Incident Response](#-monitoring--incident-response)
- [Security Checklist](#-security-checklist)
- [Compliance](#-compliance)

---

## 🛡️ Security Overview

LezerPrint implements security-by-design principles across all layers of the application stack. Our security model follows industry best practices and compliance standards to protect user data, ensure system integrity, and maintain operational security.

### Security Principles

- **Defense in Depth** - Multiple layers of security controls
- **Least Privilege** - Minimal necessary access rights
- **Zero Trust** - Verify everything, trust nothing
- **Fail Securely** - Secure defaults when systems fail
- **Security by Design** - Built-in security from the ground up
- **Regular Auditing** - Continuous security assessment

### Threat Model

| Threat Category | Risk Level | Mitigation Strategy |
|----------------|------------|-------------------|
| **Unauthorized Access** | High | Multi-factor authentication, role-based access |
| **Data Breach** | High | Encryption at rest/transit, access controls |
| **Injection Attacks** | Medium | Input validation, parameterized queries |
| **File Upload Exploits** | Medium | File type validation, sandboxing |
| **CSRF/XSS** | Medium | CSRF tokens, content security policy |
| **DoS Attacks** | Medium | Rate limiting, load balancing |
| **Privilege Escalation** | Low | Strict role validation, audit logging |
| **Man-in-the-Middle** | Low | TLS encryption, certificate pinning |

---

## 🔑 Authentication & Authorization

### Multi-Factor Authentication (MFA)

#### Implementation
```typescript
// TOTP-based MFA setup
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export class MFAService {
  async generateSecret(userId: string): Promise<MFASetup> {
    const secret = speakeasy.generateSecret({
      name: `LezerPrint (${user.email})`,
      issuer: 'LezerPrint',
      length: 32
    });

    await prisma.user.update({
      where: { id: userId },
      data: { 
        mfaSecret: secret.base32,
        mfaEnabled: false // Enable after verification
      }
    });

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
    
    return {
      secret: secret.base32,
      qrCode: qrCodeUrl,
      backupCodes: this.generateBackupCodes()
    };
  }

  async verifyToken(userId: string, token: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { mfaSecret: true }
    });

    if (!user?.mfaSecret) return false;

    return speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token,
      window: 2 // Allow 2 time steps (±60 seconds)
    });
  }

  private generateBackupCodes(): string[] {
    return Array.from({ length: 10 }, () => 
      crypto.randomBytes(4).toString('hex').toUpperCase()
    );
  }
}
```

#### Frontend MFA Integration
```typescript
// MFA setup component
export function MFASetup() {
  const [secret, setSecret] = useState<string>('');
  const [qrCode, setQrCode] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState<string>('');

  const setupMFA = async () => {
    const response = await api.post('/auth/mfa/setup');
    setSecret(response.data.secret);
    setQrCode(response.data.qrCode);
  };

  const verifyAndEnable = async () => {
    await api.post('/auth/mfa/verify', {
      token: verificationCode
    });
    toast.success('MFA enabled successfully');
  };

  return (
    <div className="space-y-4">
      <QRCodeDisplay src={qrCode} />
      <SecretKeyDisplay secret={secret} />
      <VerificationInput 
        value={verificationCode}
        onChange={setVerificationCode}
        onSubmit={verifyAndEnable}
      />
    </div>
  );
}
```

### JWT Security Implementation

#### Secure Token Generation
```typescript
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export class TokenService {
  // Use RS256 for better security in distributed systems
  private privateKey = fs.readFileSync(process.env.JWT_PRIVATE_KEY_PATH);
  private publicKey = fs.readFileSync(process.env.JWT_PUBLIC_KEY_PATH);

  generateAccessToken(user: User): string {
    const payload = {
      sub: user.id, // Subject (user ID)
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000), // Issued at
      jti: crypto.randomUUID() // Unique token ID
    };

    return jwt.sign(payload, this.privateKey, {
      algorithm: 'RS256',
      expiresIn: '15m',
      issuer: 'lezerprint-api',
      audience: 'lezerprint-client'
    });
  }

  generateRefreshToken(userId: string): string {
    return jwt.sign(
      { 
        sub: userId, 
        type: 'refresh',
        jti: crypto.randomUUID()
      },
      process.env.JWT_REFRESH_SECRET,
      { 
        algorithm: 'HS256',
        expiresIn: '7d' 
      }
    );
  }

  verifyAccessToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, this.publicKey, {
        algorithms: ['RS256'],
        issuer: 'lezerprint-api',
        audience: 'lezerprint-client'
      }) as JWTPayload;
    } catch (error) {
      return null;
    }
  }
}
```

#### Token Blacklisting
```typescript
// Redis-based token blacklist
export class TokenBlacklist {
  private redis = new Redis(process.env.REDIS_URL);

  async blacklistToken(tokenId: string, expiresAt: Date): Promise<void> {
    const ttl = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
    if (ttl > 0) {
      await this.redis.setex(`blacklist:${tokenId}`, ttl, '1');
    }
  }

  async isBlacklisted(tokenId: string): Promise<boolean> {
    const result = await this.redis.get(`blacklist:${tokenId}`);
    return result !== null;
  }

  // Middleware to check blacklist
  checkBlacklist = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.user?.jti;
    if (token && await this.isBlacklisted(token)) {
      return res.status(401).json({ error: 'Token has been revoked' });
    }
    next();
  };
}
```

### Role-Based Access Control (RBAC)

#### Permission System
```typescript
// Granular permissions
export enum Permission {
  // User management
  USER_READ = 'user:read',
  USER_WRITE = 'user:write',
  USER_DELETE = 'user:delete',
  
  // Printer control
  PRINTER_READ = 'printer:read',
  PRINTER_CONTROL = 'printer:control',
  PRINTER_CONFIGURE = 'printer:configure',
  
  // File management
  FILE_READ = 'file:read',
  FILE_UPLOAD = 'file:upload',
  FILE_DELETE = 'file:delete',
  
  // Print jobs
  JOB_READ = 'job:read',
  JOB_CREATE = 'job:create',
  JOB_CONTROL = 'job:control',
  
  // System administration
  SYSTEM_CONFIGURE = 'system:configure',
  SYSTEM_MONITOR = 'system:monitor',
  ANALYTICS_VIEW = 'analytics:view'
}

// Role definitions
export const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    Permission.USER_READ,
    Permission.USER_WRITE,
    Permission.USER_DELETE,
    Permission.PRINTER_READ,
    Permission.PRINTER_CONTROL,
    Permission.PRINTER_CONFIGURE,
    Permission.FILE_READ,
    Permission.FILE_UPLOAD,
    Permission.FILE_DELETE,
    Permission.JOB_READ,
    Permission.JOB_CREATE,
    Permission.JOB_CONTROL,
    Permission.SYSTEM_CONFIGURE,
    Permission.SYSTEM_MONITOR,
    Permission.ANALYTICS_VIEW
  ],
  
  [UserRole.OPERATOR]: [
    Permission.PRINTER_READ,
    Permission.PRINTER_CONTROL,
    Permission.FILE_READ,
    Permission.FILE_UPLOAD,
    Permission.JOB_READ,
    Permission.JOB_CREATE,
    Permission.JOB_CONTROL,
    Permission.ANALYTICS_VIEW
  ],
  
  [UserRole.VIEWER]: [
    Permission.PRINTER_READ,
    Permission.FILE_READ,
    Permission.JOB_READ,
    Permission.ANALYTICS_VIEW
  ]
};

// Permission checking middleware
export function requirePermission(permission: Permission) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as AuthUser;
    
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userPermissions = rolePermissions[user.role] || [];
    
    if (!userPermissions.includes(permission)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: permission,
        userRole: user.role
      });
    }

    next();
  };
}
```

### Session Management

#### Secure Session Configuration
```typescript
import session from 'express-session';
import RedisStore from 'connect-redis';

const sessionConfig = {
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  name: 'lezerprint.sid', // Don't use default name
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true, // Prevent XSS
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict' // CSRF protection
  },
  genid: () => crypto.randomUUID() // Secure session ID generation
};

app.use(session(sessionConfig));
```

---

## 🔒 Data Protection

### Encryption at Rest

#### Database Encryption
```sql
-- Enable transparent data encryption
ALTER SYSTEM SET ssl = on;
ALTER SYSTEM SET ssl_cert_file = '/etc/ssl/certs/server.crt';
ALTER SYSTEM SET ssl_key_file = '/etc/ssl/private/server.key';

-- Encrypt sensitive columns
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Store encrypted sensitive data
CREATE TABLE user_secrets (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  encrypted_api_key BYTEA,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Function to encrypt/decrypt data
CREATE OR REPLACE FUNCTION encrypt_secret(plaintext TEXT, user_id UUID)
RETURNS BYTEA AS $$
BEGIN
  RETURN pgp_sym_encrypt(plaintext, user_id::TEXT || ':' || current_setting('app.encryption_key'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Application-Level Encryption
```typescript
import crypto from 'crypto';

export class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private keyDerivationIterations = 100000;

  // Derive key from master key and user-specific salt
  private deriveKey(masterKey: string, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(
      masterKey, 
      salt, 
      this.keyDerivationIterations, 
      32, 
      'sha256'
    );
  }

  encrypt(plaintext: string, userSalt: string): EncryptedData {
    const salt = Buffer.from(userSalt, 'hex');
    const key = this.deriveKey(process.env.MASTER_ENCRYPTION_KEY!, salt);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipher(this.algorithm, key);
    cipher.setAAD(Buffer.from('lezerprint')); // Additional authenticated data
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      data: encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  decrypt(encryptedData: EncryptedData, userSalt: string): string {
    const salt = Buffer.from(userSalt, 'hex');
    const key = this.deriveKey(process.env.MASTER_ENCRYPTION_KEY!, salt);
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const authTag = Buffer.from(encryptedData.authTag, 'hex');
    
    const decipher = crypto.createDecipher(this.algorithm, key);
    decipher.setAuthTag(authTag);
    decipher.setAAD(Buffer.from('lezerprint'));
    
    let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

### Encryption in Transit

#### TLS Configuration
```typescript
// Express HTTPS setup
import https from 'https';
import fs from 'fs';

const httpsOptions = {
  key: fs.readFileSync(process.env.SSL_PRIVATE_KEY_PATH!),
  cert: fs.readFileSync(process.env.SSL_CERTIFICATE_PATH!),
  // Intermediate certificates
  ca: fs.readFileSync(process.env.SSL_CA_PATH!),
  
  // Security options
  secureProtocol: 'TLSv1_2_method',
  ciphers: [
    'ECDHE-RSA-AES256-GCM-SHA512',
    'DHE-RSA-AES256-GCM-SHA512',
    'ECDHE-RSA-AES256-GCM-SHA384',
    'DHE-RSA-AES256-GCM-SHA384',
    'ECDHE-RSA-AES256-SHA384'
  ].join(':'),
  honorCipherOrder: true
};

const server = https.createServer(httpsOptions, app);
```

#### HSTS and Security Headers
```typescript
import helmet from 'helmet';

app.use(helmet({
  // Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "trusted-cdn.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "trusted-api.com"],
      fontSrc: ["'self'", "fonts.googleapis.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  
  // Additional security headers
  noSniff: true,
  frameguard: { action: 'deny' },
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));
```

### Data Anonymization

#### PII Handling
```typescript
export class DataAnonymizer {
  // Hash email for analytics while preserving uniqueness
  hashEmail(email: string): string {
    return crypto
      .createHash('sha256')
      .update(email + process.env.HASH_SALT)
      .digest('hex')
      .substring(0, 16);
  }

  // Anonymize user data for analytics
  anonymizeUserData(user: User): AnonymizedUser {
    return {
      id: this.hashEmail(user.email),
      role: user.role,
      createdAt: user.createdAt,
      // Remove PII
      totalPrints: user.totalPrints,
      successRate: user.successRate
    };
  }

  // GDPR-compliant data deletion
  async deleteUserData(userId: string): Promise<void> {
    await prisma.$transaction([
      // Anonymize instead of delete to preserve analytics
      prisma.user.update({
        where: { id: userId },
        data: {
          email: `deleted-${Date.now()}@deleted.com`,
          username: `deleted-${Date.now()}`,
          isActive: false,
          deletedAt: new Date()
        }
      }),
      
      // Delete sensitive files
      prisma.file.deleteMany({
        where: { userId }
      }),
      
      // Keep anonymized print job data for analytics
      prisma.printJob.updateMany({
        where: { userId },
        data: { userId: 'anonymous' }
      })
    ]);
  }
}
```

---

## 🌐 Network Security

### CORS Configuration

```typescript
import cors from 'cors';

const corsOptions = {
  origin: function (origin, callback) {
    // Allow specific origins
    const allowedOrigins = [
      'https://lezerprint.com',
      'https://app.lezerprint.com',
      'https://admin.lezerprint.com'
    ];
    
    // Allow localhost in development
    if (process.env.NODE_ENV === 'development') {
      allowedOrigins.push('http://localhost:3000');
    }
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-CSRF-Token'
  ]
};

app.use(cors(corsOptions));
```

### Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

// Different limits for different endpoints
const authLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'auth_limit:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    error: 'Too many authentication attempts',
    retryAfter: 15 * 60 // seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip successful requests
  skipSuccessfulRequests: true
});

const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'api_limit:'
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: {
    error: 'API rate limit exceeded',
    retryAfter: 60
  }
});

const uploadLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'upload_limit:'
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 uploads per minute
  message: {
    error: 'Upload rate limit exceeded'
  }
});

// Apply rate limiters
app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);
app.use('/api/files/upload', uploadLimiter);
```

### DDoS Protection

```typescript
// Slowloris protection
import slowDown from 'express-slow-down';

const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 100, // Allow 100 requests per windowMs at full speed
  delayMs: 500, // Add 500ms delay after delayAfter
  maxDelayMs: 20000, // Maximum delay of 20 seconds
  skipSuccessfulRequests: true
});

app.use(speedLimiter);

// Request size limiting
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    // Additional validation on request body
    if (buf.length > 10 * 1024 * 1024) {
      throw new Error('Request entity too large');
    }
  }
}));
```

---

## ✅ Input Validation

### Zod Schema Validation

```typescript
import { z } from 'zod';

// User input schemas
export const userRegistrationSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email too long')
    .toLowerCase()
    .transform(email => email.trim()),
    
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username too long')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username contains invalid characters')
    .transform(username => username.toLowerCase()),
    
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Password must contain uppercase, lowercase, number, and special character')
});

// Print job schema
export const createJobSchema = z.object({
  fileId: z.string().uuid('Invalid file ID'),
  profileId: z.string().uuid('Invalid profile ID').optional(),
  priority: z.enum(['low', 'normal', 'high']).default('normal'),
  settings: z.object({
    temperature: z.number().min(0).max(300),
    speed: z.number().min(10).max(200),
    layerHeight: z.number().min(0.1).max(1.0)
  }).optional()
});

// Printer command schema
export const printerCommandSchema = z.object({
  command: z.string()
    .min(1, 'Command cannot be empty')
    .max(120, 'Command too long')
    .regex(/^[A-Z][0-9].*$/, 'Invalid G-code format'),
  wait: z.boolean().default(true)
});
```

### Validation Middleware

```typescript
export function validateSchema<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: error.issues.map(issue => ({
              field: issue.path.join('.'),
              message: issue.message,
              code: issue.code
            }))
          }
        });
      }
      next(error);
    }
  };
}

// Usage
app.post('/api/auth/register', 
  validateSchema(userRegistrationSchema),
  registerController
);
```

### SQL Injection Prevention

```typescript
// Always use parameterized queries with Prisma
export class SafeQueryService {
  // ✅ Safe - Prisma automatically parameterizes
  async getUserFiles(userId: string, fileType?: string) {
    return prisma.file.findMany({
      where: {
        userId, // Automatically parameterized
        ...(fileType && { fileType }) // Conditional safe parameter
      }
    });
  }

  // ✅ Safe - Manual parameterization for raw queries
  async getCustomAnalytics(userId: string, startDate: Date, endDate: Date) {
    return prisma.$queryRaw`
      SELECT 
        COUNT(*) as total_jobs,
        AVG(actual_time) as avg_time,
        SUM(filament_used) as total_filament
      FROM print_jobs 
      WHERE user_id = ${userId}
        AND created_at BETWEEN ${startDate} AND ${endDate}
        AND status = 'COMPLETED'
    `;
  }

  // ❌ Dangerous - Never do this
  async dangerousQuery(userInput: string) {
    // This is vulnerable to SQL injection
    return prisma.$queryRawUnsafe(`
      SELECT * FROM users WHERE name = '${userInput}'
    `);
  }
}
```

---

## 📁 File Upload Security

### File Type Validation

```typescript
import path from 'path';
import fs from 'fs';

export class FileValidator {
  private allowedMimeTypes = new Set([
    'application/sla', // STL files
    'text/plain', // G-code files
    'application/octet-stream', // Binary STL
    'model/stl', // STL MIME type
    'model/obj', // OBJ files
    'model/3mf' // 3MF files
  ]);

  private allowedExtensions = new Set([
    '.stl', '.gcode', '.obj', '.3mf'
  ]);

  // Magic number validation for file types
  private magicNumbers = {
    stl_binary: Buffer.from([0x80, 0x00, 0x00, 0x00]), // Binary STL
    stl_ascii: Buffer.from('solid '), // ASCII STL
    gcode: Buffer.from(';'), // G-code comment
    obj: Buffer.from('v '), // OBJ vertex
    threemf: Buffer.from('PK') // 3MF is ZIP-based
  };

  async validateFile(file: Express.Multer.File): Promise<ValidationResult> {
    const errors: string[] = [];

    // Check file size
    if (file.size > 50 * 1024 * 1024) { // 50MB
      errors.push('File size exceeds 50MB limit');
    }

    // Check extension
    const ext = path.extname(file.originalname).toLowerCase();
    if (!this.allowedExtensions.has(ext)) {
      errors.push(`File extension ${ext} is not allowed`);
    }

    // Check MIME type
    if (!this.allowedMimeTypes.has(file.mimetype)) {
      errors.push(`MIME type ${file.mimetype} is not allowed`);
    }

    // Check magic numbers
    const isValidFormat = await this.validateMagicNumbers(file.path, ext);
    if (!isValidFormat) {
      errors.push('File content does not match extension');
    }

    // Scan for malicious content
    const isSafe = await this.scanForMaliciousContent(file.path);
    if (!isSafe) {
      errors.push('File contains potentially malicious content');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private async validateMagicNumbers(filePath: string, extension: string): Promise<boolean> {
    const buffer = Buffer.alloc(100);
    const fd = await fs.promises.open(filePath, 'r');
    await fd.read(buffer, 0, 100, 0);
    await fd.close();

    switch (extension) {
      case '.stl':
        return buffer.includes(this.magicNumbers.stl_binary) || 
               buffer.includes(this.magicNumbers.stl_ascii);
      case '.gcode':
        return buffer.includes(this.magicNumbers.gcode) ||
               buffer.toString().includes('G0') ||
               buffer.toString().includes('G1');
      case '.obj':
        return buffer.includes(this.magicNumbers.obj);
      case '.3mf':
        return buffer.includes(this.magicNumbers.threemf);
      default:
        return false;
    }
  }

  private async scanForMaliciousContent(filePath: string): Promise<boolean> {
    // Check for executable patterns
    const suspiciousPatterns = [
      /exec\s*\(/gi,
      /system\s*\(/gi,
      /eval\s*\(/gi,
      /<script/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /\$\{.*\}/gi // Template injection
    ];

    const content = await fs.promises.readFile(filePath, 'utf-8');
    
    return !suspiciousPatterns.some(pattern => pattern.test(content));
  }
}
```

### Secure File Storage

```typescript
export class SecureFileStorage {
  private uploadDir = process.env.UPLOAD_DIR || './uploads';
  private quarantineDir = path.join(this.uploadDir, 'quarantine');

  async storeFile(file: Express.Multer.File, userId: string): Promise<StoredFile> {
    // Generate secure filename
    const secureFilename = this.generateSecureFilename(file.originalname);
    const userDir = path.join(this.uploadDir, userId);
    const filePath = path.join(userDir, secureFilename);

    // Ensure user directory exists with proper permissions
    await fs.promises.mkdir(userDir, { 
      recursive: true, 
      mode: 0o755 
    });

    // Move file from temp location
    await fs.promises.copyFile(file.path, filePath);
    await fs.promises.unlink(file.path); // Remove temp file

    // Set secure file permissions
    await fs.promises.chmod(filePath, 0o644);

    // Generate thumbnail if applicable
    const thumbnailPath = await this.generateThumbnail(filePath, file.mimetype);

    return {
      id: crypto.randomUUID(),
      originalName: file.originalname,
      filename: secureFilename,
      path: filePath,
      size: file.size,
      mimetype: file.mimetype,
      thumbnailPath
    };
  }

  private generateSecureFilename(originalName: string): string {
    const ext = path.extname(originalName);
    const timestamp = Date.now();
    const random = crypto.randomBytes(8).toString('hex');
    return `${timestamp}-${random}${ext}`;
  }

  private async generateThumbnail(filePath: string, mimetype: string): Promise<string | null> {
    if (!mimetype.startsWith('image/') && !mimetype.includes('stl')) {
      return null;
    }

    const thumbnailDir = path.join(this.uploadDir, 'thumbnails');
    await fs.promises.mkdir(thumbnailDir, { recursive: true });

    const thumbnailPath = path.join(
      thumbnailDir, 
      `${path.parse(filePath).name}_thumb.jpg`
    );

    // Use sharp for image thumbnails
    if (mimetype.startsWith('image/')) {
      await sharp(filePath)
        .resize(200, 200, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);
    }

    return thumbnailPath;
  }

  async quarantineFile(filePath: string, reason: string): Promise<void> {
    const filename = path.basename(filePath);
    const quarantinePath = path.join(this.quarantineDir, filename);
    
    await fs.promises.mkdir(this.quarantineDir, { recursive: true });
    await fs.promises.move(filePath, quarantinePath);
    
    // Log quarantine action
    console.warn(`File quarantined: ${filename}, Reason: ${reason}`);
  }
}
```

---

## 🔌 API Security

### CSRF Protection

```typescript
import csrf from 'csurf';

// CSRF protection for state-changing operations
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

// Apply CSRF protection to dangerous endpoints
app.use('/api/printer', csrfProtection);
app.use('/api/files', csrfProtection);
app.use('/api/jobs', csrfProtection);

// Provide CSRF token to frontend
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});
```

### Request Signing

```typescript
// HMAC request signing for critical operations
export class RequestSigner {
  private secret = process.env.API_SIGNING_SECRET!;

  generateSignature(payload: string, timestamp: string): string {
    const data = `${timestamp}.${payload}`;
    return crypto
      .createHmac('sha256', this.secret)
      .update(data)
      .digest('hex');
  }

  verifySignature(payload: string, timestamp: string, signature: string): boolean {
    const expectedSignature = this.generateSignature(payload, timestamp);
    
    // Use timing-safe comparison
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  // Middleware for critical endpoints
  requireSignature = (req: Request, res: Response, next: NextFunction) => {
    const signature = req.headers['x-signature'] as string;
    const timestamp = req.headers['x-timestamp'] as string;
    const payload = JSON.stringify(req.body);

    if (!signature || !timestamp) {
      return res.status(400).json({ error: 'Missing signature or timestamp' });
    }

    // Check timestamp (prevent replay attacks)
    const now = Date.now();
    const requestTime = parseInt(timestamp);
    if (Math.abs(now - requestTime) > 300000) { // 5 minutes
      return res.status(400).json({ error: 'Request timestamp too old' });
    }

    if (!this.verifySignature(payload, timestamp, signature)) {
      return res.status(403).json({ error: 'Invalid signature' });
    }

    next();
  };
}
```

### API Versioning and Deprecation

```typescript
// Secure API versioning
export class APIVersioning {
  private supportedVersions = new Set(['v1', 'v2']);
  private deprecatedVersions = new Map([
    ['v1', new Date('2024-12-31')] // Deprecation date
  ]);

  validateVersion = (req: Request, res: Response, next: NextFunction) => {
    const version = req.headers['api-version'] as string || 'v1';
    
    if (!this.supportedVersions.has(version)) {
      return res.status(400).json({
        error: 'Unsupported API version',
        supportedVersions: Array.from(this.supportedVersions)
      });
    }

    // Warn about deprecation
    const deprecationDate = this.deprecatedVersions.get(version);
    if (deprecationDate) {
      res.set('Warning', `API version ${version} is deprecated. Support ends ${deprecationDate.toISOString()}`);
    }

    req.apiVersion = version;
    next();
  };
}
```

---

## 🗄️ Database Security

### Connection Security

```typescript
// Secure database configuration
const databaseConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: true,
    ca: fs.readFileSync('/path/to/ca-certificate.crt').toString(),
    cert: fs.readFileSync('/path/to/client-certificate.crt').toString(),
    key: fs.readFileSync('/path/to/client-key.key').toString()
  } : false,
  
  // Connection pool security
  max: 20, // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  
  // Query timeout
  statement_timeout: 30000, // 30 seconds
  
  // Application name for auditing
  application_name: 'lezerprint-api'
};
```

### Query Security

```sql
-- Create read-only user for analytics
CREATE ROLE analytics_reader;
GRANT CONNECT ON DATABASE lezerprint TO analytics_reader;
GRANT USAGE ON SCHEMA public TO analytics_reader;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics_reader;

-- Create application user with limited permissions
CREATE ROLE app_user;
GRANT CONNECT ON DATABASE lezerprint TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON print_jobs, files, users TO app_user;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- Row-level security
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_files_policy ON files
  USING (user_id = current_setting('app.current_user_id')::uuid);

ALTER TABLE print_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_jobs_policy ON print_jobs
  USING (user_id = current_setting('app.current_user_id')::uuid);
```

### Audit Logging

```typescript
// Database audit logging
export class AuditLogger {
  async logDatabaseOperation(
    operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE',
    table: string,
    userId: string,
    details?: any
  ): Promise<void> {
    await prisma.auditLog.create({
      data: {
        operation,
        table,
        userId,
        details: details ? JSON.stringify(details) : null,
        timestamp: new Date(),
        ipAddress: this.getCurrentIP(),
        userAgent: this.getCurrentUserAgent()
      }
    });
  }

  // Prisma middleware for automatic audit logging
  auditMiddleware: Prisma.Middleware = async (params, next) => {
    const before = Date.now();
    
    // Log sensitive operations
    if (['create', 'update', 'delete'].includes(params.action) &&
        ['user', 'file', 'printJob'].includes(params.model || '')) {
      
      await this.logDatabaseOperation(
        params.action.toUpperCase() as any,
        params.model!,
        this.getCurrentUserId(),
        params.args
      );
    }

    const result = await next(params);
    const after = Date.now();

    // Log slow queries
    if (after - before > 1000) { // 1 second
      console.warn(`Slow query detected: ${params.model}.${params.action} took ${after - before}ms`);
    }

    return result;
  };
}

// Apply audit middleware
prisma.$use(auditLogger.auditMiddleware);
```

---

## 🏗️ Infrastructure Security

### Docker Security

```dockerfile
# Secure Dockerfile practices
FROM node:20-alpine AS base

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set working directory
WORKDIR /app

# Copy and install dependencies as root
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY --chown=nextjs:nodejs . .

# Build application
RUN npm run build

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start application
CMD ["node", "dist/server.js"]
```

### Container Security

```yaml
# Docker Compose security configuration
version: '3.8'
services:
  backend:
    build: .
    read_only: true # Read-only container
    cap_drop:
      - ALL # Drop all capabilities
    cap_add:
      - NET_BIND_SERVICE # Only necessary capabilities
    security_opt:
      - no-new-privileges:true
    tmpfs:
      - /tmp:noexec,nosuid,size=100m
    volumes:
      - uploads:/app/uploads:rw,nosuid,nodev,noexec
    environment:
      - NODE_ENV=production
    networks:
      - backend-network
    restart: unless-stopped
    
  postgres:
    image: postgres:15-alpine
    read_only: true
    cap_drop:
      - ALL
    security_opt:
      - no-new-privileges:true
    tmpfs:
      - /tmp:noexec,nosuid,size=100m
      - /var/run/postgresql:noexec,nosuid,size=100m
    volumes:
      - postgres_data:/var/lib/postgresql/data:rw,nosuid,nodev
    environment:
      - POSTGRES_USER_FILE=/run/secrets/postgres_user
      - POSTGRES_PASSWORD_FILE=/run/secrets/postgres_password
    secrets:
      - postgres_user
      - postgres_password
    networks:
      - backend-network

networks:
  backend-network:
    driver: bridge
    internal: true # No external access

secrets:
  postgres_user:
    external: true
  postgres_password:
    external: true
```

### Secrets Management

```typescript
// Secret rotation service
export class SecretsManager {
  private vault = new HashiCorpVault({
    endpoint: process.env.VAULT_ENDPOINT,
    token: process.env.VAULT_TOKEN
  });

  async getSecret(path: string): Promise<string> {
    try {
      const secret = await this.vault.read(path);
      return secret.data.value;
    } catch (error) {
      console.error(`Failed to retrieve secret from ${path}:`, error);
      throw new Error('Secret retrieval failed');
    }
  }

  async rotateJWTSecret(): Promise<void> {
    const newSecret = crypto.randomBytes(64).toString('hex');
    
    // Store new secret in vault
    await this.vault.write('secret/jwt', { value: newSecret });
    
    // Update environment variable
    process.env.JWT_SECRET = newSecret;
    
    // Log rotation (without exposing secret)
    console.log('JWT secret rotated successfully');
  }

  // Automatic secret rotation
  scheduleSecretRotation(): void {
    setInterval(async () => {
      try {
        await this.rotateJWTSecret();
      } catch (error) {
        console.error('Failed to rotate JWT secret:', error);
      }
    }, 30 * 24 * 60 * 60 * 1000); // 30 days
  }
}
```

---

## 📊 Monitoring & Incident Response

### Security Monitoring

```typescript
// Security event monitoring
export class SecurityMonitor {
  private alertThresholds = {
    failedLogins: 5, // per 15 minutes
    suspiciousFileUploads: 3, // per hour
    rateLimitViolations: 10, // per hour
    privilegeEscalations: 1 // immediate alert
  };

  async detectAnomalies(): Promise<SecurityAlert[]> {
    const alerts: SecurityAlert[] = [];
    const now = new Date();
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);

    // Check failed login attempts
    const failedLogins = await prisma.auditLog.count({
      where: {
        operation: 'FAILED_LOGIN',
        timestamp: { gte: fifteenMinutesAgo }
      }
    });

    if (failedLogins >= this.alertThresholds.failedLogins) {
      alerts.push({
        type: 'BRUTE_FORCE_ATTACK',
        severity: 'HIGH',
        message: `${failedLogins} failed login attempts in 15 minutes`,
        timestamp: now
      });
    }

    // Check for privilege escalation attempts
    const privilegeEscalations = await prisma.auditLog.count({
      where: {
        operation: 'PRIVILEGE_ESCALATION',
        timestamp: { gte: fifteenMinutesAgo }
      }
    });

    if (privilegeEscalations > 0) {
      alerts.push({
        type: 'PRIVILEGE_ESCALATION',
        severity: 'CRITICAL',
        message: `Privilege escalation attempt detected`,
        timestamp: now
      });
    }

    return alerts;
  }

  async handleSecurityAlert(alert: SecurityAlert): Promise<void> {
    // Log to security log
    console.error(`SECURITY ALERT: ${alert.type} - ${alert.message}`);

    // Send to SIEM system
    await this.sendToSIEM(alert);

    // Auto-remediation for critical alerts
    if (alert.severity === 'CRITICAL') {
      await this.triggerAutoRemediation(alert);
    }

    // Notify security team
    await this.notifySecurityTeam(alert);
  }

  private async triggerAutoRemediation(alert: SecurityAlert): Promise<void> {
    switch (alert.type) {
      case 'BRUTE_FORCE_ATTACK':
        // Temporarily block IP addresses
        await this.blockSuspiciousIPs();
        break;
      case 'PRIVILEGE_ESCALATION':
        // Force logout all sessions for affected user
        await this.forceLogoutUser(alert.userId);
        break;
    }
  }
}
```

### Incident Response

```typescript
// Incident response automation
export class IncidentResponse {
  async handleSecurityIncident(incident: SecurityIncident): Promise<void> {
    // Create incident ticket
    const ticketId = await this.createIncidentTicket(incident);

    // Gather forensic data
    const forensicData = await this.gatherForensicData(incident);

    // Contain the threat
    await this.containThreat(incident);

    // Notify stakeholders
    await this.notifyStakeholders(incident, ticketId);

    // Start investigation
    await this.initiateInvestigation(incident, forensicData);
  }

  private async containThreat(incident: SecurityIncident): Promise<void> {
    switch (incident.type) {
      case 'DATA_BREACH':
        // Isolate affected systems
        await this.isolateAffectedSystems(incident.affectedSystems);
        // Revoke access tokens
        await this.revokeAllTokens();
        break;
        
      case 'MALWARE_DETECTED':
        // Quarantine infected files
        await this.quarantineFiles(incident.affectedFiles);
        // Scan all systems
        await this.initiateFullSystemScan();
        break;
    }
  }

  private async gatherForensicData(incident: SecurityIncident): Promise<ForensicData> {
    return {
      logs: await this.extractRelevantLogs(incident.timeRange),
      networkTraffic: await this.captureNetworkTraffic(incident.timeRange),
      systemSnapshots: await this.createSystemSnapshots(),
      userActivity: await this.getUserActivityLogs(incident.timeRange)
    };
  }
}
```

---

## ✅ Security Checklist

### Development Security Checklist

#### Authentication & Authorization
- [ ] **Strong password policy** implemented and enforced
- [ ] **Multi-factor authentication** available for all users
- [ ] **JWT tokens** use secure algorithms (RS256/ES256)
- [ ] **Token expiration** properly configured (short-lived access tokens)
- [ ] **Refresh token rotation** implemented
- [ ] **Session timeout** configured appropriately
- [ ] **Role-based access control** properly implemented
- [ ] **Principle of least privilege** followed

#### Input Validation & Data Protection
- [ ] **All inputs validated** using schema validation (Zod)
- [ ] **SQL injection protection** via parameterized queries
- [ ] **XSS prevention** via proper output encoding
- [ ] **CSRF protection** enabled for state-changing operations
- [ ] **File upload validation** includes type, size, and content checks
- [ ] **Sensitive data encrypted** at rest and in transit
- [ ] **PII handling** follows privacy regulations
- [ ] **Data retention policies** implemented

#### API Security
- [ ] **Rate limiting** implemented on all endpoints
- [ ] **CORS policy** properly configured
- [ ] **Security headers** implemented (HSTS, CSP, etc.)
- [ ] **API versioning** strategy in place
- [ ] **Request/response logging** for audit trail
- [ ] **Error handling** doesn't leak sensitive information

#### Infrastructure Security
- [ ] **TLS/SSL** properly configured with strong ciphers
- [ ] **Database connections** encrypted and authenticated
- [ ] **Secrets management** using secure vault solutions
- [ ] **Container security** best practices followed
- [ ] **Network segmentation** implemented
- [ ] **Regular security updates** automated

#### Monitoring & Response
- [ ] **Security logging** comprehensive and centralized
- [ ] **Anomaly detection** systems in place
- [ ] **Incident response plan** documented and tested
- [ ] **Security alerts** configured and monitored
- [ ] **Regular security assessments** scheduled
- [ ] **Vulnerability scanning** automated

### Production Security Checklist

#### Environment Hardening
- [ ] **Production secrets** stored securely (not in code)
- [ ] **Environment isolation** between dev/staging/prod
- [ ] **Firewall rules** configured and minimal
- [ ] **Unused services** disabled
- [ ] **Security patches** up to date
- [ ] **Backup encryption** enabled
- [ ] **Disaster recovery** plan tested

#### Operational Security
- [ ] **Admin access** logged and monitored
- [ ] **Privileged operations** require approval
- [ ] **Regular access reviews** conducted
- [ ] **Security training** provided to team
- [ ] **Vendor security** assessments completed
- [ ] **Compliance audits** scheduled and passed

---

## 📋 Compliance

### GDPR Compliance

```typescript
// GDPR data handling
export class GDPRCompliance {
  // Right to access
  async exportUserData(userId: string): Promise<UserDataExport> {
    const userData = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        files: true,
        printJobs: {
          include: {
            file: { select: { originalName: true } },
            events: true
          }
        },
        notifications: true
      }
    });

    return {
      personalData: {
        email: userData.email,
        username: userData.username,
        createdAt: userData.createdAt,
        preferences: userData.preferences
      },
      files: userData.files.map(file => ({
        name: file.originalName,
        uploadDate: file.createdAt,
        size: file.fileSize
      })),
      printHistory: userData.printJobs.map(job => ({
        fileName: job.file.originalName,
        startDate: job.startedAt,
        status: job.status,
        duration: job.actualTime
      }))
    };
  }

  // Right to erasure
  async deleteUserData(userId: string, retainAnalytics = true): Promise<void> {
    await prisma.$transaction(async (tx) => {
      if (retainAnalytics) {
        // Anonymize data for analytics
        await tx.user.update({
          where: { id: userId },
          data: {
            email: `deleted-${Date.now()}@deleted.local`,
            username: `deleted-${Date.now()}`,
            passwordHash: 'DELETED',
            isActive: false,
            deletedAt: new Date()
          }
        });
      } else {
        // Complete deletion
        await tx.user.delete({
          where: { id: userId }
        });
      }

      // Delete files from storage
      const files = await tx.file.findMany({
        where: { userId },
        select: { filePath: true }
      });

      for (const file of files) {
        await fs.promises.unlink(file.filePath).catch(() => {});
      }
    });
  }

  // Data portability
  async generateDataExport(userId: string): Promise<string> {
    const userData = await this.exportUserData(userId);
    const exportData = {
      exportDate: new Date().toISOString(),
      format: 'JSON',
      version: '1.0',
      data: userData
    };

    const exportPath = `/tmp/user-export-${userId}-${Date.now()}.json`;
    await fs.promises.writeFile(exportPath, JSON.stringify(exportData, null, 2));
    
    return exportPath;
  }
}
```

### SOC 2 Compliance

```typescript
// SOC 2 controls implementation
export class SOC2Controls {
  // Logical access controls
  async enforceAccessControls(): Promise<void> {
    // Regular access review
    const inactiveUsers = await prisma.user.findMany({
      where: {
        lastLoginAt: {
          lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // 90 days
        },
        isActive: true
      }
    });

    for (const user of inactiveUsers) {
      await prisma.user.update({
        where: { id: user.id },
        data: { isActive: false }
      });
      
      await this.auditLog('USER_DEACTIVATED', user.id, 'Inactive for 90 days');
    }
  }

  // Change management
  async trackConfigurationChanges(): Promise<void> {
    // Monitor system configuration changes
    const configHash = await this.calculateConfigHash();
    const lastKnownHash = await this.getLastConfigHash();

    if (configHash !== lastKnownHash) {
      await this.auditLog('CONFIG_CHANGED', 'system', {
        previousHash: lastKnownHash,
        currentHash: configHash
      });
      
      await this.storeConfigHash(configHash);
    }
  }

  // Data backup and recovery
  async verifyBackupIntegrity(): Promise<BackupStatus> {
    const backups = await this.listRecentBackups();
    const verificationResults = [];

    for (const backup of backups) {
      const isValid = await this.verifyBackupChecksum(backup);
      verificationResults.push({
        backup: backup.name,
        valid: isValid,
        checkedAt: new Date()
      });
    }

    return {
      totalBackups: backups.length,
      validBackups: verificationResults.filter(r => r.valid).length,
      lastVerification: new Date(),
      results: verificationResults
    };
  }
}
```

---

## 📚 Additional Resources

### Security Tools & Libraries
- [**Helmet.js**](https://helmetjs.github.io/) - Security headers middleware
- [**express-rate-limit**](https://github.com/nfriedly/express-rate-limit) - Rate limiting
- [**Zod**](https://zod.dev/) - Runtime type validation
- [**bcrypt**](https://github.com/kelektiv/node.bcrypt.js) - Password hashing
- [**jsonwebtoken**](https://github.com/auth0/node-jsonwebtoken) - JWT implementation

### Security Standards
- [**OWASP Top 10**](https://owasp.org/www-project-top-ten/) - Web application security risks
- [**NIST Cybersecurity Framework**](https://www.nist.gov/cyberframework) - Security guidelines
- [**CIS Controls**](https://www.cisecurity.org/controls/) - Critical security controls
- [**SOC 2**](https://www.aicpa.org/interestareas/frc/assuranceadvisoryservices/aicpasoc2report.html) - Service organization controls

### Related Documentation
- [**Deployment Guide**](DEPLOYMENT.md) - Production security setup
- [**Development Guide**](DEVELOPMENT_GUIDE.md) - Secure coding practices
- [**API Reference**](API_REFERENCE.md) - API security details

---

**Security is everyone's responsibility** 🔐 Regular security reviews, updates, and training are essential for maintaining a secure system. For security concerns or questions, please contact the security team or [open a security issue](https://github.com/Avi-Lezerovich/LezerPrint/security/advisories).