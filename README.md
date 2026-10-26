# Student Management System

A full-stack, internal student management platform built for institute management teams. Designed to streamline student admissions, enrollment tracking, dynamic class-subject curriculum mapping, and real-time academic distribution analytics.

---

## Features

- **Authentication & Security**: Single-role (Management) JWT-based authentication using OAuth2 password flow with protected routes and auto-logout on token expiration.
- **Student CRUD Workflows**:
  - Manual, unique, and immutable student roll numbers.
  - Required primary contact with strict 10-digit validation; optional secondary and emergency contacts.
  - Soft-archive and restore lifecycle (archived records are view-only to prevent accidental modification).
- **Search, 5-Metric Filtering & 3-Way Sorting**:
  - Live debounced search by student Name and Roll Number.
  - Multi-parameter filtering by **Class**, **Board**, **Mode**, **Subject**, and **Status** (Active vs. Archived).
  - 3-way sorting by **Name**, **Roll Number**, and **Class** (ascending/descending).
  - 10-record-per-page pagination with total page calculation and responsive controls.
- **Dynamic Curriculum Mapping**:
  - Checkbox-driven subject selection conditioned on the student's selected class.
  - Dedicated **Settings module** enabling code-free management of Classes, Boards, Modes, Subjects, and Class-Subject junction mappings.
- **Analytics Dashboard**:
  - Key metrics: Total Active Students, Online Mode count, and Offline Mode count.
  - Visual charts powered by Recharts (Students by Class bar chart, Students by Board pie/donut chart).
  - Quick actions and recent student admissions feed.

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, React Hook Form, Recharts, Lucide React |
| **Backend** | FastAPI, SQLAlchemy 2.0, Pydantic v2, Alembic, PostgreSQL, python-jose (JWT), passlib (bcrypt) |
| **Testing** | pytest, HTTPX (FastAPI TestClient) |
| **Containerization & Proxy** | Docker, Docker Compose, NGINX |
| **Target Cloud Infrastructure** | AWS EC2 (Ubuntu Linux) |

---

## Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── core/               # Security (JWT, bcrypt), exceptions, dependencies
│   │   ├── models/             # SQLAlchemy ORM models (Student, Class, Board, Mode, Subject, etc.)
│   │   ├── repositories/       # Data access layer with SQLAlchemy queries
│   │   ├── routers/            # FastAPI REST API endpoints (/auth, /students, /settings, /dashboard)
│   │   ├── schemas/            # Pydantic v2 request/response schemas and validation rules
│   │   ├── services/           # Business logic layer
│   │   ├── database.py         # SQLAlchemy engine and session configuration
│   │   ├── main.py             # FastAPI application entrypoint with CORS and middleware
│   │   └── seed.py             # Database seed script for initial master data and admin user
│   ├── migrations/             # Alembic migration environment and versions
│   ├── tests/                  # Automated backend tests (pytest)
│   ├── Dockerfile              # Backend container definition
│   ├── requirements.txt        # Python dependencies
│   └── .env.example            # Environment variable template
├── frontend/
│   ├── public/                 # Static assets and custom SVG favicon
│   ├── src/
│   │   ├── api/                # API client modules using fetch wrapper
│   │   ├── components/         # Reusable UI (Button, Input, Select, Table, Modal, Badge, Pagination)
│   │   ├── context/            # AuthContext (JWT management) and ToastContext
│   │   ├── hooks/              # Custom hooks (useAuth, useFetch, useDebounce)
│   │   ├── layouts/            # AuthLayout and MainLayout (Sidebar + Header)
│   │   ├── pages/              # Dashboard, Students (List, Form, Detail), Settings, Login
│   │   ├── styles/             # Tailwind CSS entrypoint
│   │   ├── utils/              # Route constants and date formatters
│   │   ├── App.jsx             # React Router route hierarchy
│   │   └── main.jsx            # React root mount
│   ├── Dockerfile              # Multi-stage production build container definition
│   ├── package.json            # Node.js dependencies and scripts
│   └── vite.config.js          # Vite config with /api proxy target to backend
├── nginx/
│   └── nginx.conf              # NGINX reverse proxy configuration (SPA fallback + API pass-through)
├── docker-compose.yml          # Local and production orchestration (Postgres, Backend, Frontend/Nginx)
└── README.md
```

---

## Getting Started (Local Development on Windows)

### Prerequisites

- **Python**: 3.11 or higher
- **Node.js**: 18.x or 20.x LTS (with npm)
- **PostgreSQL**: 15 or higher (running locally on port 5432, or run via Docker)
- **Git**

---

### Step 1: Database Setup

Ensure PostgreSQL is running locally with a database named `student_management`:

```sql
CREATE DATABASE student_management;
CREATE USER sms_user WITH ENCRYPTED PASSWORD 'sms_password';
GRANT ALL PRIVILEGES ON DATABASE student_management TO sms_user;
```

*(Alternatively, spin up just the database container via Docker)*:
```powershell
docker compose up db -d
```

---

### Step 2: Backend Setup

1. Open PowerShell and navigate to `backend/`:
   ```powershell
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```

3. Install dependencies:
   ```powershell
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```powershell
   Copy-Item .env.example .env
   ```
   Default `.env` configuration:
   ```ini
   DATABASE_URL=postgresql://sms_user:sms_password@localhost:5432/student_management
   SECRET_KEY=your-secret-key-change-in-production
   ACCESS_TOKEN_EXPIRE_MINUTES=1440
   ENVIRONMENT=development
   ALLOWED_ORIGINS=http://localhost:5173
   ```

