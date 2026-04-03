// Setup file for Jest tests
// Mock global fetch
global.fetch = jest.fn();

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  error: jest.fn(),
  log: jest.fn(),
};
