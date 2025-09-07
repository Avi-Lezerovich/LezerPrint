# 📡 API Reference

*Complete documentation for LezerPrint REST API and WebSocket events*

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Authentication](#-authentication)
- [Error Handling](#-error-handling)
- [Rate Limiting](#-rate-limiting)
- [Auth Endpoints](#-authentication-endpoints)
- [Printer Control](#-printer-control-endpoints)
- [File Management](#-file-management-endpoints)
- [Print Jobs](#-print-job-endpoints)
- [Analytics](#-analytics-endpoints)
- [WebSocket Events](#-websocket-events)
- [Response Codes](#-response-codes)

---

## 🔍 Overview

### Base URL

```
Development: http://localhost:3001/api
Production:  https://your-domain.com/api
```

### Content Type

All API endpoints accept and return JSON unless otherwise specified.

```http
Content-Type: application/json
Accept: application/json
```

### API Version

Current API version: `v1`

All endpoints are prefixed with `/api/` (no version in path currently).

---

## 🔐 Authentication

LezerPrint uses JWT (JSON Web Tokens) for authentication.

### Authentication Flow

1. **Register** or **Login** to get JWT token
2. **Include token** in Authorization header for protected endpoints
3. **Refresh token** when needed (7-day expiry)

### Authorization Header

```http
Authorization: Bearer <jwt_token>
```

### Token Response Format

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "7d",
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "username": "username",
      "role": "OPERATOR"
    }
  }
}
```

---

## ⚠️ Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // Optional additional details
  }
}
```

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `VALIDATION_ERROR` | Invalid input data | 400 |
| `UNAUTHORIZED` | Missing or invalid token | 401 |
| `FORBIDDEN` | Insufficient permissions | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `CONFLICT` | Resource already exists | 409 |
| `RATE_LIMITED` | Too many requests | 429 |
| `INTERNAL_ERROR` | Server error | 500 |
| `PRINTER_ERROR` | Hardware communication error | 500 |

---

## 🚦 Rate Limiting

### Limits

- **General API**: 100 requests per minute per IP
- **File Upload**: 5 uploads per minute per user
- **Printer Commands**: 30 commands per minute per user

### Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640995200
```

---

## 🔑 Authentication Endpoints

### Register User

Create a new user account.

```http
POST /api/auth/register
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "securePassword123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "username": "username",
      "role": "VIEWER"
    }
  }
}
```

### Login

Authenticate user and get access token.

```http
POST /api/auth/login
```

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:** Same as register response.

### Refresh Token

Get a new access token using refresh token.

```http
POST /api/auth/refresh
```

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Logout

Invalidate user session.

```http
POST /api/auth/logout
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

### Get Profile

Get current user profile information.

```http
GET /api/auth/profile
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "username": "username",
      "role": "OPERATOR",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "lastLoginAt": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

---

## 🖨️ Printer Control Endpoints

### Get Printer Status

Get current printer status and information.

```http
GET /api/printer/status
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "state": "idle",
    "temperatures": {
      "hotend": {
        "current": 25.0,
        "target": 0.0
      },
      "bed": {
        "current": 24.5,
        "target": 0.0
      }
    },
    "position": {
      "x": 150.0,
      "y": 150.0,
      "z": 10.0,
      "e": 0.0
    },
    "progress": {
      "completion": 0.0,
      "printTime": 0,
      "printTimeLeft": null
    },
    "currentJob": null
  }
}
```

### Send G-code Command

Send a raw G-code command to the printer.

```http
POST /api/printer/command
Authorization: Bearer <token>
```

**Required Role:** OPERATOR or ADMIN

**Request Body:**

```json
{
  "command": "G28",
  "wait": true
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "response": "ok"
  }
}
```

### Home Printer

Home specified axes or all axes.

```http
POST /api/printer/home
Authorization: Bearer <token>
```

**Required Role:** OPERATOR or ADMIN

**Request Body:**

```json
{
  "axes": "all"  // or ["X", "Y", "Z"]
}
```

### Move Axis

Move printer axis by specified distance.

```http
POST /api/printer/move
Authorization: Bearer <token>
```

**Required Role:** OPERATOR or ADMIN

**Request Body:**

```json
{
  "axis": "Z",
  "distance": 10.0,
  "speed": 1000
}
```

### Set Temperature

Set target temperatures for hotend, bed, or chamber.

```http
POST /api/printer/temperature
Authorization: Bearer <token>
```

**Required Role:** OPERATOR or ADMIN

**Request Body:**

```json
{
  "hotend": 200,
  "bed": 60,
  "chamber": 40
}
```

### Emergency Stop

Immediately stop all printer operations.

```http
POST /api/printer/emergency-stop
Authorization: Bearer <token>
```

**Required Role:** OPERATOR or ADMIN

### Pause Print

Pause current print job.

```http
POST /api/printer/pause
Authorization: Bearer <token>
```

**Required Role:** OPERATOR or ADMIN

### Resume Print

Resume paused print job.

```http
POST /api/printer/resume
Authorization: Bearer <token>
```

**Required Role:** OPERATOR or ADMIN

### Cancel Print

Cancel current print job.

```http
POST /api/printer/cancel
Authorization: Bearer <token>
```

**Required Role:** OPERATOR or ADMIN

---

## 📁 File Management Endpoints

### List Files

Get paginated list of user's files.

```http
GET /api/files?page=1&limit=20&type=STL&sort=date&order=desc
Authorization: Bearer <token>
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |
| `type` | string | - | Filter by file type (STL, GCODE, OBJ, THREEMF) |
| `sort` | string | date | Sort by (name, date, size) |
| `order` | string | desc | Sort order (asc, desc) |

**Response:**

```json
{
  "success": true,
  "data": {
    "files": [
      {
        "id": "file-uuid",
        "originalName": "model.stl",
        "fileName": "unique-filename.stl",
        "fileType": "STL",
        "fileSize": "1048576",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "printCount": 3,
        "thumbnailUrl": "/uploads/thumbnails/thumb.jpg"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
```

### Get File Details

Get detailed information about a specific file.

```http
GET /api/files/:id
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "file": {
      "id": "file-uuid",
      "originalName": "model.stl",
      "fileName": "unique-filename.stl",
      "fileType": "STL",
      "fileSize": "1048576",
      "metadata": {
        "dimensions": {
          "x": 100,
          "y": 100,
          "z": 50
        },
        "triangles": 15420
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "user": {
        "id": "user-uuid",
        "username": "username"
      },
      "_count": {
        "printJobs": 3
      }
    }
  }
}
```

### Upload File

Upload a new 3D model or G-code file.

```http
POST /api/files/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**

```
file: <binary file data>
folder: "models" (optional)
```

**Supported File Types:**
- STL (3D models)
- G-code (print instructions)
- OBJ (3D models)
- 3MF (3D models with metadata)

**Max File Size:** 50MB

**Response:**

```json
{
  "success": true,
  "data": {
    "file": {
      "id": "file-uuid",
      "originalName": "model.stl",
      "fileName": "unique-filename.stl",
      "fileType": "STL",
      "fileSize": "1048576",
      "thumbnailUrl": "/uploads/thumbnails/thumb.jpg"
    }
  }
}
```

### Download File

Download a previously uploaded file.

```http
GET /api/files/:id/download
Authorization: Bearer <token>
```

**Response:** Binary file download with appropriate headers.

### Delete File

Delete a file and all associated data.

```http
DELETE /api/files/:id
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "File deleted successfully"
  }
}
```

---

## 🔄 Print Job Endpoints

### List Print Jobs

Get paginated list of print jobs.

```http
GET /api/jobs?page=1&limit=20&status=COMPLETED
Authorization: Bearer <token>
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Items per page |
| `status` | string | - | Filter by status |
| `userId` | string | - | Filter by user (admin only) |

