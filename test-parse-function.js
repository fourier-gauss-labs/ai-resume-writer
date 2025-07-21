const { httpsCallable } = require("firebase/functions");
const { initializeApp } = require("firebase/app");
const { getFunctions } = require("firebase/functions");

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyADb-Ze-bivg-Zst4e-c5uCDDYZkEpoYxw",
    authDomain: "ai-resume-writer-46403.firebaseapp.com",
    projectId: "ai-resume-writer-46403",
    storageBucket: "ai-resume-writer-46403.firebasestorage.app",
    messagingSenderId: "52192838826",
    appId: "1:52192838826:web:9c4accf73bd48cfc093cd3"
};

const app = initializeApp(firebaseConfig);
const functions = getFunctions(app);

async function testParseResumeFunction() {
    const parseFunction = httpsCallable(functions, 'parseResumeToStructuredHistory');

    try {
        console.log('Testing parseResumeToStructuredHistory function...');

        // Test with a user ID that has no files - should trigger the "No files found" error
        const result = await parseFunction({
            userId: "test-user-123"
        });

        console.log('Success:', result.data);
    } catch (error) {
        console.error('Error details:', {
            code: error.code,
            message: error.message,
            details: error.details
        });
    }
}

testParseResumeFunction();
