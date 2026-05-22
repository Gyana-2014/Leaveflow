const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
require('dotenv').config();

/**
 * Validate credentials and return a signed JWT + user object.
 */
async function login(email, password) {
  if (!email || !password) {
    const err = new Error('Email and password are required.');
    err.status = 400;
    throw err;
  }

  const user = await userRepository.findByEmail(email);
  if (!user) {
    const err = new Error('Invalid email or password.');
    err.status = 401;
    throw err;
  }

  if (!user.is_active) {
    const err = new Error('This account has been deactivated. Contact your manager.');
    err.status = 403;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const err = new Error('Invalid email or password.');
    err.status = 401;
    throw err;
  }

  const token = jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      employee_id: user.employee_id,
    },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  return {
    token,
    user: {
      id: user.id,
      employee_id: user.employee_id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

module.exports = { login };
