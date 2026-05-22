/**
 * Generates an employee ID in format: EMP-YYYY-XXXX
 * e.g. EMP-2025-0001
 * @param {number} sequenceNumber - The sequential number for the year
 * @returns {string}
 */
function generateEmployeeId(sequenceNumber) {
  const year = new Date().getFullYear();
  const padded = String(sequenceNumber).padStart(4, '0');
  return `EMP-${year}-${padded}`;
}

module.exports = { generateEmployeeId };
