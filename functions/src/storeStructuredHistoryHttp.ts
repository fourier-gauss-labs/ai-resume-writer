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
const corsHandler = cors({ origin: true });

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

            // Create a batch for atomic operations
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
