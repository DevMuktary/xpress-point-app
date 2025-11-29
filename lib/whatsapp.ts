import axios from 'axios';

const WHATSAPP_API_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_FROM_PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

const WHATSAPP_API_URL = `https://graph.facebook.com/v19.0/${WHATSAPP_FROM_PHONE_ID}/messages`;

if (!WHATSAPP_API_TOKEN || !WHATSAPP_FROM_PHONE_ID) {
  console.error("CRITICAL: WhatsApp environment variables are not set.");
}

// --- Existing OTP Function ---
export async function sendOtpMessage(to: string, otpCode: string) {
  if (!WHATSAPP_API_TOKEN || !WHATSAPP_FROM_PHONE_ID) return;
  
  const formattedTo = to.replace('+', '').replace(/\s/g, '');

  const payload = {
    messaging_product: 'whatsapp',
    to: formattedTo,
    type: 'template',
    template: {
      name: 'otp_verification', 
      language: { code: 'en_GB' },
      components: [
        {
          type: 'body',
          parameters: [{ type: 'text', text: otpCode }],
        },
        {
          type: 'button',
          sub_type: 'url',
          index: '0',
          parameters: [{ type: 'text', text: otpCode }],
        },
      ],
    },
  };

  try {
    await axios.post(WHATSAPP_API_URL, payload, {
      headers: {
        'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    console.log(`WhatsApp OTP sent to: ${formattedTo}`);
  } catch (error: any) {
    console.error("WhatsApp OTP Error:", error.response?.data?.error || error.message);
  }
}

// --- NEW: Status Notification Function ---
export async function sendStatusNotification(to: string, serviceName: string, newStatus: string) {
  if (!WHATSAPP_API_TOKEN || !WHATSAPP_FROM_PHONE_ID) return;

  // Clean phone number
  const formattedTo = to.replace('+', '').replace(/\s/g, '');

  const payload = {
    messaging_product: 'whatsapp',
    to: formattedTo,
    type: 'template',
    template: {
      name: 'request_status_update', // <--- MAKE SURE YOU CREATE THIS TEMPLATE IN META
      language: { code: 'en_GB' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: serviceName }, // {{1}} Service Name
            { type: 'text', text: newStatus },   // {{2}} New Status
          ],
        }
      ],
    },
  };

  try {
    await axios.post(WHATSAPP_API_URL, payload, {
      headers: {
        'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    console.log(`WhatsApp Status Update sent to: ${formattedTo}`);
  } catch (error: any) {
    // We log error but don't crash the app if notification fails
    console.error("WhatsApp Notification Error:", error.response?.data?.error || error.message);
  }
}
