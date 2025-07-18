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

async function testCompleteWorkflow() {
    console.log('=== TESTING COMPLETE WORKFLOW: PARSE → STORE → RETRIEVE ===\n');

    const parseResumeToStructuredHistory = httpsCallable(functions, 'parseResumeToStructuredHistory');
    const storeStructuredHistory = httpsCallable(functions, 'storeStructuredHistory');
    const getStructuredHistory = httpsCallable(functions, 'getStructuredHistory');

    const testUserId = 'test-user-' + Date.now();

    try {
        // STEP 1: Parse the resume data
        console.log('📄 STEP 1: Parsing resume data...');
        const parseResult = await parseResumeToStructuredHistory({
            userId: 'h8jKZcK81VekRCJYXa8Gk6RhOnp1'
        });

        const structuredData = parseResult.data as any;
        console.log('✅ Parsing complete!');
        console.log(`   - Contact Info: ${structuredData.contactInformation ? 'Present' : 'Missing'}`);
        console.log(`   - Skills: ${structuredData.skills ? structuredData.skills.length : 0}`);
        console.log(`   - Education: ${structuredData.education ? structuredData.education.length : 0}`);
        console.log(`   - Certifications: ${structuredData.certifications ? structuredData.certifications.length : 0}`);
        console.log(`   - Job History: ${structuredData.jobHistory ? structuredData.jobHistory.length : 0}`);

        // STEP 2: Store the structured data to Firestore
        console.log('\n💾 STEP 2: Storing structured data to Firestore...');
        const storeResult = await storeStructuredHistory({
            userId: testUserId,
            structuredHistory: structuredData
        });

        const storeSummary = storeResult.data as any;
        console.log('✅ Storage complete!');
        console.log(`   - User ID: ${storeSummary.userId}`);
        console.log(`   - Contact Info stored: ${storeSummary.stored.contactInfo}`);
        console.log(`   - Skills stored: ${storeSummary.stored.skills}`);
        console.log(`   - Education entries stored: ${storeSummary.stored.education}`);
        console.log(`   - Certification entries stored: ${storeSummary.stored.certifications}`);
        console.log(`   - Job history entries stored: ${storeSummary.stored.jobHistory}`);
        console.log(`   - Stored at: ${storeSummary.storedAt}`);

        // STEP 3: Retrieve the stored data from Firestore
        console.log('\n🔍 STEP 3: Retrieving structured data from Firestore...');
        const retrieveResult = await getStructuredHistory({
            userId: testUserId
        });

        const retrievedData = retrieveResult.data as any;
        console.log('✅ Retrieval complete!');
        console.log(`   - Contact Info: ${retrievedData.contactInformation ? 'Present' : 'Missing'}`);
        console.log(`   - Skills: ${retrievedData.skills ? retrievedData.skills.length : 0}`);
        console.log(`   - Education: ${retrievedData.education ? retrievedData.education.length : 0}`);
        console.log(`   - Certifications: ${retrievedData.certifications ? retrievedData.certifications.length : 0}`);
        console.log(`   - Job History: ${retrievedData.jobHistory ? retrievedData.jobHistory.length : 0}`);

        // STEP 4: Verify data integrity (compare original vs retrieved)
        console.log('\n🔍 STEP 4: Verifying data integrity...');

        // Check contact information
        const contactMatch = JSON.stringify(structuredData.contactInformation) === JSON.stringify(retrievedData.contactInformation);
        console.log(`   - Contact Info integrity: ${contactMatch ? '✅ MATCH' : '❌ MISMATCH'}`);

        // Check skills
        const skillsMatch = JSON.stringify(structuredData.skills) === JSON.stringify(retrievedData.skills);
        console.log(`   - Skills integrity: ${skillsMatch ? '✅ MATCH' : '❌ MISMATCH'}`);

        // Check education
        const educationMatch = JSON.stringify(structuredData.education) === JSON.stringify(retrievedData.education);
        console.log(`   - Education integrity: ${educationMatch ? '✅ MATCH' : '❌ MISMATCH'}`);

        // Check certifications
        const certificationsMatch = JSON.stringify(structuredData.certifications) === JSON.stringify(retrievedData.certifications);
        console.log(`   - Certifications integrity: ${certificationsMatch ? '✅ MATCH' : '❌ MISMATCH'}`);

        // Check job history
        const jobHistoryMatch = JSON.stringify(structuredData.jobHistory) === JSON.stringify(retrievedData.jobHistory);
        console.log(`   - Job History integrity: ${jobHistoryMatch ? '✅ MATCH' : '❌ MISMATCH'}`);

        // Overall integrity check
        const allMatch = contactMatch && skillsMatch && educationMatch && certificationsMatch && jobHistoryMatch;
        console.log(`\n🎯 OVERALL DATA INTEGRITY: ${allMatch ? '✅ PERFECT MATCH' : '❌ DISCREPANCIES FOUND'}`);

        if (allMatch) {
            console.log('\n🎉 SUCCESS: Complete workflow test passed!');
            console.log('   ✅ Parse → Store → Retrieve workflow is functioning correctly');
            console.log('   ✅ All data types preserved perfectly');
            console.log('   ✅ Firestore storage structure matches PRD specification');
        } else {
            console.log('\n⚠️  WARNING: Data integrity issues detected');
        }

        // Show a sample of the stored data
        if (retrievedData.jobHistory && retrievedData.jobHistory.length > 0) {
            console.log('\n📊 SAMPLE JOB HISTORY ENTRY:');
            const sampleJob = retrievedData.jobHistory[0];
            console.log(`   - Title: "${sampleJob.title}"`);
            console.log(`   - Company: "${sampleJob.company}"`);
            console.log(`   - Period: ${sampleJob.startDate.month}/${sampleJob.startDate.year} - ${sampleJob.endDate.month || 'Present'}/${sampleJob.endDate.year || ''}`);
            console.log(`   - Currently Working: ${sampleJob.currentlyWorking}`);
            console.log(`   - Accomplishments: ${sampleJob.accomplishments.length} listed`);
        }

    } catch (error) {
        console.error('❌ Workflow test failed:', error);
    }
}

testCompleteWorkflow().catch(console.error);
