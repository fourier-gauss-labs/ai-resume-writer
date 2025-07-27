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

export const storeStructuredHistoryHttp = onRequest(async (req: Request, res: Response) => {
    return corsHandler(req, res, async () => {
        try {
            // Only allow POST requests
            if (req.method !== 'POST') {
                res.status(405).json({ error: 'Method not allowed' });
                return;
            }

            console.log('=== storeStructuredHistoryHttp called ===');
            console.log('Request body:', JSON.stringify(req.body, null, 2));

            const { userId, structuredData } = req.body;

            if (!userId) {
                res.status(400).json({ error: 'Missing userId parameter' });
                return;
            }

            if (!structuredData) {
                res.status(400).json({ error: 'Missing structuredData parameter' });
                return;
            }

            console.log('Storing structured data for user:', userId);

            // First, clear existing data
            console.log('Clearing existing data...');

            // Clear skills
            const skillsRef = db.collection('users').doc(userId).collection('skills');
            const skillsSnapshot = await skillsRef.get();
            const skillsBatch = db.batch();
            skillsSnapshot.docs.forEach(doc => {
                skillsBatch.delete(doc.ref);
            });
            if (!skillsSnapshot.empty) {
                await skillsBatch.commit();
                console.log(`Cleared ${skillsSnapshot.size} existing skills`);
            }

            // Clear education
            const educationRef = db.collection('users').doc(userId).collection('education');
            const educationSnapshot = await educationRef.get();
            const educationBatch = db.batch();
            educationSnapshot.docs.forEach(doc => {
                educationBatch.delete(doc.ref);
            });
            if (!educationSnapshot.empty) {
                await educationBatch.commit();
                console.log(`Cleared ${educationSnapshot.size} existing education entries`);
            }

            // Clear certifications
            const certificationsRef = db.collection('users').doc(userId).collection('certifications');
            const certificationsSnapshot = await certificationsRef.get();
            const certificationsBatch = db.batch();
            certificationsSnapshot.docs.forEach(doc => {
                certificationsBatch.delete(doc.ref);
            });
            if (!certificationsSnapshot.empty) {
                await certificationsBatch.commit();
                console.log(`Cleared ${certificationsSnapshot.size} existing certifications`);
            }

            // Clear job history
            const jobHistoryRef = db.collection('users').doc(userId).collection('jobHistory');
            const jobHistorySnapshot = await jobHistoryRef.get();
            const jobHistoryBatch = db.batch();
            jobHistorySnapshot.docs.forEach(doc => {
                jobHistoryBatch.delete(doc.ref);
            });
            if (!jobHistorySnapshot.empty) {
                await jobHistoryBatch.commit();
                console.log(`Cleared ${jobHistorySnapshot.size} existing job history entries`);
            }

            // Clear contact information (profile collection)
            const profileRef = db.collection('users').doc(userId).collection('profile');
            const profileSnapshot = await profileRef.get();
            const profileBatch = db.batch();
            profileSnapshot.docs.forEach(doc => {
                profileBatch.delete(doc.ref);
            });
            if (!profileSnapshot.empty) {
                await profileBatch.commit();
                console.log(`Cleared ${profileSnapshot.size} existing profile entries`);
            }

            // Create a batch for atomic operations to store new data
            const batch = db.batch();

            // Store contact information
            if (structuredData.contactInformation && Object.keys(structuredData.contactInformation).length > 0) {
                const contactRef = db.collection('users').doc(userId).collection('profile').doc('contactInformation');
                batch.set(contactRef, structuredData.contactInformation, { merge: true });
                console.log('Added contact information to batch');
            }

            // Store skills
            if (structuredData.skills && structuredData.skills.length > 0) {
                for (let i = 0; i < structuredData.skills.length; i++) {
                    const skillRef = db.collection('users').doc(userId).collection('skills').doc(`skill_${Date.now()}_${i}`);
                    batch.set(skillRef, {
                        skill: structuredData.skills[i],
                        createdAt: admin.firestore.FieldValue.serverTimestamp()
                    });
                }
                console.log(`Added ${structuredData.skills.length} skills to batch`);
            }

            // Store education
            if (structuredData.education && structuredData.education.length > 0) {
                for (let i = 0; i < structuredData.education.length; i++) {
                    const educationRef = db.collection('users').doc(userId).collection('education').doc(`education_${Date.now()}_${i}`);
                    batch.set(educationRef, {
                        ...structuredData.education[i],
                        createdAt: admin.firestore.FieldValue.serverTimestamp()
                    });
                }
                console.log(`Added ${structuredData.education.length} education entries to batch`);
            }

            // Store certifications
            if (structuredData.certifications && structuredData.certifications.length > 0) {
                for (let i = 0; i < structuredData.certifications.length; i++) {
                    const certRef = db.collection('users').doc(userId).collection('certifications').doc(`cert_${Date.now()}_${i}`);
                    batch.set(certRef, {
                        ...structuredData.certifications[i],
                        createdAt: admin.firestore.FieldValue.serverTimestamp()
                    });
                }
                console.log(`Added ${structuredData.certifications.length} certifications to batch`);
            }

            // Store job history
            if (structuredData.jobHistory && structuredData.jobHistory.length > 0) {
                for (let i = 0; i < structuredData.jobHistory.length; i++) {
                    const jobRef = db.collection('users').doc(userId).collection('jobHistory').doc(`job_${Date.now()}_${i}`);
                    batch.set(jobRef, {
                        ...structuredData.jobHistory[i],
                        createdAt: admin.firestore.FieldValue.serverTimestamp()
                    });
                }
                console.log(`Added ${structuredData.jobHistory.length} job history entries to batch`);
            }

            // Commit the batch
            await batch.commit();
            console.log('Successfully stored structured data');

            res.status(200).json({
                success: true,
                message: 'Structured data stored successfully'
            });

        } catch (error) {
            console.error('Error in storeStructuredHistoryHttp:', error);
            res.status(500).json({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
});
