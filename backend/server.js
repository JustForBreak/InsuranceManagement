const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Static credentials for testing
const VALID_CREDENTIALS = {
  email: 'admin@example.com',
  password: 'password123'
};

// Login endpoint
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Simple validation
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }

  // Check credentials
  if (email === VALID_CREDENTIALS.email && password === VALID_CREDENTIALS.password) {
    return res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: 1,
        email: email,
        name: 'Admin User'
      }
    });
  } else {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Login endpoint: POST http://localhost:${PORT}/login`);
  console.log(`Test credentials: ${VALID_CREDENTIALS.email} / ${VALID_CREDENTIALS.password}`);
});
