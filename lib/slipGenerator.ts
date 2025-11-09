import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';

// --- Helper Functions ---

const loadFile = (filePath: string) => {
  const absolutePath = path.resolve(process.cwd(), filePath);
  return fs.promises.readFile(absolutePath);
};

// Updated to generate a QR code with a transparent background
const createQrCodeBuffer = async (data: any): Promise<Buffer> => {
  const qrText = `surname: ${data.surname} | givenNames: ${data.firstname} ${data.middlename} | dob: ${data.birthdate}`;
  return QRCode.toBuffer(qrText, {
    color: {
      dark: '#000000', // Black dots
      light: '#0000'   // Transparent background
    }
  });
};

const formatNin = (nin: string) => {
  if (!nin || nin.length !== 11) return nin;
  return `${nin.slice(0, 4)}   ${nin.slice(4, 7)}   ${nin.slice(7)}`;
};

const displayField = (value: any): string => {
  if (value === null || value === undefined || value === "") {
    return '****';
  }
  return value.toString();
};

const getIssueDate = (): string => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const year = today.getFullYear();
  const months = [
    'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
  ];
  const monthAbbr = months[today.getMonth()]; 
  return `${day}-${monthAbbr}-${year}`; // Format: 09-NOV-2025
};

/**
 * Main function to generate the PDF
 */
