import nodemailer from 'nodemailer';

// Use environment variables for real SMTP, fallback to console logging for now
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'ethereal.user@ethereal.email',
    pass: process.env.SMTP_PASS || 'etherealpassword',
  },
});

export const sendOTP = async (email, otp) => {
  const mailOptions = {
    from: '"SmartTable AI" <noreply@smarttable.ai>',
    to: email,
    subject: 'Your SmartTable Verification Code',
    text: `Your verification code is: ${otp}. It will expire in 15 minutes.`,
    html: `<p>Your verification code is: <strong>${otp}</strong></p><p>It will expire in 15 minutes.</p>`,
  };

  try {
    if (process.env.NODE_ENV !== 'production' && !process.env.SMTP_HOST) {
      console.log('\n=============================================');
      console.log(`✉️ [DEV EMAIL MOCK] Sent to: ${email}`);
      console.log(`✉️ [DEV EMAIL MOCK] OTP Code: ${otp}`);
      console.log('=============================================\n');
      return true;
    }
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
};
