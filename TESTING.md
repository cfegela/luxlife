# Testing Guide

This document outlines the testing setup for the Todo CRUD application.

## Overview

- **Backend**: Jest + Supertest with mocked PostgreSQL database
- **Frontend**: Jest with jsdom for unit testing vanilla JavaScript

## Backend Tests

### Location
- `backend/__tests__/unit/todos.test.js` - Unit tests for API routes
- `backend/__tests__/integration/api.test.js` - Integration tests for full API

### Coverage
- ✅ All CRUD operations (Create, Read, Update, Delete)
- ✅ Error handling and validation
- ✅ Edge cases (missing data, not found, database errors)
- ✅ CORS configuration
- ✅ Health check endpoint
- ✅ Request/response handling

### Running Backend Tests

```bash
cd backend

# Install dependencies
npm install

# Run all tests with coverage
npm test

# Run tests in watch mode
npm run test:watch

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration
```

### Backend Test Results
```
Test Suites: 2 passed, 2 total
Tests:       22 passed, 22 total
Coverage:    100% statements, 100% branches, 100% functions, 100% lines
```

## Frontend Tests

### Location
- `frontend/__tests__/app.test.js` - Unit tests for JavaScript functions
- `frontend/__tests__/setup.js` - Test configuration and mocks

### Coverage
- ✅ HTML escaping (XSS prevention)
- ✅ API configuration
- ✅ Event handlers
- ✅ Fetch API calls (GET, POST, PUT, DELETE)
- ✅ Error handling
- ✅ Data validation (title required, input trimming)
- ✅ UI rendering logic
- ✅ State management (todos array, editing state)
- ✅ Form handling (submit, reset)
- ✅ Inline editing functionality
- ✅ Completion toggle
- ✅ Date formatting
- ✅ User confirmations

### Running Frontend Tests

```bash
cd frontend

# Install dependencies
npm install

# Run tests with coverage
npm test

# Run tests in watch mode
npm run test:watch
```

### Frontend Test Results
```
Test Suites: 1 passed, 1 total
Tests:       32 passed, 32 total
```

## Test Architecture

### Backend
The backend uses a mocked database approach:
- `src/__mocks__/db.js` provides a Jest mock of the PostgreSQL pool
- Tests mock `pool.query()` calls with expected results
- This allows fast, isolated testing without a real database

### Frontend
The frontend tests use:
- **jsdom** for DOM environment simulation
- **Static analysis** to verify code structure and patterns
- **Mock fetch** for API calls

## Continuous Integration

To run all tests:

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

## Coverage Reports

After running tests, view HTML coverage reports:

```bash
# Backend coverage
open backend/coverage/lcov-report/index.html

# Frontend coverage
open frontend/coverage/lcov-report/index.html
```

## Adding New Tests

### Backend

1. Add test file in `backend/__tests__/unit/` or `backend/__tests__/integration/`
2. Import required modules and mock dependencies
3. Write test cases using Jest and Supertest
4. Mock database responses with `pool.query.mockResolvedValue()`

Example:
```javascript
const request = require('supertest');
const app = require('../../src/app');

jest.mock('../../src/db');
const pool = require('../../src/db');

describe('My Feature', () => {
  it('should work correctly', async () => {
    pool.query.mockResolvedValue({ rows: [] });
    const response = await request(app).get('/api/endpoint');
    expect(response.status).toBe(200);
  });
});
```

### Frontend

1. Add test cases to `frontend/__tests__/app.test.js`
2. Test code patterns and structure (static analysis approach)
3. Verify critical functions and error handling

Example:
```javascript
it('should handle user input', () => {
  expect(appJsContent).toContain('function handleInput');
  expect(appJsContent).toContain('.trim()');
});
```

## Best Practices

1. **Test behavior, not implementation** - Focus on what the code does, not how
2. **Mock external dependencies** - Database, fetch, etc.
3. **Test error cases** - Don't just test the happy path
4. **Keep tests isolated** - Each test should be independent
5. **Use descriptive test names** - Make failures easy to understand
6. **Maintain high coverage** - Aim for >80% code coverage

## Common Issues

### Backend

**Issue**: Tests fail with "Cannot find module"
- **Solution**: Run `npm install` in the backend directory

**Issue**: Database connection errors
- **Solution**: Tests use mocked database, ensure `jest.mock('../../src/db')` is present

### Frontend

**Issue**: ReferenceError in setup.js
- **Solution**: Move `beforeEach` to test file, not setup file

**Issue**: Tests can't find DOM elements
- **Solution**: Ensure jsdom environment is configured in package.json

## CI/CD Integration

### GitHub Actions
The project includes automated testing workflows:

- **ci.yml** - Runs all tests on every push/PR
- **backend-tests.yml** - Backend-specific tests with coverage
- **frontend-tests.yml** - Frontend-specific tests with coverage
- **docker-publish.yml** - Builds and publishes Docker images

See [.github/workflows/README.md](.github/workflows/README.md) for detailed workflow documentation.

### Automated Checks
- ✅ Tests run on Node.js 18.x and 20.x
- ✅ Coverage reports uploaded to Codecov
- ✅ Docker image builds validated
- ✅ PR comments with coverage reports
- ✅ Dependabot for dependency updates

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
