#!/usr/bin/env node

import { initializeApp } from 'firebase/app';
import { getFunctions, httpsCallable } from 'firebase/functions';
import fs from 'fs';

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyAMFdOXRG5s0JqWs4o16xDk_NOOlzFIYfo",
    authDomain: "ai-resume-writer-46403.firebaseapp.com",
    projectId: "ai-resume-writer-46403",
    storageBucket: "ai-resume-writer-46403.appspot.com",
    messagingSenderId: "334659394893",
    appId: "1:334659394893:web:2a1c8b56fb4b5c8a5d5e1c"
};

async function testResumeGeneration() {
    console.log('🚀 Testing Resume Generation...\n');

    try {
        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const functions = getFunctions(app);

        // Get the callable function
        const generateResume = httpsCallable(functions, 'generateResumeHttp');

        // Test data
        const testData = {
            templateId: 'ats-friendly-single-column',
            content: {
                personalInfo: {
                    name: 'John Doe',
                    email: 'john.doe@example.com',
                    phone: '(555) 123-4567',
                    location: 'San Francisco, CA'
                },
                summary: 'Experienced software developer with 5+ years of experience.',
                experience: [
                    {
                        title: 'Senior Software Engineer',
                        company: 'Tech Innovations Inc.',
                        duration: '2021 - Present',
                        bullets: [
                            'Led development of microservices architecture serving 1M+ users',
                            'Improved system performance by 40% through optimization initiatives'
                        ]
                    }
                ],
                education: [
                    {
                        degree: 'Bachelor of Science in Computer Science',
                        school: 'University of Technology',
                        duration: '2015 - 2019'
                    }
                ],
                skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Docker'],
                certifications: [
                    {
                        name: 'AWS Certified Solutions Architect',
                        issuer: 'Amazon Web Services',
                        date: '2022'
                    }
                ]
            }
        };

        console.log('📤 Calling generateResumeHttp function...');
        const start = Date.now();

        const result = await generateResume(testData);

        const duration = Date.now() - start;

        if (result.data.success) {
            console.log('✅ Resume generation successful!');
            console.log(`⏱️  Total time: ${duration}ms`);
            console.log(`📄 File size: ${result.data.metadata.fileSize} bytes`);
            console.log(`📊 Pages: ${result.data.metadata.pages}`);
            console.log(`⚡ LaTeX compilation time: ${result.data.metadata.compilationTime}`);
            console.log(`📋 Template: ${result.data.metadata.templateId} v${result.data.metadata.templateVersion}`);
            console.log(`🔗 PDF Base64 length: ${result.data.pdfBase64.length} characters`);

            // Save the PDF for verification
            const pdfBuffer = Buffer.from(result.data.pdfBase64, 'base64');
            fs.writeFileSync('integration-test-resume.pdf', pdfBuffer);
            console.log('💾 PDF saved as integration-test-resume.pdf');

        } else {
            console.error('❌ Resume generation failed:', result.data.error);
            if (result.data.details) {
                console.error('Details:', result.data.details);
            }
            process.exit(1);
        }

    } catch (error) {
        console.error('💥 Error during test:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    }
}

// Run the test
testResumeGeneration()
    .then(() => {
        console.log('\n🎉 Integration test completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Integration test failed:', error);
        process.exit(1);
    });
