# GitHub Actions Workflows

This directory contains CI/CD workflows for the Todo application.

## Workflows

### 1. `backend.yml` - Backend Pipeline
**Triggers:** Push/PR affecting backend files

Complete backend pipeline with two jobs:

**Test Job:**
- Matrix testing on Node.js 18.x and 20.x
- Runs all 22 Jest tests with coverage
- Uploads coverage to Codecov (Node 20.x only)
- Archives coverage reports (7-day retention)

**Docker Job:** (only on push to main)
- Builds Docker image for backend
- Publishes to GitHub Container Registry (ghcr.io)
- Tags: branch name, semantic version, git SHA
- Uses GitHub Actions cache for faster builds

**Path filters:**
- `backend/**`
- `.github/workflows/backend.yml`

### 2. `frontend.yml` - Frontend Pipeline
**Triggers:** Push/PR affecting frontend files

Complete frontend pipeline with two jobs:

**Test Job:**
- Matrix testing on Node.js 18.x and 20.x
- Runs all 32 Jest tests with coverage
- Uploads coverage to Codecov (Node 20.x only)
- Archives coverage reports (7-day retention)

**Docker Job:** (only on push to main)
- Builds Docker image for frontend (nginx)
- Publishes to GitHub Container Registry (ghcr.io)
- Tags: branch name, semantic version, git SHA
- Uses GitHub Actions cache for faster builds

**Path filters:**
- `frontend/**`
- `.github/workflows/frontend.yml`

### 3. `dependabot.yml` - Dependency Updates

Automated dependency updates for:
- Backend npm packages (weekly)
- Frontend npm packages (weekly)
- GitHub Actions (weekly)
- Docker base images (weekly)

## Setup Instructions

### 1. Enable GitHub Actions
GitHub Actions is enabled by default for public repositories. For private repos:
1. Go to Settings → Actions → General
2. Allow all actions and reusable workflows

### 2. Configure Codecov (Optional)
To enable coverage reporting:

1. Sign up at [codecov.io](https://codecov.io)
2. Add your repository
3. Get the upload token
4. Add to GitHub Secrets:
   - Go to Settings → Secrets and variables → Actions
   - New repository secret: `CODECOV_TOKEN`

If you don't want Codecov integration, the workflows will still work (the upload step has `fail_ci_if_error: false`).

### 3. GitHub Container Registry (GHCR)
To publish Docker images:

1. The workflow uses `GITHUB_TOKEN` automatically
2. Images are published to `ghcr.io/YOUR_USERNAME/luxlife/backend` and `frontend`
3. Make packages public in Settings → Packages if desired

### 4. Branch Protection (Recommended)
Set up branch protection rules for `main`:

1. Go to Settings → Branches → Add rule
2. Branch name pattern: `main`
3. Enable:
   - ☑️ Require status checks to pass before merging
   - ☑️ Require branches to be up to date before merging
   - Select: `Backend Tests`, `Frontend Tests`, `Docker Build Test`
   - ☑️ Require pull request reviews before merging

## Workflow Triggers

| Workflow | Push to main/develop | PR to main/develop | Docker Build | Path Filters |
|----------|---------------------|-------------------|--------------|--------------|
| Backend | ✅ | ✅ | ✅ (main only) | backend/** |
| Frontend | ✅ | ✅ | ✅ (main only) | frontend/** |

## Viewing Results

### Test Results
- Navigate to Actions tab in GitHub
- Click on the workflow run (Backend or Frontend)
- View job details and logs

### Coverage Reports
- Download artifacts from workflow run
- Or view in Codecov dashboard

### Docker Images
- Navigate to Packages in GitHub
- View published container images
- Images at: `ghcr.io/YOUR_USERNAME/luxlife/backend` and `frontend`

## Local Testing

Test workflows locally using [act](https://github.com/nektos/act):

```bash
# Install act
brew install act  # macOS
# or download from https://github.com/nektos/act

# Run backend workflow
act -W .github/workflows/backend.yml

# Run frontend workflow
act -W .github/workflows/frontend.yml

# Run specific job
act -j test
```

## Customization

### Add More Node.js Versions
Edit the matrix in workflow files:

```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x, 22.x]  # Add more versions
```

### Change Test Commands
Modify the test step:

```yaml
- name: Run tests
  working-directory: ./backend
  run: npm test -- --maxWorkers=2  # Add Jest options
```

### Add Linting
Add a new job:

```yaml
lint:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
    - run: npm ci
    - run: npm run lint
```

## Troubleshooting

### Tests fail in CI but pass locally
- Check Node.js version matches
- Ensure `package-lock.json` is committed
- Verify environment variables

### Docker build fails
- Check Dockerfile syntax
- Verify all files are committed
- Review build context in workflow

### Coverage upload fails
- Verify `CODECOV_TOKEN` is set
- Check coverage files are generated
- Review Codecov dashboard for errors

## Cost Optimization

GitHub Actions is free for public repos. For private repos:
- 2,000 minutes/month on free plan
- Use path filters to avoid unnecessary runs
- Cache dependencies (`cache: 'npm'`)
- Use Docker layer caching

## Best Practices

1. ✅ Always run tests before building Docker images
2. ✅ Use path filters to avoid unnecessary workflow runs
3. ✅ Cache dependencies for faster builds
4. ✅ Set up branch protection to enforce CI checks
5. ✅ Keep workflows DRY using reusable workflows or composite actions
6. ✅ Use secrets for sensitive data
7. ✅ Pin action versions (e.g., `@v4` not `@main`)
