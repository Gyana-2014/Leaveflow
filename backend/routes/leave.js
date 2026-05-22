const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { authMiddleware, requireRole } = require('../middleware/auth');

// Employee: submit a leave request
router.post('/', authMiddleware, requireRole('employee'), leaveController.applyLeave);

// Employee: view own leaves
router.get('/my', authMiddleware, requireRole('employee'), leaveController.getMyLeaves);

// Manager: view all leaves
router.get('/all', authMiddleware, requireRole('manager'), leaveController.getAllLeaves);

// Manager: approve or reject a leave
router.put('/:id', authMiddleware, requireRole('manager'), leaveController.processLeave);

module.exports = router;
