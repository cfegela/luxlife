const app = require('./app');

const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend server running on port ${PORT}`);
});
