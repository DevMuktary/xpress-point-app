// Get Meta API credentials from Railway environment variables
// Using the names from your sample code
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_TEMPLATE_NAME = 'otp_verification'; // Or use process.env.META_TEMPLATE_NAME
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

  // This payload is for a template with a BODY and a URL BUTTON
  const payload = {
    messaging_product: 'whatsapp',
    to: to,
    type: 'template',
    template: {
      name: templateName,
      language: {
        code: 'en_GB', // English (UK) as you requested
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
        // Component 2: The URL Button
        // This matches the template Meta expects
        {
          type: 'button',
          sub_type: 'url', // <-- THIS IS THE FIX
          index: '0', // The first button
          parameters: [
            {
              type: 'text',
              // This is the variable part of the URL
              // e.g., for a URL like "https://xpresspoint.net/copy/{{1}}"
              // this 'code' fills the {{1}}
              text: code,
            },
          ],
        },
      ],
    },
  };

  try {
    // Using fetch as in your example
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Meta API Error:', data);
    } else {
      console.log('WhatsApp message sent successfully:', data);
    }

  } catch (error: any) {
    console.error(
      'Error sending WhatsApp message:',
      error.response ? error.response.data : error.message
    );
  }
}