5. Run database migrations:
   ```powershell
   alembic upgrade head
   ```

6. Seed initial master data (Classes 6–12, Boards, Modes, Subjects, and Admin account):
   ```powershell
   python -m app.seed
   ```

7. Start the FastAPI development server:
   ```powershell
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```
   API is accessible at: `http://127.0.0.1:8000`  
   Interactive API Docs (Swagger): `http://127.0.0.1:8000/docs`

---

### Step 3: Frontend Setup

1. Open a new PowerShell window and navigate to `frontend/`:
   ```powershell
   cd frontend
   ```

2. Install npm dependencies:
   ```powershell
   npm install
   ```

3. Configure environment variables (if needed):
   `.env` in `frontend/` contains:
   ```ini
   VITE_API_BASE_URL=http://127.0.0.1:8000/api/v1
   ```

4. Start the Vite development server:
   ```powershell
   npm run dev
   ```
   Frontend will be running at: `http://localhost:5173`

---

## Default Login Credentials

Seeded automatically by `python -m app.seed`:

- **Email**: `admin@institute.com`
- **Password**: `admin123`
- **Role**: Management (Admin)

---

## REST API Overview

All API endpoints are grouped under `/api/v1`:

### Authentication (`/api/v1/auth`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/login` | Authenticate user (OAuth2 form: `username`, `password`) & issue JWT |
| `GET` | `/auth/me` | Fetch authenticated user profile |

### Students (`/api/v1/students`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/students` | List students (paginated: `page`, `per_page`; searchable: `search`; filters: `class_id`, `board_id`, `mode_id`, `subject_id`, `is_archived`; sort: `sort_by`, `sort_order`) |
| `POST` | `/students` | Register a new student record with assigned subject IDs |
| `GET` | `/students/{id}` | Retrieve complete student profile with relationship names |
| `PUT` | `/students/{id}` | Update student details (roll number is immutable; blocked if archived) |
| `PATCH` | `/students/{id}/archive` | Soft-archive student (sets view-only mode) |
| `PATCH` | `/students/{id}/restore` | Restore student to active status |

