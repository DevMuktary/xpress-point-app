import axios from 'axios';

// 1. Using the correct environment variable names
const WHATSAPP_API_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_FROM_PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

const WHATSAPP_API_URL = `https://graph.facebook.com/v19.0/${WHATSAPP_FROM_PHONE_ID}/messages`;

if (!WHATSAPP_API_TOKEN || !WHATSAPP_FROM_PHONE_ID) {
  console.error("CRITICAL: WhatsApp environment variables are not set.");
}

// 2. Using the function name 'sendOtpMessage' (which register/route.ts calls)
export async function sendOtpMessage(to: string, otpCode: string) {
  if (!WHATSAPP_API_TOKEN || !WHATSAPP_FROM_PHONE_ID) {
    console.error("Cannot send WhatsApp OTP: API variables are missing.");
    return;
  }
  
  // Format the number to remove the '+'
  const formattedTo = to.replace('+', '');

  // 3. --- THIS IS THE FIX ---
  // Using your correct 2-component payload
  const payload = {
    messaging_product: 'whatsapp',
    to: formattedTo,
    type: 'template',
    template: {
      name: 'otp_verification', // Your correct template name
      language: {
        code: 'en_GB', // Your correct language
      },
      components: [
        // Component 1: The Body
        {
          type: 'body',
          parameters: [
            {
              type: 'text',
              text: otpCode,
            },
          ],
        },
        // Component 2: The URL Button
        {
          type: 'button',
          sub_type: 'url',
          index: '0', // The first button
          parameters: [
            {
              type: 'text',
              // This is the variable part of the URL
              // (e.g., /copy/123456)
              text: otpCode,
            },
          ],
        },
      ],
    },
  };
  // -----------------------

  try {
    await axios.post(WHATSAPP_API_URL, payload, {
      headers: {
        'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    console.log(`WhatsApp OTP sent to: ${formattedTo}`);
  } catch (error: any) {
    // Log the detailed error from Meta
    console.error("WhatsApp Error:", error.response?.data?.error || error.message);
  }
}
