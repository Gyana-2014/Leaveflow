const leaveService = require('../services/leaveService');
const asyncHandler = require('../utils/asyncHandler');

/**
 * POST /api/leaves — Employee applies for leave
 */
const applyLeave = asyncHandler(async (req, res) => {
  const { type, start_date, end_date, reason } = req.body;
  const { id: user_id, name, email } = req.user;
  const result = await leaveService.applyLeave({ user_id, name, email, type, start_date, end_date, reason });
  res.status(201).json({ message: 'Leave request submitted successfully.', leaveId: result.leaveId });
});

/**
 * GET /api/leaves/my — Employee views their own leaves
 */
const getMyLeaves = asyncHandler(async (req, res) => {
  const leaves = await leaveService.getMyLeaves(req.user.id);
  res.json(leaves);
});

/**
 * GET /api/leaves/all — Manager views all leaves
 */
const getAllLeaves = asyncHandler(async (req, res) => {
  const leaves = await leaveService.getAllLeaves();
  res.json(leaves);
});

/**
 * PUT /api/leaves/:id — Manager approves or rejects a leave
 */
const processLeave = asyncHandler(async (req, res) => {
  const { status, comment } = req.body;
  const result = await leaveService.processLeave({
    leaveId: req.params.id,
    managerId: req.user.id,
    status,
    comment,
  });
  res.json(result);
});

module.exports = { applyLeave, getMyLeaves, getAllLeaves, processLeave };
