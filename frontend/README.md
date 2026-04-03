# Todo Frontend

Vanilla JavaScript frontend for the Todo application.

## Testing

### Install Dependencies
```bash
npm install
```

### Run Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### View Coverage Report
After running tests, open `coverage/lcov-report/index.html` in your browser.

## Test Structure

- `__tests__/app.test.js` - Unit tests for JavaScript functions and logic
- `__tests__/setup.js` - Test configuration and global mocks

## Coverage

Tests cover:
- HTML escaping for XSS prevention
- API URL configuration
- Event handlers
- Fetch API calls
- Error handling
- Data validation
- UI rendering logic
- State management
- Form handling
- Inline editing
- Completion toggling
- Date formatting
