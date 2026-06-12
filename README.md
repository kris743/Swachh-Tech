<div align="center">

# 🌿 SWACHH TECH AI

### India's Most Advanced AI-Powered Smart Waste Management Platform

[![CI](https://github.com/your-org/swachh-tech-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/swachh-tech-ai/actions/workflows/ci.yml)
[![Deploy](https://github.com/your-org/swachh-tech-ai/actions/workflows/deploy.yml/badge.svg)](https://github.com/your-org/swachh-tech-ai/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Built for Smart India Hackathon 2025**

[Live Demo](https://swachhtech.vercel.app) · [API Docs](https://api.swachhtech.ai/api/docs) · [Architecture](#architecture)

</div>

---

## 🎯 About

SWACHH TECH AI is an enterprise-grade, full-stack SaaS platform for smart waste management that connects Citizens, Municipal Authorities, Waste Collection Workers, Truck Drivers, Green Champions, and Recyclers through AI-powered insights, real-time tracking, and gamified engagement.

### Key Features

| Feature | Description |
|---------|-------------|
| 🤖 **AI Waste Detection** | YOLOv8-powered image classification for complaint categorization |
| 📊 **Waste Prediction** | ML-based waste generation forecasting by ward |
| 🗺️ **Route Optimization** | OR-Tools VRP solver for optimal collection routes |
| 📍 **Live GPS Tracking** | Real-time truck tracking with Socket.IO |
| 📱 **QR Collection System** | Household QR codes for verified waste collection |
| 🏆 **Gamification** | Points, levels, badges, and leaderboards for citizens |
| 📋 **Complaint Management** | End-to-end complaint lifecycle with AI classification |
| 📈 **Analytics Dashboards** | Comprehensive admin dashboards with Recharts |
| 🌐 **Multilingual** | English + Hindi support |
| 🔐 **Enterprise Security** | JWT, RBAC, OTP, audit logging, OWASP compliance |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTS                              │
│   Web App (Next.js 15) │ Mobile (Progressive Web App)       │
└──────────────┬──────────────────────────────────────────────┘
               │ HTTPS / WSS
┌──────────────▼──────────────────────────────────────────────┐
│                   BACKEND API (NestJS 11)                   │
│   Auth │ Users │ Collections │ Complaints │ Rewards │ ...   │
│   ─────────────────────────────────────────────────────     │
│   JWT │ RBAC │ Rate Limiting │ Audit │ WebSocket Gateway    │
└──────┬───────────────┬──────────────────────────────────────┘
       │               │ HTTP
┌──────▼──────┐  ┌─────▼──────────────────────────────────────┐
│ PostgreSQL  │  │        AI SERVICE (FastAPI)                 │
│   (Prisma)  │  │  Waste Prediction │ Image Classification   │
│             │  │  Route Optimization │ AI Insights           │
├─────────────┤  │  ──────────────────────────────────────    │
│    Redis    │  │  scikit-learn │ YOLOv8 │ OR-Tools           │
└─────────────┘  └────────────────────────────────────────────┘
```

---

## 👥 User Roles

| Role | Access |
|------|--------|
| **Citizen** | Dashboard, collections, complaints, rewards, training, truck tracking |
| **Waste Worker** | QR scanning, daily routes, attendance, performance, training |
| **Truck Driver** | Route assignments, GPS tracking, navigation, daily summary |
| **Green Champion** | Area monitoring, complaint verification, dumping reports |
| **Recycler** | Pickup requests, materials, household connections, revenue |
| **Municipality Admin** | Global dashboard, all management, AI insights, analytics, reports |

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Next.js (App Router) | 15.x |
| Styling | TailwindCSS | v4 |
| Components | ShadCN UI | Latest |
| Animations | Motion (Framer) | 12.x |
| State | Zustand + React Query | Latest |
| Charts | Recharts | Latest |
| Backend | NestJS | 11.x |
| ORM | Prisma | v7 |
| Database | PostgreSQL | 16 |
| Cache | Redis | 7 |
| Real-time | Socket.IO | 4.8.x |
| AI/ML | FastAPI + scikit-learn | 0.136.x |
| Computer Vision | YOLOv8 (ultralytics) | Latest |
| Optimization | Google OR-Tools | Latest |
| Auth | JWT + Passport | — |
| Storage | Cloudinary | — |
| Maps | Google Maps API | — |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Python 3.11+
- Docker & Docker Compose
- Git

### Option 1: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/your-org/swachh-tech-ai.git
cd swachh-tech-ai

# Copy environment variables
cp .env.example .env

# Start all services
docker-compose up --build

# Run database migrations & seed
docker exec swachh-backend npx prisma migrate deploy
docker exec swachh-backend npx prisma db seed
```

Services will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **AI Service**: http://localhost:8000
- **API Docs (Swagger)**: http://localhost:4000/api/docs

### Option 2: Manual Setup

#### Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

#### AI Service
```bash
cd ai-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

---

## 🔑 Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@swachhtech.ai | Admin@123 |
| Citizen | citizen@swachhtech.ai | Citizen@123 |
| Worker | worker@swachhtech.ai | Worker@123 |
| Driver | driver@swachhtech.ai | Driver@123 |
| Green Champion | champion@swachhtech.ai | Champion@123 |
| Recycler | recycler@swachhtech.ai | Recycler@123 |

---

## 📁 Project Structure

```
swachh-tech-ai/
├── frontend/              # Next.js 15 Application
│   ├── src/
│   │   ├── app/           # App Router (pages & layouts)
│   │   ├── components/    # UI & shared components
│   │   ├── lib/           # Utilities, API client, auth
│   │   ├── hooks/         # Custom React hooks
│   │   ├── stores/        # Zustand state stores
│   │   ├── types/         # TypeScript interfaces
│   │   └── i18n/          # Translations (EN, HI)
│   └── Dockerfile
│
├── backend/               # NestJS API
│   ├── src/
│   │   ├── modules/       # Feature modules (auth, users, etc.)
│   │   ├── common/        # Guards, decorators, filters, pipes
│   │   ├── prisma/        # Database service
│   │   └── gateway/       # WebSocket gateway
│   ├── prisma/            # Schema, migrations, seeds
│   └── Dockerfile
│
├── ai-service/            # FastAPI AI Microservice
│   ├── app/
│   │   ├── api/           # API endpoints
│   │   ├── models/        # ML model wrappers
│   │   ├── schemas/       # Pydantic models
│   │   └── services/      # Business logic
│   └── Dockerfile
│
├── docker-compose.yml     # Full stack orchestration
├── .github/workflows/     # CI/CD pipelines
├── docs/                  # Documentation
└── .env.example           # Environment template
```

---

## 🧪 Testing

```bash
# Backend unit tests
cd backend && npm run test

# Backend e2e tests
cd backend && npm run test:e2e

# AI service tests
cd ai-service && pytest tests/ -v

# Frontend build verification
cd frontend && npm run build
```

---

## 🌍 Deployment

### Production Deployment Targets

| Service | Platform | Config |
|---------|----------|--------|
| Frontend | Vercel | Auto-deploy from `main` |
| Backend | Railway | Dockerfile-based |
| AI Service | Render | Dockerfile-based |
| Database | Supabase | PostgreSQL managed |
| Cache | Railway/Upstash | Redis managed |

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed deployment guide.

---

## 🔒 Security

- **JWT Authentication** with refresh token rotation
- **Role-Based Access Control** (6 roles with granular permissions)
- **OTP Verification** for phone-based login
- **Password Encryption** with bcrypt (12 rounds)
- **Rate Limiting** on all API endpoints
- **Input Validation** on every request (class-validator)
- **CORS** configured per environment
- **Helmet** HTTP security headers
- **Audit Logging** for all sensitive operations
- **Secure File Upload** with type/size validation

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Smart India Hackathon 2025** — Problem statement and inspiration
- **Swachh Bharat Mission** — India's clean India initiative
- **Google OR-Tools** — Route optimization algorithms
- **Ultralytics** — YOLOv8 computer vision models

---

<div align="center">

**Built with ❤️ for a Cleaner India**

🌿 SWACHH TECH AI — Smart Waste, Smart Future 🌿

</div>
