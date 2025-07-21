// Test script to debug the storeStructuredHistory function
const { initializeApp } = require('firebase-admin/app');
const { getFunctions, httpsCallable } = require('firebase/functions');
const { initializeApp: initializeClientApp } = require('firebase/app');

// Initialize Firebase client
const firebaseConfig = {
    apiKey: "AIzaSyADb-Ze-bivg-Zst4e-c5uCDDYZkEpoYxw",
    authDomain: "ai-resume-writer-46403.firebaseapp.com",
    projectId: "ai-resume-writer-46403",
    storageBucket: "ai-resume-writer-46403.firebasestorage.app",
    messagingSenderId: "52192838826",
    appId: "1:52192838826:web:9c4accf73bd48cfc093cd3"
};

const app = initializeClientApp(firebaseConfig);
const functions = getFunctions(app);

async function testStoreStructuredHistory() {
    const storeFunction = httpsCallable(functions, 'storeStructuredHistory');

    const testData = {
        userId: "test-user-123",
        structuredHistory: {
            contactInformation: {
                fullName: "Test User",
                email: ["test@example.com"],
                phones: ["123-456-7890"]
            },
            skills: ["JavaScript", "Python"],
            education: [{
                school: "Test University",
                degree: "Test Degree",
                startDate: { month: "January", year: "2020" },
                endDate: { month: "May", year: "2024" },
                grade: "A"
            }]
        }
    };

    try {
        console.log('Testing storeStructuredHistory with:', JSON.stringify(testData, null, 2));
        const result = await storeFunction(testData);
        console.log('Success:', result);
    } catch (error) {
        console.error('Error:', error);
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
    }
}

testStoreStructuredHistory();
