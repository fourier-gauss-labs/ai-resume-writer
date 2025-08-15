'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/authContext';
import { profileService } from '@/services/profileService';

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

            if (!response.ok) {
                throw new Error(`Failed to fetch structured history: ${response.statusText}`);
            }

            const result = await response.json();

            // Extract the actual data from the wrapped response
            const actualData = result.data || {};

            // Transform the data to match our interface
            // Handle both flat and nested contactInformation structures
            let contactInfo = null;

            if (actualData.contactInformation && actualData.contactInformation.contactInformation) {
                // Extract the nested contactInformation and map to simple structure
                const firebaseContact = actualData.contactInformation.contactInformation;
                contactInfo = {
                    fullName: firebaseContact.fullName || '',
                    email: Array.isArray(firebaseContact.email) ? firebaseContact.email : [],
                    phones: Array.isArray(firebaseContact.phone)
                        ? firebaseContact.phone
                        : (firebaseContact.phone ? [firebaseContact.phone] : [])
                };
            } else if (actualData.contactInformation) {
                // Handle flat structure
                contactInfo = {
                    fullName: actualData.contactInformation.fullName || '',
                    email: Array.isArray(actualData.contactInformation.email) ? actualData.contactInformation.email : [],
                    phones: Array.isArray(actualData.contactInformation.phone)
                        ? actualData.contactInformation.phone
                        : (actualData.contactInformation.phone ? [actualData.contactInformation.phone] : [])
                };
            }

            const transformedData: StructuredHistoryData = {
                contactInformation: contactInfo || null,
                jobHistory: actualData.jobHistory || [],
                education: actualData.education || [],
                certifications: actualData.certifications || [],
                skills: actualData.skills || []
            };

            setData(transformedData);
        } catch (err) {
            console.error('Error fetching structured history:', err);
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

    // Create a refetch function that clears ProfileService cache first
    const refetch = useCallback(async () => {
        profileService.clearCache();
        await fetchStructuredHistory();
    }, [fetchStructuredHistory]);

    return {
        data,
        isLoading,
        error,
        refetch: refetch
    };
}
