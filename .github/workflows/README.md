# GitHub Actions Workflows

This directory contains CI/CD workflows for the Todo application.

## Workflows

### 1. `ci.yml` - Full Test Suite
**Triggers:** Push/PR to main or develop branches

Runs the complete test suite including:
- Backend tests with coverage
- Frontend tests with coverage
- Docker build validation
- Test summary report

**Jobs:**
- `backend-test`: Runs backend Jest tests
- `frontend-test`: Runs frontend Jest tests
- `docker-build`: Validates Docker images build successfully
- `report`: Creates summary of all test results

### 2. `backend-tests.yml` - Backend Tests
**Triggers:** Push/PR affecting backend files

Runs backend-specific tests:
- Tests on Node.js 18.x and 20.x
- Uploads coverage to Codecov
- Posts coverage comment on PRs
- Archives coverage reports

**Path filters:**
- `backend/**`
- `.github/workflows/backend-tests.yml`

### 3. `frontend-tests.yml` - Frontend Tests
**Triggers:** Push/PR affecting frontend files

Runs frontend-specific tests:
- Tests on Node.js 18.x and 20.x
- Uploads coverage to Codecov
- Posts coverage comment on PRs
- Archives coverage reports

**Path filters:**
- `frontend/**`
- `.github/workflows/frontend-tests.yml`

### 4. `docker-publish.yml` - Docker Build & Publish
**Triggers:**
- Push to main branch
- Version tags (v*.*.*)
- PRs to main (build only, no push)

**Features:**
- Runs all tests before building
- Builds and pushes Docker images to GitHub Container Registry
- Tags images with:
  - Branch name
  - Semantic version (from git tags)
  - Git SHA
- Uses layer caching for faster builds

**Requires:**
- `GITHUB_TOKEN` (automatically provided)

### 5. `dependabot.yml` - Dependency Updates

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

| Workflow | Push to main/develop | PR to main/develop | Tags | Path Filters |
|----------|---------------------|-------------------|------|--------------|
| CI | ✅ | ✅ | ❌ | None |
| Backend Tests | ✅ | ✅ | ❌ | backend/** |
| Frontend Tests | ✅ | ✅ | ❌ | frontend/** |
| Docker Publish | ✅ (main only) | ✅ (build only) | ✅ | None |

## Viewing Results

### Test Results
- Navigate to Actions tab in GitHub
- Click on the workflow run
- View job details and logs

### Coverage Reports
- Download artifacts from workflow run
- Or view in Codecov dashboard

### Docker Images
- Navigate to Packages in GitHub
- View published container images

## Local Testing

Test workflows locally using [act](https://github.com/nektos/act):

```bash
# Install act
brew install act  # macOS
# or download from https://github.com/nektos/act

# Run the CI workflow
act -W .github/workflows/ci.yml

# Run specific job
act -j backend-test
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
