# SWACHH TECH AI — Deployment Guide

## Overview

This guide covers deploying SWACHH TECH AI to production using:
- **Frontend** → Vercel
- **Backend** → Railway
- **AI Service** → Render
- **Database** → Supabase (PostgreSQL)
- **Cache** → Upstash (Redis) or Railway Redis

---

## Prerequisites

- GitHub repository with the codebase
- Accounts on: Vercel, Railway, Render, Supabase, Cloudinary
- Google Maps API key
- (Optional) Twilio, SendGrid, Firebase accounts for notifications

---

## Step 1: Database — Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note the connection string from Project Settings → Database:
   ```
   postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```
3. For migrations, use the **direct connection** (port 5432, not pooled)
4. Run migrations:
   ```bash
   cd backend
   DATABASE_URL="your_supabase_direct_url" npx prisma migrate deploy
   DATABASE_URL="your_supabase_direct_url" npx prisma db seed
   ```

---

## Step 2: Cache — Redis

### Option A: Upstash (Recommended — Serverless)
1. Go to [upstash.com](https://upstash.com)
2. Create a Redis database
3. Copy the connection URL: `rediss://default:xxx@xxx.upstash.io:6379`

### Option B: Railway Redis
1. In your Railway project, add a Redis service
2. Use the provided `REDIS_URL`

---

## Step 3: Backend — Railway

1. Go to [railway.app](https://railway.app)
2. Create a new project → Deploy from GitHub
3. Select the repository, set root directory to `backend`
4. Configure environment variables:

| Variable | Value |
|----------|-------|
| `PORT` | `4000` |
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Supabase connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET` | Strong random string (32+ chars) |
| `JWT_EXPIRATION` | `15m` |
| `JWT_REFRESH_SECRET` | Different strong random string |
| `JWT_REFRESH_EXPIRATION` | `7d` |
| `AI_SERVICE_URL` | Render AI service URL |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret |

5. Railway will auto-detect the Dockerfile and deploy

---

## Step 4: AI Service — Render

1. Go to [render.com](https://render.com)
2. Create a new Web Service → Connect GitHub repo
3. Set root directory to `ai-service`
4. Build Command: (Dockerfile will be used)
5. Environment: Docker
6. Configure environment variables:

| Variable | Value |
|----------|-------|
| `AI_PORT` | `8000` |
| `AI_DATABASE_URL` | Supabase connection string |
| `AI_REDIS_URL` | Redis connection string |
| `AI_MODEL_PATH` | `/app/models` |
| `AI_LOG_LEVEL` | `info` |

7. Note the service URL for backend config

---

## Step 5: Frontend — Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import the GitHub repository
3. Set root directory to `frontend`
4. Framework Preset: Next.js
5. Configure environment variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://your-railway-url/api` |
| `NEXT_PUBLIC_WS_URL` | `https://your-railway-url` |
| `NEXT_PUBLIC_AI_API_URL` | `https://your-render-url/api/v1` |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Your Google Maps API key |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |

6. Deploy

---

## Step 6: Post-Deployment Verification

1. **Frontend**: Visit your Vercel URL, verify landing page loads
2. **Backend**: Visit `https://your-railway-url/api/docs` for Swagger
3. **AI Service**: Visit `https://your-render-url/health` for health check
4. **Auth**: Test login with default credentials
5. **WebSocket**: Open dashboard and verify real-time connection

---

## Environment Variables Summary

### Required for All Environments

```bash
# Database
DATABASE_URL=postgresql://...

# Redis
REDIS_URL=redis://...

# JWT
JWT_SECRET=<min-32-char-random-string>
JWT_REFRESH_SECRET=<different-random-string>

# Service URLs
AI_SERVICE_URL=https://your-render-url
NEXT_PUBLIC_API_URL=https://your-railway-url/api
```

### Optional (Enhanced Features)

```bash
# Cloudinary (file uploads)
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...

# Twilio (SMS)
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...

# SendGrid (Email)
SENDGRID_API_KEY=...

# Firebase (Push)
FIREBASE_PROJECT_ID=...
```

---

## Docker Deployment (Self-Hosted)

For self-hosted deployment using Docker:

```bash
# Production build
cp .env.example .env
# Edit .env with production values

docker-compose -f docker-compose.yml up -d --build

# Run migrations
docker exec swachh-backend npx prisma migrate deploy
docker exec swachh-backend npx prisma db seed
```

---

## SSL/HTTPS

- **Vercel**: Automatic SSL
- **Railway**: Automatic SSL
- **Render**: Automatic SSL
- **Self-hosted**: Use nginx reverse proxy with Let's Encrypt

---

## Monitoring

Recommended monitoring setup:
- **Uptime**: UptimeRobot or Better Stack
- **Errors**: Sentry (free tier available)
- **Logs**: Railway/Render built-in logging
- **Performance**: Vercel Analytics (frontend)
