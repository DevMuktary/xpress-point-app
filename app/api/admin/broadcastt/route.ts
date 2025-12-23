import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import axios from 'axios';

// 🔴 CONFIGURATION
const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const TEMPLATE_NAME = "application_profile_migration"; 
const BATCH_SIZE = 1000; 

// Helper: Clean Phone Numbers
function formatPhoneNumber(phone: any): string {
    if (!phone) return '';
    let str = String(phone).replace(/\D/g, ''); 
    if (str.startsWith('0')) {
        str = '234' + str.substring(1);
    }
    return str;
}

// Helper: Read CSV (Promisified to fix Build Error)
async function readCsvFile(filePath: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
        const results: any[] = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (error) => reject(error));
    });
}

// 🔴 MAIN ROUTE HANDLER
export async function GET(req: NextRequest) {
    const startRow = parseInt(req.nextUrl.searchParams.get('start') || '0');
    
    // Locate CSV
    const csvFilePath = path.join(process.cwd(), 'applicants.csv');
    if (!fs.existsSync(csvFilePath)) {
        return NextResponse.json({ error: 'CSV file not found at project root.' }, { status: 404 });
    }

    // 1. Read CSV
    const applicants = await readCsvFile(csvFilePath);

    // 2. Slice Batch
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

    // 3. Send Loop
    for (const applicant of batch) {
        // Handle different CSV header names
        const rawPhone = applicant.phone || applicant.Phone || applicant.PhoneNumber || applicant['Phone Number']; 
        const cleanPhone = formatPhoneNumber(rawPhone);

        if (cleanPhone.length < 10) {
            failCount++;
            continue;
        }

        try {
            const url = `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`;
            const data = {
                messaging_product: "whatsapp",
                to: cleanPhone,
                type: "template",
                template: {
                    name: TEMPLATE_NAME,
                    language: { code: "en_US" },
                    components: [
                        // Sending empty header parameters implies using the default static media
                        // associated with the template in Meta Manager.
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
            successCount++;
        } catch (error: any) {
            console.error(`Failed ${cleanPhone}:`, error.response?.data || error.message);
            failCount++;
        }

        // Rate Limit Protection (20ms delay)
        await new Promise(r => setTimeout(r, 20));
    }

    return NextResponse.json({
        message: "Batch Completed",
        processed: batch.length,
        success: successCount,
        failed: failCount,
        nextStartUrl: `${req.nextUrl.origin}/api/admin/broadcast?start=${endRow}`,
        nextStartRow: endRow
    });
}
