import * as admin from 'firebase-admin';
import { parseJobHistory } from '../src/lib/geminiParser';

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    admin.initializeApp();
}

async function testJobHistory() {
    console.log('=== TESTING JOB HISTORY PARSING ===\n');

    // Sample corpus with various job history patterns
    const sampleCorpus = `
DOCUMENT_BOUNDARY_MARKER_START: resume.txt
Bill McCann
Software Engineer
bill.mccann@gmail.com
(732) 812-0367

PROFESSIONAL EXPERIENCE

Senior Software Engineer at TechCorp Solutions
January 2020 - Present
• Led development of microservices architecture serving 1M+ daily users
• Implemented CI/CD pipelines reducing deployment time by 75%
• Mentored 5 junior developers and established coding standards
• Architected scalable data processing systems handling 10TB daily

Software Engineer at InnovateTech LLC
June 2018 - December 2019
• Developed REST APIs using Node.js and Express framework
• Built responsive web applications with React and TypeScript
• Collaborated with cross-functional teams to deliver features on time
• Optimized database queries resulting in 40% performance improvement

Full Stack Developer at StartupXYZ Inc
March 2016 - May 2018
• Created full-stack web applications from concept to deployment
• Worked with modern technologies: React, Node.js, MongoDB, AWS
• Participated in agile development processes and sprint planning
• Delivered 15+ client projects with 98% customer satisfaction

Junior Developer | DataSystems Corporation
August 2014 - February 2016
• Maintained legacy systems and provided technical support
• Assisted in migration of monolithic applications to microservices
• Wrote unit tests achieving 85% code coverage
• Participated in code reviews and knowledge sharing sessions

EDUCATION
University of Michigan, MBA, Operations, 12/1989
Central Michigan University, BA, Computer Science, June 1981

SKILLS
JavaScript, TypeScript, Python, Java, React, Node.js, AWS, Docker, Git
DOCUMENT_BOUNDARY_MARKER_END: resume.txt
    `;

    try {
        const result = await parseJobHistory(sampleCorpus);

        console.log('JOB HISTORY PARSING RESULT:');
        console.log(JSON.stringify(result, null, 2));

        console.log('\n=== DETAILED JOB HISTORY INSPECTION ===\n');

        result.jobHistory.forEach((job, index) => {
            console.log(`--- Job Entry ${index + 1} ---`);
            console.log(`Title: "${job.title}"`);
            console.log(`Company: "${job.company}"`);
            console.log(`Start Date: ${JSON.stringify(job.startDate)}`);
            console.log(`  - Month: "${job.startDate.month}"`);
            console.log(`  - Year: "${job.startDate.year}"`);
            console.log(`End Date: ${JSON.stringify(job.endDate)}`);
            console.log(`  - Month: "${job.endDate.month}"`);
            console.log(`  - Year: "${job.endDate.year}"`);
            console.log(`Currently Working: ${job.currentlyWorking}`);
            console.log(`Job Description: "${job.jobDescription}"`);
            console.log(`Accomplishments (${job.accomplishments.length}):`);
            job.accomplishments.forEach((acc, i) => {
                console.log(`  ${i + 1}. "${acc}"`);
            });
            console.log('');
        });

        // Verify expected results
        const expectedJobs = [
            { title: /senior.*software.*engineer/i, company: /techcorp/i, current: true },
            { title: /software.*engineer/i, company: /innovatetech/i, current: false },
            { title: /full.*stack.*developer/i, company: /startupxyz/i, current: false },
            { title: /junior.*developer/i, company: /datasystems/i, current: false }
        ];

        console.log('=== VERIFICATION ===');
        expectedJobs.forEach((expected, index) => {
            const found = result.jobHistory.find(job =>
                expected.title.test(job.title.toLowerCase()) &&
                expected.company.test(job.company.toLowerCase())
            );

            if (found) {
                console.log(`✅ Found job: ${expected.title} at ${expected.company}`);
                if (found.currentlyWorking === expected.current) {
                    console.log(`✅ Current status correct: ${expected.current}`);
                } else {
                    console.log(`❌ Current status mismatch. Expected: ${expected.current}, Got: ${found.currentlyWorking}`);
                }
            } else {
                console.log(`❌ Missing job: ${expected.title} at ${expected.company}`);
            }
        });

        // Check for accomplishments
        const totalAccomplishments = result.jobHistory.reduce((sum, job) => sum + job.accomplishments.length, 0);
        console.log(`\n📊 Total accomplishments extracted: ${totalAccomplishments}`);

    } catch (error) {
        console.error('Error testing job history:', error);
    }
}

testJobHistory().catch(console.error);
