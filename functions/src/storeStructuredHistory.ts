import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

// For emulator use, connect Firestore to the emulator
if (process.env.FUNCTIONS_EMULATOR) {
    // This ensures Firestore connects to the emulator
    db.settings({
        host: '127.0.0.1:8080',
        ssl: false,
        ignoreUndefinedProperties: true
    });
}

/**
 * Helper to extract payload from Firebase callable function data.
 * Handles both emulator and production SDK quirks.
 */
function extractPayload(data: any) {
    // Emulator sometimes wraps payload in a 'data' property
    if (data && typeof data === 'object') {
        if ('userId' in data || 'structuredHistory' in data) {
            return data;
        }
        if ('data' in data && (typeof data.data === 'object')) {
            return data.data;
        }
    }
    return {};
}

/**
 * Callable Cloud Function to store structured history data to Firestore.
 *
 * This function takes the structured data output from parseResumeToStructuredHistory
 * and saves it to Firestore using the collection structure specified in the PRD:
 * - users/{userId}/structuredHistory/contactInfo
 * - users/{userId}/structuredHistory/jobHistory
 * - users/{userId}/structuredHistory/education
 * - users/{userId}/structuredHistory/certifications
 * - users/{userId}/structuredHistory/skills
 *
 * Expected payload:
 * {
 *   userId: string,
 *   structuredHistory: {
 *     contactInformation: {...},
 *     skills: [...],
 *     education: [...],
 *     certifications: [...],
 *     jobHistory: [...]
 *   }
 * }
 */
export const storeStructuredHistory = functions.https.onCall(async (data: any, context) => {
    console.log('Raw received data (keys):', Object.keys(data));

    const payload = extractPayload(data);
    console.log('Extracted payload:', JSON.stringify(payload, null, 2));

    // Validate the input
    if (!payload.userId || typeof payload.userId !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'userId is required and must be a string');
    }

    if (!payload.structuredHistory || typeof payload.structuredHistory !== 'object') {
        throw new functions.https.HttpsError('invalid-argument', 'structuredHistory is required and must be an object');
    }

    const { userId, structuredHistory } = payload;

    try {
        // Prepare the Firestore batch write
        const batch = db.batch();

        // Define the base path for the user's structured history
        const userStructuredHistoryPath = `users/${userId}/structuredHistory`;

        // Store Contact Information
        if (structuredHistory.contactInformation) {
            const contactInfoRef = db.doc(`${userStructuredHistoryPath}/contactInfo`);
            batch.set(contactInfoRef, {
                ...structuredHistory.contactInformation,
                lastUpdated: new Date(),
                source: 'ai-parsing'
            });
            console.log('Contact information queued for storage');
        }

        // Store Skills
        if (structuredHistory.skills && Array.isArray(structuredHistory.skills)) {
            const skillsRef = db.doc(`${userStructuredHistoryPath}/skills`);
            batch.set(skillsRef, {
                skills: structuredHistory.skills,
                lastUpdated: new Date(),
                source: 'ai-parsing'
            });
            console.log(`${structuredHistory.skills.length} skills queued for storage`);
        }

        // Store Education
        if (structuredHistory.education && Array.isArray(structuredHistory.education)) {
            const educationRef = db.doc(`${userStructuredHistoryPath}/education`);
            batch.set(educationRef, {
                education: structuredHistory.education,
                lastUpdated: new Date(),
                source: 'ai-parsing'
            });
            console.log(`${structuredHistory.education.length} education entries queued for storage`);
        }

        // Store Certifications
        if (structuredHistory.certifications && Array.isArray(structuredHistory.certifications)) {
            const certificationsRef = db.doc(`${userStructuredHistoryPath}/certifications`);
            batch.set(certificationsRef, {
                certifications: structuredHistory.certifications,
                lastUpdated: new Date(),
                source: 'ai-parsing'
            });
            console.log(`${structuredHistory.certifications.length} certification entries queued for storage`);
        }

        // Store Job History
        if (structuredHistory.jobHistory && Array.isArray(structuredHistory.jobHistory)) {
            const jobHistoryRef = db.doc(`${userStructuredHistoryPath}/jobHistory`);
            batch.set(jobHistoryRef, {
                jobHistory: structuredHistory.jobHistory,
                lastUpdated: new Date(),
                source: 'ai-parsing'
            });
            console.log(`${structuredHistory.jobHistory.length} job history entries queued for storage`);
        }

        // Execute the batch write
        await batch.commit();
        console.log('Successfully stored all structured history data to Firestore');

        // Return summary of what was stored
        const summary = {
            userId: userId,
            stored: {
                contactInfo: !!structuredHistory.contactInformation,
                skills: structuredHistory.skills ? structuredHistory.skills.length : 0,
                education: structuredHistory.education ? structuredHistory.education.length : 0,
                certifications: structuredHistory.certifications ? structuredHistory.certifications.length : 0,
                jobHistory: structuredHistory.jobHistory ? structuredHistory.jobHistory.length : 0
            },
            storedAt: new Date().toISOString()
        };

        console.log('Storage summary:', JSON.stringify(summary, null, 2));
        return summary;

    } catch (error) {
        console.error('Error storing structured history:', error);
        throw new functions.https.HttpsError('internal', 'Failed to store structured history data');
    }
});

