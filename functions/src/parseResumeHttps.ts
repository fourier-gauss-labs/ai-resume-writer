import { onRequest } from "firebase-functions/v2/https";
import * as admin from 'firebase-admin';
import * as mammoth from 'mammoth';
import pdfParse from 'pdf-parse';
import { parseContactInformation, parseSkills, parseEducation, parseCertifications, parseJobHistory } from './lib';
import { Request, Response } from "express";
import cors from "cors";

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}

const storage = admin.storage();

// Initialize CORS middleware
const corsHandler = cors({ origin: true });

export const parseResumeToStructuredHistoryHttp = onRequest(async (req: Request, res: Response) => {
    return corsHandler(req, res, async () => {
        try {
            // Only allow POST requests
            if (req.method !== 'POST') {
                res.status(405).json({ error: 'Method not allowed' });
                return;
            }

            console.log('=== parseResumeToStructuredHistoryHttp called ===');
            console.log('Request body:', JSON.stringify(req.body, null, 2));

            const { userId } = req.body;

            if (!userId) {
                res.status(400).json({ error: 'Missing userId parameter' });
                return;
            }

            console.log('Processing files for user:', userId);

            // Get the default bucket
            const bucket = storage.bucket();

            // List files in the user's folder
            const [files] = await bucket.getFiles({
                prefix: `uploads/${userId}/`
            });

            if (files.length === 0) {
                console.log('No files found in storage for user:', userId);
                res.status(404).json({ error: 'No files found in storage' });
                return;
            }

            console.log(`Found ${files.length} files in storage`);

            let allStructuredData = {
                contactInformation: {},
                skills: [] as string[],
                education: [] as any[],
                certifications: [] as any[],
                jobHistory: [] as any[]
            };

            // Process each file
            for (const file of files) {
                try {
                    console.log(`Processing file: ${file.name}`);

                    // Download file content
                    const [fileBuffer] = await file.download();
                    let extractedText = '';

                    // Extract text based on file type
                    if (file.name.endsWith('.pdf')) {
                        const pdfData = await pdfParse(fileBuffer);
                        extractedText = pdfData.text;
                    } else if (file.name.endsWith('.docx')) {
                        const result = await mammoth.extractRawText({ buffer: fileBuffer });
                        extractedText = result.value;
                    } else if (file.name.endsWith('.txt')) {
                        extractedText = fileBuffer.toString('utf-8');
                    } else {
                        console.log(`Skipping unsupported file type: ${file.name}`);
                        continue;
                    }

                    if (!extractedText.trim()) {
                        console.log(`No text extracted from file: ${file.name}`);
                        continue;
                    }

                    console.log(`Extracted ${extractedText.length} characters from ${file.name}`);

                    // Parse different sections using AI
                    try {
                        console.log('Parsing contact information...');
                        const contactInfo = await parseContactInformation(extractedText);
                        if (contactInfo && contactInfo.contactInformation && Object.keys(contactInfo.contactInformation).length > 0) {
                            // Merge contact information properly (extract from nested structure)
                            Object.assign(allStructuredData.contactInformation, contactInfo.contactInformation);
                        }

                        console.log('Parsing skills...');
                        const skills = await parseSkills(extractedText);
                        if (skills && skills.skills && Array.isArray(skills.skills) && skills.skills.length > 0) {
                            allStructuredData.skills.push(...skills.skills);
                        }

                        console.log('Parsing education...');
                        const education = await parseEducation(extractedText);
                        if (education && education.education && Array.isArray(education.education) && education.education.length > 0) {
                            allStructuredData.education.push(...education.education);
                        }

                        console.log('Parsing certifications...');
                        const certifications = await parseCertifications(extractedText);
                        if (certifications && certifications.certifications && Array.isArray(certifications.certifications) && certifications.certifications.length > 0) {
                            allStructuredData.certifications.push(...certifications.certifications);
                        }

                        console.log('Parsing job history...');
                        const jobHistory = await parseJobHistory(extractedText);
                        if (jobHistory && jobHistory.jobHistory && Array.isArray(jobHistory.jobHistory) && jobHistory.jobHistory.length > 0) {
                            allStructuredData.jobHistory.push(...jobHistory.jobHistory);
                        }

                    } catch (parseError) {
                        console.error(`Error parsing file ${file.name}:`, parseError);
                        // Continue with other files
                    }

                } catch (fileError) {
                    console.error(`Error processing file ${file.name}:`, fileError);
                    // Continue with other files
                }
            }

            // Remove duplicates from arrays
            allStructuredData.skills = [...new Set(allStructuredData.skills)];

            console.log('=== Final structured data ===');
            console.log(JSON.stringify(allStructuredData, null, 2));

            res.status(200).json({
                success: true,
                data: allStructuredData,
                filesProcessed: files.length
            });

        } catch (error) {
            console.error('Error in parseResumeToStructuredHistoryHttp:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
});
