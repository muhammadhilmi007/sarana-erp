/**
 * Email Service
 * Handles sending emails for authentication flows
 */

const nodemailer = require('nodemailer');
const config = require('../config');
const {
  logger
} = require('../utils/logger');

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.EMAIL_PORT) || 2525,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || ''
  }
});

/**
 * Send an email
 * @param {Object} options - Email options
 * @returns {Promise<Object>} - Nodemailer send result
 */
const sendEmail = async options => {
  try {
    const mailOptions = {
      from: options.from || process.env.EMAIL_FROM || 'noreply@samudraepaket.com',
      to: options.to,
      subject: options.subject,
      html: options.html
    };
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error('Error sending email:', error);
    throw error;
  }
};

/**
 * Send verification email
 * @param {Object} user - User object
 * @param {string} token - Verification token
 * @returns {Promise<Object>} - Nodemailer send result
 */
const sendVerificationEmail = async (user, token) => {
  const verificationUrl = `${process.env.WEB_APP_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563EB;">Verify Your Email Address</h2>
      <p>Hello ${user.firstName},</p>
      <p>Thank you for registering with Samudra Paket. Please verify your email address by clicking the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" style="background-color: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Verify Email</a>
      </div>
      <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
      <p style="word-break: break-all;"><a href="${verificationUrl}">${verificationUrl}</a></p>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't create an account with us, please ignore this email.</p>
      <p>Best regards,<br>The Samudra Paket Team</p>
    </div>
  `;
  return sendEmail({
    to: user.email,
    subject: 'Verify Your Email Address - Samudra Paket',
    html
  });
};

/**
 * Send password reset email
 * @param {Object} user - User object
 * @param {string} token - Password reset token
 * @returns {Promise<Object>} - Nodemailer send result
 */
const sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${process.env.WEB_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563EB;">Reset Your Password</h2>
      <p>Hello ${user.firstName},</p>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #2563EB; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
      </div>
      <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
      <p style="word-break: break-all;"><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
      <p>Best regards,<br>The Samudra Paket Team</p>
    </div>
  `;
  return sendEmail({
    to: user.email,
    subject: 'Reset Your Password - Samudra Paket',
    html
  });
};

/**
 * Send password changed notification
 * @param {Object} user - User object
 * @returns {Promise<Object>} - Nodemailer send result
 */
const sendPasswordChangedEmail = async user => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563EB;">Password Changed</h2>
      <p>Hello ${user.firstName},</p>
      <p>Your password has been successfully changed.</p>
      <p>If you did not make this change, please contact our support team immediately.</p>
      <p>Best regards,<br>The Samudra Paket Team</p>
    </div>
  `;
  return sendEmail({
    to: user.email,
    subject: 'Password Changed - Samudra Paket',
    html
  });
};

/**
 * Send account locked notification
 * @param {Object} user - User object
 * @param {string} reason - Reason for locking
 * @returns {Promise<Object>} - Nodemailer send result
 */
const sendAccountLockedEmail = async (user, reason) => {
  let reasonText = 'multiple failed login attempts';
  if (reason === 'MANUAL') {
    reasonText = 'administrative action';
  } else if (reason === 'SUSPICIOUS_ACTIVITY') {
    reasonText = 'suspicious activity';
  } else if (reason === 'PASSWORD_EXPIRED') {
    reasonText = 'password expiration';
  }
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563EB;">Account Locked</h2>
      <p>Hello ${user.firstName},</p>
      <p>Your account has been temporarily locked due to ${reasonText}.</p>
      <p>If you need immediate access to your account, please contact our support team for assistance.</p>
      <p>Best regards,<br>The Samudra Paket Team</p>
    </div>
  `;
  return sendEmail({
    to: user.email,
    subject: 'Account Locked - Samudra Paket',
    html
  });
};

/**
 * Send new device login notification
 * @param {Object} user - User object
 * @param {Object} deviceInfo - Device information
 * @returns {Promise<Object>} - Nodemailer send result
 */
const sendNewDeviceLoginEmail = async (user, deviceInfo) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563EB;">New Device Login</h2>
      <p>Hello ${user.firstName},</p>
      <p>We detected a login to your account from a new device:</p>
      <ul>
        <li><strong>Device:</strong> ${deviceInfo.device || 'Unknown'}</li>
        <li><strong>Browser:</strong> ${deviceInfo.browser || 'Unknown'}</li>
        <li><strong>Location:</strong> ${deviceInfo.location || 'Unknown'}</li>
        <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
      </ul>
      <p>If this was you, you can ignore this email.</p>
      <p>If you don't recognize this activity, please change your password immediately and contact our support team.</p>
      <p>Best regards,<br>The Samudra Paket Team</p>
    </div>
  `;
  return sendEmail({
    to: user.email,
    subject: 'New Device Login - Samudra Paket',
    html
  });
};
module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  sendAccountLockedEmail,
  sendNewDeviceLoginEmail
};