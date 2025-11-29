import axios from 'axios';

const WHATSAPP_API_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_FROM_PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

const WHATSAPP_API_URL = `https://graph.facebook.com/v19.0/${WHATSAPP_FROM_PHONE_ID}/messages`;

if (!WHATSAPP_API_TOKEN || !WHATSAPP_FROM_PHONE_ID) {
  console.error("CRITICAL: WhatsApp environment variables are not set.");
}

// --- Helper: Format Phone Number for Meta ---
// Converts "+234..." or "080..." to "23480..."
function formatPhoneNumber(phone: string): string {
  if (!phone) return '';

  // 1. Remove all spaces, dashes, parentheses
  let clean = phone.replace(/[\s-()]/g, '');

  // 2. If it starts with +234, remove the +
  if (clean.startsWith('+234')) {
    clean = clean.substring(1);
  }
  // 3. If it starts with 0 (e.g., 080...), replace leading 0 with 234
  else if (clean.startsWith('0')) {
    clean = '234' + clean.substring(1);
  }
  
  // 4. Ensure no plus signs remain
  return clean.replace('+', '');
}

// --- Existing OTP Function ---
export async function sendOtpMessage(to: string, otpCode: string) {
  if (!WHATSAPP_API_TOKEN || !WHATSAPP_FROM_PHONE_ID) return;
  
  const formattedTo = formatPhoneNumber(to);

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
    // Log detailed error from Meta
    console.error("WhatsApp OTP Error:", JSON.stringify(error.response?.data?.error, null, 2));
  }
}

// --- Status Notification Function ---
export async function sendStatusNotification(to: string, serviceName: string, newStatus: string) {
  if (!WHATSAPP_API_TOKEN || !WHATSAPP_FROM_PHONE_ID) return;

  const formattedTo = formatPhoneNumber(to);

  const payload = {
    messaging_product: 'whatsapp',
    to: formattedTo,
    type: 'template',
    template: {
      name: 'request_status_update',
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
    console.error("WhatsApp Notification Error:", JSON.stringify(error.response?.data?.error, null, 2));
  }
}
