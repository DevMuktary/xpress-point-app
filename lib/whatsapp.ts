import axios from 'axios';

const WHATSAPP_API_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_FROM_PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

const WHATSAPP_API_URL = `https://graph.facebook.com/v19.0/${WHATSAPP_FROM_PHONE_ID}/messages`;

// --- Helper: Format Phone Number for Meta ---
// Converts "+234..." or "080..." to "23480..."
function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  // 1. Remove all non-digits
  let clean = phone.replace(/\D/g, ''); 

  // 2. Handle Nigerian formats specifically
  // If it starts with '234', leave it.
  // If it starts with '0', strip it and add '234'.
  if (clean.startsWith('0')) {
    clean = '234' + clean.substring(1);
  }
  
  return clean;
}

export async function sendOtpMessage(to: string, otpCode: string) {
  if (!WHATSAPP_API_TOKEN || !WHATSAPP_FROM_PHONE_ID) {
    console.error("WhatsApp Config Missing");
    return;
  }
  
  const formattedTo = formatPhoneNumber(to);

  const payload = {
    messaging_product: 'whatsapp',
    to: formattedTo,
    type: 'template',
    template: {
      name: 'otp_verification', // Ensure this matches your Meta template exactly
      language: { code: 'en_GB' }, // Ensure this matches your Meta template language
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
    // Log the FULL error from Meta for debugging
    console.error("WhatsApp OTP Error:", JSON.stringify(error.response?.data || error.message, null, 2));
  }
}

export async function sendStatusNotification(to: string, serviceName: string, newStatus: string) {
  if (!WHATSAPP_API_TOKEN || !WHATSAPP_FROM_PHONE_ID) return;

  const formattedTo = formatPhoneNumber(to);

  const payload = {
    messaging_product: 'whatsapp',
    to: formattedTo,
    type: 'template',
    template: {
      name: 'request_status_update', // Ensure this matches
      language: { code: 'en_GB' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: serviceName },
            { type: 'text', text: newStatus },
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
    console.log(`WhatsApp Status sent to: ${formattedTo}`);
  } catch (error: any) {
    console.error("WhatsApp Notify Error:", JSON.stringify(error.response?.data || error.message, null, 2));
  }
}
