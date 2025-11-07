import { createCanvas, loadImage, registerFont } from 'canvas';
import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';

// Helper function to load the local font file
// We must register the font for canvas to use it.
const fontPath = path.resolve(process.cwd(), 'public/fonts/PublicSans.ttf');
try {
  registerFont(fontPath, { family: 'Public Sans' });
} catch (error) {
  console.error("Could not load font. Using system default.", error);
}

// Helper function to load the PNG template file from the /public folder
const loadTemplate = async (slipType: string) => {
  const templatePath = path.resolve(process.cwd(), `public/templates/nin_${slipType}.png`);
  // Read the file from disk
  const templateBuffer = await fs.promises.readFile(templatePath);
  return loadImage(templateBuffer);
};

// Helper function to generate the QR code as an image
const createQrCode = async (data: any) => {
  const qrText = `surname: ${data.surname} | givenNames: ${data.firstname} ${data.middlename} | dob: ${data.birthdate}`;
  const qrImageBuffer = await QRCode.toBuffer(qrText);
  return loadImage(qrImageBuffer);
};

// Helper to format NIN with spaces: 12345678901 -> 1234   567   8901
const formatNin = (nin: string) => {
  if (!nin || nin.length !== 11) return nin;
  return `${nin.slice(0, 4)}   ${nin.slice(4, 7)}   ${nin.slice(7)}`;
};

/**
 * Main function to generate the PDF
 */
export async function generateNinSlipPdf(slipType: string, data: any): Promise<Buffer> {
  const templateType = slipType.toLowerCase();
  
  // 1. Load the correct PNG template
  const template = await loadTemplate(templateType);
  const canvas = createCanvas(template.width, template.height);
  const ctx = canvas.getContext('2d');
  
  // Draw the template as the background
  ctx.drawImage(template, 0, 0, template.width, template.height);

  // 2. Load the user's photo (from base64)
  const userPhoto = await loadImage(`data:image/png;base64,${data.photo}`);

  // 3. Draw the data based on the slip type
  // These coordinates and fonts are from your PHP files
  if (templateType === 'regular') {
    ctx.font = 'bold 28px "Public Sans"';
    ctx.fillStyle = '#333';
    ctx.fillText(displayField(data.nin), 122, 178); // Adjusted Y for 28px font

    ctx.font = '10px "Public Sans"';
    ctx.fillText(displayField(data.trackingId), 122, 133);
    ctx.fillText(displayField(data.surname), 296, 135);
    ctx.fillText(displayField(data.firstname), 296, 170);
    ctx.fillText(displayField(data.middlename), 296, 203);
    ctx.fillText(displayField(data.gender?.toUpperCase()), 296, 232);
    ctx.fillText(displayField(data.residence_AdressLine1), 437, 140, 160); // Max width

    ctx.drawImage(userPhoto, 600, 81, 120, 132); // Photo in top-right
  } 
  
  else if (templateType === 'standard') {
    const qrImage = await createQrCode(data);
    
    ctx.font = 'bold 23px "Public Sans"';
    ctx.fillStyle = '#333';
    ctx.fillText(formatNin(data.nin), 327, 389);
    
    ctx.font = '500 12px "Public Sans"';
    ctx.fillText(displayField(data.surname), 320, 252);
    ctx.fillText(displayField(data.firstname) + ',', 320, 292);
    ctx.fillText(displayField(data.middlename), 393, 292);
    ctx.fillText(displayField(data.birthdate), 320, 327);
    
    ctx.drawImage(userPhoto, 205, 232, 90, 100);
    ctx.drawImage(qrImage, 498, 239, 90, 90);
  } 
  
  else if (templateType === 'premium') {
    const qrImage = await createQrCode(data);
    
    // Watermark
    ctx.globalAlpha = 0.3; // Faint
    ctx.font = 'bold 16px "Public Sans"';
    ctx.fillStyle = '#aaa';
    ctx.fillText(displayField(data.nin), 170, 370); // Just one example, can be complex
    ctx.globalAlpha = 1.0; // Reset
    
    ctx.font = 'bold 45px "Public Sans"';
    ctx.fillStyle = '#333';
    ctx.fillText(formatNin(data.nin), 195, 590);
    
    ctx.font = '500 14px "Public Sans"';
    ctx.fillText(displayField(data.surname), 255, 390);
    ctx.fillText(displayField(data.firstname), 255, 445);
    ctx.fillText(displayField(data.middlename), 360, 445);
    ctx.fillText(displayField(data.birthdate), 255, 495);
    ctx.fillText(displayField(data.gender?.toUpperCase()), 424, 495);
    
    ctx.drawImage(userPhoto, 97, 350, 130, 164);
    ctx.drawImage(qrImage, 528, 295, 160, 160);
  }

  // 4. Convert the final canvas to a PDF Buffer
  // For simplicity, we create a PDF that is the exact size of the image
  const { createCanvas: createPdfCanvas } = require('canvas');
  const pdfCanvas = createPdfCanvas(template.width, template.height, 'pdf');
  const pdfCtx = pdfCanvas.getContext('2d');
  
  // Draw our completed image canvas onto the PDF canvas
  pdfCtx.drawImage(canvas, 0, 0);
  
  return pdfCanvas.toBuffer('application/pdf');
}

// Helper to fill empty fields with '****'
function displayField(value: any): string {
  if (value === null || value === undefined || value === "") {
    return '****';
  }
  return value.toString();
}
