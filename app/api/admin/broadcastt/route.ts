import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import axios from 'axios';

// 🔴 CONFIGURATION
const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
// The template name must match exactly what you approved in Meta
const TEMPLATE_NAME = "application_update"; 
const BATCH_SIZE = 1000; 

// Helper to clean phone numbers
function formatPhoneNumber(phone: any): string {
    if (!phone) return '';
    let str = String(phone).replace(/\D/g, ''); 
    if (str.startsWith('0')) {
        str = '234' + str.substring(1);
    }
    return str;
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
            language: { code: "en_US" },
            components: [
                // Empty header component because video is already embedded in the template
                {
                    type: "header",
                    parameters: [] 
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
    
    const csvFilePath = path.join(process.cwd(), 'applicants.csv');
    
    if (!fs.existsSync(csvFilePath)) {
        return NextResponse.json({ error: 'CSV file not found at root.' }, { status: 404 });
    }

    // 1. Read the CSV first (Wait for it to finish)
    const applicants = await new Promise<any[]>((resolve, reject) => {
        const results: any[] = [];
        fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (error) => reject(error));
    });

    // 2. Slice the Batch
    const endRow = startRow + BATCH_SIZE;
    const batch = applicants.slice(startRow, endRow);

    if (batch.length === 0) {
        return NextResponse.json({ 
            message: "✅ Broadcast Complete. No more records.", 
            nextStartRow: null 
        });
    }

    console.log(`🚀 Starting Broadcast: Row ${startRow} to ${endRow} (${batch.length} users)`);

    let successCount = 0;
    let failCount = 0;

    // 3. Process the Batch
    for (const applicant of batch) {
        // Handle different possible CSV header names
        const rawPhone = applicant.phone || applicant.Phone || applicant.PhoneNumber || applicant['Phone Number']; 
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

        // Rate Limit Protection (50ms delay)
        await new Promise(r => setTimeout(r, 50));
    }

    // 4. Return the Response (This fixes the build error)
    return NextResponse.json({
        message: "Batch Completed",
        processed: batch.length,
        success: successCount,
        failed: failCount,
        nextStartUrl: `/api/admin/broadcast?start=${endRow}`,
        nextStartRow: endRow
    });
}
