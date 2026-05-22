const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { authMiddleware, requireRole } = require('../middleware/auth');

// All employee management routes are manager-only
router.use(authMiddleware, requireRole('manager'));

// GET  /api/employees       — list all employees
router.get('/', employeeController.getAllEmployees);

// POST /api/employees       — add a new employee
router.post('/', employeeController.addEmployee);

// DELETE /api/employees/:id — soft-delete an employee
router.delete('/:id', employeeController.deleteEmployee);

module.exports = router;
