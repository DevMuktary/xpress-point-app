import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import axios from 'axios';

// 🔴 CONFIGURATION
const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const TEMPLATE_NAME = "application__update"; 
const BATCH_SIZE = 1000; 

// 🔴 RUGGED VIDEO LINK
// Since you uploaded 'intro.mp4' to your 'public' folder, this link now works perfectly.
const VIDEO_LINK = "https://xpresspoint.net/intro.mp4";

// Helper to clean phone numbers
function formatPhoneNumber(phone: any): string {
    if (!phone) return '';
    let str = String(phone).replace(/\D/g, ''); 
    if (str.startsWith('0')) {
        str = '234' + str.substring(1);
    }
    return str;
}

// The Sender Function
async function sendTemplateMessage(to: string) {
    const url = `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`;

    const data = {
        messaging_product: "whatsapp",
        to: to,
        type: "template",
        template: {
            name: TEMPLATE_NAME,
            language: { code: "en" }, 
            components: [
                {
                    type: "header",
                    parameters: [
                        {
                            type: "video",
                            video: {
                                link: VIDEO_LINK
                            }
                        }
                    ]
                }
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

export async function GET(req: NextRequest) {
    const startRow = parseInt(req.nextUrl.searchParams.get('start') || '0');
    
    // Locate CSV
    const csvFilePath = path.join(process.cwd(), 'applicants.csv');
    if (!fs.existsSync(csvFilePath)) {
        return NextResponse.json({ error: 'CSV file not found at root.' }, { status: 404 });
    }

    // Read CSV with forced headers
    const applicants = await new Promise<any[]>((resolve, reject) => {
        const results: any[] = [];
        fs.createReadStream(csvFilePath)
            .pipe(csv({ headers: ['phone'] })) 
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (err) => reject(err));
    });

    // Slice Batch
    const endRow = startRow + BATCH_SIZE;
    const batch = applicants.slice(startRow, endRow);

    if (batch.length === 0) {
        return NextResponse.json({ 
            message: "✅ Broadcast Complete. No more records found.", 
            nextStartRow: null 
        });
    }

    console.log(`🚀 Starting Broadcast: Row ${startRow} to ${endRow} (${batch.length} users)`);

    let successCount = 0;
    let failCount = 0;

    // Send Loop
    for (const applicant of batch) {
        const rawPhone = applicant.phone; 
        const cleanPhone = formatPhoneNumber(rawPhone);

        if (cleanPhone.length < 10) {
            failCount++;
            continue;
        }

        try {
            await sendTemplateMessage(cleanPhone);
            successCount++;
        } catch (error: any) {
            // Detailed error logging
            console.error(`Failed ${cleanPhone}:`, JSON.stringify(error.response?.data || error.message, null, 2));
            failCount++;
        }

        // Rate Limit Protection (50ms)
        await new Promise(r => setTimeout(r, 50));
    }

    return NextResponse.json({
        message: "Batch Completed",
        processed: batch.length,
        success: successCount,
        failed: failCount,
        next_batch_link: `/api/admin/whatsapp-blast?start=${endRow}`,
        next_start_row: endRow
    });
}
