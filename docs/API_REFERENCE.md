# 📡 API Reference

Complete documentation for LezerPrint REST API and WebSocket events (kept in sync with the current backend).

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

All endpoints are currently prefixed with `/api/` with no version segment.

Health endpoints:

```
GET /api/health  -> { status: 'ok', version: '1.0.0', timestamp }
GET /api/status  -> { server: 'LezerPrint Backend', status: 'running', timestamp }
```

---

## 🔐 Authentication

LezerPrint uses JWT (JSON Web Tokens).

### Authentication Flow

1. Register or login to get tokens
2. Include the access token in the Authorization header for protected endpoints
3. Refresh using the refresh token when the access token expires

### Authorization Header

```http
Authorization: Bearer <jwt_token>
```

### Token lifetimes

- Access token (JWT): 15 minutes
- Refresh token (JWT): 7 days

Auth endpoints return the following shape (no `success` wrapper):

```json
{
  "message": "...",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "username": "username",
    "role": "VIEWER|OPERATOR|ADMIN"
  },
  "tokens": {
    "accessToken": "<jwt>",
    "refreshToken": "<jwt>"
  }
}
```

---

## ⚠️ Error Handling

### Error Response Format

Most API routes respond with a standard envelope:

```json
{ "success": true, "data": { /* payload */ }, "meta": { /* optional */ } }
```

On validation or server errors these routes return:

```json
{ "success": false, "error": { "code": "ERROR_CODE", "message": "...", "details": {} } }
```

Note: Auth endpoints return plain objects with `message`, `user`, and `tokens` fields (no `success` wrapper).

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

Not currently enforced in the backend. Planned limits may include per-IP request ceilings and per-user command throttles.

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
  "message": "User registered successfully",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "username": "username",
    "role": "VIEWER"
  },
  "tokens": {
    "accessToken": "<jwt>",
    "refreshToken": "<jwt>"
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

**Response:**

```json
{
  "message": "Login successful",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "username": "username",
    "role": "VIEWER|OPERATOR|ADMIN"
  },
  "tokens": {
    "accessToken": "<jwt>",
    "refreshToken": "<jwt>"
  }
}
```

### Refresh Token

Get a new access token using refresh token.

```http
POST /api/auth/refresh
```

**Request Body:**

```json
{ "refreshToken": "<jwt>" }
```

**Response:**

```json
{ "message": "Token refreshed successfully", "tokens": { "accessToken": "<jwt>", "refreshToken": "<jwt>" } }
```

### Logout

Invalidate user session.

```http
POST /api/auth/logout
Authorization: Bearer <token>
```

**Response:**

```json
{ "message": "Logout successful" }
```

### Get Profile

Get current user profile information.

```http
GET /api/auth/profile
Authorization: Bearer <token>
```

**Response:**

```json
{ "user": { "id": "user-uuid", "email": "user@example.com", "username": "username", "role": "VIEWER|OPERATOR|ADMIN", "createdAt": "2024-01-01T00:00:00.000Z", "updatedAt": "2024-01-01T12:00:00.000Z" } }
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
    "state": "idle|printing|paused|error",
    "error": null,
    "connected": true,
    "temperatures": {
      "hotendTemp": 25.0,
      "hotendTarget": 0.0,
      "bedTemp": 24.5,
      "bedTarget": 0.0
    },
    "position": { "x": 0, "y": 0, "z": 0, "e": 0 },
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
{ "axis": "X|Y|Z|E", "distance": 10.0, "speed": 1000 }
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
{ "hotend": 200, "bed": 60, "chamber": 40 }
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
| `type` | string | - | Filter by file type (STL, GCODE) |
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
        "fileName": "safe-name-123.stl",
        "fileType": "STL",
        "fileSize": "1048576", // serialized as string
        "createdAt": "2024-01-01T00:00:00.000Z",
        "printCount": 3
      }
    ],
    "total": 45,
    "page": 1,
    "pages": 3
  }
}
```

Note: `fileSize` is stored as BigInt in the DB and serialized as a string in responses.

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
      "fileName": "safe-name-123.stl",
      "fileType": "STL",
      "fileSize": "1048576",
      "metadata": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "user": { "id": "user-uuid", "username": "username" },
      "_count": { "printJobs": 3 }
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
- STL (.stl)
- G-code (.gcode, .gco, .g)

OBJ/3MF are not accepted by the current upload filter.

**Max File Size:** 100MB by default (configurable via `MAX_FILE_SIZE`).

**Response:**

```json
{
  "success": true,
  "data": {
    "file": {
      "id": "file-uuid",
      "originalName": "model.stl",
      "fileName": "safe-name-123.stl",
      "fileType": "STL",
      "fileSize": "1048576"
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
| `userId` | string | - | (Not supported by current endpoint) |

**Response:**

```json
{
  "success": true,
  "data": {
    "jobs": [ /* PrintJob[] */ ]
  },
  "meta": { "page": 1, "limit": 20, "total": 15, "pages": 1 }
}
```

### Start Job

Create and start a job from an uploaded file.

```http
POST /api/jobs/start
Authorization: Bearer <token>
```

Required role: OPERATOR or ADMIN

**Request Body:**

```json
{ "fileId": "file-uuid" }
```

### Get Job Details

Get detailed information about a print job.

```http
GET /api/jobs/:id
Authorization: Bearer <token>
```

### Pause/Resume/Cancel Job

```http
POST /api/jobs/:id/pause
POST /api/jobs/:id/resume
POST /api/jobs/:id/cancel
Authorization: Bearer <token>
```

Required role: OPERATOR or ADMIN

Note: There is no `PUT /api/jobs/:id` or `DELETE /api/jobs/:id` in the current implementation.

---

## 📊 Analytics Endpoints

### Dashboard Analytics

Get dashboard analytics data.

```http
GET /api/analytics/dashboard
Authorization: Bearer <token>
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `range` | string | - | Not currently supported |

**Response:**

```json
{ "success": true, "data": { "totalPrints": 0, "successRate": 0, "totalTime": 0, "materialUsed": 0, "averagePrintTime": 0, "trends": [] } }
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

Realtime via Socket.IO. Authenticate by passing the access token in `auth`.

### Connection

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
  auth: { token },
  transports: ['websocket']
});

socket.on('connected', (info) => {
  console.log('Connected:', info);
});
```

### Server Events (received)

- `connected` -> initial connection info
- `status:current` and `status:update` -> printer status snapshots/updates
- `temperature:current` and `temperature:update` -> temperature data
- `progress:update` -> job progress updates
- `alert` -> important alerts
- `camera:frame` -> base64 JPEG frames (when subscribed and authorized)
- `control:response` and `command:response` -> command acknowledgments

```javascript
socket.on('status:update', (status) => console.log(status));
socket.on('temperature:update', (t) => console.log(t));
socket.on('progress:update', (p) => console.log(p));
socket.on('alert', (a) => console.warn(a));
```

### Client Events (sent)

Subscriptions:

```javascript
socket.emit('subscribe:status');
socket.emit('subscribe:temperature');
// camera requires authentication
socket.emit('subscribe:camera');
```

Controls (auth + OPERATOR/ADMIN):

```javascript
socket.emit('control:pause');
socket.emit('control:resume');
socket.emit('control:stop');
socket.emit('control:emergency');
socket.emit('control:command', { gcode: 'M105' });
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