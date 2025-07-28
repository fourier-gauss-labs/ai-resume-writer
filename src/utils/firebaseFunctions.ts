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