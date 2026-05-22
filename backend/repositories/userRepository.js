const db = require('../config/db');

/**
 * Find a user by email.
 */
async function findByEmail(email) {
  const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
}

/**
 * Find a user by ID.
 */
async function findById(id) {
  const [rows] = await db.query(
    'SELECT id, employee_id, name, email, role, is_active, created_at FROM users WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

/**
 * Get all active employees (role = 'employee').
 */
async function findAllEmployees() {
  const [rows] = await db.query(
    `SELECT u.id, u.employee_id, u.name, u.email, u.role, u.is_active, u.created_at,
            m.name AS created_by_name
     FROM users u
     LEFT JOIN users m ON u.created_by = m.id
     WHERE u.role = 'employee'
     ORDER BY u.created_at DESC`
  );
  return rows;
}

/**
 * Get the first manager email.
 */
async function findFirstManagerEmail() {
  const [rows] = await db.query(
    "SELECT email FROM users WHERE role = 'manager' AND is_active = 1 LIMIT 1"
  );
  return rows[0]?.email || null;
}

/**
 * Count employees created in a given year (used for ID generation).
 */
async function countEmployeesInYear(year) {
  const [rows] = await db.query(
    `SELECT COUNT(*) AS total FROM users
     WHERE role = 'employee' AND YEAR(created_at) = ?`,
    [year]
  );
  return rows[0].total;
}

/**
 * Create a new employee.
 */
async function createEmployee({ employee_id, name, email, hashedPassword, created_by }) {
  const [result] = await db.query(
    `INSERT INTO users (employee_id, name, email, password, role, created_by, is_active)
     VALUES (?, ?, ?, ?, 'employee', ?, 1)`,
    [employee_id, name, email, hashedPassword, created_by]
  );
  return result.insertId;
}

/**
 * Soft delete: set is_active = 0.
 */
async function softDeleteEmployee(id) {
  const [result] = await db.query(
    "UPDATE users SET is_active = 0 WHERE id = ? AND role = 'employee'",
    [id]
  );
  return result.affectedRows > 0;
}

module.exports = {
  findByEmail,
  findById,
  findAllEmployees,
  findFirstManagerEmail,
  countEmployeesInYear,
  createEmployee,
  softDeleteEmployee,
};
