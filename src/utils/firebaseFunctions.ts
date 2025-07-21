import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";

// Type definitions for the function responses
export interface ContactInformation {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    linkedin?: string;
    website?: string;
}

export interface Skills {
    technical?: string[];
    soft?: string[];
    tools?: string[];
    languages?: string[];
}

export interface Education {
    institutions?: Array<{
        institution: string;
        degree: string;
        field?: string;
        graduationYear?: number;
        gpa?: string;
    }>;
}

export interface Certifications {
    certifications?: Array<{
        name: string;
        issuer: string;
        date?: string;
        expirationDate?: string;
    }>;
}

export interface JobHistory {
    positions?: Array<{
        company: string;
        title: string;
        startDate: string;
        endDate?: string;
        description?: string;
        achievements?: string[];
    }>;
}

export interface StructuredHistory extends ContactInformation, Skills, Education, Certifications, JobHistory {
    error?: string;
    corpus?: string;
}

/**
 * Call the parseResumeToStructuredHistory Firebase function
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
 * Call the storeStructuredHistory Firebase function
 * to save structured profile data to Firestore
 */
export async function storeStructuredHistory(userId: string, data: StructuredHistory): Promise<void> {
    const storeFunction = httpsCallable(functions, 'storeStructuredHistory');

    try {
        await storeFunction({
            userId,
            data
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
