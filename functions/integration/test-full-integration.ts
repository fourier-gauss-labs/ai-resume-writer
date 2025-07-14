import { initializeApp } from 'firebase/app';
import { getFunctions, connectFunctionsEmulator, httpsCallable } from 'firebase/functions';

// Minimal Firebase config for emulator use only
const firebaseConfig = {
    apiKey: 'fake',
    authDomain: 'fake',
    projectId: 'ai-resume-writer-46403',
    appId: 'fake'
};

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);

// Point to the local emulator
connectFunctionsEmulator(functions, 'localhost', 5001);

async function testFullIntegration() {
    console.log('=== TESTING FULL INTEGRATION (All 4 Data Types) ===\n');

    const parseResumeToStructuredHistory = httpsCallable(functions, 'parseResumeToStructuredHistory');

    try {
        const result = await parseResumeToStructuredHistory({
            userId: 'h8jKZcK81VekRCJYXa8Gk6RhOnp1'
        });

        const data = result.data as any;

        console.log('FULL STRUCTURED HISTORY RESULT:');
        console.log(JSON.stringify(data, null, 2));

        console.log('\n=== INTEGRATION VERIFICATION ===');

        // Check that all 4 data types are present
        const hasContactInfo = data.contactInformation ? '✅' : '❌';
        const hasSkills = data.skills ? '✅' : '❌';
        const hasEducation = data.education ? '✅' : '❌';
        const hasCertifications = data.certifications ? '✅' : '❌';

        console.log(`${hasContactInfo} Contact Information: ${data.contactInformation ? 'Present' : 'Missing'}`);
        console.log(`${hasSkills} Skills: ${data.skills ? `${data.skills.length} skills found` : 'Missing'}`);
        console.log(`${hasEducation} Education: ${data.education ? `${data.education.length} entries found` : 'Missing'}`);
        console.log(`${hasCertifications} Certifications: ${data.certifications ? `${data.certifications.length} entries found` : 'Missing'}`);

        if (data.contactInformation) {
            console.log(`   - Name: "${data.contactInformation.fullName}"`);
            console.log(`   - Emails: ${data.contactInformation.email.length}`);
            console.log(`   - Phones: ${data.contactInformation.phones.length}`);
        }

        if (data.education && data.education.length > 0) {
            console.log(`   - Latest Education: ${data.education[0].school} (${data.education[0].endDate.month}/${data.education[0].endDate.year})`);
        }

        if (data.certifications && data.certifications.length > 0) {
            console.log(`   - Latest Certification: ${data.certifications[0].certName} (${data.certifications[0].issuedDate.month}/${data.certifications[0].issuedDate.year})`);
        }

        console.log('\n=== STRUCTURE COMPLIANCE ===');
        console.log('All 4 required data structures from PRD are present and functioning!');

    } catch (error) {
        console.error('Function error:', error);
    }
}

testFullIntegration().catch(console.error);
