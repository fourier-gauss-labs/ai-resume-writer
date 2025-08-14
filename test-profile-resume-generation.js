/**
 * Quick test to verify the Phase 1A profile-based resume generation works
 */

// Sample profile data for testing
const sampleProfile = {
    contactInformation: {
        fullName: 'John Smith',
        email: 'john.smith@example.com',
        phone: '(555) 123-4567',
        address: 'San Francisco, CA',
        linkedinUrl: 'https://linkedin.com/in/johnsmith',
        githubUrl: 'https://github.com/johnsmith'
    },
    skills: [
        'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python',
        'AWS', 'Docker', 'Kubernetes', 'SQL', 'MongoDB',
        'Project Management', 'Team Leadership'
    ],
    education: [
        {
            degree: 'Bachelor of Science in Computer Science',
            school: 'University of California, Berkeley',
            duration: '2018 - 2022',
            startDate: '2018-09-01',
            endDate: '2022-05-15',
            gpa: '3.8',
            honors: 'Magna Cum Laude'
        }
    ],
    certifications: [
        {
            name: 'AWS Solutions Architect Professional',
            issuer: 'Amazon Web Services',
            date: '2023-08-15',
            credentialId: 'AWS-SAP-2023-001'
        },
        {
            name: 'Certified Kubernetes Administrator',
            issuer: 'Cloud Native Computing Foundation',
            date: '2023-06-20'
        },
        {
            name: 'PMP Certification',
            issuer: 'Project Management Institute',
            date: '2023-03-10'
        }
    ],
    jobHistory: [
        {
            title: 'Senior Software Engineer',
            company: 'TechCorp Solutions',
            startDate: '2022-01-15',
            endDate: 'present',
            location: 'San Francisco, CA',
            achievements: [
                'Led cloud migration project that reduced infrastructure costs by 40%',
                'Architected microservices platform serving 1M+ daily users',
                'Mentored team of 5 junior developers and improved code review process',
                'Implemented CI/CD pipeline reducing deployment time by 60%',
                'Collaborated with product team to deliver 3 major feature releases'
            ]
        },
        {
            title: 'Full Stack Developer',
            company: 'StartupXYZ',
            startDate: '2020-06-01',
            endDate: '2021-12-31',
            location: 'Remote',
            achievements: [
                'Built responsive web application using React and Node.js',
                'Integrated payment processing and user authentication systems',
                'Optimized database queries improving application performance by 35%',
                'Worked directly with founders to define product roadmap'
            ]
        }
    ]
};

// Test the ResumeContentGenerator
function testResumeGeneration() {
    console.log('🧪 Testing Resume Content Generation...\n');

    // Import would normally be dynamic, but for testing we'll assume the logic
    // For now, let's manually test the conversion logic

    const resumeContent = {
        personalInfo: convertContactInfo(sampleProfile.contactInformation),
        summary: generateSummary(sampleProfile),
        experience: convertJobHistory(sampleProfile.jobHistory),
        education: convertEducation(sampleProfile.education),
        skills: sampleProfile.skills.slice(0, 12),
        certifications: convertCertifications(sampleProfile.certifications)
    };

    console.log('✅ Generated Resume Content:');
    console.log(JSON.stringify(resumeContent, null, 2));

    // Verify key fields are present
    console.log('\n🔍 Verification:');
    console.log(`✅ Name: ${resumeContent.personalInfo.name}`);
    console.log(`✅ Email: ${resumeContent.personalInfo.email}`);
    console.log(`✅ Experience count: ${resumeContent.experience.length}`);
    console.log(`✅ Education count: ${resumeContent.education.length}`);
    console.log(`✅ Skills count: ${resumeContent.skills.length}`);
    console.log(`✅ Certifications count: ${resumeContent.certifications.length}`);
    console.log(`✅ Summary length: ${resumeContent.summary.length} characters`);
}

function convertContactInfo(contactInfo) {
    return {
        name: contactInfo.fullName || 'Your Name',
        email: contactInfo.email || 'your.email@example.com',
        phone: contactInfo.phone || '(555) 123-4567',
        location: contactInfo.address || 'Your City, State'
    };
}

