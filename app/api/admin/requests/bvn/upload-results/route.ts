import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromSession } from '@/lib/auth';

// Helper to clean NIBSS data (removes leading single quotes and whitespace)
const cleanData = (value: string | undefined) => {
  if (!value) return null;
  // Remove leading single quote if present (common in NIBSS CSVs)
  let clean = value.startsWith("'") ? value.substring(1) : value;
  // Remove "null" strings
  if (clean.toLowerCase() === 'null') return null;
  return clean.trim();
};

export async function POST(request: Request) {
  const user = await getUserFromSession();

  // Security: Admin Only
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // 1. Read File as Text
    const text = await file.text();
    const lines = text.split(/\r?\n/); // Split by new line

    if (lines.length < 2) {
      return NextResponse.json({ error: 'File is empty or invalid' }, { status: 400 });
    }

    // 2. Parse Headers (Line 0) to find column indexes dynamically
    // Expected: TICKET_NUMBER, BVN, AGT_MGT_INST_NAME, AGENT_NAME, AGENT_CODE, BMS_IMPORT_ID, VALIDATION_STATUS, VALIDATION_MESSAGE
    const headers = lines[0].split(',').map(h => h.trim().toUpperCase());
    
    const idxTicket = headers.indexOf('TICKET_NUMBER');
    const idxBvn = headers.indexOf('BVN');
    const idxInst = headers.indexOf('AGT_MGT_INST_NAME');
    const idxName = headers.indexOf('AGENT_NAME');
    const idxCode = headers.indexOf('AGENT_CODE');
    const idxBms = headers.indexOf('BMS_IMPORT_ID');
    const idxStatus = headers.indexOf('VALIDATION_STATUS');
    const idxMsg = headers.indexOf('VALIDATION_MESSAGE');

    if (idxTicket === -1 || idxCode === -1 || idxStatus === -1) {
      return NextResponse.json({ error: 'Invalid CSV format. Missing required columns (TICKET_NUMBER, AGENT_CODE, VALIDATION_STATUS).' }, { status: 400 });
    }

    // 3. Process Rows
    let successCount = 0;
    let errorCount = 0;

    // We use a loop to process sequentially (or you could batch them)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Simple CSV split (Assumes no commas INSIDE the values)
      const cols = line.split(','); 

      const ticketNumber = cleanData(cols[idxTicket]);
      const agentCode = cleanData(cols[idxCode]);
      const status = cleanData(cols[idxStatus]);
      
      if (!ticketNumber || !agentCode || !status) {
        console.log(`Skipping Line ${i}: Missing Key Data`);
        errorCount++;
        continue;
      }

      const bvn = cleanData(cols[idxBvn]);
      const institutionName = cleanData(cols[idxInst]);
      const agentName = cleanData(cols[idxName]);
      const bmsImportId = cleanData(cols[idxBms]);
      // Join remaining columns for message in case it contained commas
      const messageRaw = cols.slice(idxMsg).join(','); 
      const message = cleanData(messageRaw);

      // 4. Upsert into DB
      try {
        await prisma.bvnEnrollmentResult.upsert({
          where: { ticketNumber: ticketNumber },
          update: {
            status: status,
            message: message,
            bvn: bvn,
            updatedAt: new Date() // Refresh timestamp to bring it to top
          },
          create: {
            ticketNumber,
            agentCode,
            status,
            message,
            bvn,
            institutionName,
            agentName,
            bmsImportId
          }
        });
        successCount++;
      } catch (dbError) {
        console.error(`DB Error on Line ${i}:`, dbError);
        errorCount++;
      }
    }

    return NextResponse.json({ 
      message: 'Upload processed successfully', 
      stats: { success: successCount, errors: errorCount } 
    });

  } catch (error: any) {
    console.error("Bulk Upload Error:", error);
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
  }
}