/**
 * Callable Cloud Function to retrieve structured history data from Firestore.
 *
 * This function retrieves all structured data for a user from the Firestore collections.
 *
 * Expected payload:
 * {
 *   userId: string
 * }
 */
export const getStructuredHistory = functions.https.onCall(async (data: any, context) => {
    console.log('Raw received data (keys):', Object.keys(data));

    const payload = extractPayload(data);
    console.log('Extracted payload:', JSON.stringify(payload, null, 2));

    // Validate the input
    if (!payload.userId || typeof payload.userId !== 'string') {
        throw new functions.https.HttpsError('invalid-argument', 'userId is required and must be a string');
    }

    const { userId } = payload;

    try {
        // Define the base path for the user's structured history
        const userStructuredHistoryPath = `users/${userId}/structuredHistory`;

        // Retrieve all documents in parallel
        const [contactInfoDoc, skillsDoc, educationDoc, certificationsDoc, jobHistoryDoc] = await Promise.all([
            db.doc(`${userStructuredHistoryPath}/contactInfo`).get(),
            db.doc(`${userStructuredHistoryPath}/skills`).get(),
            db.doc(`${userStructuredHistoryPath}/education`).get(),
            db.doc(`${userStructuredHistoryPath}/certifications`).get(),
            db.doc(`${userStructuredHistoryPath}/jobHistory`).get()
        ]);

        // Build the structured history response
        const structuredHistory: any = {};

        if (contactInfoDoc.exists) {
            const data = contactInfoDoc.data();
            if (data) {
                // Remove metadata fields before returning
                const { lastUpdated, source, ...contactInfo } = data;
                structuredHistory.contactInformation = contactInfo;
            }
        }

        if (skillsDoc.exists) {
            const data = skillsDoc.data();
            if (data && data.skills) {
                structuredHistory.skills = data.skills;
            }
        }

        if (educationDoc.exists) {
            const data = educationDoc.data();
            if (data && data.education) {
                structuredHistory.education = data.education;
            }
        }

        if (certificationsDoc.exists) {
            const data = certificationsDoc.data();
            if (data && data.certifications) {
                structuredHistory.certifications = data.certifications;
            }
        }

        if (jobHistoryDoc.exists) {
            const data = jobHistoryDoc.data();
            if (data && data.jobHistory) {
                structuredHistory.jobHistory = data.jobHistory;
            }
        }

        console.log('Successfully retrieved structured history data from Firestore');
        console.log('Retrieved data summary:', {
            hasContactInfo: !!structuredHistory.contactInformation,
            skillsCount: structuredHistory.skills ? structuredHistory.skills.length : 0,
            educationCount: structuredHistory.education ? structuredHistory.education.length : 0,
            certificationsCount: structuredHistory.certifications ? structuredHistory.certifications.length : 0,
            jobHistoryCount: structuredHistory.jobHistory ? structuredHistory.jobHistory.length : 0
        });

        return structuredHistory;

    } catch (error) {
        console.error('Error retrieving structured history:', error);
        throw new functions.https.HttpsError('internal', 'Failed to retrieve structured history data');
    }
});
