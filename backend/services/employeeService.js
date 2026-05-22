const bcrypt = require('bcryptjs');
const userRepository = require('../repositories/userRepository');
const { generateEmployeeId } = require('../utils/generateEmployeeId');

/**
 * Add a new employee (manager only).
 */
async function addEmployee({ name, email, password, created_by }) {
  if (!name || !email || !password) {
    const err = new Error('Name, email, and password are required.');
    err.status = 400;
    throw err;
  }

  // Check for duplicate email
  const existing = await userRepository.findByEmail(email);
  if (existing) {
    const err = new Error('An account with this email already exists.');
    err.status = 409;
    throw err;
  }

  // Generate sequential employee ID for the current year
  const year = new Date().getFullYear();
  const count = await userRepository.countEmployeesInYear(year);
  const employee_id = generateEmployeeId(count + 1);

  const hashedPassword = await bcrypt.hash(password, 10);

  const insertId = await userRepository.createEmployee({
    employee_id,
    name,
    email,
    hashedPassword,
    created_by,
  });

  return { id: insertId, employee_id, name, email };
}

/**
 * Get all employees.
 */
async function getAllEmployees() {
  return userRepository.findAllEmployees();
}

/**
 * Soft-delete an employee.
 */
async function deleteEmployee(id) {
  const employee = await userRepository.findById(id);
  if (!employee) {
    const err = new Error('Employee not found.');
    err.status = 404;
    throw err;
  }
  if (employee.role !== 'employee') {
    const err = new Error('Cannot delete a manager account via this endpoint.');
    err.status = 403;
    throw err;
  }
  const deleted = await userRepository.softDeleteEmployee(id);
  if (!deleted) {
    const err = new Error('Failed to delete employee. Please try again.');
    err.status = 500;
    throw err;
  }
  return true;
}

module.exports = { addEmployee, getAllEmployees, deleteEmployee };
