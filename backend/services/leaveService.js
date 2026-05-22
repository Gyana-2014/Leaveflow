const leaveRepository = require('../repositories/leaveRepository');
const userRepository = require('../repositories/userRepository');
const {
  sendLeaveRequestEmail,
  sendLeaveApprovedEmail,
  sendLeaveRejectedEmail,
} = require('../config/email');
require('dotenv').config();

/**
 * Employee submits a new leave request.
 */
async function applyLeave({ user_id, name, email, type, start_date, end_date, reason }) {
  if (!type || !start_date || !end_date || !reason) {
    const err = new Error('All fields (type, start_date, end_date, reason) are required.');
    err.status = 400;
    throw err;
  }

  if (new Date(start_date) > new Date(end_date)) {
    const err = new Error('Start date cannot be after end date.');
    err.status = 400;
    throw err;
  }

  const leaveId = await leaveRepository.createLeave({ user_id, type, start_date, end_date, reason });

  // Email notification to manager (non-blocking)
  const managerEmail =
    (await userRepository.findFirstManagerEmail()) || process.env.MANAGER_EMAIL;
  const leave = { type, start_date, end_date, reason };
  const employee = { name, email };
  sendLeaveRequestEmail(managerEmail, employee, leave).catch(console.error);

  return { leaveId };
}

/**
 * Get leaves for a specific employee.
 */
async function getMyLeaves(userId) {
  return leaveRepository.findLeavesByUserId(userId);
}

/**
 * Manager: get all leave requests.
 */
async function getAllLeaves() {
  return leaveRepository.findAllLeaves();
}

/**
 * Manager: approve or reject a leave request.
 */
async function processLeave({ leaveId, managerId, status, comment }) {
  if (!['Approved', 'Rejected'].includes(status)) {
    const err = new Error('Status must be "Approved" or "Rejected".');
    err.status = 400;
    throw err;
  }

  const leave = await leaveRepository.findLeaveById(leaveId);
  if (!leave) {
    const err = new Error('Leave request not found.');
    err.status = 404;
    throw err;
  }

  if (leave.status !== 'Pending') {
    const err = new Error('This request has already been processed.');
    err.status = 400;
    throw err;
  }

  await leaveRepository.updateLeaveStatus({
    id: leaveId,
    status,
    manager_comment: comment,
    approved_by: managerId,
  });

  // Email employee (non-blocking)
  const employee = { name: leave.employee_name, email: leave.employee_email };
  if (status === 'Approved') {
    sendLeaveApprovedEmail(employee.email, employee, leave).catch(console.error);
  } else {
    sendLeaveRejectedEmail(employee.email, employee, leave, comment).catch(console.error);
  }

  return { message: `Leave request ${status.toLowerCase()} successfully.` };
}

module.exports = { applyLeave, getMyLeaves, getAllLeaves, processLeave };
