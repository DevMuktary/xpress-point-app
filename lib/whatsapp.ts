import axios from 'axios';

// Get Meta API credentials from Railway environment variables
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_API_VERSION = 'v19.0'; // Use a current API version

/**
 * Sends a WhatsApp message using the Meta Cloud API.
 * @param to - The recipient's full international phone number (e.g., "+23480...")
 * @param templateName - The name of the approved template in your Meta account (e.g., "otp_verification")
 * @param code - The 6-digit OTP code to send.
 */
export async function sendWhatsAppMessage(to: string, templateName: string, code: string) {
  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    console.error('WhatsApp credentials are not set in environment variables.');
    // In production, we just fail silently so we don't leak info
    // In development, you might want to throw an error
    return; 
  }

  const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

  // This is the standard Meta API payload for a template message
  const payload = {
    messaging_product: 'whatsapp',
    to: to,
    type: 'template',
    template: {
      name: templateName,
      language: {
        code: 'en_US', // Or the language of your template
      },
      components: [
        {
          type: 'body',
          parameters: [
            {
              type: 'text',
              text: code,
            },
          ],
        },
      ],
    },
  };

  try {
    await axios.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    console.log(`WhatsApp OTP message sent to ${to}`);
  } catch (error: any) {
    console.error(
      'Error sending WhatsApp message:',
      error.response ? error.response.data : error.message
    );
    // We don't throw an error to the user, as the account was still created.
    // They can use a "resend" button later.
  }
}
