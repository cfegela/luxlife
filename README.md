# LuxLife Todo Application

![Backend](https://github.com/cfegela/luxlife/actions/workflows/backend.yml/badge.svg)
![Frontend](https://github.com/cfegela/luxlife/actions/workflows/frontend.yml/badge.svg)
[![codecov](https://codecov.io/gh/cfegela/luxlife/branch/main/graph/badge.svg)](https://codecov.io/gh/cfegela/luxlife)

A production-ready full-stack CRUD todo application with Express.js backend, vanilla JavaScript frontend, PostgreSQL database, comprehensive testing, and automated CI/CD pipelines with security scanning.

## Features

- ✅ **Complete CRUD Operations** - Create, read, update, and delete todos
- ✅ **100% Test Coverage** - 54 tests across backend and frontend
- ✅ **Security Scanning** - Automated Trivy and Semgrep security scans
- ✅ **Automated CI/CD** - GitHub Actions workflows with path filtering
- ✅ **Docker Containerized** - Full Docker Compose setup for local development
- ✅ **Modern UI** - Clean gradient design with inline editing
- ✅ **PostgreSQL Database** - Persistent data storage with proper indexing
- ✅ **API Documentation** - RESTful API with proper error handling

## Tech Stack

**Backend:**
- Express.js 4.x - Web framework
- PostgreSQL 16 - Database
- Node.js 18.x/20.x - Runtime
- Jest + Supertest - Testing

**Frontend:**
- Vanilla JavaScript (ES6+) - No frameworks
- HTML5 + CSS3 - Modern web standards
- nginx - Static file serving
- Jest + jsdom - Unit testing

**DevOps:**
- Docker + Docker Compose - Containerization
- GitHub Actions - CI/CD automation
- Trivy - Container & dependency scanning
- Semgrep - Static code analysis (SAST)
- Codecov - Coverage reporting
- Dependabot - Automated dependency updates

## Quick Start

### Prerequisites
- Docker and Docker Compose (or Podman)
- Git

### Run the Application

```bash
# Clone the repository
git clone https://github.com/cfegela/luxlife.git
cd luxlife

# Start all services
docker compose up --build

# Access the application
open http://localhost:8080
```

The application will be available at:
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3000
- **PostgreSQL**: localhost:5432

### Stop the Application

```bash
# Stop services
docker compose down

# Stop and remove volumes (deletes all data)
docker compose down -v
```

## Project Structure

```
luxlife/
├── backend/                  # Express.js API
│   ├── src/
│   │   ├── index.js         # Server entry point
│   │   ├── app.js           # Express app (for testing)
│   │   ├── db.js            # PostgreSQL connection
│   │   └── routes/
│   │       └── todos.js     # CRUD routes
│   ├── __tests__/           # Test suites
│   │   ├── unit/            # Unit tests
│   │   └── integration/     # Integration tests
│   ├── init.sql             # Database schema
│   ├── Dockerfile           # Backend container
│   └── package.json
├── frontend/                 # Vanilla JS frontend
│   ├── index.html           # Main HTML
│   ├── style.css            # Styling
│   ├── app.js               # Application logic
│   ├── __tests__/           # Frontend tests
│   ├── nginx.conf           # nginx configuration
│   ├── Dockerfile           # Frontend container
│   └── package.json
├── .github/
│   ├── workflows/           # CI/CD pipelines
│   │   ├── backend.yml      # Backend pipeline
│   │   ├── frontend.yml     # Frontend pipeline
│   │   ├── README.md        # Workflow documentation
│   │   ├── ARCHITECTURE.md  # CI/CD architecture
│   │   └── SECURITY.md      # Security scanning guide
│   └── dependabot.yml       # Dependency updates
└── docker-compose.yml        # Container orchestration
```

## Database Schema

**Table: `todos`**

| Column       | Type                        | Description                |
|--------------|-----------------------------|----------------------------|
| id           | SERIAL PRIMARY KEY          | Unique identifier          |
| title        | VARCHAR(255) NOT NULL       | Todo title                 |
| description  | TEXT                        | Optional description       |
| completed    | BOOLEAN DEFAULT false       | Completion status          |
| created_at   | TIMESTAMP DEFAULT NOW()     | Creation timestamp         |
| updated_at   | TIMESTAMP DEFAULT NOW()     | Last update timestamp      |

## API Endpoints

Base URL: `http://localhost:3000/api`

| Method | Endpoint         | Description            | Request Body                      |
|--------|-----------------|------------------------|-----------------------------------|
| GET    | `/todos`         | List all todos         | -                                 |
| GET    | `/todos/:id`     | Get single todo        | -                                 |
| POST   | `/todos`         | Create new todo        | `{ title, description? }`         |
| PUT    | `/todos/:id`     | Update todo            | `{ title?, description?, completed? }` |
| DELETE | `/todos/:id`     | Delete todo            | -                                 |
| GET    | `/health`        | Health check           | -                                 |

### Example API Usage

```bash
# Create a todo
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy groceries","description":"Milk, eggs, bread"}'

# List all todos
curl http://localhost:3000/api/todos

# Update a todo
curl -X PUT http://localhost:3000/api/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'

# Delete a todo
curl -X DELETE http://localhost:3000/api/todos/1
```

## Development

### Backend Development

```bash
cd backend

# Install dependencies
npm install

# Run in development mode (with auto-reload)
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# For local development, use the Docker setup
# or serve files with any static server
```

### Environment Variables

**Backend** (set in `docker-compose.yml` or `.env`):
```env
DB_HOST=db
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=tododb
PORT=3000
```

## Testing

### Test Coverage

**Backend**: 22 tests, 100% coverage
- Unit tests: 19 tests (route handlers with mocked database)
- Integration tests: 3 tests (full API workflow)

**Frontend**: 32 tests
- Unit tests for JavaScript functions
- Static analysis of code patterns
- Mock fetch API calls

### Running All Tests

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# View coverage reports
open backend/coverage/lcov-report/index.html
open frontend/coverage/lcov-report/index.html
```

### Test Architecture

**Backend:**
- Jest + Supertest for API testing
- Mocked PostgreSQL database (`src/__mocks__/db.js`)
- Tests isolated from real database
- Fast execution (<2 seconds)

**Frontend:**
- Jest + jsdom for DOM simulation
- Static code analysis approach
- Mock fetch for API calls
- Validates code patterns and structure

### What's Tested

**Backend:**
- ✅ All CRUD operations
- ✅ Error handling (404, 500, validation errors)
- ✅ Request/response handling
- ✅ CORS configuration
- ✅ Edge cases (missing data, invalid IDs)
- ✅ Health check endpoint

**Frontend:**
- ✅ HTML escaping (XSS prevention)
- ✅ API configuration
- ✅ Event handlers
- ✅ Fetch API calls (GET, POST, PUT, DELETE)
- ✅ Error handling
- ✅ Data validation (title required, input trimming)
- ✅ UI rendering logic
- ✅ State management
- ✅ Form handling
- ✅ Inline editing
- ✅ Completion toggle
- ✅ Date formatting

## CI/CD & Security

### GitHub Actions Workflows

**Backend Pipeline** (`.github/workflows/backend.yml`):
1. **Semgrep Security Scan** - Static code analysis
2. **Tests** - Matrix on Node 18.x & 20.x
3. **Trivy Filesystem Scan** - Dependency vulnerabilities
4. **Docker Build & Publish** - Build + scan Docker image

**Frontend Pipeline** (`.github/workflows/frontend.yml`):
1. **Semgrep Security Scan** - Static code analysis
2. **Tests** - Matrix on Node 18.x & 20.x
3. **Trivy Filesystem Scan** - Dependency vulnerabilities
4. **Docker Build & Publish** - Build + scan Docker image

### Security Scanning

**Semgrep (SAST):**
- Scans source code for security vulnerabilities
- Detects: SQL injection, XSS, hard-coded secrets
- Rulesets: p/security-audit, p/javascript, p/nodejs
- Results uploaded to GitHub Security tab

**Trivy (Vulnerability Scanner):**
- Filesystem scan: Dependencies & libraries (every push/PR)
- Image scan: Docker containers (after build)
- Reports: CRITICAL & HIGH severity CVEs
- Integrates with GitHub Security

### Automated Dependency Updates

**Dependabot** runs weekly for:
- Backend npm packages
- Frontend npm packages
- GitHub Actions versions
- Docker base images

### Workflow Triggers

| Event | Backend Workflow | Frontend Workflow |
|-------|-----------------|-------------------|
| Push to `main` | ✅ Full pipeline + Docker | ✅ Full pipeline + Docker |
| Push to `develop` | ✅ Tests + scans only | ✅ Tests + scans only |
| Pull Request | ✅ Tests + scans only | ✅ Tests + scans only |
| Path filter | `backend/**` | `frontend/**` |

### View Security Results

1. Navigate to **Security** tab in GitHub
2. Click **Code scanning** (left sidebar)
3. View findings from:
   - Semgrep (static analysis)
   - Trivy filesystem scans
   - Trivy image scans

## Docker & Deployment

### Docker Compose Services

```yaml
services:
  db:         # PostgreSQL 16 database
  backend:    # Express.js API (port 3000)
  frontend:   # nginx server (port 8080)
```

### Docker Images

Images are published to GitHub Container Registry:
- `ghcr.io/cfegela/luxlife/backend:main`
- `ghcr.io/cfegela/luxlife/frontend:main`

Tags: `main`, `sha-xxxxx`, version tags (`v1.0.0`)

### Production Deployment

```bash
# Pull latest images
docker pull ghcr.io/cfegela/luxlife/backend:main
docker pull ghcr.io/cfegela/luxlife/frontend:main

# Run with docker-compose
docker compose up -d

# Or run containers individually
docker run -d -p 5432:5432 postgres:16-alpine
docker run -d -p 3000:3000 ghcr.io/cfegela/luxlife/backend:main
docker run -d -p 8080:80 ghcr.io/cfegela/luxlife/frontend:main
```

### Data Persistence

PostgreSQL data is persisted in a Docker volume:
```bash
# Backup database
docker exec todo-db pg_dump -U postgres tododb > backup.sql

# Restore database
docker exec -i todo-db psql -U postgres tododb < backup.sql
```

## Setup & Configuration

### GitHub Actions Setup

1. **Enable GitHub Actions** (automatic for public repos)
   - Settings → Actions → Allow all actions

2. **Enable GitHub Advanced Security** (for security scanning)
   - Public repos: Free and enabled by default
   - Private repos: Requires GitHub Advanced Security license

3. **Optional: Codecov Integration**
   - Sign up at [codecov.io](https://codecov.io)
   - Add secret: `CODECOV_TOKEN`

4. **Optional: Semgrep App**
   - Sign up at [semgrep.dev](https://semgrep.dev)
   - Add secret: `SEMGREP_APP_TOKEN`
   - Enables dashboard and custom rules

5. **Branch Protection** (recommended)
   - Settings → Branches → Add rule for `main`
   - Require status checks:
     - Backend: Semgrep, Test (18.x), Test (20.x), Trivy FS
     - Frontend: Semgrep, Test (18.x), Test (20.x), Trivy FS
   - Require pull request reviews

### Local Development Setup

```bash
# Option 1: Docker (recommended)
docker compose up

# Option 2: Local development
# Terminal 1 - Database
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:16-alpine

# Terminal 2 - Backend
cd backend
npm install
npm run dev

# Terminal 3 - Frontend
cd frontend
npm install
# Serve with any static server (e.g., python -m http.server 8080)
```

## Troubleshooting

### Common Issues

**Docker Issues:**
```bash
# Podman not running
podman machine start

# Port already in use
docker compose down
lsof -ti:8080 | xargs kill -9

# Clean rebuild
docker compose down -v
docker compose up --build
```

**Test Issues:**
```bash
# Backend tests fail
cd backend
rm -rf node_modules package-lock.json
npm install
npm test

# Frontend tests fail
cd frontend
rm -rf node_modules package-lock.json
npm install
npm test
```

**Database Issues:**
```bash
# Reset database
docker compose down -v
docker compose up

# Access database directly
docker exec -it todo-db psql -U postgres tododb
```

## Contributing

### Adding Features

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make changes and add tests
3. Ensure all tests pass: `npm test`
4. Commit with descriptive message
5. Push and create pull request

### Code Standards

- **Backend**: Follow Express.js best practices
- **Frontend**: Use vanilla JavaScript (no frameworks)
- **Tests**: Maintain 80%+ code coverage
- **Security**: No hard-coded secrets, validate inputs
- **Commits**: Use conventional commits format

### Testing Requirements

- All new features must include tests
- Tests must pass locally before pushing
- CI/CD pipelines must pass before merging
- Security scans must not introduce new high/critical issues

## Resources

### Technologies
- [Express.js Documentation](https://expressjs.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [Jest Testing Framework](https://jestjs.io/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Trivy Scanner](https://aquasecurity.github.io/trivy/)
- [Semgrep SAST](https://semgrep.dev/docs/)

### Support

- **Issues**: https://github.com/cfegela/luxlife/issues
- **Security**: Use GitHub Security Advisories for security issues
- **Actions**: https://github.com/cfegela/luxlife/actions

## License

This project is open source and available under the MIT License.

## Acknowledgments

Built with:
- Express.js for the backend API
- PostgreSQL for data persistence
- Docker for containerization
- GitHub Actions for CI/CD
- Jest for testing
- Trivy and Semgrep for security

---

**Repository**: https://github.com/cfegela/luxlife
**Author**: cfegela
**Status**: ✅ Production Ready
