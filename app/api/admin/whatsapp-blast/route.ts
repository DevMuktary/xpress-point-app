import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import axios from 'axios';

// 🔴 CONFIGURATION
const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
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

// The Sender Function
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
                {
                    type: "header",
                    parameters: [] // Video is embedded in template, no params needed
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

// 🟢 THIS EXPORTS 'GET' so you can run it from the Browser
export async function GET(req: NextRequest) {
    // 1. Get Start Row from URL (e.g. ?start=1000)
    const startRow = parseInt(req.nextUrl.searchParams.get('start') || '0');
    
    // 2. Find CSV at Project Root
    const csvFilePath = path.join(process.cwd(), 'applicants.csv');
    
    if (!fs.existsSync(csvFilePath)) {
        return NextResponse.json({ error: '❌ applicants.csv not found at root folder.' }, { status: 404 });
    }

    // 3. Read CSV
    const applicants = await new Promise<any[]>((resolve, reject) => {
        const results: any[] = [];
        fs.createReadStream(csvFilePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (err) => reject(err));
    });

    // 4. Slice the Batch
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

    // 5. Send Loop
    for (const applicant of batch) {
        // Adjust this if your CSV header is different (e.g. 'Phone Number')
        const rawPhone = applicant.phone || applicant.Phone || applicant.PhoneNumber || applicant['Phone Number']; 
        const cleanPhone = formatPhoneNumber(rawPhone);

        if (cleanPhone.length < 10) {
            failCount++;
            continue;
        }

        try {
            await sendTemplateMessage(cleanPhone);
            successCount++;
        } catch (error: any) {
            console.error(`Failed ${cleanPhone}:`, error.response?.data || error.message);
            failCount++;
        }

        // Rate Limit Protection (50ms delay)
        await new Promise(r => setTimeout(r, 50));
    }

    // 6. Return Result with Next Link
    return NextResponse.json({
        message: "Batch Completed",
        processed: batch.length,
        success: successCount,
        failed: failCount,
        next_batch_link: `/api/admin/whatsapp-blast?start=${endRow}`,
        next_start_row: endRow
    });
}
