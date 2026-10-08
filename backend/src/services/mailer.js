const nodemailer = require("nodemailer");

require("dotenv").config();

const smtpConfigured = Boolean(process.env.SMTP_HOST);
let transporter;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });
  }
  return transporter;
};

/*
  Sends the reset link by email when SMTP_* settings are present.
  Without them (local development) the link is printed in the server
  console instead, so the flow can still be tested.
*/
const sendPasswordResetEmail = async ({ to, username, resetUrl }) => {
  if (!smtpConfigured) {
    console.log(`[mail] SMTP is not configured. Password reset link for ${to}:\n${resetUrl}`);
    return;
  }

  await getTransporter().sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject: "Reset your Todo password",
    text: [
      `Hi ${username || "there"},`,
      "",
      "We received a request to reset your Todo password.",
      `Open this link within 30 minutes to choose a new one: ${resetUrl}`,
      "",
      "If you didn't ask for this, you can ignore this email; your password won't change.",
    ].join("\n"),
    html: `
      <p>Hi ${escapeHtml(username || "there")},</p>
      <p>We received a request to reset your Todo password.</p>
      <p><a href="${escapeHtml(resetUrl)}">Choose a new password</a> (the link works for 30 minutes).</p>
      <p>If you didn't ask for this, you can ignore this email; your password won't change.</p>
    `,
  });
};

const escapeHtml = (text) =>
  String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

module.exports = { sendPasswordResetEmail };
