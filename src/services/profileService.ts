import { auth } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

// Firebase error interface
interface FirebaseError extends Error {
    code?: string;
    details?: unknown;
}

// Firebase function response interface
interface StructuredHistoryResponse {
    skills?: string[];
    education?: Education[];
    certifications?: Certification[];
    jobHistory?: JobHistory[];
    contactInformation?: {
        fullName: string;
        email: string[];
        phone: string[];
        address: string;
        linkedinUrl: string;
        portfolioUrl: string;
        githubUrl: string;
    };
}

export interface ContactInformation {
    fullName?: string;
    email?: string;
    emails?: string[]; // For backward compatibility
    phone?: string;
    phones?: string[]; // For backward compatibility
    address?: string;
    linkedinUrl?: string;
    portfolioUrl?: string;
    githubUrl?: string;
}

export interface Skill {
    skill: string;
    proficiency?: string;
    category?: string;
}

export interface Education {
    degree: string;
    school: string;
    duration?: string;
    startDate?: string;
    endDate?: string;
    gpa?: string;
    honors?: string;
    relevantCoursework?: string[];
}

export interface Certification {
    name: string;
    issuer: string;
    date?: string;
    expirationDate?: string;
    credentialId?: string;
    url?: string;
}

export interface JobHistory {
    title: string;
    company: string;
    startDate?: string;
    endDate?: string;
    duration?: string;
    location?: string;
    description?: string;
    achievements?: string[];
    responsibilities?: string[];
}

export interface UserProfile {
    contactInformation: ContactInformation;
    skills: string[];
    education: Education[];
    certifications: Certification[];
    jobHistory: JobHistory[];
}

export class ProfileService {
    private static instance: ProfileService;
    private cachedProfile: UserProfile | null = null;
    private cacheTimestamp: number = 0;
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    static getInstance(): ProfileService {
        if (!ProfileService.instance) {
            ProfileService.instance = new ProfileService();
        }
        return ProfileService.instance;
    }

    private constructor() { }

    /**
     * Get the complete user profile from Firebase
     */
    async getUserProfile(forceRefresh: boolean = false): Promise<UserProfile> {
        const now = Date.now();

        // Return cached profile if still valid
        if (!forceRefresh && this.cachedProfile && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
            console.log('ProfileService: Returning cached profile');
            return this.cachedProfile;
        }

        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error('User not authenticated. Please log in to generate resumes.');
            }

            console.log('ProfileService: Fetching profile for user:', user.uid);

            // Use the existing getStructuredHistoryHttp function
            const getStructuredHistory = httpsCallable(functions, 'getStructuredHistoryHttp');

            console.log('ProfileService: Calling getStructuredHistoryHttp...');
            let response;
            try {
                response = await getStructuredHistory({ userId: user.uid });
                console.log('ProfileService: Firebase response received:', {
                    hasData: !!response.data,
                    dataKeys: response.data ? Object.keys(response.data) : []
                });
            } catch (firebaseError) {
                console.error('ProfileService: Firebase function error:', firebaseError);
                console.error('ProfileService: Firebase error details:', {
                    code: (firebaseError as FirebaseError)?.code,
                    message: (firebaseError as FirebaseError)?.message,
                    details: (firebaseError as FirebaseError)?.details
                });
                throw new Error(`Firebase function error: ${(firebaseError as FirebaseError)?.message || 'Unknown Firebase error'}`);
            }

            const data = response.data as StructuredHistoryResponse;

            if (!data) {
                throw new Error('No profile data found in Firebase. Please upload your resume or enter your profile information first.');
            }

            console.log('ProfileService: Raw Firebase data:', {
                contactInformation: data.contactInformation,
                skillsCount: data.skills?.length || 0,
                educationCount: data.education?.length || 0,
                certificationsCount: data.certifications?.length || 0,
                jobHistoryCount: data.jobHistory?.length || 0
            });

            // Extract contact information directly (no nested structure)
            const contactData = data.contactInformation;
            const flatContactInfo: ContactInformation = {
                fullName: contactData?.fullName || '',
                email: Array.isArray(contactData?.email) && contactData.email.length > 0
                    ? contactData.email[0]
                    : (typeof contactData?.email === 'string' ? contactData.email : ''),
                emails: Array.isArray(contactData?.email)
                    ? contactData.email
                    : (contactData?.email ? [contactData.email] : []),
                phone: Array.isArray(contactData?.phone) && contactData.phone.length > 0
                    ? contactData.phone[0]
                    : (typeof contactData?.phone === 'string' ? contactData.phone : ''),
                phones: Array.isArray(contactData?.phone)
                    ? contactData.phone
                    : (contactData?.phone ? [contactData.phone] : []),
                address: contactData?.address || '',
                linkedinUrl: contactData?.linkedinUrl || '',
                portfolioUrl: contactData?.portfolioUrl || '',
                githubUrl: contactData?.githubUrl || ''
            };

            const profile: UserProfile = {
                contactInformation: flatContactInfo,
                skills: data.skills || [],
                education: data.education || [],
                certifications: data.certifications || [],
                jobHistory: data.jobHistory || []
            };