### Settings Master Data (`/api/v1/settings`)
| Method | Endpoint | Description |
|---|---|---|
| `GET`, `POST` | `/settings/classes` | Fetch all classes / Create class |
| `PUT` | `/settings/classes/{id}` | Update class name or display order |
| `GET`, `POST`, `PUT` | `/settings/boards` | Manage educational boards (CBSE, ICSE, etc.) |
| `GET`, `POST`, `PUT` | `/settings/modes` | Manage study modes (Online, Offline) |
| `GET`, `POST`, `PUT` | `/settings/subjects` | Manage academic subjects |
| `GET` | `/settings/classes/{id}/subjects` | Fetch subjects mapped to a class |
| `PUT` | `/settings/classes/{id}/subjects` | Update class-subject junction mappings (`subject_ids: [...]`) |

### Dashboard Analytics (`/api/v1/dashboard`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/dashboard/stats` | Active count, online mode count, offline mode count |
| `GET` | `/dashboard/students-by-class` | Student count distribution by class |
| `GET` | `/dashboard/students-by-board` | Student count distribution by board |
| `GET` | `/dashboard/recent-students` | 5 most recently enrolled active students |

---

## Running Automated Tests

Backend unit tests are written with `pytest` using a separate in-memory SQLite database session with seeded fixtures, ensuring non-destructive execution.

Run tests from the `backend/` directory:
```powershell
cd backend
.\.venv\Scripts\Activate.ps1
pytest -v
```

**Test Coverage Summary (14 Passed)**:
- `test_auth.py`: Login with valid/invalid credentials, nonexistent user handling, authorized vs. unauthorized `/me` queries.
- `test_dashboard.py`: Statistics counts, class distribution, board distribution, and recent students endpoint checks.
- `test_settings.py`: Master data CRUD operations, subject addition/updates, and class-subject mapping persistence.
- `test_students.py`: Student creation, roll number uniqueness enforcement, 10-digit contact validation, soft-archive/restore lifecycle, and 5-metric filtering/sorting/pagination.

---

## Deployment Status & Verification

### Containerization Status
- **Backend Dockerfile**: Configured (`python:3.12-slim`, dependency installation, automatic migration, seed, and Uvicorn start).
- **Frontend Dockerfile**: Configured (Multi-stage build with `node:18-alpine` for Vite compilation and `nginx:alpine` for serving static assets).
- **NGINX Configuration**: Configured at `nginx/nginx.conf` (Reverse proxies `/api/` requests to `http://backend:8000`, enables gzip compression, and implements React Router SPA fallback with `try_files $uri $uri/ /index.html`).
- **Docker Compose**: Orchestrates `db` (Postgres 15), `backend`, and `frontend` with named volume `postgres_data`.

### Deployment Checklist

| Component | Status | Notes |
|---|---|---|
| **Local Full-Stack Prototype** | Verified | Tested end-to-end via frontend proxy and backend tests |
| **Docker Compose Config** | Configured | `docker-compose.yml`, `Dockerfile`s, and `nginx.conf` present |
| **Containerized Local Execution** | Ready to Test | Can be started locally using `docker compose up --build` |
| **AWS EC2 Production Deployment** | Pending Execution | EC2 instance provisioning, Docker installation on remote host, and production security group setup are pending |

### Steps to Deploy on AWS EC2 (When Ready)

1. **Launch EC2 Instance**:
   - Ubuntu 22.04 LTS / 24.04 LTS (`t2.small` or `t3.small` recommended).
   - In Security Group, open inbound ports: `22` (SSH), `80` (HTTP), `443` (HTTPS).
2. **Install Docker & Docker Compose on EC2**:
   ```bash
   sudo apt-get update
   sudo apt-get install -y docker.io docker-compose-v2
   sudo usermod -aG docker $USER
   ```
3. **Deploy Application**:
   - Clone repository onto EC2.
   - Set production `SECRET_KEY` and database credentials in `.env` or `docker-compose.yml`.
   - Run:
     ```bash
     docker compose up --build -d
     ```
4. **Access Application**:
   Navigate to the public EC2 IPv4 address or domain at port `80`.
