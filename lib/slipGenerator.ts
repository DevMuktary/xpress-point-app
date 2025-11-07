import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
// import fontkit from '@pdf-lib/fontkit'; // <-- REMOVED
import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';

// --- Helper Functions ---

const loadFile = (filePath: string) => {
  const absolutePath = path.resolve(process.cwd(), filePath);
  return fs.promises.readFile(absolutePath);
};

const createQrCodeBuffer = async (data: any): Promise<Buffer> => {
  const qrText = `surname: ${data.surname} | givenNames: ${data.firstname} ${data.middlename} | dob: ${data.birthdate}`;
  return QRCode.toBuffer(qrText);
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

/**
 * Main function to generate the PDF
 */
export async function generateNinSlipPdf(slipType: string, data: any): Promise<Buffer> {
  const templateType = slipType.toLowerCase();
  
  // 1. Create a new PDF document
  const pdfDoc = await PDFDocument.create();

  // --- REMOVED FONTKIT REGISTRATION ---
  // pdfDoc.registerFontkit(fontkit);

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
    throw new Error("Failed to generate slip: The photo data from the API was corrupt.");
  }

  // 3. Add a page to the PDF that matches the template's size
  const { width, height } = templateImage.scale(1);
  const page = pdfDoc.addPage([width, height]);
  
  // 4. Draw the template as the background
  page.drawImage(templateImage, { x: 0, y: 0, width, height });

  // 5. Load the BUILT-IN fonts (This does not require fontkit)
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  // 6. Draw the data (Y-coordinates are from bottom-left)
  if (templateType === 'regular') {
    
    // --- Your "perfection" fixes are still here ---
    page.drawText(displayField(data.nin), {
      x: 122, y: height - 170, size: 10, font: helvetica, color: rgb(0.2, 0.2, 0.2)
    });
    // ---------------------------------------------

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
    
    // --- Your "perfection" fixes are still here ---
    page.drawImage(userPhoto, { x: 605, y: height - (81 + 115), width: 105, height: 115 });
    // ---------------------------------------------
  } 
  
  else if (templateType === 'standard') {
    const qrBuffer = await createQrCodeBuffer(data);
    const qrImage = await pdfDoc.embedPng(qrBuffer);

    page.drawText(formatNin(data.nin), {
      x: 327, y: height - 389, size: 23, font: helveticaBold, color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(displayField(data.surname), {
      x: 320, y: height - 252, size: 12, font: helvetica, color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(displayField(data.firstname) + ',', {
      x: 320, y: height - 292, size: 12, font: helvetica, color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(displayField(data.middlename), {
      x: 393, y: height - 292, size: 12, font: helvetica, color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(displayField(data.birthdate), {
      x: 320, y: height - 327, size: 12, font: helvetica, color: rgb(0.2, 0.2, 0.2)
    });
    
    page.drawImage(userPhoto, { x: 205, y: height - (232 + 100), width: 90, height: 100 });
    page.drawImage(qrImage, { x: 498, y: height - (239 + 90), width: 90, height: 90 });
  } 
  
  else if (templateType === 'premium') {
    const qrBuffer = await createQrCodeBuffer(data);
    const qrImage = await pdfDoc.embedPng(qrBuffer);

    // Watermark
    page.drawText(displayField(data.nin), {
      x: 170, y: height - 370, size: 16, font: helveticaBold, color: rgb(0.8, 0.8, 0.8), opacity: 0.3
    });
    
    page.drawText(formatNin(data.nin), {
      x: 195, y: height - 590, size: 45, font: helveticaBold, color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(displayField(data.surname), {
      x: 255, y: height - 390, size: 14, font: helvetica, color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(displayField(data.firstname), {
      x: 255, y: height - 445, size: 14, font: helvetica, color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(displayField(data.middlename), {
      x: 360, y: height - 445, size: 14, font: helvetica, color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(displayField(data.birthdate), {
      x: 255, y: height - 495, size: 14, font: helvetica, color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(displayField(data.gender?.toUpperCase()), {
      x: 424, y: height - 495, size: 14, font: helvetica, color: rgb(0.2, 0.2, 0.2)
    });
    
    page.drawImage(userPhoto, { x: 97, y: height - (350 + 164), width: 130, height: 164 });
    page.drawImage(qrImage, { x: 528, y: height - (295 + 160), width: 160, height: 160 });
  }

  // 7. Save the PDF to a buffer and return it
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
