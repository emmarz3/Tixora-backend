const QRCode = require('qrcode');

const generateQR = async (data) => {
  try {
    const qrData = await QRCode.toDataURL(JSON.stringify(data), {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrData;
  } catch (error) {
    console.error('QR Generation failed:', error);
    throw error;
  }
};

module.exports = { generateQR };
