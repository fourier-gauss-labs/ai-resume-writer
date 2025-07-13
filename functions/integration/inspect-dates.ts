import { initializeApp } from 'firebase/app';
import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';

// Initialize Firebase
const firebaseConfig = {
    projectId: 'ai-resume-writer-46403'
};

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);

// Point to the local emulator
connectFunctionsEmulator(functions, 'localhost', 5001);

async function inspectEducationDates() {
    try {
        const parseResumeToStructuredHistory = httpsCallable(functions, 'parseResumeToStructuredHistory');
        const result = await parseResumeToStructuredHistory({ userId: 'h8jKZcK81VekRCJYXa8Gk6RhOnp1' });
        const data = result.data as any;

        console.log('=== DETAILED EDUCATION INSPECTION ===');

        if (data.education && Array.isArray(data.education)) {
            data.education.forEach((edu: any, index: number) => {
                console.log(`\n--- Education Entry ${index + 1} ---`);
                console.log('School:', edu.school);
                console.log('Degree:', edu.degree);
                console.log('Start Date Object:', edu.startDate);
                console.log('  - Month:', `"${edu.startDate?.month}"` || 'undefined');
                console.log('  - Year:', `"${edu.startDate?.year}"` || 'undefined');
                console.log('End Date Object:', edu.endDate);
                console.log('  - Month:', `"${edu.endDate?.month}"` || 'undefined');
                console.log('  - Year:', `"${edu.endDate?.year}"` || 'undefined');
                console.log('Grade:', `"${edu.grade}"` || 'undefined');
            });
        } else {
            console.log('No education array found');
        }

    } catch (err) {
        console.error('Error:', err);
    }
}

inspectEducationDates();
