// Mock implementation of the database pool
const pool = {
  query: jest.fn(),
  on: jest.fn(),
};

module.exports = pool;
