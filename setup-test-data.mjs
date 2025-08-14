/**
 * Script to populate test profile data in Firebase emulator for debugging
 */

import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, doc, setDoc } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator, httpsCallable } from 'firebase/functions';

// Firebase config for emulator
const firebaseConfig = {
    apiKey: "demo-api-key",
    authDomain: "ai-resume-writer-46403.firebaseapp.com",
    projectId: "ai-resume-writer-46403",
    storageBucket: "ai-resume-writer-46403.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);

// Connect to emulators
connectAuthEmulator(auth, "http://127.0.0.1:9099");
connectFirestoreEmulator(db, '127.0.0.1', 8080);
connectFunctionsEmulator(functions, "127.0.0.1", 5001);

async function createTestUser() {
    console.log('📝 Creating test user...');

    try {
        // Create or sign in test user
        let userCredential;
        try {
            userCredential = await createUserWithEmailAndPassword(auth, 'test@example.com', 'password123');
            console.log('✅ Created new test user:', userCredential.user.uid);
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                userCredential = await signInWithEmailAndPassword(auth, 'test@example.com', 'password123');
                console.log('✅ Signed in existing test user:', userCredential.user.uid);
            } else {
                throw error;
            }
        }

        const userId = userCredential.user.uid;

        // Create profile data
        console.log('💾 Creating profile data...');

        // Contact information
        await setDoc(doc(db, 'users', userId, 'profile', 'contactInformation'), {
            fullName: 'Test User',
            email: 'test@example.com',
            phone: '(555) 123-4567',
            address: 'Test City, CA',
            linkedinUrl: 'https://linkedin.com/in/testuser'
        });

        // Skills
        const skillsData = [
            { skill: 'JavaScript' },
            { skill: 'TypeScript' },
            { skill: 'React' },
            { skill: 'Node.js' },
            { skill: 'Python' },
            { skill: 'AWS' }
        ];

        for (let i = 0; i < skillsData.length; i++) {
            await setDoc(doc(db, 'users', userId, 'skills', `skill-${i}`), skillsData[i]);
        }

        // Education
        await setDoc(doc(db, 'users', userId, 'education', 'edu-1'), {
            degree: 'Bachelor of Science in Computer Science',
            school: 'Test University',
            startDate: '2018-09-01',
            endDate: '2022-05-15',
            duration: '2018 - 2022'
        });

        // Certifications
        await setDoc(doc(db, 'users', userId, 'certifications', 'cert-1'), {
            name: 'AWS Solutions Architect',
            issuer: 'Amazon Web Services',
            date: '2023-06-01'
        });

        // Job History
        await setDoc(doc(db, 'users', userId, 'jobHistory', 'job-1'), {
            title: 'Software Engineer',
            company: 'Test Company Inc',
            startDate: '2022-06-01',
            endDate: 'present',
            achievements: [
                'Developed React applications',
                'Improved system performance by 30%',
                'Led team of 3 developers'
            ]
        });

        console.log('✅ Profile data created successfully');

        // Test the getStructuredHistoryHttp function
        console.log('🧪 Testing getStructuredHistoryHttp function...');

        const getStructuredHistory = httpsCallable(functions, 'getStructuredHistoryHttp');
        const response = await getStructuredHistory({ userId: userId });

        console.log('✅ Function response received:', {
            hasContactInfo: !!response.data.contactInformation,
            skillsCount: response.data.skills?.length || 0,
            educationCount: response.data.education?.length || 0,
            certificationsCount: response.data.certifications?.length || 0,
            jobHistoryCount: response.data.jobHistory?.length || 0
        });

        return userId;

    } catch (error) {
        console.error('❌ Error creating test data:', error);
        throw error;
    }
}

// Run the setup
createTestUser().then(userId => {
    console.log(`🎉 Test setup complete! User ID: ${userId}`);
    console.log('You can now test resume generation with this user.');
    process.exit(0);
}).catch(error => {
    console.error('💥 Setup failed:', error);
    process.exit(1);
});
