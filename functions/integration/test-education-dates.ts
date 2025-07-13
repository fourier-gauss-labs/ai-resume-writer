import { initializeApp } from 'firebase/app';
import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';

// Initialize Firebase
const firebaseConfig = {
    projectId: 'demo-project'
};

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);

// Point to the local emulator
connectFunctionsEmulator(functions, 'localhost', 5001);

async function testEducationDates() {
    const parseResumeToStructuredHistory = httpsCallable(functions, 'parseResumeToStructuredHistory');
    try {
        const result = await parseResumeToStructuredHistory({ userId: 'h8jKZcK81VekRCJYXa8Gk6RhOnp1' });
        const data = result.data as any;

        console.log('=== EDUCATION DETAILS WITH DATES ===');
        if (data.education && Array.isArray(data.education)) {
            data.education.forEach((edu: any, index: number) => {
                console.log(`\nEducation Entry ${index + 1}:`);
                console.log('School:', edu.school);
                console.log('Degree:', edu.degree);
                console.log('Start Date Month:', edu.startDate?.month || 'EMPTY');
                console.log('Start Date Year:', edu.startDate?.year || 'EMPTY');
                console.log('End Date Month:', edu.endDate?.month || 'EMPTY');
                console.log('End Date Year:', edu.endDate?.year || 'EMPTY');
                console.log('Grade:', edu.grade || 'EMPTY');
                console.log('---');
            });
        } else {
            console.log('No education data found or not in expected format');
        }
    } catch (err) {
        console.error('Function error:', err);
    }
}

testEducationDates();
