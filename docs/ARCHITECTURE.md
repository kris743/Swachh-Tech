# SWACHH TECH AI — Architecture Documentation

## System Architecture

SWACHH TECH AI follows a microservices architecture with three core services communicating through REST APIs and WebSockets.

## Service Overview

### 1. Frontend Service (Next.js 15)

**Purpose**: User interface for all 6 roles

**Key Patterns**:
- **App Router**: File-based routing with route groups for auth and dashboard layouts
- **Server Components**: Default for data fetching; `'use client'` only for interactivity
- **React Query**: Server state management with caching, refetching, and optimistic updates
- **Zustand**: Client state (auth, UI preferences)
- **Socket.IO Client**: Real-time updates for GPS tracking and notifications

**Route Groups**:
- `(auth)` — Login, Register, OTP verification
- `(dashboard)` — Protected routes with role-based layouts
  - `/citizen/*` — Citizen dashboard pages
  - `/worker/*` — Worker dashboard pages
  - `/driver/*` — Driver dashboard pages
  - `/green-champion/*` — Green Champion pages
  - `/recycler/*` — Recycler pages
  - `/admin/*` — Municipality admin pages

### 2. Backend Service (NestJS 11)

**Purpose**: REST API, authentication, business logic, WebSocket gateway

**Key Patterns**:
- **Module Architecture**: Each feature domain in its own NestJS module
- **Guards**: JWT authentication + RBAC authorization
- **Interceptors**: Response transformation + audit logging
- **Exception Filters**: Consistent error response format
- **Validation Pipes**: class-validator DTOs on all endpoints
- **Prisma Service**: Global database service with connection management

**Module List**:
| Module | Endpoints | Auth Required |
|--------|-----------|---------------|
| Auth | /auth/* | No (public) |
| Users | /users/* | Admin |
| Citizens | /citizens/* | Citizen |
| Workers | /workers/* | Worker |
| Drivers | /drivers/* | Driver |
| Trucks | /trucks/* | Admin |
| Routes | /routes/* | Admin, Driver |
| QR Codes | /qr-codes/* | Worker, Admin |
| Collections | /collections/* | All roles |
| Complaints | /complaints/* | All roles |
| Rewards | /rewards/* | Citizen |
| Notifications | /notifications/* | All roles |
| Analytics | /analytics/* | Admin |
| Green Champions | /green-champions/* | Green Champion |
| Recyclers | /recyclers/* | Recycler |
| Training | /training/* | All roles |
| Upload | /upload/* | All roles |
| Audit | /audit/* | Admin |

**WebSocket Gateway**:
- Namespace: `/tracking`
- Events:
  - `truck:location` — Driver emits GPS coordinates
  - `truck:update` — Broadcast to ward subscribers
  - `notification:new` — Server pushes to specific users
  - `collection:complete` — Worker scans, citizen notified

### 3. AI Service (FastAPI)

**Purpose**: Machine learning inference for waste prediction, image classification, route optimization

**Endpoints**:
| Endpoint | Method | Model | Input | Output |
|----------|--------|-------|-------|--------|
| /api/v1/predict/waste | POST | GradientBoosting | ward_id, days | Predictions array |
| /api/v1/classify/complaint | POST | YOLOv8 | Image file | Classification + confidence |
| /api/v1/optimize/route | POST | OR-Tools VRP | Depot + pickups | Optimized routes |
| /api/v1/insights | GET | Rule-based + ML | ward_id (optional) | Recommendations |

**Model Loading**: Models loaded at startup via FastAPI lifespan events for fast inference.

## Data Flow Diagrams

### QR Collection Flow
```
Worker scans QR → Backend validates QR → Check duplicate (12hr window)
  → Log collection (GPS, timestamp, waste type) → Update stats
  → Notify citizen (Socket.IO + DB) → Award points to citizen
```

### Complaint Flow
```
Citizen uploads image + description + location
  → Backend saves complaint (PENDING)
  → Backend calls AI Service for classification
  → AI returns classification + confidence + severity
  → Admin/Green Champion sees in dashboard
  → Admin assigns to worker (ASSIGNED)
  → Worker resolves (IN_PROGRESS → RESOLVED)
  → Citizen notified at each status change
```

### Route Optimization Flow
```
Admin requests optimization for ward
  → Backend collects pickup points (households)
  → Backend sends to AI Service
  → OR-Tools VRP solver optimizes
  → Returns routes per vehicle
  → Admin reviews and assigns to drivers
  → Drivers see routes in their dashboard
```

## Database Schema

### Entity Relationship Overview

```
User (1) ─── (0..1) CitizenProfile
User (1) ─── (0..1) WorkerProfile
User (1) ─── (0..1) DriverProfile
User (1) ─── (0..1) GreenChampionProfile
User (1) ─── (0..1) RecyclerProfile

Household (1) ─── (1) QRCode
Household (1) ─── (N) CitizenProfile
Household (1) ─── (N) WasteCollection

Truck (1) ─── (0..1) DriverProfile
Truck (1) ─── (N) RouteAssignment

Route (1) ─── (N) RouteAssignment
RouteAssignment ─── DriverProfile + Truck

WasteCollection ─── WorkerProfile + Household + QRCode

Complaint (1) ─── (N) ComplaintMedia
Complaint ─── CitizenProfile (author)
Complaint ─── User (assignedTo)
Complaint ─── GreenChampionProfile (verifiedBy)

RewardTransaction ─── CitizenProfile
Notification ─── User
AuditLog ─── User
```

## Security Architecture

### Authentication Flow
```
1. User sends credentials (email + password)
2. Backend validates and returns:
   - Access Token (JWT, 15min expiry)
   - Refresh Token (JWT, 7day expiry, stored in DB)
3. Client stores tokens
4. Client sends Access Token in Authorization header
5. On 401: Client sends Refresh Token to /auth/refresh
6. Backend validates Refresh Token, issues new pair
7. On logout: Refresh Token cleared from DB
```

### RBAC (Role-Based Access Control)
```
@Roles(UserRole.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
```
- Roles defined as enum: CITIZEN, WORKER, DRIVER, GREEN_CHAMPION, RECYCLER, ADMIN
- Each endpoint decorated with required roles
- Guards check JWT validity then role authorization

## Deployment Architecture

```
┌─────────┐     ┌──────────┐     ┌─────────┐
│  Vercel  │     │ Railway  │     │ Render  │
│ Frontend │────▶│ Backend  │────▶│   AI    │
│ (CDN)    │     │ (Docker) │     │ (Docker)│
└─────────┘     └─────┬────┘     └─────────┘
                      │
              ┌───────┴────────┐
              │   Supabase     │
              │  PostgreSQL    │
              │    + Redis     │
              └────────────────┘
```
