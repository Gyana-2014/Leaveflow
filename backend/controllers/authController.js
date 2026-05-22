const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');

/**
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.json(result);
});

module.exports = { login };
