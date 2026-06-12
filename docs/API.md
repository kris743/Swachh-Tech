# SWACHH TECH AI — API Reference

## Base URL

- **Development**: `http://localhost:4000/api`
- **Production**: `https://api.swachhtech.ai/api`
- **Swagger UI**: `{BASE_URL}/docs`

## Authentication

All protected endpoints require a Bearer token:
```
Authorization: Bearer <access_token>
```

## Response Format

All API responses follow this format:
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

Error responses:
```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400
}
```

---

## Auth Endpoints

### POST /auth/register
Register a new user.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass@123",
  "firstName": "Rahul",
  "lastName": "Sharma",
  "phone": "+919876543210",
  "role": "CITIZEN"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "email": "...", "role": "CITIZEN" },
    "accessToken": "jwt...",
    "refreshToken": "jwt..."
  }
}
```

### POST /auth/login
Login with email and password.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass@123"
}
```

### POST /auth/otp/send
Send OTP to phone number.

**Body:**
```json
{
  "phone": "+919876543210"
}
```

### POST /auth/otp/verify
Verify OTP and get tokens.

**Body:**
```json
{
  "phone": "+919876543210",
  "otp": "123456"
}
```

### POST /auth/refresh
Refresh access token.

**Body:**
```json
{
  "refreshToken": "jwt..."
}
```

### POST /auth/logout
Logout and invalidate refresh token.

### GET /auth/me
Get current authenticated user. **Requires Auth.**

---

## Citizens Endpoints

### GET /citizens/profile
Get citizen profile. **Role: CITIZEN**

### PATCH /citizens/profile
Update citizen profile. **Role: CITIZEN**

### GET /citizens/dashboard
Get citizen dashboard stats. **Role: CITIZEN**

### GET /citizens/collection-history
Get waste collection history. **Role: CITIZEN**

**Query:** `?page=1&limit=10&wasteType=DRY`

### GET /citizens/leaderboard
Get reward leaderboard. **Role: CITIZEN**

---

## Workers Endpoints

### GET /workers/my-dashboard
Get worker dashboard stats. **Role: WORKER**

### GET /workers/my-route
Get today's assigned route. **Role: WORKER**

### POST /workers/attendance/check-in
Check in for duty. **Role: WORKER**

**Body:**
```json
{
  "latitude": 12.9716,
  "longitude": 77.5946
}
```

### POST /workers/attendance/check-out
Check out from duty. **Role: WORKER**

### GET /workers/performance
Get performance metrics. **Role: WORKER**

---

## QR Code Endpoints

### POST /qr-codes/generate/:householdId
Generate QR code for household. **Role: ADMIN**

### POST /qr-codes/scan
Scan QR code and log collection. **Role: WORKER**

**Body:**
```json
{
  "code": "QR-UUID-STRING",
  "gpsLatitude": 12.9716,
  "gpsLongitude": 77.5946,
  "wasteType": "DRY",
  "weight": 2.5
}
```

**Response:** `201 Created` with collection record.

**Error Cases:**
- `400` — Invalid QR code
- `409` — Duplicate scan within 12 hours
- `404` — Household not found

### GET /qr-codes/:householdId
Get QR code for household. **Roles: CITIZEN, ADMIN**

---

## Complaints Endpoints

### POST /complaints
Create new complaint. **Role: CITIZEN**

**Body (multipart/form-data):**
```
type: GARBAGE_DUMP
description: "Large garbage dump near park entrance"
gpsLatitude: 12.9716
gpsLongitude: 77.5946
address: "MG Road, Ward 5"
images: [file1.jpg, file2.jpg]
```

### GET /complaints
Get complaints (filtered by role). **All Roles**

**Query:** `?status=PENDING&type=GARBAGE_DUMP&ward=Ward5&page=1&limit=10`

### GET /complaints/:id
Get complaint detail. **All Roles**

### PATCH /complaints/:id/status
Update complaint status. **Roles: ADMIN, GREEN_CHAMPION**

**Body:**
```json
{
  "status": "VERIFIED",
  "notes": "Verified on ground"
}
```

### PATCH /complaints/:id/assign
Assign complaint to worker. **Role: ADMIN**

**Body:**
```json
{
  "assignedToId": "user-uuid"
}
```

### GET /complaints/stats
Get complaint statistics. **Roles: ADMIN, GREEN_CHAMPION**

---

## Trucks Endpoints

### GET /trucks
Get all trucks. **Role: ADMIN**

### POST /trucks
Create new truck. **Role: ADMIN**

### PATCH /trucks/:id
Update truck details. **Role: ADMIN**

### GET /trucks/fleet-status
Get fleet status overview. **Role: ADMIN**

### PATCH /trucks/:id/location
Update truck GPS location. **Role: DRIVER**

---

## Routes Endpoints

### GET /routes
Get all routes. **Roles: ADMIN, DRIVER**

### POST /routes
Create new route. **Role: ADMIN**

### POST /routes/assign
Assign route to driver. **Role: ADMIN**

### GET /routes/assignments
Get route assignments. **Roles: ADMIN, DRIVER**

### PATCH /routes/assignments/:id/status
Update assignment status. **Role: DRIVER**

---

## Rewards Endpoints

### GET /rewards/my-wallet
Get citizen reward wallet. **Role: CITIZEN**

### GET /rewards/leaderboard
Get reward leaderboard (top 50). **All Roles**

### GET /rewards/transactions
Get reward transaction history. **Role: CITIZEN**

---

## Analytics Endpoints

### GET /analytics/dashboard
Get admin dashboard KPIs. **Role: ADMIN**

### GET /analytics/waste-trends
Get 30-day waste trends. **Role: ADMIN**

### GET /analytics/complaints
Get complaint analytics. **Role: ADMIN**

### GET /analytics/collections
Get collection statistics. **Role: ADMIN**

### GET /analytics/wards/:ward
Get ward-specific analytics. **Role: ADMIN**

### GET /analytics/workers
Get worker performance data. **Role: ADMIN**

### GET /analytics/trucks
Get truck utilization data. **Role: ADMIN**

---

## Notifications Endpoints

### GET /notifications
Get user notifications. **All Roles**

**Query:** `?page=1&limit=20`

### PATCH /notifications/:id/read
Mark notification as read. **All Roles**

### PATCH /notifications/read-all
Mark all notifications as read. **All Roles**

### GET /notifications/unread-count
Get unread notification count. **All Roles**

---

## AI Service Endpoints

Base URL: `http://localhost:8000/api/v1`

### POST /predict/waste
Predict waste generation.

### POST /classify/complaint
Classify complaint image.

### POST /optimize/route
Optimize collection route.

### GET /insights
Get AI-generated insights.

### GET /health
Health check.

---

## WebSocket Events

Connect to: `ws://localhost:4000/tracking`

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `truck:location` | `{ truckId, latitude, longitude, speed }` | Driver sends GPS update |
| `subscribe:ward` | `{ ward }` | Subscribe to ward updates |

### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `truck:update` | `{ truckId, latitude, longitude, speed, eta }` | Truck position update |
| `notification:new` | `{ id, title, body, type }` | New notification |
| `collection:complete` | `{ householdId, wasteType, workerName }` | Collection completed |

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| Auth endpoints | 5 requests / minute |
| API endpoints | 100 requests / minute |
| File uploads | 10 requests / minute |
| WebSocket messages | 60 messages / minute |

## Pagination

All list endpoints support:
```
?page=1&limit=10&search=keyword
```

Response includes:
```json
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```
