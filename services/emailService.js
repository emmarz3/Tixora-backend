const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendTicketEmail = async (to, ticketData, qrCode) => {
  try {
    const mailOptions = {
      from: `"TIXORA" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Your TIXORA Ticket - ${ticketData.event_title}`,
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #9333ea; font-size: 28px;">🎫 Your Event Ticket</h1>
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 24px; border-radius: 16px; margin: 24px 0;">
            <h2 style="margin: 0 0 8px 0;">${ticketData.event_title}</h2>
            <p style="margin: 4px 0; opacity: 0.9;">📅 ${new Date(ticketData.date).toLocaleDateString()}</p>
            <p style="margin: 4px 0; opacity: 0.9;">📍 ${ticketData.location}</p>
            <p style="margin: 4px 0; opacity: 0.9;">🎫 Ticket ID: <strong>${ticketData.ticket_id}</strong></p>
            <p style="margin: 4px 0; opacity: 0.9;">Type: <strong>${ticketData.type}</strong></p>
          </div>
          <div style="text-align: center; margin: 24px 0;">
            <img src="${qrCode}" alt="QR Code" style="width: 200px; height: 200px; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.1);" />
            <p style="margin-top: 12px; color: #666; font-size: 14px;">Present this QR code at the event</p>
          </div>
          <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border-left: 4px solid #9333ea;">
            <p><strong>Support:</strong> support@tixora.com | +234 123 456 7890</p>
          </div>
          <hr style="margin: 32px 0; border: none; border-top: 1px solid #e2e8f0;" />
          <p style="color: #64748b; font-size: 14px; text-align: center;">
            © 2024 TIXORA. Book more amazing events!
          </p>
        </div>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Ticket email sent:', result.messageId);
  } catch (error) {
    console.error('❌ Email failed:', error);
    throw error;
  }
};

module.exports = { sendTicketEmail };
