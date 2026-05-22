const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const leaveRoutes = require('./routes/leave');
const employeeRoutes = require('./routes/employee');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ─── Core Middleware ────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// ─── Routes ─────────────────────────────────────────────────────────────────
// Keep /api/login for backward compatibility with existing frontend
app.use('/api/auth', authRoutes);
app.post('/api/login', (req, res, next) => {
  req.url = '/login';
  authRoutes(req, res, next);
});

app.use('/api/leave', leaveRoutes);
app.use('/api/employees', employeeRoutes);

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Leave Management API is running.' });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

// ─── Centralized Error Handler (must be last) ─────────────────────────────────
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📋 API Health: http://localhost:${PORT}/api/health`);
});
