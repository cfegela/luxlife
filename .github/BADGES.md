# Status Badges

Add these badges to your main README.md file to show build and coverage status.

## GitHub Actions Status Badges

```markdown
![CI](https://github.com/YOUR_USERNAME/luxlife/actions/workflows/ci.yml/badge.svg)
![Backend Tests](https://github.com/YOUR_USERNAME/luxlife/actions/workflows/backend-tests.yml/badge.svg)
![Frontend Tests](https://github.com/YOUR_USERNAME/luxlife/actions/workflows/frontend-tests.yml/badge.svg)
![Docker Publish](https://github.com/YOUR_USERNAME/luxlife/actions/workflows/docker-publish.yml/badge.svg)
```

Replace `YOUR_USERNAME` with your GitHub username.

## Codecov Badges

```markdown
[![codecov](https://codecov.io/gh/YOUR_USERNAME/luxlife/branch/main/graph/badge.svg)](https://codecov.io/gh/YOUR_USERNAME/luxlife)
```

## Example README Section

```markdown
# LuxLife Todo Application

![CI](https://github.com/YOUR_USERNAME/luxlife/actions/workflows/ci.yml/badge.svg)
[![codecov](https://codecov.io/gh/YOUR_USERNAME/luxlife/branch/main/graph/badge.svg)](https://codecov.io/gh/YOUR_USERNAME/luxlife)

A full-stack CRUD todo application with Express, PostgreSQL, and vanilla JavaScript.

## Features

- ✅ Complete CRUD operations
- ✅ 100% test coverage
- ✅ Automated CI/CD
- ✅ Docker containerized
- ✅ GitHub Actions workflows

## Tech Stack

**Backend:** Express.js, PostgreSQL, Node.js
**Frontend:** Vanilla JavaScript, HTML5, CSS3
**DevOps:** Docker, Docker Compose, GitHub Actions
**Testing:** Jest, Supertest

## Quick Start

\`\`\`bash
docker compose up --build
\`\`\`

Open http://localhost:8080

## Testing

\`\`\`bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
\`\`\`

See [TESTING.md](TESTING.md) for details.
```
