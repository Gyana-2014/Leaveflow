/**
 * Centralized Express error handler.
 * Must be registered LAST in server.js after all routes.
 */
function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${req.method} ${req.originalUrl} →`, err.message || err);

  // Known operational errors (thrown manually with status + message)
  if (err.status && err.message) {
    return res.status(err.status).json({ message: err.message });
  }

  // MySQL duplicate entry
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ message: 'A record with this value already exists.' });
  }

  // Default: 500
  res.status(500).json({ message: 'Internal server error. Please try again later.' });
}

module.exports = errorHandler;
