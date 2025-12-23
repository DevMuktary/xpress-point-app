import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import axios from 'axios';

// 🔴 CONFIGURATION
// Ensure these ENV variables are set in Railway
const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const TEMPLATE_NAME = "application_update"; // Confirm this name matches exactly in Meta
const BATCH_SIZE = 1000; // Safety limit per run

// Helper to clean phone numbers
function formatPhoneNumber(phone: any): string {
    if (!phone) return '';
    let str = String(phone).replace(/\D/g, ''); // Remove non-digits
    if (str.startsWith('0')) {
        str = '234' + str.substring(1);
    }
    return str;
}

export async function GET(req: NextRequest) {
    // 1. Security Check (Optional: Add a secret key query param if you want extra safety)
    // const secret = req.nextUrl.searchParams.get('secret');
    // if (secret !== 'MY_RUGGED_SECRET') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 2. Get Start Row from URL (e.g. ?start=1000)
    const startRow = parseInt(req.nextUrl.searchParams.get('start') || '0');
    
    // 3. Locate CSV File
    const csvFilePath = path.join(process.cwd(), 'applicants.csv');
    if (!fs.existsSync(csvFilePath)) {
        return NextResponse.json({ error: 'CSV file not found at root.' }, { status: 404 });
    }

    const applicants: any[] = [];

    // 4. Read CSV
    return new Promise((resolve) => {
        fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on('data', (data) => applicants.push(data))
            .on('end', async () => {
                
                // 5. Slice Batch
                const endRow = startRow + BATCH_SIZE;
                const batch = applicants.slice(startRow, endRow);

                if (batch.length === 0) {
                    resolve(NextResponse.json({ 
                        message: "✅ Broadcast Complete. No more records.", 
                        nextStartRow: null 
                    }));
                    return;
                }

                console.log(`🚀 Starting Broadcast: Row ${startRow} to ${endRow} (${batch.length} users)`);

                let successCount = 0;
                let failCount = 0;

                // 6. Send Loop
                for (const applicant of batch) {
                    // Adjust 'phone' to match your CSV header column name
                    const rawPhone = applicant.phone || applicant.Phone || applicant.PhoneNumber; 
                    const cleanPhone = formatPhoneNumber(rawPhone);

                    if (cleanPhone.length < 10) {
                        failCount++;
                        continue;
                    }

                    try {
                        await sendTemplateMessage(cleanPhone);
                        successCount++;
                    } catch (error) {
                        console.error(`Failed ${cleanPhone}:`, error);
                        failCount++;
                    }

                    // ⚡ Rate Limit Protection: 20 messages/sec (50ms delay)
                    await new Promise(r => setTimeout(r, 50));
                }

                // 7. Response
                resolve(NextResponse.json({
                    message: "Batch Completed",
                    processed: batch.length,
                    success: successCount,
                    failed: failCount,
                    nextStartUrl: `/api/admin/broadcast?start=${endRow}`,
                    nextStartRow: endRow
                }));
            });
    });
}

// 🔴 THE SENDER FUNCTION
async function sendTemplateMessage(to: string) {
    const url = `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`;

    const data = {
        messaging_product: "whatsapp",
        to: to,
        type: "template",
        template: {
            name: TEMPLATE_NAME,
            language: { code: "en_US" }, // Change to "en_GB" if that's what you submitted
            components: [
                // Since video is ALREADY in the template header, we don't send a link.
                // We send an empty header component just to define the type if required, 
                // but usually for pre-uploaded media templates, you just omit parameters 
                // OR you might need to re-upload the media ID if it's dynamic.
                // IF the media is static (part of template approval), you don't need 'parameters'.
                {
                    type: "header",
                    parameters: [] 
                },
                // If you have body variables like {{1}}, add them here:
                // {
                //     type: "body",
                //     parameters: [ { type: "text", text: "User Name" } ]
                // }
            ]
        }
    };

    await axios.post(url, data, {
        headers: {
            'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json'
        }
    });
}
