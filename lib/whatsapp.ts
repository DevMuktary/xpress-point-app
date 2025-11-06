import axios from 'axios';

// Get Meta API credentials from Railway environment variables
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_API_VERSION = 'v19.0'; // Use a current API version

/**
 * Sends a WhatsApp message using the Meta Cloud API.
 * @param to - The recipient's full international phone number (e.g., "+23480...")
 * @param templateName - The name of the approved template (e.g., "otp_verification")
 * @param code - The 6-digit OTP code to send.
 */
export async function sendWhatsAppMessage(to: string, templateName: string, code: string) {
  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    console.error('WhatsApp credentials are not set in environment variables.');
    return; 
  }

  const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

  // --- THIS IS THE UPDATED PAYLOAD ---
  // It now includes *two* components: the 'body' and the 'button'
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
        // Component 1: The Body
        {
          type: 'body',
          parameters: [
            {
              type: 'text',
              text: code,
            },
          ],
        },
        // Component 2: The "Copy Code" Button
        {
          type: 'button',
          sub_type: 'copy_code', // This tells Meta it's a "Copy Code" button
          index: '0', // This is the first button
          parameters: [
            {
              type: 'text',
              text: code, // This is the value that will be copied
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
  }
}
