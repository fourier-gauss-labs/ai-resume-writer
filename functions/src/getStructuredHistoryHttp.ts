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

export const getStructuredHistoryHttp = onRequest(async (req: Request, res: Response) => {
    return corsHandler(req, res, async () => {
        try {
            // Only allow GET requests
            if (req.method !== 'GET') {
                res.status(405).json({ error: 'Method not allowed' });
                return;
            }

            console.log('=== getStructuredHistoryHttp called ===');
            console.log('Query params:', req.query);

            const { userId } = req.query;

            if (!userId || typeof userId !== 'string') {
                res.status(400).json({ error: 'Missing userId parameter' });
                return;
            }

            console.log('Retrieving structured data for user:', userId);

            // Get contact information
            const contactRef = db.collection('users').doc(userId).collection('profile').doc('contactInformation');
            const contactDoc = await contactRef.get();
            const contactInformation = contactDoc.exists ? contactDoc.data() : {};

            // Get skills
            const skillsRef = db.collection('users').doc(userId).collection('skills');
            const skillsSnapshot = await skillsRef.get();
            const skills: string[] = [];
            skillsSnapshot.forEach(doc => {
                const data = doc.data();
                if (data.skill) {
                    skills.push(data.skill);
                }
            });

            // Get education
            const educationRef = db.collection('users').doc(userId).collection('education');
            const educationSnapshot = await educationRef.get();
            const education: any[] = [];
            educationSnapshot.forEach(doc => {
                const data = doc.data();
                // Remove createdAt timestamp for cleaner response
                const { createdAt, ...educationData } = data;
                education.push(educationData);
            });

            // Get certifications
            const certificationsRef = db.collection('users').doc(userId).collection('certifications');
            const certificationsSnapshot = await certificationsRef.get();
            const certifications: any[] = [];
            certificationsSnapshot.forEach(doc => {
                const data = doc.data();
                // Remove createdAt timestamp for cleaner response
                const { createdAt, ...certData } = data;
                certifications.push(certData);
            });

            // Get job history
            const jobHistoryRef = db.collection('users').doc(userId).collection('jobHistory');
            const jobHistorySnapshot = await jobHistoryRef.get();
            const jobHistory: any[] = [];
            jobHistorySnapshot.forEach(doc => {
                const data = doc.data();
                // Remove createdAt timestamp for cleaner response
                const { createdAt, ...jobData } = data;
                jobHistory.push(jobData);
            });

            const structuredData = {
                contactInformation,
                skills,
                education,
                certifications,
                jobHistory
            };

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
