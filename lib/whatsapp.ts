import axios from 'axios';

// "World-Class" API Credentials
const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN;
const WHATSAPP_FROM_PHONE_ID = process.env.WHATSAPP_FROM_PHONE_ID;
const WHATSAPP_API_URL = `https://graph.facebook.com/v19.0/${WHATSAPP_FROM_PHONE_ID}/messages`;

if (!WHATSAPP_API_TOKEN || !WHATSAPP_FROM_PHONE_ID) {
  console.error("CRITICAL: WhatsApp environment variables are not set.");
}

// "Stunning" function to send the OTP
export async function sendOtpMessage(to: string, otpCode: string) {
  if (!WHATSAPP_API_TOKEN || !WHATSAPP_FROM_PHONE_ID) {
    console.error("Cannot send WhatsApp OTP: API variables are missing.");
    // We "fail silently" so we don't crash the registration
    return;
  }
  
  // "Refurbish" the number to remove the '+'
  const formattedTo = to.replace('+', '');

  const payload = {
    messaging_product: "whatsapp",
    to: formattedTo,
    type: "template",
    template: {
      name: "xpresspoint_otp",
      language: {
        code: "en"
      },
      components: [
        {
          type: "body",
          parameters: [
            {
              type: "text",
              text: otpCode
            }
          ]
        }
      ]
    }
  };

  try {
    await axios.post(WHATSAPP_API_URL, payload, {
      headers: {
        'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    console.log(`"World-class" WhatsApp OTP sent to: ${formattedTo}`);
  } catch (error: any) {
    console.error("RUBBISH WhatsApp Error:", error.response?.data || error.message);
  }
}
