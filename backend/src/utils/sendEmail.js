import nodemailer from "nodemailer";

let cachedTransporter = null;

const getTransporter = () => {
  if (cachedTransporter) return cachedTransporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    console.warn("SMTP config missing; falling back to console logger for emails.");
    return null;
  }

  cachedTransporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });

  return cachedTransporter;
};

export const sendEmail = async (to, subject, text, html, attachments = []) => {
  const transporter = getTransporter();

  if (!transporter) {
    console.log(`[Email Mock] To: ${to}\nSubject: ${subject}\n${text}`);
    return;
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text,
    html: html || `<p>${text}</p>`,
    attachments
  });
};