export async function generateNinSlipPdf(slipType: string, data: any): Promise<Buffer> {
  const templateType = slipType.toLowerCase();
  
  // 1. Create a new PDF document
  const pdfDoc = await PDFDocument.create();

  // 2. Load the PNG template and the user's photo
  let templateImage;
  let userPhoto;

  try {
    const templateBuffer = await loadFile(`public/templates/nin_${templateType}.png`);
    templateImage = await pdfDoc.embedPng(templateBuffer);
  } catch (error: any) {
    console.error(`Failed to load template: nin_${templateType}.png`, error.message);
    throw new Error(`Service configuration error: Could not load template file for ${slipType}.`);
  }

  try {
    const photoBuffer = Buffer.from(data.photo, 'base64');
    userPhoto = await pdfDoc.embedJpg(photoBuffer);
  } catch (error: any) {
    console.error("Failed to embed user photo (data.photo):", error.message);
    if (error.message.includes('buffer length') || error.message.includes('Invalid JPG')) {
      throw new Error("Failed to generate slip: The photo data from the API was corrupt.");
    }
    throw new Error("Failed to generate slip: Invalid photo data.");
  }

  // 3. Add a page to the PDF that matches the template's size
  const { width, height } = templateImage.scale(1);
  const page = pdfDoc.addPage([width, height]);
  
  // 4. Draw the template as the background
  page.drawImage(templateImage, { x: 0, y: 0, width: width, height: height });

  // 5. Load the BUILT-IN fonts
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  // 6. Draw the data (Y-coordinates are from bottom-left)
  if (templateType === 'regular') {
    
    // This is the "perfect" position for REGULAR
    page.drawText(displayField(data.nin), {
      x: 122, y: height - 170, size: 10, font: helvetica, color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(displayField(data.trackingId), {
      x: 122, y: height - 133, size: 10, font: helvetica, color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(displayField(data.surname), {
      x: 296, y: height - 135, size: 10, font: helvetica, color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(displayField(data.firstname), {
      x: 296, y: height - 170, size: 10, font: helvetica, color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(displayField(data.middlename), {
      x: 296, y: height - 203, size: 10, font: helvetica, color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(displayField(data.gender?.toUpperCase()), {
      x: 296, y: height - 232, size: 10, font: helvetica, color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(displayField(data.residence_AdressLine1), {
      x: 437, y: height - 140, size: 10, font: helvetica, color: rgb(0.2, 0.2, 0.2), maxWidth: 160
    });
    page.drawImage(userPhoto, { x: 615, y: height - (112 + 115), width: 105, height: 115 });
  } 
  
  else if (templateType === 'standard') {
    
    // This is the "perfect" position for STANDARD
    const qrBuffer = await createQrCodeBuffer(data);
    const qrImage = await pdfDoc.embedPng(qrBuffer);

    page.drawText(formatNin(data.nin), {
      x: 322, y: height - 247, size: 23, font: helveticaBold, color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(displayField(data.surname), {
      x: 320, y: height - 110, size: 12, font: helvetica, color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(displayField(data.firstname) + ',', {
      x: 320, y: height - 150, size: 12, font: helvetica, color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(displayField(data.middlename), {
      x: 393, y: height - 150, size: 12, font: helvetica, color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(displayField(data.birthdate), {
      x: 320, y: height - 185, size: 12, font: helvetica, color: rgb(0.2, 0.2, 0.2)
    });
    page.drawImage(userPhoto, { x: 207, y: height - (87 + 100), width: 90, height: 100 });
    page.drawImage(qrImage, { x: 498, y: height - (90 + 90), width: 90, height: 90 });
    page.drawText("ISSUE DATE", {
      x: 518, y: height - 187, size: 8, font: helveticaBold, color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(getIssueDate(), {
      x: 518, y: height - 197, size: 8, font: helvetica, color: rgb(0.2, 0.2, 0.2)
    });
  } 
  
  else if (templateType === 'premium') {
    
    const qrBuffer = await createQrCodeBuffer(data);
    const qrImage = await pdfDoc.embedPng(qrBuffer);

    // Bold NIN (Perfected position)
    page.drawText(formatNin(data.nin), {
      x: 445, y: height - 1048, size: 56, font: helveticaBold, color: rgb(0.2, 0.2, 0.2)
    });
    
    // Watermark
    page.drawText(displayField(data.nin), {
      x: 270, y: height - 570, size: 18, font: helveticaBold, color: rgb(0.8, 0.8, 0.8), opacity: 0.3
    });
    
    // Text Fields (Perfected position)
    page.drawText(displayField(data.surname), {
      x: 475, y: height - 695, size: 32, font: helvetica, color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(displayField(data.firstname), {
      x: 470, y: height - 792, size: 32, font: helvetica, color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(displayField(data.middlename), {
      x: 632, y: height - 792, size: 32, font: helvetica, color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(displayField(data.birthdate), {
      x: 465, y: height - 880, size: 32, font: helvetica, color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(displayField(data.gender?.toUpperCase()), {
      x: 714, y: height - 880, size: 32, font: helvetica, color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(getIssueDate(), {
      x: 774, y: height - 880, size: 32, font: helvetica, color: rgb(0.2, 0.2, 0.2)
    });
    
    // --- THIS IS THE FIX (Photo) ---
    const photoX = 169;
    const photoY = height - 929;
    const photoWidth = 262; 
    const photoHeight = 326; 
    const photoRadius = 10; 

    // 1. Save the current state
    page.pushGraphicsState(); // <-- CORRECTED
    
    // 2. Create the rounded rectangle path
    page.drawRectangle({
      x: photoX,
      y: photoY,
      width: photoWidth,
      height: photoHeight,
      borderRadius: photoRadius,
      color: rgb(1, 1, 1),
    });

    // 3. Use this path as a "clipping mask"
    page.clip();

    // 4. Draw the image *inside* the mask
    page.drawImage(userPhoto, {
      x: photoX,
      y: photoY,
      width: photoWidth,
      height: photoHeight,
    });

    // 5. Remove the mask
    page.popGraphicsState(); // <-- CORRECTED
    // --------------------------------
    
    // QR Code (Perfected position)
    page.drawImage(qrImage, { 
      x: 870, 
      y: height - 814, 
      width: 344, 
      height: 326 
    });

    // Text under QR (REMOVED)
    // -----------------------
  }

  // 7. Save the PDF to a buffer and return it
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
