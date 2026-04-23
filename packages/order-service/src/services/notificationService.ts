import nodemailer from 'nodemailer';
// Dummy twilio
// import twilio from 'twilio'; 

export const sendNotification = async (to: string, subject: string, text: string) => {
  // In dev/test just log it
  console.log(`[Notification] To: ${to} | Subject: ${subject} | Text: ${text}`);

  if (process.env.NODE_ENV === 'production') {
    // let transporter = nodemailer.createTransport({ ... });
    // await transporter.sendMail({ from: '...', to, subject, text });
  }
};
