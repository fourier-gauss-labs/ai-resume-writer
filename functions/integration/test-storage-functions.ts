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

async function testStorageFunctions() {
    console.log('=== TESTING STORAGE FUNCTIONS ===\n');

    const storeStructuredHistory = httpsCallable(functions, 'storeStructuredHistory');
    const getStructuredHistory = httpsCallable(functions, 'getStructuredHistory');

    const testUserId = 'test-storage-user-' + Date.now();

    // Sample structured data to store
    const sampleStructuredData = {
        contactInformation: {
            fullName: "John Doe",
            email: ["john.doe@example.com"],
            phones: ["555-123-4567"]
        },
        skills: ["JavaScript", "TypeScript", "React", "Node.js", "Firebase"],
        education: [
            {
                school: "University of Technology",
                degree: "Bachelor of Science in Computer Science",
                startDate: { month: "09", year: "2015" },
                endDate: { month: "05", year: "2019" },
                grade: "3.8 GPA"
            }
        ],
        certifications: [
            {
                certName: "AWS Certified Developer",
                issuer: "Amazon Web Services",
                issuedDate: { month: "06", year: "2023" },
                credentialId: "AWS-DEV-2023-001"
            }
        ],
        jobHistory: [
            {
                title: "Senior Software Engineer",
                company: "Tech Solutions Inc",
                startDate: { month: "01", year: "2020" },
                endDate: { month: "", year: "" },
                currentlyWorking: true,
                jobDescription: "Lead development of scalable web applications",
                accomplishments: [
                    "Improved system performance by 40%",
                    "Led a team of 5 developers"
                ]
            }
        ]
    };

    try {
        // TEST 1: Store the structured data
        console.log('💾 TEST 1: Storing structured data to Firestore...');
        const storeResult = await storeStructuredHistory({
            userId: testUserId,
            structuredHistory: sampleStructuredData
        });

        const storeSummary = storeResult.data as any;
        console.log('✅ Storage successful!');
        console.log('Storage Summary:', JSON.stringify(storeSummary, null, 2));

        // TEST 2: Retrieve the stored data
        console.log('\n🔍 TEST 2: Retrieving structured data from Firestore...');
        const retrieveResult = await getStructuredHistory({
            userId: testUserId
        });

        const retrievedData = retrieveResult.data as any;
        console.log('✅ Retrieval successful!');
        console.log('Retrieved Data:', JSON.stringify(retrievedData, null, 2));

        // TEST 3: Verify data integrity
        console.log('\n🔍 TEST 3: Verifying data integrity...');

        const originalContact = JSON.stringify(sampleStructuredData.contactInformation);
        const retrievedContact = JSON.stringify(retrievedData.contactInformation);
        const contactMatch = originalContact === retrievedContact;

        const originalSkills = JSON.stringify(sampleStructuredData.skills);
        const retrievedSkills = JSON.stringify(retrievedData.skills);
        const skillsMatch = originalSkills === retrievedSkills;

        const originalEducation = JSON.stringify(sampleStructuredData.education);
        const retrievedEducation = JSON.stringify(retrievedData.education);
        const educationMatch = originalEducation === retrievedEducation;

        const originalCertifications = JSON.stringify(sampleStructuredData.certifications);
        const retrievedCertifications = JSON.stringify(retrievedData.certifications);
        const certificationsMatch = originalCertifications === retrievedCertifications;

        const originalJobHistory = JSON.stringify(sampleStructuredData.jobHistory);
        const retrievedJobHistory = JSON.stringify(retrievedData.jobHistory);
        const jobHistoryMatch = originalJobHistory === retrievedJobHistory;

        console.log(`Contact Info: ${contactMatch ? '✅ MATCH' : '❌ MISMATCH'}`);
        console.log(`Skills: ${skillsMatch ? '✅ MATCH' : '❌ MISMATCH'}`);
        console.log(`Education: ${educationMatch ? '✅ MATCH' : '❌ MISMATCH'}`);
        console.log(`Certifications: ${certificationsMatch ? '✅ MATCH' : '❌ MISMATCH'}`);
        console.log(`Job History: ${jobHistoryMatch ? '✅ MATCH' : '❌ MISMATCH'}`);

        const allMatch = contactMatch && skillsMatch && educationMatch && certificationsMatch && jobHistoryMatch;
        console.log(`\n🎯 OVERALL: ${allMatch ? '✅ ALL DATA STORED AND RETRIEVED CORRECTLY' : '❌ DATA INTEGRITY ISSUES'}`);

        // TEST 4: Test retrieving non-existent user
        console.log('\n🚫 TEST 4: Testing retrieval of non-existent user...');
        try {
            const nonExistentResult = await getStructuredHistory({
                userId: 'non-existent-user-12345'
            });

            const nonExistentData = nonExistentResult.data as any;
            const isEmpty = Object.keys(nonExistentData).length === 0;
            console.log(`Non-existent user data: ${isEmpty ? '✅ CORRECTLY EMPTY' : '❌ UNEXPECTED DATA'}`);

        } catch (error) {
            console.log('❌ Error retrieving non-existent user:', error);
        }

        console.log('\n🎉 Storage function tests completed!');

    } catch (error) {
        console.error('❌ Storage test failed:', error);
    }
}

testStorageFunctions().catch(console.error);
