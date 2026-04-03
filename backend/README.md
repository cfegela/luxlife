# Todo Backend API

Express.js REST API for managing todos with PostgreSQL database.

## Testing

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Unit Tests Only
```bash
npm run test:unit
```

### Run Integration Tests Only
```bash
npm run test:integration
```

### View Coverage Report
After running tests, open `coverage/lcov-report/index.html` in your browser.

## Test Structure

- `__tests__/unit/todos.test.js` - Unit tests for todo routes with mocked database
- `__tests__/integration/api.test.js` - Integration tests for the complete API

## Coverage

Tests cover:
- All CRUD operations (Create, Read, Update, Delete)
- Error handling and validation
- Edge cases (missing data, not found, database errors)
- CORS configuration
- Health check endpoint
