'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/authContext';

interface ContactInformation {
    fullName: string;
    email: string[];
    phones: string[];
}

interface JobHistoryItem {
    title: string;
    company: string;
    startDate: { month: string; year: string };
    endDate: { month: string; year: string };
    currentlyWorking: boolean;
    jobDescription: string;
    accomplishments: string[];
}

interface EducationItem {
    school: string;
    degree: string;
    startDate: { month: string; year: string };
    endDate: { month: string; year: string };
    grade?: string;
}

interface CertificationItem {
    certName: string;
    issuer: string;
    issuedDate: { month: string; year: string };
    credentialId?: string;
}

interface StructuredHistoryData {
    contactInformation: ContactInformation | null;
    jobHistory: JobHistoryItem[];
    education: EducationItem[];
    certifications: CertificationItem[];
    skills: string[];
}

interface UseStructuredHistoryReturn {
    data: StructuredHistoryData;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useStructuredHistory(): UseStructuredHistoryReturn {
    const { user } = useAuth();
    const [data, setData] = useState<StructuredHistoryData>({
        contactInformation: null,
        jobHistory: [],
        education: [],
        certifications: [],
        skills: []
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchStructuredHistory = useCallback(async () => {
        if (!user) {
            setError('User not authenticated');
            return;
        }

        console.log('=== useStructuredHistory fetchStructuredHistory called ===');
        console.log('User ID:', user.uid);

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(
                `https://us-central1-ai-resume-writer-46403.cloudfunctions.net/getStructuredHistoryHttp?userId=${user.uid}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            console.log('=== useStructuredHistory response ===');
            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            if (!response.ok) {
                throw new Error(`Failed to fetch structured history: ${response.statusText}`);
            }

            const result = await response.json();
            console.log('=== useStructuredHistory result ===');
            console.log('Raw result:', result);

            // Extract the actual data from the wrapped response
            const actualData = result.data || {};
            console.log('Extracted data:', actualData);

            // Transform the data to match our interface
            // Handle both flat and nested contactInformation structures
            let contactInfo = actualData.contactInformation;
            if (contactInfo && contactInfo.contactInformation) {
                // If nested, extract the inner contactInformation
                contactInfo = contactInfo.contactInformation;
            }

            console.log('Transformed contactInfo:', contactInfo);

            const transformedData: StructuredHistoryData = {
                contactInformation: contactInfo || null,
                jobHistory: actualData.jobHistory || [],
                education: actualData.education || [],
                certifications: actualData.certifications || [],
                skills: actualData.skills || []
            };

            console.log('=== useStructuredHistory final transformed data ===');
            console.log('Final data:', transformedData);

            setData(transformedData);
        } catch (err) {
            console.error('=== useStructuredHistory error ===');
            console.error('Error:', err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchStructuredHistory();
        } else {
            // Reset data when user logs out
            setData({
                contactInformation: null,
                jobHistory: [],
                education: [],
                certifications: [],
                skills: []
            });
            setError(null);
        }
    }, [user, fetchStructuredHistory]);

    return {
        data,
        isLoading,
        error,
        refetch: fetchStructuredHistory
    };
}
