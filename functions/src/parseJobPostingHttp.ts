import { onRequest } from "firebase-functions/v2/https";
import * as admin from 'firebase-admin';
import { Request, Response } from "express";
import cors from "cors";
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}

const firestore = admin.firestore();
const storage = admin.storage();

// Initialize CORS middleware
const corsHandler = cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'https://ai-resume-writer-46403.web.app'],
    credentials: true
});

// Initialize Google AI
const getGenAI = () => {
    const apiKey = process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY environment variable is required');
    }
    return new GoogleGenerativeAI(apiKey);
};

interface JobParsingRequest {
    userId: string;
    jobAdText: string;
    url?: string;
}

interface ParsedJobData {
    company: string;
    title: string;
    applicationDeadline?: string;
}

interface JobDocument {
    company: string;
    title: string;
    applicationDeadline: string | null;
    status: 'interested';
    dateAdded: admin.firestore.Timestamp;
    url: string | null;
    fullTextPath: string;
}

async function parseJobPostingWithAI(jobText: string): Promise<ParsedJobData> {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
Parse the following job posting and extract the key information. Return a JSON object with exactly these fields:

- company: The company name (if not found, use "unknown")
- title: The job title/position (if not found, use "unknown")
- applicationDeadline: The application deadline if mentioned (in YYYY-MM-DD format if possible, otherwise the exact text from the posting, or null if not mentioned)

Only return the JSON object, no other text.

Job Posting Text:
${jobText}
`;

    try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        console.log('Gemini response:', responseText);

        // Parse JSON response
        const cleanedResponse = responseText.replace(/```json\n?|\n?```/g, '').trim();
        const parsedData = JSON.parse(cleanedResponse) as ParsedJobData;

        // Ensure required fields have fallback values
        return {
            company: parsedData.company || 'unknown',
            title: parsedData.title || 'unknown',
            applicationDeadline: parsedData.applicationDeadline || undefined
        };

    } catch (error) {
        console.error('Error parsing job with AI:', error);
        // Return fallback data if AI parsing fails
        return {
            company: 'unknown',
            title: 'unknown',
            applicationDeadline: undefined
        };
    }
}

async function checkForDuplicateJob(userId: string, company: string, title: string): Promise<boolean> {
    try {
        const jobsRef = firestore.collection('users').doc(userId).collection('jobs');
        const snapshot = await jobsRef
            .where('company', '==', company)
            .where('title', '==', title)
            .limit(1)
            .get();

        return !snapshot.empty;
    } catch (error) {
        console.error('Error checking for duplicate job:', error);
        return false; // If check fails, proceed with adding the job
    }
}

async function storeJobTextInStorage(userId: string, jobId: string, jobText: string): Promise<string> {
    const bucket = storage.bucket();
    const fileName = `uploads/${userId}/jobs/${jobId}.txt`;
    const file = bucket.file(fileName);

    await file.save(jobText, {
        metadata: {
            contentType: 'text/plain',
        },
    });

    return fileName;
}

export const parseJobPostingHttp = onRequest(
    {
        timeoutSeconds: 60, // 1 minute timeout
        memory: '256MiB'
    },
    async (req: Request, res: Response) => {
        return corsHandler(req, res, async () => {
            try {
                // Only allow POST requests
                if (req.method !== 'POST') {
                    res.status(405).json({ error: 'Method not allowed' });
                    return;
                }

                console.log('=== parseJobPostingHttp called ===');
                console.log('Request body:', JSON.stringify(req.body, null, 2));

                const { userId, jobAdText, url }: JobParsingRequest = req.body;

                // Validate required fields
                if (!userId || !jobAdText) {
                    res.status(400).json({ error: 'Missing required fields: userId and jobAdText' });
                    return;
                }

                if (!jobAdText.trim()) {
                    res.status(400).json({ error: 'Job advertisement text cannot be empty' });
                    return;
                }

                console.log('Parsing job posting for user:', userId);

                // Parse job posting with AI
                const parsedData = await parseJobPostingWithAI(jobAdText);
                console.log('Parsed job data:', parsedData);

                // Check for duplicate jobs (only if we have real company/title, not "unknown")
                if (parsedData.company !== 'unknown' && parsedData.title !== 'unknown') {
                    const isDuplicate = await checkForDuplicateJob(userId, parsedData.company, parsedData.title);
                    if (isDuplicate) {
                        res.status(409).json({
                            error: 'duplicate',
                            message: `Job "${parsedData.title}" at "${parsedData.company}" already exists in your pipeline.`
                        });
                        return;
                    }
                }

                // Create job document
                const jobsRef = firestore.collection('users').doc(userId).collection('jobs');
                const jobDocRef = jobsRef.doc(); // Auto-generate ID
                const jobId = jobDocRef.id;

                // Store full job text in Firebase Storage
                const fullTextPath = await storeJobTextInStorage(userId, jobId, jobAdText);

                // Create job document
                const jobDocument: JobDocument = {
                    company: parsedData.company,
                    title: parsedData.title,
                    applicationDeadline: parsedData.applicationDeadline || null,
                    status: 'interested',
                    dateAdded: admin.firestore.Timestamp.now(),
                    url: url || null,
                    fullTextPath: fullTextPath
                };

                // Save to Firestore
                await jobDocRef.set(jobDocument);

                console.log('Job added successfully:', jobId);

                // Return success response with job data
                res.status(200).json({
                    success: true,
                    jobId: jobId,
                    jobData: {
                        id: jobId,
                        ...jobDocument,
                        dateAdded: jobDocument.dateAdded.toDate().toISOString()
                    }
                });

            } catch (error) {
                console.error('Error in parseJobPostingHttp:', error);
                res.status(500).json({
                    error: 'Internal server error',
                    message: error instanceof Error ? error.message : 'Unknown error occurred'
                });
            }
        });
    }
);
