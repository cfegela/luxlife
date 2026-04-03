# CI/CD Architecture

## Workflow Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Repository                         │
│                     (Push / Pull Request)                    │
└────────────┬────────────────────────────────────────────────┘
             │
             ├──────────────┬──────────────┬──────────────┐
             │              │              │              │
             ▼              ▼              ▼              ▼
    ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐
    │    CI      │  │  Backend   │  │  Frontend  │  │   Docker   │
    │ (ci.yml)   │  │ Tests      │  │  Tests     │  │  Publish   │
    └────────────┘  └────────────┘  └────────────┘  └────────────┘
         │               │               │               │
         │               │               │               │
         ▼               ▼               ▼               ▼
    ┌─────────────────────────────────────────────────────────┐
    │              Parallel Execution                          │
    │  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
    │  │ Backend  │  │ Frontend │  │  Docker  │              │
    │  │  Tests   │  │  Tests   │  │  Build   │              │
    │  └──────────┘  └──────────┘  └──────────┘              │
    └─────────────────────────────────────────────────────────┘
         │               │               │
         ▼               ▼               ▼
    ┌─────────────────────────────────────────────────────────┐
    │                   Artifacts                              │
    │  • Coverage Reports (backend & frontend)                 │
    │  • Docker Images (ghcr.io)                              │
    │  • Test Summary (GitHub Summary)                        │
    └─────────────────────────────────────────────────────────┘
```

## Workflow Triggers

### 1. Main CI Workflow (`ci.yml`)
```
Trigger: Any push or PR to main/develop
│
├── Backend Tests (Node 20.x)
│   ├── npm ci
│   ├── npm test
│   └── Upload coverage artifact
│
├── Frontend Tests (Node 20.x)
│   ├── npm ci
│   ├── npm test
│   └── Upload coverage artifact
│
├── Docker Build Test
│   ├── Build backend image
│   └── Build frontend image
│
└── Test Summary Report
    ├── Download all artifacts
    └── Create summary
```

### 2. Backend Tests (`backend-tests.yml`)
```
Trigger: Push/PR affecting backend/** files
│
└── Test Matrix (Node 18.x, 20.x)
    ├── Checkout code
    ├── Setup Node.js with npm cache
    ├── Install dependencies (npm ci)
    ├── Run tests with coverage
    ├── Upload to Codecov (Node 20.x only)
    ├── Archive coverage reports
    └── Comment on PR with coverage (Node 20.x only)
```

### 3. Frontend Tests (`frontend-tests.yml`)
```
Trigger: Push/PR affecting frontend/** files
│
└── Test Matrix (Node 18.x, 20.x)
    ├── Checkout code
    ├── Setup Node.js with npm cache
    ├── Install dependencies (npm ci)
    ├── Run tests with coverage
    ├── Upload to Codecov (Node 20.x only)
    ├── Archive coverage reports
    └── Comment on PR with coverage (Node 20.x only)
```

### 4. Docker Publish (`docker-publish.yml`)
```
Trigger: Push to main, version tags, or PR to main
│
├── Run All Tests
│   ├── Backend tests
│   └── Frontend tests
│
└── Build & Push (if tests pass and not PR)
    ├── Login to GitHub Container Registry
    ├── Extract metadata & tags
    ├── Build backend image with cache
    ├── Push backend image
    ├── Build frontend image with cache
    └── Push frontend image
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
