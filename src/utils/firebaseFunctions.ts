import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";

// Type definitions
export interface StructuredHistory {
    contactInformation: Record<string, unknown>;
    skills: string[];
    education: Record<string, unknown>[];
    certifications: Record<string, unknown>[];
    jobHistory: Record<string, unknown>[];
}

/**
 * Call the parseResumeToStructuredHistoryHttp Firebase function via HTTP
 * to parse uploaded documents into structured profile data
 */
export async function parseResumeToStructuredHistoryHttp(userId: string, filePaths?: string[]): Promise<StructuredHistory> {
    try {
        // Use emulator URL for local development based on environment variable
        const useEmulator = process.env.NEXT_PUBLIC_FIREBASE_ENV === 'emulator';
        const functionUrl = useEmulator
            ? 'http://localhost:5001/ai-resume-writer-46403/us-central1/parseResumeToStructuredHistoryHttp'
            : 'https://us-central1-ai-resume-writer-46403.cloudfunctions.net/parseResumeToStructuredHistoryHttp';

        console.log('=== parseResumeToStructuredHistoryHttp ===');
        console.log('Using function URL:', functionUrl);
        console.log('Request payload:', { userId, filePaths });

        const requestBody = {
            userId,
            ...(filePaths && { filePaths })
        };

        console.log('Making fetch request...');
        const response = await fetch(functionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        console.log('Response received:');
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
                console.error('Error response data:', errorData);
            } catch (parseError) {
                console.error('Failed to parse error response:', parseError);
                errorData = { error: `HTTP ${response.status} ${response.statusText}` };
            }
            throw new Error(`Failed to parse resume: ${errorData.error || `HTTP ${response.status}`}`);
        }

        const result = await response.json();
        console.log('Successful response:', result);

        if (!result.success) {
            throw new Error(result.error || 'Unknown error from server');
        }

        return result.data as StructuredHistory;
    } catch (error) {
        console.error('=== parseResumeToStructuredHistoryHttp ERROR ===');
        console.error('Error type:', error?.constructor?.name);
        console.error('Error message:', error instanceof Error ? error.message : String(error));
        console.error('Full error:', error);

        // Check if it's a network error
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            throw new Error('Failed to parse resume: Network error - unable to connect to the parsing service. Please check your internet connection and try again.');
        }

        throw new Error(`Failed to parse resume: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Call the storeStructuredHistoryHttp Firebase function via HTTP
 * to store structured profile data to Firestore
 */
export async function storeStructuredHistoryHttp(userId: string, structuredData: StructuredHistory): Promise<void> {
    try {
        // Use emulator URL for local development based on environment variable
        const useEmulator = process.env.NEXT_PUBLIC_FIREBASE_ENV === 'emulator';
        const functionUrl = useEmulator
            ? 'http://localhost:5001/ai-resume-writer-46403/us-central1/storeStructuredHistoryHttp'
            : 'https://us-central1-ai-resume-writer-46403.cloudfunctions.net/storeStructuredHistoryHttp';

        console.log('Storing structured history with URL:', functionUrl);
        console.log('Data to store:', { userId, structuredData });

        const response = await fetch(functionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
                structuredData
            })
        });

        console.log('Store response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Store error response:', errorData);
            throw new Error(`HTTP ${response.status}: ${errorData.error || response.statusText}`);
        }

        const result = await response.json();
        console.log('Store successful response:', result);

        if (!result.success) {
            throw new Error(result.error || 'Unknown error from server');
        }
    } catch (error) {
        console.error('Error calling storeStructuredHistoryHttp:', error);
        throw new Error(`Failed to store structured history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Call the parseResumeToStructuredHistory Firebase function (legacy callable)
 * to parse uploaded documents into structured profile data
 */
export async function parseResumeToStructuredHistory(userId: string, filePaths?: string[]): Promise<StructuredHistory> {
    const parseFunction = httpsCallable(functions, 'parseResumeToStructuredHistory');

    try {
        const result = await parseFunction({
            userId,
            ...(filePaths && { filePaths })
        });

        return result.data as StructuredHistory;
    } catch (error) {
        console.error('Error calling parseResumeToStructuredHistory:', error);
        throw new Error(`Failed to parse resume: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Call the storeStructuredHistory Firebase function (legacy callable)
 * to save structured profile data to Firestore
 */
export async function storeStructuredHistory(userId: string, structuredHistory: StructuredHistory): Promise<void> {
    const storeFunction = httpsCallable(functions, 'storeStructuredHistory');

    try {
        await storeFunction({
            userId,
            structuredHistory
        });
    } catch (error) {
        console.error('Error calling storeStructuredHistory:', error);
        throw new Error(`Failed to store structured history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Call the getStructuredHistory Firebase function
 * to retrieve structured profile data from Firestore
 */
export async function getStructuredHistory(userId: string): Promise<StructuredHistory | null> {
    const getFunction = httpsCallable(functions, 'getStructuredHistory');

    try {
        const result = await getFunction({ userId });
        return result.data as StructuredHistory | null;
    } catch (error) {
        console.error('Error calling getStructuredHistory:', error);
        throw new Error(`Failed to get structured history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

// Job parsing types
export interface ParsedJobData {
    id: string;
    company: string;
    title: string;
    applicationDeadline: string | null;
    status: 'interested' | 'applied' | 'interview' | 'completed';
    dateAdded: string; // ISO string
    url: string | null;
    fullTextPath: string;
    // New fields for generated materials
    hasGeneratedResume?: boolean;
    hasGeneratedCoverLetter?: boolean;
    resumeId?: string;
    coverLetterId?: string;
}

export interface JobParsingResponse {
    success: true;
    jobId: string;
    jobData: ParsedJobData;
}

/**
 * Call the parseJobPostingHttp Firebase function via HTTP
 * to parse job posting text into structured data and store it
 */
export async function parseJobPostingHttp(userId: string, jobAdText: string, url?: string): Promise<JobParsingResponse> {
    try {
        // Use emulator URL for local development based on environment variable
        const useEmulator = process.env.NEXT_PUBLIC_FIREBASE_ENV === 'emulator';
        const functionUrl = useEmulator
            ? 'http://localhost:5001/ai-resume-writer-46403/us-central1/parseJobPostingHttp'
            : 'https://us-central1-ai-resume-writer-46403.cloudfunctions.net/parseJobPostingHttp';

        console.log('=== parseJobPostingHttp ===');
        console.log('Using function URL:', functionUrl);
        console.log('Request payload:', { userId, url, jobAdTextLength: jobAdText.length });

        const requestBody = {
            userId,
            jobAdText,
            url
        };

        const response = await fetch(functionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        const data = await response.json();

        if (!response.ok) {
            if (data.error === 'duplicate') {
                throw new Error(data.message);
            }
            throw new Error(data.message || `HTTP error! status: ${response.status}`);
        }

        console.log('parseJobPostingHttp response:', data);
        return data as JobParsingResponse;

    } catch (error) {
        console.error('Error calling parseJobPostingHttp:', error);
        throw new Error(`Failed to parse job posting: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Fetch all jobs for a user from Firestore
 */
export async function getUserJobs(userId: string): Promise<ParsedJobData[]> {
    try {
        const { collection, query, getDocs, orderBy } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');

        const jobsRef = collection(db, 'users', userId, 'jobs');
        const jobsQuery = query(jobsRef, orderBy('dateAdded', 'desc'));
        const snapshot = await getDocs(jobsQuery);

        const jobs: ParsedJobData[] = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            jobs.push({
                id: doc.id,
                company: data.company,
                title: data.title,
                applicationDeadline: data.applicationDeadline,
                status: data.status,
                dateAdded: data.dateAdded.toDate().toISOString(),
                url: data.url,
                fullTextPath: data.fullTextPath
            });
        });

        console.log(`Fetched ${jobs.length} jobs for user ${userId}`);
        return jobs;

    } catch (error) {
        console.error('Error fetching user jobs:', error);
        throw new Error(`Failed to fetch jobs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Update job status in Firestore
 */
export async function updateJobStatus(userId: string, jobId: string, newStatus: 'interested' | 'applied' | 'interview' | 'completed'): Promise<void> {
    try {
        const { doc, updateDoc } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');

        const jobRef = doc(db, 'users', userId, 'jobs', jobId);
        await updateDoc(jobRef, {
            status: newStatus
        });

        console.log(`Updated job ${jobId} status to: ${newStatus}`);

    } catch (error) {
        console.error('Error updating job status:', error);
        throw new Error(`Failed to update job status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Update job details in Firestore
 */
export async function updateJob(userId: string, jobId: string, updates: Partial<ParsedJobData>): Promise<void> {
    try {
        const { doc, updateDoc } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');

        const jobRef = doc(db, 'users', userId, 'jobs', jobId);
        await updateDoc(jobRef, updates);

        console.log(`Updated job ${jobId} with:`, updates);

    } catch (error) {
        console.error('Error updating job:', error);
        throw new Error(`Failed to update job: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Fetch job text content from Firebase Storage
 */
export async function getJobTextFromStorage(fullTextPath: string): Promise<string> {
    try {
        console.log('=== getJobTextFromStorage ===');
        console.log('Fetching job text from Storage path:', fullTextPath);

        // Import Firebase Storage functions and auth
        const { storage, auth } = await import("@/lib/firebase");
        const { ref, getDownloadURL } = await import("firebase/storage");

        console.log('Firebase imports successful');

        // Check if user is authenticated
        if (!auth.currentUser) {
            throw new Error('User not authenticated');
        }

        console.log('User authenticated:', auth.currentUser.uid);

        // Create a reference to the file
        const fileRef = ref(storage, fullTextPath);
        console.log('File reference created for:', fullTextPath);

        // Get the download URL
        console.log('Getting download URL...');
        const downloadUrl = await getDownloadURL(fileRef);
        console.log('Download URL obtained:', downloadUrl);

        // Fetch the content using the authenticated download URL
        console.log('Fetching content from download URL...');
        const response = await fetch(downloadUrl);

        if (!response.ok) {
            throw new Error(`Failed to fetch job text: ${response.status} ${response.statusText}`);
        }

        const textContent = await response.text();
        console.log('Job text loaded successfully:', textContent.length, 'characters');

        return textContent;

    } catch (error) {
        console.error('=== getJobTextFromStorage ERROR ===');
        console.error('Error details:', error);
        console.error('Full text path:', fullTextPath);
        throw new Error(`Failed to fetch job text: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}