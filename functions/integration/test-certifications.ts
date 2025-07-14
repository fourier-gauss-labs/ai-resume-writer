import * as admin from 'firebase-admin';
import { parseCertifications } from '../src/lib/geminiParser';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}

async function testCertifications() {
    console.log('=== TESTING CERTIFICATIONS PARSING ===\n');

    // Sample corpus with various certification patterns
    const sampleCorpus = `
DOCUMENT_BOUNDARY_MARKER_START: resume.txt
John Doe
Software Engineer
email@example.com
(555) 123-4567

EXPERIENCE
Senior Software Engineer at TechCorp (2020-2023)
- Developed scalable web applications
- Led a team of 5 developers

Software Engineer at StartupXYZ (2018-2020)
- Built REST APIs and microservices

EDUCATION
University of Michigan, MBA, Operations, 12/1989
Central Michigan University, BA, Computer Science, June 1981

CERTIFICATIONS & LICENSES
AWS Certified Solutions Architect - Professional
Amazon Web Services
Issued: March 2023
Credential ID: AWS-SAP-2023-001

Microsoft Certified: Azure Developer Associate
Microsoft Corporation
Issued: 08/2022
Credential ID: MC-AZ-204-2022

Project Management Professional (PMP)
Project Management Institute
Earned: December 2021
Certificate Number: PMP-2021-789

Certified Information Systems Security Professional (CISSP)
(ISC)² - International Information System Security Certification Consortium
Issued: 05/2020
License ID: CISSP-567890

Oracle Certified Professional, Java SE 11 Developer
Oracle Corporation
Completed: February 2019

SKILLS
JavaScript, TypeScript, Python, Java, React, Node.js, AWS, Docker, Git
DOCUMENT_BOUNDARY_MARKER_END: resume.txt
    `;

    try {
        const result = await parseCertifications(sampleCorpus);

        console.log('CERTIFICATIONS PARSING RESULT:');
        console.log(JSON.stringify(result, null, 2));

        console.log('\n=== DETAILED CERTIFICATIONS INSPECTION ===\n');

        result.certifications.forEach((cert, index) => {
            console.log(`--- Certification Entry ${index + 1} ---`);
            console.log(`Name: "${cert.certName}"`);
            console.log(`Issuer: "${cert.issuer}"`);
            console.log(`Issued Date Object: ${JSON.stringify(cert.issuedDate)}`);
            console.log(`  - Month: "${cert.issuedDate.month}"`);
            console.log(`  - Year: "${cert.issuedDate.year}"`);
            console.log(`Credential ID: "${cert.credentialId}"`);
            console.log('');
        });

        // Verify expected results
        const expectedCerts = [
            { name: /aws.*solutions architect/i, month: '03', year: '2023' },
            { name: /azure.*developer/i, month: '08', year: '2022' },
            { name: /pmp|project management/i, month: '12', year: '2021' },
            { name: /cissp|security/i, month: '05', year: '2020' },
            { name: /oracle.*java/i, month: '02', year: '2019' }
        ];

        console.log('=== VERIFICATION ===');
        expectedCerts.forEach((expected, index) => {
            const found = result.certifications.find(cert =>
                expected.name.test(cert.certName.toLowerCase())
            );

            if (found) {
                console.log(`✅ Found certification matching: ${expected.name}`);
                if (found.issuedDate.month === expected.month && found.issuedDate.year === expected.year) {
                    console.log(`✅ Date matches: ${expected.month}/${expected.year}`);
                } else {
                    console.log(`❌ Date mismatch. Expected: ${expected.month}/${expected.year}, Got: ${found.issuedDate.month}/${found.issuedDate.year}`);
                }
            } else {
                console.log(`❌ Missing certification: ${expected.name}`);
            }
        });

    } catch (error) {
        console.error('Error testing certifications:', error);
    }
}

testCertifications().catch(console.error);
