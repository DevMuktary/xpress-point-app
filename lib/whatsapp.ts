import axios from 'axios'; // Sticking with axios as it's already in package.json

// We'll use the environment variables we already set up
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_API_VERSION = 'v19.0';

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

  // This payload is for a template with a BODY and a "Copy Code" button
  const payload = {
    messaging_product: 'whatsapp',
    to: to,
    type: 'template',
    template: {
      name: templateName,
      language: {
        // --- THIS IS THE FIX ---
        code: 'en_GB', // Changed from 'en_US' to 'English (UK)'
      },
      components: [
        // Component 1: The Body
        // This corresponds to the {{1}} in "Your code is {{1}}"
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
        // This MUST match the button in your Meta template
        {
          type: 'button',
          sub_type: 'copy_code', // This is the correct type
          index: '0', // The first button
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
    // Using axios as it's already installed and working
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
