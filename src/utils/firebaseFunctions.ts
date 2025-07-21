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
        const response = await fetch('https://us-central1-ai-resume-writer-46403.cloudfunctions.net/parseResumeToStructuredHistoryHttp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
                ...(filePaths && { filePaths })
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`HTTP ${response.status}: ${errorData.error || response.statusText}`);
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Unknown error from server');
        }

        return result.data as StructuredHistory;
    } catch (error) {
        console.error('Error calling parseResumeToStructuredHistoryHttp:', error);
        throw new Error(`Failed to parse resume: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Call the storeStructuredHistoryHttp Firebase function via HTTP
 * to store structured profile data to Firestore
 */
export async function storeStructuredHistoryHttp(userId: string, structuredData: StructuredHistory): Promise<void> {
    try {
        const response = await fetch('https://us-central1-ai-resume-writer-46403.cloudfunctions.net/storeStructuredHistoryHttp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
                structuredData
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`HTTP ${response.status}: ${errorData.error || response.statusText}`);
        }

        const result = await response.json();

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