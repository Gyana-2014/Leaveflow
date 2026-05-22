const employeeService = require('../services/employeeService');
const asyncHandler = require('../utils/asyncHandler');

/**
 * POST /api/employees — Manager adds a new employee
 */
const addEmployee = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const created_by = req.user.id;
  const employee = await employeeService.addEmployee({ name, email, password, created_by });
  res.status(201).json({ message: 'Employee added successfully.', employee });
});

/**
 * GET /api/employees — Manager views all employees
 */
const getAllEmployees = asyncHandler(async (req, res) => {
  const employees = await employeeService.getAllEmployees();
  res.json(employees);
});

/**
 * DELETE /api/employees/:id — Manager soft-deletes an employee
 */
const deleteEmployee = asyncHandler(async (req, res) => {
  await employeeService.deleteEmployee(req.params.id);
  res.json({ message: 'Employee deactivated successfully.' });
});

module.exports = { addEmployee, getAllEmployees, deleteEmployee };
