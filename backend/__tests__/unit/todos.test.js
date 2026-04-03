const request = require('supertest');
const express = require('express');
const todosRouter = require('../../src/routes/todos');

// Mock the database module
jest.mock('../../src/db');
const pool = require('../../src/db');

// Create a test app
const app = express();
app.use(express.json());
app.use('/api/todos', todosRouter);

describe('Todos Routes - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/todos', () => {
    it('should return all todos', async () => {
      const mockTodos = [
        {
          id: 1,
          title: 'Test Todo 1',
          description: 'Description 1',
          completed: false,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 2,
          title: 'Test Todo 2',
          description: 'Description 2',
          completed: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];

      pool.query.mockResolvedValue({ rows: mockTodos });

      const response = await request(app).get('/api/todos');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toMatchObject({
        id: 1,
        title: 'Test Todo 1',
        description: 'Description 1',
        completed: false
      });
      expect(response.body[1]).toMatchObject({
        id: 2,
        title: 'Test Todo 2',
        description: 'Description 2',
        completed: true
      });
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM todos ORDER BY created_at DESC'
      );
    });

    it('should return empty array when no todos exist', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const response = await request(app).get('/api/todos');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should handle database errors', async () => {
      pool.query.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/todos');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to fetch todos' });
    });
  });

  describe('GET /api/todos/:id', () => {
    it('should return a single todo by id', async () => {
      const mockTodo = {
        id: 1,
        title: 'Test Todo',
        description: 'Test Description',
        completed: false,
        created_at: new Date(),
        updated_at: new Date()
      };

      pool.query.mockResolvedValue({ rows: [mockTodo] });

      const response = await request(app).get('/api/todos/1');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: 1,
        title: 'Test Todo',
        description: 'Test Description',
        completed: false
      });
      expect(pool.query).toHaveBeenCalledWith(
        'SELECT * FROM todos WHERE id = $1',
        ['1']
      );
    });

    it('should return 404 when todo not found', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const response = await request(app).get('/api/todos/999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Todo not found' });
    });

    it('should handle database errors', async () => {
      pool.query.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/todos/1');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to fetch todo' });
    });
  });

  describe('POST /api/todos', () => {
    it('should create a new todo', async () => {
      const newTodo = {
        title: 'New Todo',
        description: 'New Description'
      };

      const createdTodo = {
        id: 1,
        ...newTodo,
        completed: false,
        created_at: new Date(),
        updated_at: new Date()
      };

      pool.query.mockResolvedValue({ rows: [createdTodo] });

      const response = await request(app)
        .post('/api/todos')
        .send(newTodo);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        id: 1,
        title: 'New Todo',
        description: 'New Description',
        completed: false
      });
      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO todos (title, description) VALUES ($1, $2) RETURNING *',
        ['New Todo', 'New Description']
      );
    });

    it('should create todo without description', async () => {
      const newTodo = { title: 'New Todo' };

      const createdTodo = {
        id: 1,
        title: 'New Todo',
        description: null,
        completed: false,
        created_at: new Date(),
        updated_at: new Date()
      };

      pool.query.mockResolvedValue({ rows: [createdTodo] });

      const response = await request(app)
        .post('/api/todos')
        .send(newTodo);

      expect(response.status).toBe(201);
      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO todos (title, description) VALUES ($1, $2) RETURNING *',
        ['New Todo', null]
      );
    });

    it('should return 400 when title is missing', async () => {
      const response = await request(app)
        .post('/api/todos')
        .send({ description: 'Description only' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Title is required' });
      expect(pool.query).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      pool.query.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/api/todos')
        .send({ title: 'Test' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to create todo' });
    });
  });

  describe('PUT /api/todos/:id', () => {
    it('should update a todo', async () => {
      const updates = {
        title: 'Updated Title',
        description: 'Updated Description',
        completed: true
      };

      const updatedTodo = {
        id: 1,
        ...updates,
        created_at: new Date(),
        updated_at: new Date()
      };

      pool.query.mockResolvedValue({ rows: [updatedTodo] });

      const response = await request(app)
        .put('/api/todos/1')
        .send(updates);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: 1,
        title: 'Updated Title',
        description: 'Updated Description',
        completed: true
      });
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE todos'),
        ['Updated Title', 'Updated Description', true, '1']
      );
    });

    it('should partially update a todo', async () => {
      const updates = { completed: true };

      const updatedTodo = {
        id: 1,
        title: 'Original Title',
        description: 'Original Description',
        completed: true,
        created_at: new Date(),
        updated_at: new Date()
      };

      pool.query.mockResolvedValue({ rows: [updatedTodo] });

      const response = await request(app)
        .put('/api/todos/1')
        .send(updates);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: 1,
        title: 'Original Title',
        description: 'Original Description',
        completed: true
      });
    });

    it('should return 404 when todo not found', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const response = await request(app)
        .put('/api/todos/999')
        .send({ title: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Todo not found' });
    });

    it('should handle database errors', async () => {
      pool.query.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .put('/api/todos/1')
        .send({ title: 'Updated' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to update todo' });
    });
  });

  describe('DELETE /api/todos/:id', () => {
    it('should delete a todo', async () => {
      const deletedTodo = {
        id: 1,
        title: 'Deleted Todo',
        description: 'Description',
        completed: false,
        created_at: new Date(),
        updated_at: new Date()
      };

      pool.query.mockResolvedValue({ rows: [deletedTodo] });

      const response = await request(app).delete('/api/todos/1');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Todo deleted successfully');
      expect(response.body.todo).toMatchObject({
        id: 1,
        title: 'Deleted Todo',
        description: 'Description',
        completed: false
      });
      expect(pool.query).toHaveBeenCalledWith(
        'DELETE FROM todos WHERE id = $1 RETURNING *',
        ['1']
      );
    });

    it('should return 404 when todo not found', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const response = await request(app).delete('/api/todos/999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Todo not found' });
    });

    it('should handle database errors', async () => {
      pool.query.mockRejectedValue(new Error('Database error'));

      const response = await request(app).delete('/api/todos/1');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Failed to delete todo' });
    });
  });
});
