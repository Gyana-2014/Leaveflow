const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

/**
 * Reusable email sender
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} message - HTML message body
 */
async function sendEmail(to, subject, message) {
  try {
    const mailOptions = {
      from: `"Leave Management System" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 32px 40px;">
            <h1 style="color: #f1f5f9; margin: 0; font-size: 22px; letter-spacing: -0.5px;">🗓️ Leave Management</h1>
            <p style="color: #94a3b8; margin: 6px 0 0; font-size: 13px;">Automated Notification</p>
          </div>
          <div style="padding: 36px 40px; background: #ffffff;">
            ${message}
          </div>
          <div style="padding: 20px 40px; background: #f1f5f9; text-align: center;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">This is an automated message. Please do not reply directly.</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Email failed to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
}

// Email: Leave request submitted → notify manager
async function sendLeaveRequestEmail(managerEmail, employee, leave) {
  const subject = `New Leave Request from ${employee.name}`;
  const message = `
    <h2 style="color: #1e293b; margin: 0 0 20px; font-size: 20px;">New Leave Request</h2>
    <p style="color: #475569; margin: 0 0 24px; font-size: 15px;">A new leave request has been submitted and requires your review.</p>
    
    <table style="width: 100%; border-collapse: collapse; background: #f8fafc; border-radius: 8px; overflow: hidden;">
      <tr><td style="padding: 12px 16px; color: #64748b; font-size: 13px; width: 40%;">Employee</td>
          <td style="padding: 12px 16px; color: #1e293b; font-weight: 600; font-size: 14px;">${employee.name}</td></tr>
      <tr style="background:#ffffff"><td style="padding: 12px 16px; color: #64748b; font-size: 13px;">Leave Type</td>
          <td style="padding: 12px 16px; color: #1e293b; font-weight: 600; font-size: 14px;">${leave.type}</td></tr>
      <tr><td style="padding: 12px 16px; color: #64748b; font-size: 13px;">Start Date</td>
          <td style="padding: 12px 16px; color: #1e293b; font-weight: 600; font-size: 14px;">${new Date(leave.start_date).toDateString()}</td></tr>
      <tr style="background:#ffffff"><td style="padding: 12px 16px; color: #64748b; font-size: 13px;">End Date</td>
          <td style="padding: 12px 16px; color: #1e293b; font-weight: 600; font-size: 14px;">${new Date(leave.end_date).toDateString()}</td></tr>
      <tr><td style="padding: 12px 16px; color: #64748b; font-size: 13px;">Reason</td>
          <td style="padding: 12px 16px; color: #1e293b; font-size: 14px;">${leave.reason}</td></tr>
    </table>
    
    <p style="color: #94a3b8; font-size: 13px; margin: 24px 0 0;">Please log in to the Leave Management System to approve or reject this request.</p>
  `;
  return sendEmail(managerEmail, subject, message);
}

// Email: Leave approved → notify employee
async function sendLeaveApprovedEmail(employeeEmail, employee, leave) {
  const subject = `✅ Your Leave Request Has Been Approved`;
  const message = `
    <h2 style="color: #16a34a; margin: 0 0 20px; font-size: 20px;">✅ Leave Approved</h2>
    <p style="color: #475569; margin: 0 0 24px; font-size: 15px;">Great news, <strong>${employee.name}</strong>! Your leave request has been approved.</p>
    
    <table style="width: 100%; border-collapse: collapse; background: #f0fdf4; border-radius: 8px; overflow: hidden; border: 1px solid #bbf7d0;">
      <tr><td style="padding: 12px 16px; color: #64748b; font-size: 13px; width: 40%;">Leave Type</td>
          <td style="padding: 12px 16px; color: #1e293b; font-weight: 600; font-size: 14px;">${leave.type}</td></tr>
      <tr style="background:#ffffff"><td style="padding: 12px 16px; color: #64748b; font-size: 13px;">From</td>
          <td style="padding: 12px 16px; color: #1e293b; font-weight: 600; font-size: 14px;">${new Date(leave.start_date).toDateString()}</td></tr>
      <tr><td style="padding: 12px 16px; color: #64748b; font-size: 13px;">To</td>
          <td style="padding: 12px 16px; color: #1e293b; font-weight: 600; font-size: 14px;">${new Date(leave.end_date).toDateString()}</td></tr>
    </table>
    
    <p style="color: #16a34a; font-size: 14px; margin: 24px 0 0; padding: 16px; background: #f0fdf4; border-radius: 8px; border-left: 3px solid #16a34a;">
      Your leave has been approved. Please ensure your work is handed off before your leave begins.
    </p>
  `;
  return sendEmail(employeeEmail, subject, message);
}

// Email: Leave rejected → notify employee
async function sendLeaveRejectedEmail(employeeEmail, employee, leave, comment = '') {
  const subject = `❌ Your Leave Request Has Been Rejected`;
  const message = `
    <h2 style="color: #dc2626; margin: 0 0 20px; font-size: 20px;">❌ Leave Request Rejected</h2>
    <p style="color: #475569; margin: 0 0 24px; font-size: 15px;">Hi <strong>${employee.name}</strong>, unfortunately your leave request could not be approved at this time.</p>
    
    <table style="width: 100%; border-collapse: collapse; background: #fff7f7; border-radius: 8px; overflow: hidden; border: 1px solid #fecaca;">
      <tr><td style="padding: 12px 16px; color: #64748b; font-size: 13px; width: 40%;">Leave Type</td>
          <td style="padding: 12px 16px; color: #1e293b; font-weight: 600; font-size: 14px;">${leave.type}</td></tr>
      <tr style="background:#ffffff"><td style="padding: 12px 16px; color: #64748b; font-size: 13px;">From</td>
          <td style="padding: 12px 16px; color: #1e293b; font-weight: 600; font-size: 14px;">${new Date(leave.start_date).toDateString()}</td></tr>
      <tr><td style="padding: 12px 16px; color: #64748b; font-size: 13px;">To</td>
          <td style="padding: 12px 16px; color: #1e293b; font-weight: 600; font-size: 14px;">${new Date(leave.end_date).toDateString()}</td></tr>
      ${comment ? `<tr style="background:#ffffff"><td style="padding: 12px 16px; color: #64748b; font-size: 13px;">Manager's Note</td>
          <td style="padding: 12px 16px; color: #dc2626; font-size: 14px;">${comment}</td></tr>` : ''}
    </table>
    
    <p style="color: #64748b; font-size: 14px; margin: 24px 0 0; padding: 16px; background: #fff7f7; border-radius: 8px; border-left: 3px solid #dc2626;">
      If you have questions, please contact your manager directly.
    </p>
  `;
  return sendEmail(employeeEmail, subject, message);
}

module.exports = {
  sendEmail,
  sendLeaveRequestEmail,
  sendLeaveApprovedEmail,
  sendLeaveRejectedEmail,
};
