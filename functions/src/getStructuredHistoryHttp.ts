import { onRequest } from "firebase-functions/v2/https";
import * as admin from 'firebase-admin';
import { Request, Response } from "express";
import cors from "cors";

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

// Initialize CORS middleware
const corsHandler = cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'https://ai-resume-writer-46403.web.app'],
    credentials: true
});

export const getStructuredHistoryHttp = onRequest(async (req: Request, res: Response) => {
    return corsHandler(req, res, async () => {
        try {
            // Allow both GET and POST requests
            if (req.method !== 'GET' && req.method !== 'POST') {
                res.status(405).json({ error: 'Method not allowed. Only GET and POST are supported.' });
                return;
            }

            console.log('=== getStructuredHistoryHttp called (v2) ===');

            // Get userId from query params (GET) or body (POST)
            const userId = req.method === 'GET' ? req.query.userId as string : req.body?.data?.userId;

            console.log('Request method:', req.method);
            console.log('User ID:', userId);
            console.log('Query params:', req.query);
            console.log('Request body:', req.body);

            if (!userId || typeof userId !== 'string') {
                res.status(400).json({ error: 'Missing userId parameter' });
                return;
            }

            console.log('Retrieving structured data for user:', userId);

            // Get contact information from the correct path, with fallback to old path
            let contactRef = db.collection('users').doc(userId).collection('structuredHistory').doc('contactInfo');
            console.log('Contact ref path (new):', contactRef.path);
            let contactDoc = await contactRef.get();
            console.log('Contact doc exists (new path):', contactDoc.exists);

            let contactInformation = contactDoc.exists ? contactDoc.data() : {};

            // Fallback to old path if new path is empty
            if (!contactDoc.exists) {
                console.log('Trying old contact path as fallback...');
                contactRef = db.collection('users').doc(userId).collection('profile').doc('contactInformation');
                console.log('Contact ref path (old):', contactRef.path);
                contactDoc = await contactRef.get();
                console.log('Contact doc exists (old path):', contactDoc.exists);
                contactInformation = contactDoc.exists ? contactDoc.data() : {};
            }

            console.log('Contact information retrieved:', JSON.stringify(contactInformation, null, 2));
            console.log('Contact information keys:', Object.keys(contactInformation || {}));
            console.log('FullName from contact info:', contactInformation?.fullName);

            // Get skills from the correct path, with fallback
            let skillsRef = db.collection('users').doc(userId).collection('structuredHistory').doc('skills');
            let skillsDoc = await skillsRef.get();
            let skillsData = skillsDoc.exists ? skillsDoc.data() : {};
            let skills: string[] = (skillsData && skillsData.skills) || [];

            // Fallback to old skills collection if new path is empty
            if (skills.length === 0) {
                console.log('Trying old skills path as fallback...');
                const oldSkillsRef = db.collection('users').doc(userId).collection('skills');
                const oldSkillsSnapshot = await oldSkillsRef.get();
                skills = [];
                oldSkillsSnapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.skill) {
                        skills.push(data.skill);
                    }
                });
            }

            // Get education from the correct path, with fallback
            let educationRef = db.collection('users').doc(userId).collection('structuredHistory').doc('education');
            let educationDoc = await educationRef.get();
            let educationData = educationDoc.exists ? educationDoc.data() : {};
            let education: any[] = (educationData && educationData.education) || [];

            // Fallback to old education collection if new path is empty
            if (education.length === 0) {
                console.log('Trying old education path as fallback...');
                const oldEducationRef = db.collection('users').doc(userId).collection('education');
                const oldEducationSnapshot = await oldEducationRef.get();
                education = [];
                oldEducationSnapshot.forEach(doc => {
                    const data = doc.data();
                    const { createdAt, ...educationData } = data;
                    education.push(educationData);
                });
            }

            // Get certifications from the correct path, with fallback
            let certificationsRef = db.collection('users').doc(userId).collection('structuredHistory').doc('certifications');
            let certificationsDoc = await certificationsRef.get();
            let certificationsData = certificationsDoc.exists ? certificationsDoc.data() : {};
            let certifications: any[] = (certificationsData && certificationsData.certifications) || [];

            // Fallback to old certifications collection if new path is empty
            if (certifications.length === 0) {
                console.log('Trying old certifications path as fallback...');
                const oldCertificationsRef = db.collection('users').doc(userId).collection('certifications');
                const oldCertificationsSnapshot = await oldCertificationsRef.get();
                certifications = [];
                oldCertificationsSnapshot.forEach(doc => {
                    const data = doc.data();
                    const { createdAt, ...certData } = data;
                    certifications.push(certData);
                });
            }

            // Get job history from the correct path, with fallback
            let jobHistoryRef = db.collection('users').doc(userId).collection('structuredHistory').doc('jobHistory');
            let jobHistoryDoc = await jobHistoryRef.get();
            let jobHistoryData = jobHistoryDoc.exists ? jobHistoryDoc.data() : {};
            let jobHistory: any[] = (jobHistoryData && jobHistoryData.jobHistory) || [];

            // Fallback to old job history collection if new path is empty
            if (jobHistory.length === 0) {
                console.log('Trying old job history path as fallback...');
                const oldJobHistoryRef = db.collection('users').doc(userId).collection('jobHistory');
                const oldJobHistorySnapshot = await oldJobHistoryRef.get();
                jobHistory = [];
                oldJobHistorySnapshot.forEach(doc => {
                    const data = doc.data();
                    const { createdAt, ...jobData } = data;
                    jobHistory.push(jobData);
                });
            }

            const structuredData = {
                contactInformation,
                skills,
                education,
                certifications,
                jobHistory
            };

            console.log('Final structured data summary:', {
                hasContactInfo: !!contactInformation && Object.keys(contactInformation).length > 0,
                skillsCount: skills.length,
                educationCount: education.length,
                certificationsCount: certifications.length,
                jobHistoryCount: jobHistory.length,
                contactKeys: Object.keys(contactInformation || {})
            });

            console.log('Successfully retrieved structured data');

            res.status(200).json({
                success: true,
                data: structuredData
            });

        } catch (error) {
            console.error('Error in getStructuredHistoryHttp:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
});
