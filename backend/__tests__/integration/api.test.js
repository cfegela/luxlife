const request = require('supertest');
const app = require('../../src/app');

// Mock the database module
jest.mock('../../src/db');
const pool = require('../../src/db');

describe('Todo API - Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete CRUD workflow', () => {
    it('should create, read, update, and delete a todo', async () => {
      // CREATE
      const newTodo = {
        id: 1,
        title: 'Integration Test Todo',
        description: 'Testing full workflow',
        completed: false,
        created_at: new Date(),
        updated_at: new Date()
      };

      pool.query.mockResolvedValueOnce({ rows: [newTodo] });

      const createResponse = await request(app)
        .post('/api/todos')
        .send({ title: newTodo.title, description: newTodo.description });

      expect(createResponse.status).toBe(201);
      expect(createResponse.body.title).toBe(newTodo.title);

      // READ ALL
      pool.query.mockResolvedValueOnce({ rows: [newTodo] });

      const listResponse = await request(app).get('/api/todos');

      expect(listResponse.status).toBe(200);
      expect(Array.isArray(listResponse.body)).toBe(true);
      expect(listResponse.body.length).toBe(1);

      // READ ONE
      pool.query.mockResolvedValueOnce({ rows: [newTodo] });

      const getResponse = await request(app).get('/api/todos/1');

      expect(getResponse.status).toBe(200);
      expect(getResponse.body.id).toBe(1);

      // UPDATE
      const updatedTodo = {
        ...newTodo,
        title: 'Updated Title',
        completed: true,
        updated_at: new Date()
      };

      pool.query.mockResolvedValueOnce({ rows: [updatedTodo] });

      const updateResponse = await request(app)
        .put('/api/todos/1')
        .send({ title: 'Updated Title', completed: true });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.title).toBe('Updated Title');
      expect(updateResponse.body.completed).toBe(true);

      // DELETE
      pool.query.mockResolvedValueOnce({ rows: [updatedTodo] });

      const deleteResponse = await request(app).delete('/api/todos/1');

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.message).toBe('Todo deleted successfully');
    });
  });

  describe('Health check endpoint', () => {
    it('should return ok status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('Error handling', () => {
    it('should handle invalid JSON in request body', async () => {
      const response = await request(app)
        .post('/api/todos')
        .set('Content-Type', 'application/json')
        .send('invalid json');

      expect(response.status).toBe(400);
    });

    it('should handle Content-Type application/json', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{
          id: 1,
          title: 'Test',
          description: null,
          completed: false,
          created_at: new Date(),
          updated_at: new Date()
        }]
      });

      const response = await request(app)
        .post('/api/todos')
        .set('Content-Type', 'application/json')
        .send(JSON.stringify({ title: 'Test' }));

      expect(response.status).toBe(201);
    });
  });

  describe('CORS headers', () => {
    it('should include CORS headers in response', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const response = await request(app)
        .get('/api/todos')
        .set('Origin', 'http://localhost:8080');

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });
});
