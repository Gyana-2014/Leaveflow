const db = require('../config/db');

/**
 * Insert a new leave request.
 */
async function createLeave({ user_id, type, start_date, end_date, reason }) {
  const [result] = await db.query(
    `INSERT INTO leaves (user_id, type, start_date, end_date, reason, status)
     VALUES (?, ?, ?, ?, ?, 'Pending')`,
    [user_id, type, start_date, end_date, reason]
  );
  return result.insertId;
}

/**
 * Get all leave requests for a specific employee.
 */
async function findLeavesByUserId(userId) {
  const [rows] = await db.query(
    'SELECT * FROM leaves WHERE user_id = ? ORDER BY created_at DESC',
    [userId]
  );
  return rows;
}

/**
 * Get all leave requests with employee details (manager view).
 */
async function findAllLeaves() {
  const [rows] = await db.query(
    `SELECT l.*, u.name AS employee_name, u.email AS employee_email, u.employee_id
     FROM leaves l
     JOIN users u ON l.user_id = u.id
     ORDER BY l.created_at DESC`
  );
  return rows;
}

/**
 * Get a single leave request by ID (with employee info).
 */
async function findLeaveById(id) {
  const [rows] = await db.query(
    `SELECT l.*, u.name AS employee_name, u.email AS employee_email
     FROM leaves l
     JOIN users u ON l.user_id = u.id
     WHERE l.id = ?`,
    [id]
  );
  return rows[0] || null;
}

/**
 * Update leave status + optional manager comment + approved_by.
 */
async function updateLeaveStatus({ id, status, manager_comment, approved_by }) {
  const [result] = await db.query(
    `UPDATE leaves
     SET status = ?, manager_comment = ?, approved_by = ?, updated_at = NOW()
     WHERE id = ?`,
    [status, manager_comment || null, approved_by, id]
  );
  return result.affectedRows > 0;
}

module.exports = {
  createLeave,
  findLeavesByUserId,
  findAllLeaves,
  findLeaveById,
  updateLeaveStatus,
};