**Response:**

```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": "job-uuid",
        "status": "COMPLETED",
        "progress": 100.0,
        "startedAt": "2024-01-01T10:00:00.000Z",
        "completedAt": "2024-01-01T12:30:00.000Z",
        "estimatedTime": 9000,
        "actualTime": 9000,
        "filamentUsed": 25.5,
        "cost": "3.50",
        "file": {
          "id": "file-uuid",
          "originalName": "model.stl"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "pages": 1
    }
  }
}
```

### Create Print Job

Create a new print job from an uploaded file.

```http
POST /api/jobs
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "fileId": "file-uuid",
  "profileId": "profile-uuid",
  "priority": "normal",
  "startImmediately": false
}
```

### Get Job Details

Get detailed information about a print job.

```http
GET /api/jobs/:id
Authorization: Bearer <token>
```

### Update Job

Update print job properties.

```http
PUT /api/jobs/:id
Authorization: Bearer <token>
```

### Cancel Job

Cancel a queued or running print job.

```http
DELETE /api/jobs/:id
Authorization: Bearer <token>
```

---

## 📊 Analytics Endpoints

### Dashboard Analytics

Get dashboard analytics data.

```http
GET /api/analytics/dashboard?range=30d
Authorization: Bearer <token>
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `range` | string | 30d | Time range (7d, 30d, 90d, 1y) |

**Response:**

```json
{
  "success": true,
  "data": {
    "totalPrints": 45,
    "successRate": 92.5,
    "totalTime": 156000,
    "materialUsed": 850.5,
    "averagePrintTime": 3467,
    "trends": [
      {
        "date": "2024-01-01",
        "prints": 5,
        "successRate": 100,
        "time": 18000
      }
    ]
  }
}
```

### Material Usage Statistics

```http
GET /api/analytics/materials
Authorization: Bearer <token>
```

### Failure Analysis

```http
GET /api/analytics/failures
Authorization: Bearer <token>
```

---

## 🔌 WebSocket Events

LezerPrint uses WebSocket for real-time communication.

### Connection

```javascript
const socket = io('http://localhost:3001', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Server Events (Received)

#### Printer Status Updates

```javascript
socket.on('printer:status', (data) => {
  console.log('Printer status:', data);
  // {
  //   state: 'printing',
  //   temperatures: { hotend: { current: 200, target: 200 } },
  //   progress: { completion: 45.5, printTime: 3600 }
  // }
});
```

#### Temperature Updates

```javascript
socket.on('printer:temperature', (data) => {
  console.log('Temperature update:', data);
  // {
  //   hotend: { current: 199.8, target: 200 },
  //   bed: { current: 59.5, target: 60 }
  // }
});
```

#### Print Progress Updates

```javascript
socket.on('printer:progress', (data) => {
  console.log('Print progress:', data);
  // {
  //   jobId: 'job-uuid',
  //   completion: 67.5,
  //   printTime: 5400,
  //   printTimeLeft: 2600
  // }
});
```

#### Job Status Changes

```javascript
socket.on('job:status', (data) => {
  console.log('Job status changed:', data);
  // {
  //   jobId: 'job-uuid',
  //   status: 'COMPLETED',
  //   completedAt: '2024-01-01T12:00:00.000Z'
  // }
});
```

#### Error Events

```javascript
socket.on('printer:error', (data) => {
  console.error('Printer error:', data);
  // {
  //   type: 'THERMAL_RUNAWAY',
  //   message: 'Hotend thermal runaway detected',
  //   severity: 'CRITICAL'
  // }
});
```

### Client Events (Sent)

#### Subscribe to Updates

```javascript
socket.emit('subscribe', {
  events: ['printer:status', 'printer:temperature', 'job:status']
});
```

#### Send Printer Command

```javascript
socket.emit('printer:command', {
  command: 'M105', // Get temperature
  wait: true
});
```

---

## 📋 Response Codes

### HTTP Status Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 422 | Unprocessable Entity | Validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service temporarily unavailable |

### Success Response Format

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "meta": {
    // Optional metadata (pagination, etc.)
  }
}
```

---

## 🔧 Development Tools

### API Testing

#### Using cURL

```bash
# Get printer status
curl -H "Authorization: Bearer <token>" \
     http://localhost:3001/api/printer/status

# Upload file
curl -H "Authorization: Bearer <token>" \
     -F "file=@model.stl" \
     http://localhost:3001/api/files/upload

# Send G-code command
curl -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"command":"G28","wait":true}' \
     http://localhost:3001/api/printer/command
```

#### Using JavaScript/Fetch

```javascript
// Get printer status
const response = await fetch('/api/printer/status', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const data = await response.json();

// Upload file
const formData = new FormData();
formData.append('file', file);

const response = await fetch('/api/files/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

---

## 📚 Additional Resources

- [**Getting Started**](GETTING_STARTED.md) - Quick setup guide
- [**Development Guide**](DEVELOPMENT_GUIDE.md) - Code architecture
- [**User Manual**](USER_MANUAL.md) - Feature documentation
- [**Troubleshooting**](TROUBLESHOOTING.md) - Common issues

---

**Need help?** [Open an issue](https://github.com/Avi-Lezerovich/LezerPrint/issues) or check our [FAQ](FAQ.md).