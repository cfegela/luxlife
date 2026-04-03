# CI/CD Architecture

## Workflow Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Repository                         │
│                     (Push / Pull Request)                    │
└────────────┬────────────────────────────────────────────────┘
             │
             ├──────────────┬──────────────┐
             │              │              │
             ▼              ▼              ▼
    ┌────────────────┐  ┌────────────────┐  ┌──────────────┐
    │    Backend     │  │    Frontend    │  │  Dependabot  │
    │ (backend.yml)  │  │ (frontend.yml) │  │   Updates    │
    └────────────────┘  └────────────────┘  └──────────────┘
             │                    │
             ▼                    ▼
    ┌─────────────────────────────────────────────────────────┐
    │              Independent Pipelines                       │
    │                                                          │
    │  Backend Pipeline          Frontend Pipeline            │
    │  ┌──────────┐              ┌──────────┐                │
    │  │  Tests   │              │  Tests   │                │
    │  │ (18, 20) │              │ (18, 20) │                │
    │  └────┬─────┘              └────┬─────┘                │
    │       │                         │                       │
    │       ▼                         ▼                       │
    │  ┌──────────┐              ┌──────────┐                │
    │  │  Docker  │              │  Docker  │                │
    │  │  Build   │              │  Build   │                │
    │  └──────────┘              └──────────┘                │
    └─────────────────────────────────────────────────────────┘
             │                    │
             ▼                    ▼
    ┌─────────────────────────────────────────────────────────┐
    │                   Artifacts                              │
    │  • Backend Coverage Reports                             │
    │  • Frontend Coverage Reports                            │
    │  • Backend Docker Image (ghcr.io)                       │
    │  • Frontend Docker Image (ghcr.io)                      │
    └─────────────────────────────────────────────────────────┘
```

## Workflow Triggers

### 1. Backend Pipeline (`backend.yml`)
```
Trigger: Push/PR affecting backend/** files
│
├── Test Job - Matrix (Node 18.x, 20.x)
│   ├── Checkout code
│   ├── Setup Node.js with npm cache
│   ├── Install dependencies (npm ci)
│   ├── Run tests with coverage (22 tests)
│   ├── Upload to Codecov (Node 20.x only)
│   └── Archive coverage reports (7-day retention)
│
└── Docker Job (only on push to main, after tests pass)
    ├── Login to GitHub Container Registry
    ├── Extract metadata & tags
    ├── Build backend Docker image with cache
    └── Push to ghcr.io/username/luxlife/backend
```

### 2. Frontend Pipeline (`frontend.yml`)
```
Trigger: Push/PR affecting frontend/** files
│
├── Test Job - Matrix (Node 18.x, 20.x)
│   ├── Checkout code
│   ├── Setup Node.js with npm cache
│   ├── Install dependencies (npm ci)
│   ├── Run tests with coverage (32 tests)
│   ├── Upload to Codecov (Node 20.x only)
│   └── Archive coverage reports (7-day retention)
│
└── Docker Job (only on push to main, after tests pass)
    ├── Login to GitHub Container Registry
    ├── Extract metadata & tags
    ├── Build frontend Docker image with cache
    └── Push to ghcr.io/username/luxlife/frontend
```

## Path Filtering

The workflows use path filtering for efficiency:

| Workflow | Paths Watched |
|----------|--------------|
| `ci.yml` | All files |
| `backend-tests.yml` | `backend/**`, workflow file |
| `frontend-tests.yml` | `frontend/**`, workflow file |
| `docker-publish.yml` | All files |

## Caching Strategy

### NPM Dependencies
```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'npm'
    cache-dependency-path: backend/package-lock.json
```

### Docker Layers
```yaml
- uses: docker/build-push-action@v5
  with:
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

## Matrix Strategy

Tests run on multiple Node.js versions:
- **18.x** - LTS (Long Term Support)
- **20.x** - Current LTS

Only Node 20.x uploads coverage to:
- Codecov
- PR comments
- Artifacts

## Artifacts & Outputs

### Coverage Reports
- **Retention:** 7 days
- **Format:** HTML + LCOV
- **Location:** `coverage/` directory

### Docker Images
- **Registry:** GitHub Container Registry (ghcr.io)
- **Tags:**
  - `main` - Latest from main branch
  - `v1.2.3` - Semantic version tags
  - `sha-abc123` - Git commit SHA

### PR Comments
Automatic comments with coverage table:
```
## 📊 Backend Test Coverage

| Category | Percentage |
|----------|------------|
| Statements | 100% |
| Branches | 100% |
| Functions | 100% |
| Lines | 100% |

✅ All backend tests passed!
```

## Dependabot Configuration

Automated dependency updates for:

```
npm (backend)      → Weekly
npm (frontend)     → Weekly
GitHub Actions     → Weekly
Docker images      → Weekly
```

## Security

### Secrets Required
- `CODECOV_TOKEN` - Optional for coverage reporting
- `GITHUB_TOKEN` - Auto-provided for GHCR

### Permissions
```yaml
permissions:
  contents: read    # Read repository
  packages: write   # Write to GHCR
```

## Optimization Features

1. **Path Filtering** - Only run when relevant files change
2. **Dependency Caching** - npm packages cached between runs
3. **Docker Layer Caching** - Reuse unchanged layers
4. **Conditional Steps** - Upload only on Node 20.x
5. **Parallel Jobs** - Backend & frontend tests run simultaneously

## Monitoring & Alerts

### Success Indicators
- ✅ Green checkmark in GitHub
- ✅ All tests passing
- ✅ Coverage uploaded
- ✅ Docker images published

### Failure Handling
- ❌ Job fails if tests fail
- ❌ Docker publish skipped if tests fail
- 📧 GitHub sends email notifications
- 💬 PR checks show failure status

## Cost Optimization

For private repositories:
- Uses path filters to reduce unnecessary runs
- Caches dependencies and Docker layers
- Matrix strategy only on important workflows
- 7-day artifact retention (vs default 90 days)

**Estimated monthly usage:** ~500-800 minutes for active development

## Integration Points

```
┌─────────────┐
│   GitHub    │
│  Repository │
└──────┬──────┘
       │
       ├──────────► GitHub Actions (CI/CD)
       │
       ├──────────► Codecov (Coverage)
       │
       ├──────────► GHCR (Docker Images)
       │
       └──────────► Dependabot (Updates)
```

## Best Practices Implemented

- ✅ Fail fast on test failures
- ✅ Run tests before building images
- ✅ Use official GitHub actions
- ✅ Pin action versions (@v4)
- ✅ Parallel job execution
- ✅ Conditional steps to save time
- ✅ Comprehensive test coverage
- ✅ Automated dependency updates
- ✅ Security scanning via Dependabot
