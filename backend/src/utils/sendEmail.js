export const sendEmail = async (to, subject, text) => {
  // Mock email sender for demo/testing. Replace with real provider (SendGrid, SES, etc.).
  console.log(`Email queued to ${to}: ${subject} -> ${text}`);
};