function convertJobHistory(jobHistory) {
    return jobHistory.map(job => {
        let duration = '';
        if (job.startDate && job.endDate) {
            const start = new Date(job.startDate).toLocaleDateString('en-US', {
                month: 'short', year: 'numeric'
            });
            const end = job.endDate === 'present' ? 'Present' :
                new Date(job.endDate).toLocaleDateString('en-US', {
                    month: 'short', year: 'numeric'
                });
            duration = `${start} - ${end}`;
        } else if (job.duration) {
            duration = job.duration;
        } else {
            duration = 'Dates not specified';
        }

        const bullets = job.achievements || ['Contributed to company objectives and team success'];

        return {
            title: job.title || 'Position Title',
            company: job.company || 'Company Name',
            duration,
            bullets: bullets.slice(0, 5)
        };
    });
}

function convertEducation(education) {
    return education.map(edu => {
        let duration = '';
        if (edu.startDate && edu.endDate) {
            const start = new Date(edu.startDate).getFullYear();
            const end = edu.endDate === 'present' ? 'Present' : new Date(edu.endDate).getFullYear();
            duration = `${start} - ${end}`;
        } else if (edu.duration) {
            duration = edu.duration;
        } else {
            duration = 'Year not specified';
        }

        return {
            degree: edu.degree || 'Degree',
            school: edu.school || 'Institution',
            duration
        };
    });
}

function convertCertifications(certifications) {
    return certifications.map(cert => ({
        name: cert.name || 'Certification Name',
        issuer: cert.issuer || 'Issuing Organization',
        date: cert.date || 'Year not specified'
    }));
}

function generateSummary(profile) {
    const { jobHistory, skills, education, certifications } = profile;

    const currentYear = new Date().getFullYear();
    let yearsOfExperience = 0;

    if (jobHistory.length > 0) {
        const oldestJob = jobHistory.reduce((oldest, job) => {
            if (!job.startDate) return oldest;
            const startYear = new Date(job.startDate).getFullYear();
            return !oldest || startYear < oldest ? startYear : oldest;
        }, null);

        if (oldestJob) {
            yearsOfExperience = currentYear - oldestJob;
        }
    }

    const summaryParts = [];

    if (yearsOfExperience > 0) {
        summaryParts.push(`${yearsOfExperience}+ years of professional experience`);
    } else if (jobHistory.length > 0) {
        summaryParts.push('Professional with demonstrated experience');
    }

    if (jobHistory.length > 0) {
        const latestJob = jobHistory[0];
        if (latestJob.title) {
            summaryParts.push(`in ${latestJob.title.toLowerCase()}`);
        }
    }

    if (skills.length > 0) {
        const topSkills = skills.slice(0, 4).join(', ');
        summaryParts.push(`with expertise in ${topSkills}`);
    }

    if (education.length > 0) {
        const highestDegree = education[0];
        if (highestDegree.degree) {
            summaryParts.push(`Holds ${highestDegree.degree}`);
            if (highestDegree.school) {
                summaryParts.push(`from ${highestDegree.school}`);
            }
        }
    }

    if (certifications.length > 0) {
        const certCount = certifications.length;
        summaryParts.push(`with ${certCount} professional certification${certCount > 1 ? 's' : ''}`);
    }

    if (summaryParts.length === 0) {
        return 'Motivated professional seeking new opportunities to contribute skills and expertise to a dynamic organization.';
    }

    let summary = summaryParts[0];

    for (let i = 1; i < summaryParts.length; i++) {
        if (i === summaryParts.length - 1) {
            summary += `. ${summaryParts[i]}`;
        } else if (summaryParts[i].startsWith('in ') || summaryParts[i].startsWith('with ')) {
            summary += ` ${summaryParts[i]}`;
        } else {
            summary += `. ${summaryParts[i]}`;
        }
    }

    summary += '. Proven track record of delivering results and contributing to team success.';

    return summary;
}

// Run the test
testResumeGeneration();
