const express = require('express');
const cors = require('cors');
const todosRouter = require('./routes/todos');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/todos', todosRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app;
