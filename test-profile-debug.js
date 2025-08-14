/**
 * Test script to debug the Firebase error in profile service
 */

// Mock Firebase auth for testing
const mockAuth = {
    currentUser: {
        uid: 'test-user-123'
    }
};

// Mock Firebase functions
const mockFunctions = {};

// Mock Firebase httpsCallable
function httpsCallable(functions, functionName) {
    return async (data) => {
        console.log(`📞 Mock calling ${functionName} with data:`, data);

        if (functionName === 'getStructuredHistoryHttp') {
            // Simulate the actual Firebase response structure
            console.log('📁 Simulating Firebase response...');

            // Check if we should simulate an error
            if (data.userId === 'error-user') {
                throw new Error('Firebase Error: Permission denied');
            }

            // Return mock profile data
            return {
                data: {
                    contactInformation: {
                        fullName: 'Jane Developer',
                        email: 'jane.developer@email.com',
                        phone: '(555) 987-6543',
                        address: 'Austin, TX'
                    },
                    skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'AWS'],
                    education: [{
                        degree: 'Bachelor of Computer Science',
                        school: 'University of Texas',
                        duration: '2018-2022'
                    }],
                    certifications: [{
                        name: 'AWS Developer Associate',
                        issuer: 'Amazon Web Services',
                        date: '2023'
                    }],
                    jobHistory: [{
                        title: 'Software Developer',
                        company: 'Tech Startup Inc',
                        startDate: '2022-06-01',
                        endDate: 'present',
                        achievements: [
                            'Built React applications serving 10,000+ users',
                            'Improved API performance by 40%',
                            'Led code reviews and mentored junior developers'
                        ]
                    }]
                }
            };
        }

        throw new Error(`Unknown function: ${functionName}`);
    };
}

// Test the ProfileService logic
class TestProfileService {
    constructor() {
        this.cachedProfile = null;
        this.cacheTimestamp = 0;
        this.CACHE_DURATION = 5 * 60 * 1000;
    }

    async getUserProfile(forceRefresh = false) {
        const now = Date.now();

        if (!forceRefresh && this.cachedProfile && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
            console.log('✅ ProfileService: Returning cached profile');
            return this.cachedProfile;
        }

        try {
            const user = mockAuth.currentUser;
            if (!user) {
                throw new Error('User not authenticated');
            }

            console.log('🔍 ProfileService: Fetching profile for user:', user.uid);

            const getStructuredHistory = httpsCallable(mockFunctions, 'getStructuredHistoryHttp');
            const response = await getStructuredHistory({ userId: user.uid });

            const data = response.data;

            if (!data) {
                throw new Error('No profile data found');
            }

            const profile = {
                contactInformation: data.contactInformation || {},
                skills: data.skills || [],
                education: data.education || [],
                certifications: data.certifications || [],
                jobHistory: data.jobHistory || []
            };

            this.cachedProfile = profile;
            this.cacheTimestamp = now;

            console.log('✅ ProfileService: Profile fetched successfully', {
                contactInfo: !!profile.contactInformation.fullName,
                skills: profile.skills.length,
                education: profile.education.length,
                certifications: profile.certifications.length,
                jobHistory: profile.jobHistory.length
            });

            return profile;

        } catch (error) {
            console.error('❌ ProfileService: Error fetching profile:', error);

            // Log more detailed error information
            if (error && typeof error === 'object') {
                console.error('📋 ProfileService: Error details:', {
                    name: error.name,
                    code: error.code,
                    message: error.message,
                    stack: error.stack?.substring(0, 500)
                });
            }

            throw new Error(`ProfileService failed to fetch profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getProfileReadiness() {
        const profile = await this.getUserProfile();
        const missing = [];

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
}

async function runTest() {
    console.log('🧪 Testing ProfileService with Firebase integration...\n');

    const profileService = new TestProfileService();

    try {
        console.log('1️⃣ Testing normal profile fetch...');
        const profile = await profileService.getUserProfile();
        console.log('✅ Profile fetch successful:', {
            name: profile.contactInformation.fullName,
            skillsCount: profile.skills.length,
            jobCount: profile.jobHistory.length
        });

        console.log('\n2️⃣ Testing profile readiness...');
        const readiness = await profileService.getProfileReadiness();
        console.log('✅ Profile readiness:', readiness);

        console.log('\n3️⃣ Testing cache functionality...');
        await profileService.getUserProfile();
        console.log('✅ Cache test successful');

        console.log('\n4️⃣ Testing error scenario...');
        mockAuth.currentUser.uid = 'error-user';

        try {
            await profileService.getUserProfile(true); // force refresh
            console.log('❌ Expected error but got success');
        } catch (error) {
            console.log('✅ Error handling test successful:', error.message);
        }

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

runTest();
