# Student Management System

An internal student management tool for coaching institute management teams.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite, Tailwind CSS, React Router, React Hook Form, Recharts, Lucide React |
| Backend | FastAPI, SQLAlchemy, PostgreSQL, JWT Authentication |
| Deployment | Docker, Nginx, AWS EC2 |

## Project Structure

```
├── frontend/          # React + Vite SPA
├── backend/           # FastAPI REST API
├── nginx/             # Nginx reverse proxy config
├── docker-compose.yml # Container orchestration
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- PostgreSQL 15 (or use Docker)

### Local Development

**1. Start PostgreSQL (Docker):**
```bash
docker compose up db -d
```

**2. Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
alembic upgrade head
python -m app.seed           # Seed default data
uvicorn app.main:app --reload
```

**3. Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Production Deployment
```bash
docker compose up --build -d
```

## Default Login
- Email: `admin@institute.com`
- Password: `admin123`

## API Documentation
Once running: `http://localhost:8000/docs`
