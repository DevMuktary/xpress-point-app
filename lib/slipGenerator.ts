import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';

// --- Helper Functions ---

// Load a local file (font or PNG) as a buffer
const loadFile = (filePath: string) => {
  const absolutePath = path.resolve(process.cwd(), filePath);
  return fs.promises.readFile(absolutePath);
};

// Generate the QR code as a PNG buffer
const createQrCodeBuffer = async (data: any): Promise<Buffer> => {
  const qrText = `surname: ${data.surname} | givenNames: ${data.firstname} ${data.middlename} | dob: ${data.birthdate}`;
  return QRCode.toBuffer(qrText);
};

// Format NIN: 12345678901 -> 1234   567   8901
const formatNin = (nin: string) => {
  if (!nin || nin.length !== 11) return nin;
  return `${nin.slice(0, 4)}   ${nin.slice(4, 7)}   ${nin.slice(7)}`;
};

// Fill empty fields with '****'
const displayField = (value: any): string => {
  if (value === null || value === undefined || value === "") {
    return '****';
  }
  return value.toString();
};

/**
 * Main function to generate the PDF
 */
export async function generateNinSlipPdf(slipType: string, data: any): Promise<Buffer> {
  const templateType = slipType.toLowerCase();
  
  // 1. Create a new PDF document
  const pdfDoc = await PDFDocument.create();

  // 2. Load the PNG template and the user's photo
  const templateBuffer = await loadFile(`public/templates/nin_${templateType}.png`);
  const templateImage = await pdfDoc.embedPng(templateBuffer);
  
  const photoBuffer = Buffer.from(data.photo, 'base64');
  const userPhoto = await pdfDoc.embedPng(photoBuffer);

  // 3. Add a page to the PDF that matches the template's size
  const { width, height } = templateImage.scale(1);
  const page = pdfDoc.addPage([width, height]);
  
  // 4. Draw the template as the background
  page.drawImage(templateImage, { x: 0, y: 0, width, height });

  // 5. Load the font
  const fontBuffer = await loadFile('public/fonts/PublicSans.ttf');
  const customFont = await pdfDoc.embedFont(fontBuffer);
  
  // 6. Draw the data
  // NOTE: pdf-lib (0,0) is BOTTOM-LEFT, not top-left.
  // We must subtract the Y coordinate from the page height.

  if (templateType === 'regular') {
    page.drawText(displayField(data.nin), {
      x: 122, y: height - 178, size: 28, font: customFont, color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(displayField(data.trackingId), {
      x: 122, y: height - 133, size: 10, font: customFont, color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(displayField(data.surname), {
      x: 296, y: height - 135, size: 10, font: customFont, color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(displayField(data.firstname), {
      x: 296, y: height - 170, size: 10, font: customFont, color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(displayField(data.middlename), {
      x: 296, y: height - 203, size: 10, font: customFont, color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(displayField(data.gender?.toUpperCase()), {
      x: 296, y: height - 232, size: 10, font: customFont, color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(displayField(data.residence_AdressLine1), {
      x: 437, y: height - 140, size: 10, font: customFont, color: rgb(0.2, 0.2, 0.2), maxWidth: 160
    });
    page.drawImage(userPhoto, { x: 600, y: height - (81 + 132), width: 120, height: 132 });
  } 
  
  else if (templateType === 'standard') {
    const qrBuffer = await createQrCodeBuffer(data);
    const qrImage = await pdfDoc.embedPng(qrBuffer);

    page.drawText(formatNin(data.nin), {
      x: 327, y: height - 389, size: 23, font: customFont, color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(displayField(data.surname), {
      x: 320, y: height - 252, size: 12, font: customFont, color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(displayField(data.firstname) + ',', {
      x: 320, y: height - 292, size: 12, font: customFont, color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(displayField(data.middlename), {
      x: 393, y: height - 292, size: 12, font: customFont, color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(displayField(data.birthdate), {
      x: 320, y: height - 327, size: 12, font: customFont, color: rgb(0.2, 0.2, 0.2)
    });
    
    page.drawImage(userPhoto, { x: 205, y: height - (232 + 100), width: 90, height: 100 });
    page.drawImage(qrImage, { x: 498, y: height - (239 + 90), width: 90, height: 90 });
  } 
  
  else if (templateType === 'premium') {
    const qrBuffer = await createQrCodeBuffer(data);
    const qrImage = await pdfDoc.embedPng(qrBuffer);

    // Watermark
    page.drawText(displayField(data.nin), {
      x: 170, y: height - 370, size: 16, font: customFont, color: rgb(0.8, 0.8, 0.8), opacity: 0.3
    });
    
    page.drawText(formatNin(data.nin), {
      x: 195, y: height - 590, size: 45, font: customFont, color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(displayField(data.surname), {
      x: 255, y: height - 390, size: 14, font: customFont, color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(displayField(data.firstname), {
      x: 255, y: height - 445, size: 14, font: customFont, color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(displayField(data.middlename), {
      x: 360, y: height - 445, size: 14, font: customFont, color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(displayField(data.birthdate), {
      x: 255, y: height - 495, size: 14, font: customFont, color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(displayField(data.gender?.toUpperCase()), {
      x: 424, y: height - 495, size: 14, font: customFont, color: rgb(0.2, 0.2, 0.2)
    });
    
    page.drawImage(userPhoto, { x: 97, y: height - (350 + 164), width: 130, height: 164 });
    page.drawImage(qrImage, { x: 528, y: height - (295 + 160), width: 160, height: 160 });
  }

  // 7. Save the PDF to a buffer and return it
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