            // Check contact info more thoroughly
            const hasContactName = flatContactInfo.fullName && flatContactInfo.fullName.trim().length > 0;
            const hasContactEmail = flatContactInfo.email && flatContactInfo.email.trim().length > 0;

            // Check if we have any meaningful data
            const hasAnyData = (
                hasContactName ||
                hasContactEmail ||
                (data.skills && data.skills.length > 0) ||
                (data.education && data.education.length > 0) ||
                (data.certifications && data.certifications.length > 0) ||
                (data.jobHistory && data.jobHistory.length > 0)
            );

            if (!hasAnyData) {
                console.warn('ProfileService: No meaningful profile data found');
                console.warn('ProfileService: Data breakdown:', {
                    hasContactName,
                    hasContactEmail,
                    contactInfoKeys: Object.keys(flatContactInfo),
                    skillsLength: data.skills?.length || 0,
                    educationLength: data.education?.length || 0,
                    jobHistoryLength: data.jobHistory?.length || 0
                });
                throw new Error('Your profile appears to be empty. Please upload your resume or enter your information to generate resumes.');
            }

            // Special warning if we have data but no contact info
            if (!hasContactName && !hasContactEmail && ((data.skills?.length || 0) > 0 || (data.jobHistory?.length || 0) > 0)) {
                console.warn('ProfileService: Profile data exists but missing essential contact information');
                throw new Error('Profile found but missing contact information (name/email). Please update your profile with your basic contact details.');
            }

            // Cache the profile
            this.cachedProfile = profile;
            this.cacheTimestamp = now;

            console.log('ProfileService: Profile fetched successfully', {
                contactInfo: !!profile.contactInformation.fullName,
                skills: profile.skills.length,
                education: profile.education.length,
                certifications: profile.certifications.length,
                jobHistory: profile.jobHistory.length
            });

            return profile;

        } catch (error) {
            console.error('ProfileService: Error fetching profile:', error);

            // Log more detailed error information
            if (error && typeof error === 'object') {
                console.error('ProfileService: Error details:', {
                    name: (error as Error).name,
                    code: (error as FirebaseError).code,
                    message: (error as Error).message,
                    stack: (error as Error).stack?.substring(0, 500)
                });
            }

            // Provide user-friendly error messages
            let userMessage = 'Unknown error occurred';

            if (error instanceof Error) {
                if (error.message.includes('User not authenticated')) {
                    userMessage = 'Please log in to generate resumes';
                } else if (error.message.includes('No profile data found')) {
                    userMessage = 'No profile data found. Please upload your resume or enter your information first.';
                } else if (error.message.includes('Profile found but missing contact information')) {
                    userMessage = 'Profile found but missing contact information (name/email). Please update your profile with your basic contact details.';
                } else if (error.message.includes('profile appears to be empty')) {
                    userMessage = 'Your profile appears to be empty. Please upload your resume or enter your information to generate resumes.';
                } else if (error.message.includes('permission-denied') || error.message.includes('Permission denied')) {
                    userMessage = 'Access denied. Please check your account permissions.';
                } else if (error.message.includes('network') || error.message.includes('offline')) {
                    userMessage = 'Network error. Please check your connection and try again.';
                } else if (error.message.includes('functions/internal') || error.message.includes('INTERNAL')) {
                    userMessage = 'Internal server error. Please try again in a moment.';
                } else {
                    userMessage = error.message;
                }
            }

            // Re-throw with more context
            throw new Error(`ProfileService: ${userMessage}`);
        }
    }

    /**
     * Check if user has complete profile data
     */
    async hasCompleteProfile(): Promise<boolean> {
        try {
            const profile = await this.getUserProfile();

            return !!(
                profile.contactInformation.fullName &&
                profile.contactInformation.email &&
                profile.skills.length > 0 &&
                (profile.education.length > 0 || profile.jobHistory.length > 0)
            );
        } catch {
            return false;
        }
    }

    /**
     * Get profile readiness status for resume generation
     */
    async getProfileReadiness(): Promise<{
        isReady: boolean;
        missing: string[];
        summary: {
            hasContactInfo: boolean;
            hasSkills: boolean;
            hasEducation: boolean;
            hasCertifications: boolean;
            hasJobHistory: boolean;
        };
    }> {
        const profile = await this.getUserProfile();
        const missing: string[] = [];

        const hasContactInfo = !!(profile.contactInformation.fullName && profile.contactInformation.email);
        const hasSkills = profile.skills.length > 0;
        const hasEducation = profile.education.length > 0;
        const hasCertifications = profile.certifications.length > 0;
        const hasJobHistory = profile.jobHistory.length > 0;

        if (!hasContactInfo) missing.push('Contact Information');
        if (!hasSkills) missing.push('Skills');
        if (!hasEducation && !hasJobHistory) missing.push('Education or Work Experience');

        return {
            isReady: missing.length === 0,
            missing,
            summary: {
                hasContactInfo,
                hasSkills,
                hasEducation,
                hasCertifications,
                hasJobHistory
            }
        };
    }

    /**
     * Clear the cached profile data (useful for refresh operations)
     */
    clearCache(): void {
        this.cachedProfile = null;
        this.cacheTimestamp = 0;
        console.log('ProfileService: Cache cleared');
    }
}

// Export singleton instance
export const profileService = ProfileService.getInstance();
