# Status Badges

Add these badges to your main README.md file to show build and coverage status.

## GitHub Actions Status Badges

```markdown
![Backend](https://github.com/YOUR_USERNAME/luxlife/actions/workflows/backend.yml/badge.svg)
![Frontend](https://github.com/YOUR_USERNAME/luxlife/actions/workflows/frontend.yml/badge.svg)
```

Replace `YOUR_USERNAME` with your GitHub username (e.g., `cfegela`).

## Codecov Badges

```markdown
[![codecov](https://codecov.io/gh/YOUR_USERNAME/luxlife/branch/main/graph/badge.svg)](https://codecov.io/gh/YOUR_USERNAME/luxlife)
```

## Example README Section

```markdown
# LuxLife Todo Application

![Backend](https://github.com/cfegela/luxlife/actions/workflows/backend.yml/badge.svg)
![Frontend](https://github.com/cfegela/luxlife/actions/workflows/frontend.yml/badge.svg)
[![codecov](https://codecov.io/gh/cfegela/luxlife/branch/main/graph/badge.svg)](https://codecov.io/gh/cfegela/luxlife)

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
